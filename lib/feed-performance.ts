// Performance optimization utilities for the feed system

/**
 * Compress image before upload
 * Reduces file size while maintaining quality
 */
export async function compressImage(
    uri: string,
    quality: number = 0.7
): Promise<{ uri: string; width: number; height: number }> {
    const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');

    const result = await manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Max width 1080px
        { compress: quality, format: SaveFormat.JPEG }
    );

    return result;
}

/**
 * Compress video before upload
 * Note: This requires expo-video-thumbnails and ffmpeg
 * For now, we'll just validate size
 */
export async function validateVideoSize(uri: string, maxSizeMB: number = 50): Promise<boolean> {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const sizeMB = blob.size / (1024 * 1024);
        return sizeMB <= maxSizeMB;
    } catch (error) {
        console.error('Error validating video size:', error);
        return false;
    }
}

/**
 * Preload next batch of posts
 * Fetches posts in advance for smoother scrolling
 */
export function preloadPosts(
    posts: any[],
    currentIndex: number,
    preloadCount: number = 5
): void {
    const startIndex = currentIndex + 1;
    const endIndex = Math.min(startIndex + preloadCount, posts.length);

    for (let i = startIndex; i < endIndex; i++) {
        const post = posts[i];
        if (post.media && post.media.length > 0) {
            // Preload images
            post.media.forEach((media: any) => {
                if (media.media_type === 'photo') {
                    Image.prefetch(media.url);
                }
            });
        }
    }
}

/**
 * Debounce function for search/filter inputs
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Cache manager for offline support
 */
interface CacheItem<T> {
    data: T;
    timestamp: number;
}

class CacheManager {
    private cache: Map<string, CacheItem<any>> = new Map();
    private maxAge: number = 5 * 60 * 1000; // 5 minutes default

    set<T>(key: string, data: T, maxAge?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        const age = Date.now() - item.timestamp;
        if (age > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    clear(): void {
        this.cache.clear();
    }

    remove(key: string): void {
        this.cache.delete(key);
    }
}

export const feedCache = new CacheManager();

/**
 * Lazy load images with placeholder
 */
export function useLazyImage(uri: string) {
    const [loaded, setLoaded] = React.useState(false);
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
        const img = Image.prefetch(uri);
        img
            .then(() => setLoaded(true))
            .catch(() => setError(true));
    }, [uri]);

    return { loaded, error };
}

/**
 * Batch API requests to reduce network calls
 */
export class RequestBatcher {
    private queue: Array<() => Promise<any>> = [];
    private processing = false;
    private batchSize = 5;
    private delay = 100;

    add(request: () => Promise<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await request();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });

            if (!this.processing) {
                this.process();
            }
        });
    }

    private async process(): Promise<void> {
        this.processing = true;

        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.batchSize);
            await Promise.all(batch.map((req) => req()));
            await new Promise((resolve) => setTimeout(resolve, this.delay));
        }

        this.processing = false;
    }
}

export const requestBatcher = new RequestBatcher();

// Import React for useLazyImage hook
import React from 'react';
import { Image } from 'react-native';
