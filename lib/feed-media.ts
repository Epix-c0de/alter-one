// Feed Media Upload and Management
import { supabase } from './supabase';
import type { MediaType } from '@/types/feed.types';

const FEED_MEDIA_BUCKET = 'feed-media';

/**
 * Upload a photo to Supabase Storage
 */
export async function uploadFeedPhoto(
    file: File | Blob,
    postId: string,
    orderIndex: number = 0
): Promise<{ data: { url: string; mediaId: string } | null; error: any }> {
    try {
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
        const fileName = `${postId}/${Date.now()}_${orderIndex}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(FEED_MEDIA_BUCKET)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) return { data: null, error: uploadError };

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(FEED_MEDIA_BUCKET)
            .getPublicUrl(fileName);

        // Save media record to database
        const { data: mediaRecord, error: dbError } = await supabase
            .from('feed_media')
            .insert({
                post_id: postId,
                media_type: 'photo',
                url: urlData.publicUrl,
                order_index: orderIndex,
            })
            .select()
            .single();

        if (dbError) return { data: null, error: dbError };

        return {
            data: {
                url: urlData.publicUrl,
                mediaId: mediaRecord.id,
            },
            error: null,
        };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Upload a video to Supabase Storage
 * Note: Videos should be compressed before upload
 */
export async function uploadFeedVideo(
    file: File | Blob,
    postId: string,
    durationSeconds?: number
): Promise<{ data: { url: string; mediaId: string } | null; error: any }> {
    try {
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'mp4';
        const fileName = `${postId}/${Date.now()}_video.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(FEED_MEDIA_BUCKET)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) return { data: null, error: uploadError };

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(FEED_MEDIA_BUCKET)
            .getPublicUrl(fileName);

        // Save media record to database
        const { data: mediaRecord, error: dbError } = await supabase
            .from('feed_media')
            .insert({
                post_id: postId,
                media_type: 'video',
                url: urlData.publicUrl,
                duration_seconds: durationSeconds,
                order_index: 0,
            })
            .select()
            .single();

        if (dbError) return { data: null, error: dbError };

        return {
            data: {
                url: urlData.publicUrl,
                mediaId: mediaRecord.id,
            },
            error: null,
        };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Upload multiple photos as a carousel (up to 10)
 */
export async function createPhotoCarousel(
    files: (File | Blob)[],
    postId: string
): Promise<{ data: { urls: string[]; mediaIds: string[] } | null; error: any }> {
    if (files.length > 10) {
        return {
            data: null,
            error: new Error('Maximum 10 photos allowed in a carousel'),
        };
    }

    try {
        const uploadPromises = files.map((file, index) =>
            uploadFeedPhoto(file, postId, index)
        );

        const results = await Promise.all(uploadPromises);

        const errors = results.filter((r) => r.error);
        if (errors.length > 0) {
            return { data: null, error: errors[0].error };
        }

        const urls = results.map((r) => r.data!.url);
        const mediaIds = results.map((r) => r.data!.mediaId);

        return { data: { urls, mediaIds }, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

/**
 * Delete media file from storage and database
 */
export async function deleteFeedMedia(mediaId: string): Promise<{ error: any }> {
    try {
        // Get media record to find the file path
        const { data: mediaRecord, error: fetchError } = await supabase
            .from('feed_media')
            .select('url')
            .eq('id', mediaId)
            .single();

        if (fetchError) return { error: fetchError };

        // Extract file path from URL
        const url = new URL(mediaRecord.url);
        const filePath = url.pathname.split(`/${FEED_MEDIA_BUCKET}/`)[1];

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from(FEED_MEDIA_BUCKET)
            .remove([filePath]);

        if (storageError) return { error: storageError };

        // Delete from database
        const { error: dbError } = await supabase
            .from('feed_media')
            .delete()
            .eq('id', mediaId);

        return { error: dbError };
    } catch (error) {
        return { error };
    }
}

/**
 * Generate thumbnail for video (placeholder - requires video processing)
 */
export async function generateVideoThumbnail(
    videoFile: File | Blob
): Promise<{ data: Blob | null; error: any }> {
    // This is a placeholder - actual implementation would require
    // video processing library like ffmpeg or a server-side solution
    return {
        data: null,
        error: new Error('Video thumbnail generation not yet implemented'),
    };
}
