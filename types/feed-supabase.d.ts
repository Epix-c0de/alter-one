// Type declarations for feed system to resolve Supabase type mismatches
// These will be replaced once database types are regenerated

declare module '@supabase/supabase-js' {
    interface SupabaseClient {
        rpc(
            fn: 'get_local_feed' | 'get_archdiocese_feed' | 'get_national_feed',
            params: {
                p_user_id: string;
                p_limit: number;
                p_offset: number;
            }
        ): Promise<{ data: any; error: any }>;
    }
}

// Extend the Database type to include feed tables temporarily
declare global {
    namespace Database {
        interface PublicTables {
            feed_posts: any;
            feed_media: any;
            feed_likes: any;
            feed_comments: any;
            feed_comment_likes: any;
            feed_shares: any;
            feed_saves: any;
            feed_reports: any;
        }
    }
}

export { };
