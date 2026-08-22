import { SocialPost } from '../types';

const STORAGE_KEY = 'educongo_social_posts_v1';

export const DEFAULT_POSTS: SocialPost[] = [];


export function getSocialPosts(schoolCode?: string): SocialPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (schoolCode) {
          return parsed.filter((p) => !p.schoolCode || p.schoolCode.toUpperCase() === schoolCode.toUpperCase());
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading social posts:', err);
  }
  return [];
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
