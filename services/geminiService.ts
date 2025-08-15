import { WORDS } from '../wordlist';
import { SECRET_WORDS } from '../secretWordlist';

// Using a Set for O(1) lookups, which is much faster for validation.
const wordSet = new Set(WORDS);

/**
 * Selects a specified number of unique random words from the secret word list.
 * @param count The number of secret words to generate.
 * @returns A promise that resolves to an array of unique 5-letter secret words.
 */
export const generateSecretWords = async (count: number): Promise<string[]> => {
    const words = new Set<string>();
    while (words.size < count && words.size < SECRET_WORDS.length) {
        const randomIndex = Math.floor(Math.random() * SECRET_WORDS.length);
        words.add(SECRET_WORDS[randomIndex]);
    }
    return Promise.resolve(Array.from(words));
};

/**
 * Validates a word against the local comprehensive word list.
 * @param word The word to validate.
 * @returns A promise that resolves to true if the word is valid, false otherwise.
 */
export const validateWord = async (word: string): Promise<boolean> => {
    // The async/Promise is kept for signature consistency.
    return Promise.resolve(wordSet.has(word.toLowerCase()));
};