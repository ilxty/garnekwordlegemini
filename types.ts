
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
    Initializing,
    Playing,
    WonRound,
    LostRound,
    GameOver,
}

export interface GameSettings {
    nickname: string;
    rounds: number;
    timeLimit: number;
}
