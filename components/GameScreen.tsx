import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameSettings, GameStatus, Letter, LetterState, KeyStatus } from '../types';
import { WORD_LENGTH, MAX_GUESSES, GUESS_SCORE_MAP, PLACEMENT_BONUS, KEYBOARD_LAYOUT, INITIAL_KEY_STATUS } from '../constants';
import { generateSecretWord, validateWord } from '../services/geminiService';
import WordleGrid from './WordleGrid';
import Keyboard from './Keyboard';
import GameModal from './GameModal';
import Spinner from './Spinner';

interface GameScreenProps {
    settings: GameSettings;
    onReturnToLobby: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ settings, onReturnToLobby }) => {
    const [secretWord, setSecretWord] = useState('');
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Initializing);
    const [round, setRound] = useState(1);
    const [totalScore, setTotalScore] = useState(0);
    const [roundScore, setRoundScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
    const [keyStatuses, setKeyStatuses] = useState<KeyStatus>(INITIAL_KEY_STATUS);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const startNewRound = useCallback(async () => {
        setIsLoading(true);
        setGameStatus(GameStatus.Initializing);
        const newWord = await generateSecretWord();
        setSecretWord(newWord);
        setGuesses([]);
        setCurrentGuess('');
        setKeyStatuses(INITIAL_KEY_STATUS);
        setTimeLeft(settings.timeLimit);
        setGameStatus(GameStatus.Playing);
        setIsLoading(false);
    }, [settings.timeLimit]);
    
    useEffect(() => {
        startNewRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [round]);

    useEffect(() => {
        if (gameStatus !== GameStatus.Playing || isLoading) return;

        if (timeLeft <= 0) {
            setRoundScore(0);
            setGameStatus(GameStatus.LostRound);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStatus, timeLeft, isLoading]);

    const submitGuess = useCallback(async () => {
        if (currentGuess.length !== WORD_LENGTH) {
            setErrorMessage("Not enough letters");
            setTimeout(() => setErrorMessage(''), 2000);
            return;
        }

        setIsLoading(true);
        const isValid = await validateWord(currentGuess);
        setIsLoading(false);

        if (!isValid) {
            setErrorMessage("Not in word list");
            setTimeout(() => setErrorMessage(''), 2000);
            return;
        }

        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        
        // Update key statuses
        const newKeyStatuses = { ...keyStatuses };
        currentGuess.split('').forEach((char, index) => {
            if (secretWord[index] === char) {
                newKeyStatuses[char] = LetterState.Correct;
            } else if (secretWord.includes(char) && newKeyStatuses[char] !== LetterState.Correct) {
                newKeyStatuses[char] = LetterState.Present;
            } else if (!secretWord.includes(char)) {
                newKeyStatuses[char] = LetterState.Absent;
            }
        });
        setKeyStatuses(newKeyStatuses);
        
        setCurrentGuess('');

        if (currentGuess === secretWord) {
            const score = GUESS_SCORE_MAP[newGuesses.length] + PLACEMENT_BONUS;
            setRoundScore(score);
            setTotalScore(prev => prev + score);
            setGameStatus(GameStatus.WonRound);
        } else if (newGuesses.length === MAX_GUESSES) {
            setRoundScore(0);
            setGameStatus(GameStatus.LostRound);
        }
    }, [currentGuess, guesses, secretWord, keyStatuses]);

    const handleKeyPress = useCallback((key: string) => {
        if (gameStatus !== GameStatus.Playing) return;

        if (key === 'backspace') {
            setCurrentGuess((prev) => prev.slice(0, -1));
        } else if (key === 'enter') {
            submitGuess();
        } else if (currentGuess.length < WORD_LENGTH && /^[a-z]$/.test(key)) {
            setCurrentGuess((prev) => prev + key);
        }
    }, [gameStatus, currentGuess, submitGuess]);
    
    const handleNext = useCallback(() => {
        if (round < settings.rounds) {
            setRound(prev => prev + 1);
        } else {
            setGameStatus(GameStatus.GameOver);
        }
    }, [round, settings.rounds]);
    
    // Handle physical keyboard input
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isLoading) return;

            const { key } = event;
            const isModalOpen = gameStatus === GameStatus.WonRound || gameStatus === GameStatus.LostRound || gameStatus === GameStatus.GameOver;

            if (isModalOpen) {
                if (key === 'Enter') {
                    event.preventDefault();
                    if (gameStatus === GameStatus.GameOver) {
                        onReturnToLobby();
                    } else {
                        handleNext();
                    }
                }
                return;
            }
            
            if (gameStatus === GameStatus.Playing) {
                if (key === 'Enter') {
                    handleKeyPress('enter');
                } else if (key === 'Backspace') {
                    handleKeyPress('backspace');
                } else if (/^[a-z]$/i.test(key) && key.length === 1) {
                    handleKeyPress(key.toLowerCase());
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStatus, isLoading, handleKeyPress, handleNext, onReturnToLobby]);

    const coloredGuesses = useMemo(() => {
        return guesses.map(guess => {
            const guessChars = guess.split('');
            const secretChars = secretWord.split('');
            const result: Letter[] = Array(WORD_LENGTH).fill(null).map((_, i) => ({ char: guessChars[i], state: LetterState.Absent }));
            
            // Mark correct letters (green)
            result.forEach((letter, i) => {
                if (secretChars[i] === letter.char) {
                    result[i].state = LetterState.Correct;
                    secretChars[i] = ' '; // Mark as used
                }
            });

            // Mark present letters (yellow)
            result.forEach((letter, i) => {
                if(letter.state !== LetterState.Correct && secretChars.includes(letter.char)) {
                    result[i].state = LetterState.Present;
                    secretChars[secretChars.indexOf(letter.char)] = ' '; // Mark as used
                }
            });
            
            return result;
        });
    }, [guesses, secretWord]);

    return (
        <div className="flex flex-col items-center justify-between w-full h-full">
            {isLoading && <Spinner />}

            <div className="flex justify-between items-center w-full max-w-lg mb-4 p-2 bg-gray-800 rounded-lg">
                <div className="text-lg">Round: <span className="font-bold text-purple-400">{round} / {settings.rounds}</span></div>
                <div className="text-lg">Score: <span className="font-bold text-purple-400">{totalScore}</span></div>
                <div className="text-lg">Time: <span className="font-bold text-purple-400">{timeLeft}s</span></div>
            </div>

            <WordleGrid guesses={coloredGuesses} currentGuess={currentGuess} errorMessage={errorMessage} />
            <Keyboard onKeyPress={handleKeyPress} keyStatuses={keyStatuses} />
            
            <GameModal
                isOpen={gameStatus === GameStatus.WonRound || gameStatus === GameStatus.LostRound || gameStatus === GameStatus.GameOver}
                status={gameStatus}
                roundScore={roundScore}
                totalScore={totalScore}
                secretWord={secretWord}
                onNext={handleNext}
                onPlayAgain={onReturnToLobby}
                isFinalRound={round === settings.rounds}
            />
        </div>
    );
};

export default GameScreen;