// Feed System Type Definitions

export type FeedTier = 'local' | 'archdiocese' | 'national';

export type PostType =
    | 'event'
    | 'announcement'
    | 'testimony'
    | 'gallery'
    | 'youth'
    | 'choir'
    | 'catechism'
    | 'general';

export type MediaType = 'photo' | 'video';

export type ShareType = 'internal' | 'whatsapp' | 'facebook' | 'email';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface FeedPost {
    id: string;
    parish_id: string;
    archdiocese_id?: string;
    author_id: string;
    author_name?: string;
    author_role?: string;
    parish_name?: string;
    content: string;
    tier: FeedTier;
    post_type?: PostType;
    event_date?: string;
    like_count: number;
    comment_count: number;
    share_count: number;
    is_pinned: boolean;
    pinned_at?: string;
    pinned_by?: string;
    created_at: string;
    updated_at: string;
    user_has_liked?: boolean;
    user_has_saved?: boolean;
    media?: FeedMedia[];
}

export interface FeedMedia {
    id: string;
    post_id: string;
    media_type: MediaType;
    url: string;
    thumbnail_url?: string;
    order_index: number;
    duration_seconds?: number;
    created_at: string;
}

export interface FeedLike {
    id: string;
    post_id: string;
    user_id: string;
    created_at: string;
}

export interface FeedComment {
    id: string;
    post_id: string;
    user_id: string;
    user_name?: string;
    user_role?: string;
    content: string;
    parent_comment_id?: string;
    like_count: number;
    created_at: string;
    updated_at: string;
    user_has_liked?: boolean;
    replies?: FeedComment[];
}

export interface FeedCommentLike {
    id: string;
    comment_id: string;
    user_id: string;
    created_at: string;
}

export interface FeedShare {
    id: string;
    post_id: string;
    user_id: string;
    share_type: ShareType;
    created_at: string;
}

export interface FeedSave {
    id: string;
    post_id: string;
    user_id: string;
    created_at: string;
}

export interface FeedReport {
    id: string;
    post_id: string;
    user_id: string;
    reason: string;
    status: ReportStatus;
    reviewed_by?: string;
    reviewed_at?: string;
    created_at: string;
}

export interface CreatePostData {
    content: string;
    tier: FeedTier;
    post_type?: PostType;
    event_date?: string;
    media?: {
        type: MediaType;
        file: File | Blob;
    }[];
}

export interface UpdatePostData {
    content?: string;
    post_type?: PostType;
    event_date?: string;
}
