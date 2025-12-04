import { User } from '@supabase/supabase-js';

export type FeatureName =
    | 'session-connect'
    | 'parish-content'
    | 'favorites'
    | 'downloads'
    | 'comments'
    | 'groups'
    | 'livestream'
    | 'notifications'
    | 'ai-features'
    | 'subscription';

interface FeatureConfig {
    requiresAuth: boolean;
    guestAccess: 'full' | 'limited' | 'none';
    description: string;
}

const FEATURE_CONFIG: Record<FeatureName, FeatureConfig> = {
    'session-connect': {
        requiresAuth: true,
        guestAccess: 'none',
        description: 'Connect to parish Session ID',
    },
    'parish-content': {
        requiresAuth: true,
        guestAccess: 'limited',
        description: 'Access parish-specific content',
    },
    'favorites': {
        requiresAuth: true,
        guestAccess: 'none',
        description: 'Save and sync favorites',
    },
    'downloads': {
        requiresAuth: true,
        guestAccess: 'none',
        description: 'Download content for offline use',
    },
    'comments': {
        requiresAuth: true,
        guestAccess: 'none',
        description: 'Comment and interact',
    },
    'groups': {
        requiresAuth: true,
        guestAccess: 'none',
        description: 'Join and participate in groups',
    },
    'livestream': {
        requiresAuth: true,
        guestAccess: 'limited',
        description: 'Watch parish livestreams',
    },
    'notifications': {
        requiresAuth: true,
        guestAccess: 'none',
        description: 'Receive personalized notifications',
    },
    'ai-features': {
        requiresAuth: true,
        guestAccess: 'none',
        description: 'AI-powered features',
    },
    'subscription': {
        requiresAuth: true,
        guestAccess: 'none',
        description: 'Manage subscription',
    },
};

/**
 * Check if a user can access a specific feature
 */
export const canAccessFeature = (feature: FeatureName, user: User | null): boolean => {
    const config = FEATURE_CONFIG[feature];

    if (!config) {
        console.warn(`Unknown feature: ${feature}`);
        return false;
    }

    // If feature requires auth and user is not authenticated
    if (config.requiresAuth && !user) {
        return config.guestAccess !== 'none';
    }

    // User is authenticated or feature doesn't require auth
    return true;
};

/**
 * Get the requirement message for a feature
 */
export const getFeatureRequirement = (feature: FeatureName): string => {
    const config = FEATURE_CONFIG[feature];

    if (!config) {
        return 'This feature is not available';
    }

    if (config.requiresAuth) {
        return `Sign in to ${config.description.toLowerCase()}`;
    }

    return config.description;
};

/**
 * Check if user has guest access level
 */
export const isGuest = (user: User | null): boolean => {
    return user === null;
};

/**
 * Get list of features available to guests
 */
export const getGuestFeatures = (): FeatureName[] => {
    return Object.entries(FEATURE_CONFIG)
        .filter(([_, config]) => config.guestAccess !== 'none')
        .map(([feature]) => feature as FeatureName);
};

/**
 * Get list of features requiring authentication
 */
export const getAuthRequiredFeatures = (): FeatureName[] => {
    return Object.entries(FEATURE_CONFIG)
        .filter(([_, config]) => config.requiresAuth && config.guestAccess === 'none')
        .map(([feature]) => feature as FeatureName);
};
