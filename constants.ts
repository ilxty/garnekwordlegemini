
import { LetterState, type KeyStatus } from './types';

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export const ROUND_OPTIONS = [3, 5, 7];
export const TIME_OPTIONS = [60, 90, 120];

export const GUESS_SCORE_MAP: { [key: number]: number } = {
    1: 100,
    2: 85,
    3: 70,
    4: 55,
    5: 40,
    6: 25,
};

export const PLACEMENT_BONUS = 50; // Single player, so they are always "1st"

export const KEYBOARD_LAYOUT = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
];

export const INITIAL_KEY_STATUS: KeyStatus = 'abcdefghijklmnopqrstuvwxyz'.split('').reduce((acc, char) => {
    acc[char] = LetterState.Empty;
    return acc;
}, {} as KeyStatus);
