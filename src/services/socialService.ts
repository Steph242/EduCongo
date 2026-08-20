import { SocialPost } from '../types';

const STORAGE_KEY = 'educongo_social_posts_v1';

export const DEFAULT_POSTS: SocialPost[] = [
  {
    id: 'post_1',
    schoolCode: 'BZV-24-X8B',
    schoolName: "Lycée d'Excellence de Brazzaville",
    authorName: 'Dieudonné MAVOUNGOU',
    authorRole: 'Proviseur du Lycée',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    createdAt: 'Il y a 2 heures',
    title: '📢 Organisation des Évaluations Harmonisées du 1er Trimestre',
    content: "Chers parents d'élèves, chers enseignants et apprenants, nous vous informons que les compositions harmonisées de fin de trimestre débuteront le lundi prochain à 07h30 précises. Le port de l'uniforme officiel et le badge scannable sont obligatoires pour l'accès aux salles d'examen.",
    category: 'annonce',
    audience: 'all',
    mediaUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    likesCount: 38,
    likedByMe: false,
    isPinned: true,
    comments: [
      {
        id: 'c1',
        authorName: 'Mme NGOULOU Chantal',
        authorRole: 'Parent d\'élève (Terminale D)',
        text: 'Bien reçu Monsieur le Proviseur, merci pour ces précisions sur les horaires.',
        createdAt: 'Il y a 1 heure',
      },
      {
        id: 'c2',
        authorName: 'Prince MAVOUNGOU',
        authorRole: 'Élève - Terminale D',
        text: 'Est-ce que les calculatrices programmables sont autorisées pour l\'épreuve de Mathématiques ?',
        createdAt: 'Il y a 45 min',
      },
    ],
  },
  {
    id: 'post_2',
    schoolCode: 'BZV-24-X8B',
    schoolName: "Lycée d'Excellence de Brazzaville",
    authorName: 'Bureau de la Vie Scolaire',
    authorRole: 'Censeur & Surveillance Générale',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: 'Hier à 14:30',
    title: '🏆 Félicitations à nos Lauréats aux Olympiades Nationales de Sciences',
    content: "Nos élèves de Première C et Terminale D ont remporté la 1ère place régionale aux Olympiades de Physique-Chimie et Mathématiques du Congo ! Félicitations à toute l'équipe pédagogique et aux lauréats pour cet honneur fait à notre établissement.",
    category: 'distinction',
    audience: 'all',
    mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    likesCount: 64,
    likedByMe: true,
    comments: [
      {
        id: 'c3',
        authorName: 'Alain BONGHO',
        authorRole: 'Professeur de Sciences Physiques',
        text: 'Un immense bravo à nos jeunes pour leur dévouement et leur rigueur scientifique !',
        createdAt: 'Hier à 16:00',
      },
    ],
  },
  {
    id: 'post_3',
    schoolCode: 'BZV-24-X8B',
    schoolName: "Lycée d'Excellence de Brazzaville",
    authorName: 'Association des Parents d\'Élèves (APE)',
    authorRole: 'Coordination Générale',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    createdAt: 'Il y a 2 jours',
    title: '📊 Sondage : Choix de la date pour la Grande Journée Portes Ouvertes & Métiers',
    content: "Dans le cadre de l'orientation académique de nos lycéens et collégiens, l'APE consulte l'ensemble de la communauté éducative pour convenir de la date la plus appropriée.",
    category: 'sondage',
    audience: 'parents',
    likesCount: 22,
    likedByMe: false,
    poll: {
      question: 'Quelle date vous conviendrait le mieux pour la rencontre entreprises & universités ?',
      totalVotes: 145,
      options: [
        { id: 'opt1', text: 'Samedi 14 Décembre 2024 (Matin)', votes: 82 },
        { id: 'opt2', text: 'Samedi 21 Décembre 2024 (Matin)', votes: 43 },
        { id: 'opt3', text: 'Mercredi 18 Décembre 2024 (Après-midi)', votes: 20 },
      ],
      userVotedOptionId: 'opt1',
    },
    comments: [],
  },
];

export function getSocialPosts(schoolCode?: string): SocialPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (schoolCode) {
          return parsed.filter((p) => !p.schoolCode || p.schoolCode === schoolCode || p.schoolCode === 'BZV-24-X8B');
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading social posts:', err);
  }
  return DEFAULT_POSTS;
}

export function saveSocialPost(post: SocialPost): SocialPost[] {
  const posts = getSocialPosts();
  const updated = [post, ...posts];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving post:', err);
  }
  return updated;
}

export function togglePostLike(postId: string): SocialPost[] {
  const posts = getSocialPosts();
  const updated = posts.map((p) => {
    if (p.id === postId) {
      const newLiked = !p.likedByMe;
      return {
        ...p,
        likedByMe: newLiked,
        likesCount: newLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
      };
    }
    return p;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {}
  return updated;
}

export function addPostComment(
  postId: string,
  authorName: string,
  authorRole: string,
  text: string
): SocialPost[] {
  const posts = getSocialPosts();
  const updated = posts.map((p) => {
    if (p.id === postId) {
      const newComment = {
        id: 'c_' + Date.now(),
        authorName,
        authorRole,
        text,
        createdAt: 'À l\'instant',
      };
      return {
        ...p,
        comments: [...p.comments, newComment],
      };
    }
    return p;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {}
  return updated;
}

export function votePostPoll(postId: string, optionId: string): SocialPost[] {
  const posts = getSocialPosts();
  const updated = posts.map((p) => {
    if (p.id === postId && p.poll) {
      if (p.poll.userVotedOptionId === optionId) return p;
      const prevOpt = p.poll.userVotedOptionId;
      const newOptions = p.poll.options.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1 };
        }
        if (prevOpt && opt.id === prevOpt) {
          return { ...opt, votes: Math.max(0, opt.votes - 1) };
        }
        return opt;
      });
      return {
        ...p,
        poll: {
          ...p.poll,
          options: newOptions,
          totalVotes: prevOpt ? p.poll.totalVotes : p.poll.totalVotes + 1,
          userVotedOptionId: optionId,
        },
      };
    }
    return p;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {}
  return updated;
}
