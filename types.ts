export enum LetterState {
    Correct, // Green
    Present, // Yellow
    Absent,  // Gray
    Empty,   // Default
}

export interface Letter {
    char: string;
    state: LetterState;
}

export type Guess = Letter[];

export type KeyStatus = { [key: string]: LetterState };

export enum GameStatus {
    Waiting,
    Initializing,
    Playing,
    RoundOver,
    GameOver,
}

export interface Player {
    id: string;
    nickname: string;
    score: number;
    guesses: string[];
    roundScore: number;
    roundFinished: boolean;
}

export interface GameSettings {
    rounds: number;
    timeLimit: number;
}

export interface Game {
    id: string;
    hostId: string;
    settings: GameSettings;
    players: { [id: string]: Player };
    status: GameStatus;
    currentRound: number;
    secretWords: string[];
    roundStartTime: number | null;
}