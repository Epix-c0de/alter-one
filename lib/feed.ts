// Feed API Functions with type assertions for Supabase compatibility
import { supabase } from './supabase';
import type {
    FeedPost,
    FeedComment,
    CreatePostData,
    UpdatePostData,
    FeedTier,
    ShareType,
} from '@/types/feed.types';

/**
 * Fetch local parish feed
 */
export async function fetchLocalFeed(
    userId: string,
    limit: number = 10,
    offset: number = 0
): Promise<{ data: FeedPost[] | null; error: any }> {
    const { data, error } = await (supabase as any).rpc('get_local_feed', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
    });

    if (error) return { data: null, error };

    // Fetch media for each post
    const postsWithMedia = await Promise.all(
        (data || []).map(async (post: any) => {
            const { data: media } = await (supabase as any)
                .from('feed_media')
                .select('*')
                .eq('post_id', post.id)
                .order('order_index', { ascending: true });

            return { ...post, media: media || [] };
        })
    );

    return { data: postsWithMedia as FeedPost[], error: null };
}

/**
 * Fetch archdiocese feed
 */
export async function fetchArchdioceseFeed(
    userId: string,
    limit: number = 10,
    offset: number = 0
): Promise<{ data: FeedPost[] | null; error: any }> {
    const { data, error } = await (supabase as any).rpc('get_archdiocese_feed', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
    });

    if (error) return { data: null, error };

    const postsWithMedia = await Promise.all(
        (data || []).map(async (post: any) => {
            const { data: media } = await (supabase as any)
                .from('feed_media')
                .select('*')
                .eq('post_id', post.id)
                .order('order_index', { ascending: true });

            return { ...post, media: media || [] };
        })
    );

    return { data: postsWithMedia as FeedPost[], error: null };
}

/**
 * Fetch national feed
 */
export async function fetchNationalFeed(
    userId: string,
    limit: number = 10,
    offset: number = 0
): Promise<{ data: FeedPost[] | null; error: any }> {
    const { data, error } = await (supabase as any).rpc('get_national_feed', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
    });

    if (error) return { data: null, error };

    const postsWithMedia = await Promise.all(
        (data || []).map(async (post: any) => {
            const { data: media } = await (supabase as any)
                .from('feed_media')
                .select('*')
                .eq('post_id', post.id)
                .order('order_index', { ascending: true });

            return { ...post, media: media || [] };
        })
    );

    return { data: postsWithMedia as FeedPost[], error: null };
}

/**
 * Create a new feed post
 */
export async function createPost(
    postData: CreatePostData,
    userId: string,
    parishId: string,
    archdioceseId?: string
): Promise<{ data: FeedPost | null; error: any }> {
    const { data, error } = await (supabase as any)
        .from('feed_posts')
        .insert({
            author_id: userId,
            parish_id: parishId,
            archdiocese_id: archdioceseId,
            content: postData.content,
            tier: postData.tier,
            post_type: postData.post_type,
            event_date: postData.event_date,
        })
        .select()
        .single();

    return { data: data as FeedPost | null, error };
}

/**
 * Update an existing post
 */
export async function updatePost(
    postId: string,
    updates: UpdatePostData
): Promise<{ data: FeedPost | null; error: any }> {
    const { data, error } = await (supabase as any)
        .from('feed_posts')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .select()
        .single();

    return { data: data as FeedPost | null, error };
}

/**
 * Delete a post
 */
export async function deletePost(postId: string, userId: string): Promise<{ error: any }> {
    const { error } = await (supabase as any).from('feed_posts').delete().eq('id', postId);

    return { error };
}

/**
 * Toggle like on a post
 */
export async function toggleLikePost(
    postId: string,
    userId: string
): Promise<{ liked: boolean; error: any }> {
    // Check if already liked
    const { data: existingLike } = await (supabase as any)
        .from('feed_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    if (existingLike) {
        // Unlike
        const { error } = await (supabase as any)
            .from('feed_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);

        return { liked: false, error };
    } else {
        // Like
        const { error } = await (supabase as any).from('feed_likes').insert({
            post_id: postId,
            user_id: userId,
        });

        return { liked: true, error };
    }
}

/**
 * Add a comment to a post
 */
export async function commentOnPost(
    postId: string,
    userId: string,
    content: string,
    parentCommentId?: string
): Promise<{ data: FeedComment | null; error: any }> {
    const { data, error } = await (supabase as any)
        .from('feed_comments')
        .insert({
            post_id: postId,
            user_id: userId,
            content,
            parent_comment_id: parentCommentId,
        })
        .select()
        .single();

    return { data: data as FeedComment | null, error };
}

/**
 * Fetch comments for a post
 */
export async function fetchPostComments(
    postId: string,
    userId: string
): Promise<{ data: FeedComment[] | null; error: any }> {
    const { data, error } = await (supabase as any)
        .from('feed_comments')
        .select(`
      *,
      users!feed_comments_user_id_fkey (
        full_name,
        role
      )
    `)
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

    if (error) return { data: null, error };

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment: any) => {
            const { data: replies } = await (supabase as any)
                .from('feed_comments')
                .select(`
          *,
          users!feed_comments_user_id_fkey (
            full_name,
            role
          )
        `)
                .eq('parent_comment_id', comment.id)
                .order('created_at', { ascending: true });

            // Check if user has liked this comment
            const { data: userLike } = await (supabase as any)
                .from('feed_comment_likes')
                .select('id')
                .eq('comment_id', comment.id)
                .eq('user_id', userId)
                .single();

            return {
                ...comment,
                user_name: comment.users?.full_name,
                user_role: comment.users?.role,
                user_has_liked: !!userLike,
                replies: replies || [],
            };
        })
    );

    return { data: commentsWithReplies as FeedComment[], error: null };
}

/**
 * Toggle like on a comment
 */
export async function toggleLikeComment(
    commentId: string,
    userId: string
): Promise<{ liked: boolean; error: any }> {
    const { data: existingLike } = await (supabase as any)
        .from('feed_comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

    if (existingLike) {
        const { error } = await (supabase as any)
            .from('feed_comment_likes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', userId);

        return { liked: false, error };
    } else {
        const { error } = await (supabase as any).from('feed_comment_likes').insert({
            comment_id: commentId,
            user_id: userId,
        });

        return { liked: true, error };
    }
}

/**
 * Track a share
 */
export async function sharePost(
    postId: string,
    userId: string,
    shareType: ShareType
): Promise<{ error: any }> {
    const { error } = await (supabase as any).from('feed_shares').insert({
        post_id: postId,
        user_id: userId,
        share_type: shareType,
    });

    return { error };
}

/**
 * Toggle save on a post
 */
export async function toggleSavePost(
    postId: string,
    userId: string
): Promise<{ saved: boolean; error: any }> {
    const { data: existingSave } = await (supabase as any)
        .from('feed_saves')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    if (existingSave) {
        const { error } = await (supabase as any)
            .from('feed_saves')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId);

        return { saved: false, error };
    } else {
        const { error } = await (supabase as any).from('feed_saves').insert({
            post_id: postId,
            user_id: userId,
        });

        return { saved: true, error };
    }
}

/**
 * Fetch saved posts for a user
 */
export async function fetchSavedPosts(
    userId: string,
    limit: number = 20,
    offset: number = 0
): Promise<{ data: FeedPost[] | null; error: any }> {
    const { data, error } = await (supabase as any)
        .from('feed_saves')
        .select(`
      *,
      feed_posts (
        *,
        users!feed_posts_author_id_fkey (
          full_name,
          role
        ),
        parishes (
          parish_name
        )
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

    if (error) return { data: null, error };

    const posts = (data || []).map((save: any) => ({
        ...save.feed_posts,
        author_name: save.feed_posts.users?.full_name,
        author_role: save.feed_posts.users?.role,
        parish_name: save.feed_posts.parishes?.parish_name,
    }));

    return { data: posts as FeedPost[], error: null };
}

/**
 * Report a post
 */
export async function reportPost(
    postId: string,
    userId: string,
    reason: string
): Promise<{ error: any }> {
    const { error } = await (supabase as any).from('feed_reports').insert({
        post_id: postId,
        user_id: userId,
        reason,
    });

    return { error };
}

/**
 * Pin a post (admin only)
 */
export async function pinPost(
    postId: string,
    userId: string
): Promise<{ error: any }> {
    const { error } = await (supabase as any)
        .from('feed_posts')
        .update({
            is_pinned: true,
            pinned_at: new Date().toISOString(),
            pinned_by: userId,
        })
        .eq('id', postId);

    return { error };
}

/**
 * Unpin a post (admin only)
 */
export async function unpinPost(postId: string): Promise<{ error: any }> {
    const { error } = await (supabase as any)
        .from('feed_posts')
        .update({
            is_pinned: false,
            pinned_at: null,
            pinned_by: null,
        })
        .eq('id', postId);

    return { error };
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<{ error: any }> {
    const { error } = await (supabase as any)
        .from('feed_comments')
        .delete()
        .eq('id', commentId);

    return { error };
}
