// Bible reference formatter for feed captions

/**
 * Auto-format Bible references in text
 * Converts patterns like "John 3:16" into formatted references
 */
export function formatBibleReferences(text: string): string {
    // Pattern to match Bible references like "John 3:16" or "1 Corinthians 13:4-7"
    const bibleRefPattern = /\b(\d?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s(\d+):(\d+)(?:-(\d+))?\b/g;

    return text.replace(bibleRefPattern, (match) => {
        // For now, just wrap in a special format
        // In a real implementation, this could link to Bible Gateway or similar
        return `📖 ${match}`;
    });
}

/**
 * Extract all Bible references from text
 */
export function extractBibleReferences(text: string): string[] {
    const bibleRefPattern = /\b(\d?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s(\d+):(\d+)(?:-(\d+))?\b/g;
    const matches = text.match(bibleRefPattern);
    return matches || [];
}

/**
 * Check if text contains Bible references
 */
export function hasBibleReferences(text: string): boolean {
    const bibleRefPattern = /\b(\d?\s?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s(\d+):(\d+)(?:-(\d+))?\b/g;
    return bibleRefPattern.test(text);
}
