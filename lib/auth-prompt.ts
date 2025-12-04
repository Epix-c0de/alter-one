import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    LAST_SHOWN: 'auth_prompt_last_shown',
    IGNORE_UNTIL: 'auth_prompt_ignore_until',
    USAGE_COUNT: 'app_usage_count_guest',
    PROMPT_CONTEXT: 'auth_prompt_last_context',
};

const COOLDOWN_HOURS = 24;

export type PromptContext = 'session' | 'favorites' | 'premium' | 'download' | 'general';

/**
 * Check if the auth prompt should be shown based on cooldown and user preferences
 */
export const shouldShowPrompt = async (context: PromptContext): Promise<boolean> => {
    try {
        const ignoreUntil = await AsyncStorage.getItem(STORAGE_KEYS.IGNORE_UNTIL);

        if (ignoreUntil) {
            const ignoreTimestamp = parseInt(ignoreUntil, 10);
            const now = Date.now();

            if (now < ignoreTimestamp) {
                return false; // Still in cooldown period
            }
        }

        return true;
    } catch (error) {
        console.error('Error checking prompt status:', error);
        return true; // Default to showing if there's an error
    }
};

/**
 * Record that the prompt was shown and the user's action
 */
export const recordPromptShown = async (action: 'signup' | 'later' | 'ignore'): Promise<void> => {
    try {
        const now = Date.now();
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SHOWN, now.toString());

        if (action === 'ignore') {
            // Set 24-hour cooldown
            const ignoreUntil = now + (COOLDOWN_HOURS * 60 * 60 * 1000);
            await AsyncStorage.setItem(STORAGE_KEYS.IGNORE_UNTIL, ignoreUntil.toString());
        } else if (action === 'later') {
            // Set shorter cooldown (1 hour)
            const ignoreUntil = now + (1 * 60 * 60 * 1000);
            await AsyncStorage.setItem(STORAGE_KEYS.IGNORE_UNTIL, ignoreUntil.toString());
        }
    } catch (error) {
        console.error('Error recording prompt action:', error);
    }
};

/**
 * Increment and return the guest usage count
 */
export const incrementUsageCount = async (): Promise<number> => {
    try {
        const countStr = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_COUNT);
        const count = countStr ? parseInt(countStr, 10) : 0;
        const newCount = count + 1;
        await AsyncStorage.setItem(STORAGE_KEYS.USAGE_COUNT, newCount.toString());
        return newCount;
    } catch (error) {
        console.error('Error incrementing usage count:', error);
        return 0;
    }
};

/**
 * Get current guest usage count
 */
export const getUsageCount = async (): Promise<number> => {
    try {
        const countStr = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_COUNT);
        return countStr ? parseInt(countStr, 10) : 0;
    } catch (error) {
        console.error('Error getting usage count:', error);
        return 0;
    }
};

/**
 * Reset all prompt-related storage (call when user signs up)
 */
export const resetPromptData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.LAST_SHOWN,
            STORAGE_KEYS.IGNORE_UNTIL,
            STORAGE_KEYS.USAGE_COUNT,
            STORAGE_KEYS.PROMPT_CONTEXT,
        ]);
    } catch (error) {
        console.error('Error resetting prompt data:', error);
    }
};

/**
 * Clear the cooldown timer (for testing or manual reset)
 */
export const clearCooldown = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.IGNORE_UNTIL);
    } catch (error) {
        console.error('Error clearing cooldown:', error);
    }
};
