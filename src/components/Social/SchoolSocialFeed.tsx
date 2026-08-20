import React, { useState, useEffect } from 'react';
import { SocialPost, PortalAccount } from '../../types';
import {
  getSocialPosts,
  saveSocialPost,
  togglePostLike,
  addPostComment,
  votePostPoll,
} from '../../services/socialService';
import { LiveCameraCaptureModal } from '../Common/LiveCameraCaptureModal';

interface SchoolSocialFeedProps {
  schoolName: string;
  schoolCode: string;
  cityName?: string;
  currentUser?: PortalAccount | { displayName: string; roleTitle: string; avatarUrl?: string; role?: string };
  canCreatePost?: boolean;
}

const CATEGORY_TAGS = [
  { id: 'all', label: 'Toutes les publications', icon: 'grid_view' },
  { id: 'annonce', label: 'Annonces Officielles', icon: 'campaign' },
  { id: 'evenement', label: 'Événements & Cérémonies', icon: 'event' },
  { id: 'distinction', label: 'Mérite & Félicitations', icon: 'military_tech' },
  { id: 'sondage', label: 'Sondages & Consultations', icon: 'poll' },
  { id: 'activite', label: 'Activités & Sport', icon: 'sports_soccer' },
  { id: 'alerte', label: 'Alertes & Urgences', icon: 'warning' },
];

export const SchoolSocialFeed: React.FC<SchoolSocialFeedProps> = ({
  schoolName,
  schoolCode,
  cityName = 'Brazzaville',
  currentUser = {
    displayName: 'Direction de l\'Établissement',
    roleTitle: 'Administration & Communication',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    role: 'staff',
  },
  canCreatePost = true,
}) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeAudienceFilter, setActiveAudienceFilter] = useState<'all' | 'parents' | 'eleves' | 'personnel'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // New post modal / state
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<SocialPost['category']>('annonce');
  const [newAudience, setNewAudience] = useState<SocialPost['audience']>('all');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Poll fields if category is sondage
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPosts(getSocialPosts(schoolCode));
  }, [schoolCode]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: SocialPost = {
      id: 'post_' + Date.now(),
      schoolCode,
      schoolName,
      authorName: currentUser.displayName,
      authorRole: currentUser.roleTitle,
      authorAvatar: currentUser.avatarUrl,
      createdAt: 'À l\'instant',
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      audience: newAudience,
      mediaUrl: newMediaUrl.trim() || undefined,
      likesCount: 0,
      likedByMe: false,
      comments: [],
      poll:
        newCategory === 'sondage' && pollQuestion.trim()
          ? {
              question: pollQuestion.trim(),
              totalVotes: 0,
              options: pollOptions.filter((o) => o.trim()).map((text, idx) => ({
                id: 'opt_' + idx,
                text,
                votes: 0,
              })),
            }
          : undefined,
    };

    const updated = saveSocialPost(newPost);
    setPosts(updated);
    setIsCreatingPost(false);
    setNewTitle('');
    setNewContent('');
    setNewMediaUrl('');
    setPollQuestion('');
  };

  const handleLike = (postId: string) => {
    const updated = togglePostLike(postId);
    setPosts(updated);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const updated = addPostComment(
      postId,
      currentUser.displayName,
      currentUser.roleTitle,
      text.trim()
    );
    setPosts(updated);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const handlePollVote = (postId: string, optionId: string) => {
    const updated = votePostPoll(postId, optionId);
    setPosts(updated);
  };

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (activeAudienceFilter !== 'all' && p.audience !== 'all' && p.audience !== activeAudienceFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner & Network Header */}
      <div className="bg-white/[0.04] backdrop-blur-2xl p-5 sm:p-7 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Background Congolese Flag Glow Ribbon */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500"></div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="material-symbols-outlined text-[28px]">hub</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-white text-lg sm:text-xl">
                Agora & Réseau Social de l'Établissement
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                En direct
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Espace d'échange et d'information officielle • {schoolName} ({schoolCode})
            </p>
          </div>
        </div>

        {canCreatePost && (
          <button
            type="button"
            onClick={() => setIsCreatingPost(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold border border-emerald-400/30 shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center gap-2 active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Publier un communiqué
          </button>
        )}
      </div>

      {/* Filter and Audience Toolbar */}
      <div className="bg-white/[0.03] backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Audience Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/10 text-xs w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveAudienceFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeAudienceFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous les publics
            </button>
            <button
              type="button"
              onClick={() => setActiveAudienceFilter('parents')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeAudienceFilter === 'parents'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Parents d'élèves
            </button>
            <button
              type="button"
              onClick={() => setActiveAudienceFilter('eleves')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeAudienceFilter === 'eleves'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Élèves / Étudiants
            </button>
            <button
              type="button"
              onClick={() => setActiveAudienceFilter('personnel')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeAudienceFilter === 'personnel'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Personnel & Enseignants
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher une publication..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-white/10 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Category Scroll Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
          {CATEGORY_TAGS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-xl font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                activeCategory === cat.id
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold shadow-sm'
                  : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Feed Timeline */}
      <div className="space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-white/[0.02] rounded-3xl border border-white/10 space-y-3">
            <span className="material-symbols-outlined text-slate-500 text-[48px]">feed</span>
            <h4 className="font-bold text-white text-base">Aucune publication dans cette catégorie</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Soyez le premier à publier une annonce officielle ou un événement pour la communauté scolaire.
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`bg-white/[0.04] backdrop-blur-xl rounded-3xl border transition-all p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.35)] space-y-4 ${
                post.isPinned ? 'border-amber-400/40 bg-gradient-to-b from-amber-500/[0.03] to-transparent' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Pinned Badge */}
              {post.isPinned && (
                <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold pb-1 border-b border-white/5">
                  <span className="material-symbols-outlined text-[16px]">push_pin</span>
                  <span>Publication Épinglée par la Direction</span>
                </div>
              )}

              {/* Author & Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {post.authorAvatar ? (
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-11 h-11 rounded-2xl object-cover border border-emerald-400/50 shadow-md bg-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center font-bold text-emerald-300 shrink-0">
                      {post.authorName.charAt(0)}
                    </div>
                  )}

                  <div>
                    <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      <span>{post.authorName}</span>
                      <span className="material-symbols-outlined text-emerald-400 text-[16px]">verified</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{post.authorRole}</span>
                      <span>•</span>
                      <span className="font-mono">{post.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                    post.category === 'alerte'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : post.category === 'distinction'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : post.category === 'sondage'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {post.category}
                  </span>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300">
                    {post.audience === 'all' ? 'Public' : post.audience === 'parents' ? 'Parents' : post.audience === 'eleves' ? 'Élèves' : 'Personnel'}
                  </span>
                </div>
              </div>

              {/* Title & Body Content */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Media Picture if provided */}
              {post.mediaUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/15 max-h-[380px] bg-slate-900 shadow-md">
                  <img
                    src={post.mediaUrl}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                  />
                </div>
              )}

              {/* Interactive Poll if configured */}
              {post.poll && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400 text-[18px]">poll</span>
                    <span>{post.poll.question}</span>
                  </div>

                  <div className="space-y-2">
                    {post.poll.options.map((opt) => {
                      const percentage = post.poll?.totalVotes
                        ? Math.round((opt.votes / post.poll.totalVotes) * 100)
                        : 0;
                      const isMyVote = post.poll?.userVotedOptionId === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handlePollVote(post.id, opt.id)}
                          className={`w-full text-left p-2.5 rounded-xl border relative overflow-hidden transition-all cursor-pointer ${
                            isMyVote
                              ? 'border-purple-400 bg-purple-500/20 text-white font-semibold'
                              : 'border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-purple-500/20 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                          <div className="relative z-10 flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1.5">
                              {isMyVote && (
                                <span className="material-symbols-outlined text-purple-300 text-[15px]">
                                  check_circle
                                </span>
                              )}
                              {opt.text}
                            </span>
                            <span className="font-mono font-bold text-[11px] text-purple-300">
                              {opt.votes} ({percentage}%)
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[10px] text-slate-400 text-right">
                    Total des votes : <strong>{post.poll.totalVotes}</strong>
                  </div>
                </div>
              )}

              {/* Action Buttons: Like, Comment, Share */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-4">
                  {/* Like button */}
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 font-bold transition-transform active:scale-90 cursor-pointer ${
                      post.likedByMe ? 'text-rose-400' : 'text-slate-400 hover:text-rose-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] transition-colors">
                      {post.likedByMe ? 'favorite' : 'favorite_border'}
                    </span>
                    <span>{post.likesCount}</span>
                  </button>

                  {/* Comment toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className="flex items-center gap-1.5 font-medium text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                    <span>{post.comments.length} commentaires</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Lien de la publication copié dans le presse-papier !');
                  }}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  <span className="material-symbols-outlined text-[16px]">share</span>
                  <span>Partager</span>
                </button>
              </div>

              {/* Comment Thread Section */}
              {expandedComments[post.id] && (
                <div className="pt-3 border-t border-white/10 space-y-3">
                  {/* Comments list */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                      {post.comments.map((cmt) => (
                        <div key={cmt.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200">{cmt.authorName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{cmt.createdAt}</span>
                          </div>
                          <div className="text-[10px] text-emerald-400">{cmt.authorRole}</div>
                          <p className="text-slate-300 text-xs pt-0.5">{cmt.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCommentSubmit(post.id);
                      }}
                      placeholder="Écrire un commentaire officiel ou une question..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleCommentSubmit(post.id)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Create Post */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-950/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/15 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">campaign</span>
                Créer une publication officielle
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingPost(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              {/* Category & Audience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Catégorie *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SocialPost['category'])}
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-slate-900 text-white outline-none"
                  >
                    <option value="annonce">Annonce Officielle</option>
                    <option value="evenement">Événement & Cérémonie</option>
                    <option value="distinction">Mérite & Félicitations</option>
                    <option value="sondage">Sondage Interactif</option>
                    <option value="activite">Activités & Sport</option>
                    <option value="alerte">Alerte Météo / Urgence</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Destinataires *</label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value as SocialPost['audience'])}
                    className="w-full px-3 py-2 border border-white/15 rounded-xl text-xs bg-slate-900 text-white outline-none"
                  >
                    <option value="all">Tout le monde (Public)</option>
                    <option value="parents">Parents d'élèves uniquement</option>
                    <option value="eleves">Élèves & Étudiants</option>
                    <option value="personnel">Personnel & Enseignants</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Titre de la publication *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Calendrier des Compositions du 1er Trimestre"
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Contenu du message *</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Rédigez votre communiqué officiel..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                />
              </div>

              {/* Media URL or Camera capture */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-slate-300">Photo / Illustration</label>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                    Prendre en direct
                  </button>
                </div>
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="URL d'une photo d'événement (ou utiliser la caméra)"
                  className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-emerald-400 outline-none backdrop-blur-md"
                />
              </div>

              {/* Poll fields if Sondage */}
              {newCategory === 'sondage' && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-purple-500/30 space-y-2.5">
                  <label className="block font-semibold text-purple-300">Question du sondage :</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Ex: Quelle date pour la kermesse ?"
                    className="w-full px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.05] text-white focus:border-purple-400 outline-none"
                  />
                  <div className="space-y-1.5 pt-1">
                    {pollOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[idx] = e.target.value;
                          setPollOptions(updated);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="w-full px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-white outline-none"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`])}
                      className="text-purple-400 hover:underline text-[11px] font-semibold"
                    >
                      + Ajouter une option
                    </button>
                  </div>
                </div>
              )}

              {/* Form actions */}
              <div className="flex gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="flex-1 py-2.5 border border-white/15 rounded-xl font-medium text-slate-300 hover:bg-white/5 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Publier sur l'Agora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera for Post Attachment */}
      <LiveCameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => {
          setNewMediaUrl(dataUrl);
          setIsCameraOpen(false);
        }}
        title="Photo pour la publication"
        subtitle="Capturez un événement ou une annonce en direct"
      />
    </div>
  );
};
