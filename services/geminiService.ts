import { WORDS } from '../wordlist';
import { SECRET_WORDS } from '../secretWordlist';

// Using a Set for O(1) lookups, which is much faster for validation.
const wordSet = new Set(WORDS);

/**
 * Selects a random word from the official secret word list.
 * @returns A promise that resolves to a 5-letter secret word.
 */
export const generateSecretWord = async (): Promise<string> => {
    const randomIndex = Math.floor(Math.random() * SECRET_WORDS.length);
    // The async/Promise is kept to maintain the function signature
    // and avoid having to refactor the calling component.
    return Promise.resolve(SECRET_WORDS[randomIndex]);
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