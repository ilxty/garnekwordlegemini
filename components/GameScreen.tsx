
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Game, GameStatus, Letter, LetterState, KeyStatus, Player } from '../types';
import { WORD_LENGTH, MAX_GUESSES, GUESS_SCORE_MAP, PLACEMENT_BONUS, KEYBOARD_LAYOUT, INITIAL_KEY_STATUS } from '../constants';
import { validateWord } from '../services/geminiService';
import WordleGrid from './WordleGrid';
import Keyboard from './Keyboard';
import GameModal from './GameModal';
import Spinner from './Spinner';
import { db } from '../firebaseConfig';
import { doc, updateDoc, serverTimestamp, collection, writeBatch } from 'firebase/firestore';

interface GameScreenProps {
    game: Game;
    playerId: string;
    onReturnToLobby: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ game, playerId, onReturnToLobby }) => {
    const [currentGuess, setCurrentGuess] = useState('');
    const [keyStatuses, setKeyStatuses] = useState<KeyStatus>(INITIAL_KEY_STATUS);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState(game.settings.timeLimit);

    const me = useMemo(() => game.players[playerId], [game.players, playerId]);
    const secretWord = useMemo(() => game.secretWords[game.currentRound - 1], [game.secretWords, game.currentRound]);
    const gameRef = useMemo(() => doc(db, 'games', game.id), [game.id]);

    const resetRoundState = useCallback(() => {
        setCurrentGuess('');
        setKeyStatuses(INITIAL_KEY_STATUS);
        setErrorMessage('');
    }, []);

    useEffect(() => {
        resetRoundState();
    }, [game.currentRound, resetRoundState]);

    useEffect(() => {
        if (game.status !== GameStatus.Playing || !game.roundStartTime) {
            if (game.status === GameStatus.Initializing) setIsLoading(true);
            else setIsLoading(false);
            return;
        }
        
        setIsLoading(false);

        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - game.roundStartTime!) / 1000);
            const remaining = game.settings.timeLimit - elapsed;
            setTimeLeft(Math.max(0, remaining));

            if (remaining <= 0 && !me.roundFinished) {
                // Time's up for this player
                updateDoc(gameRef, {
                    [`players.${playerId}.roundScore`]: 0,
                    [`players.${playerId}.roundFinished`]: true,
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [game.status, game.roundStartTime, game.settings.timeLimit, gameRef, me.roundFinished, playerId]);

    // Check if all players have finished the round
    useEffect(() => {
        if (game.status === GameStatus.Playing) {
            const allFinished = Object.values(game.players).every(p => p.roundFinished);
            if (allFinished) {
                updateDoc(gameRef, { status: GameStatus.RoundOver });
            }
        }
    }, [game.players, game.status, gameRef]);

    const submitGuess = useCallback(async () => {
        if (me.roundFinished) return;
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
        
        const newGuesses = [...me.guesses, currentGuess];

        if (currentGuess === secretWord) {
            const score = GUESS_SCORE_MAP[newGuesses.length] + PLACEMENT_BONUS;
            await updateDoc(gameRef, {
                [`players.${playerId}.guesses`]: newGuesses,
                [`players.${playerId}.roundScore`]: score,
                [`players.${playerId}.score`]: me.score + score,
                [`players.${playerId}.roundFinished`]: true,
            });
        } else if (newGuesses.length === MAX_GUESSES) {
             await updateDoc(gameRef, {
                [`players.${playerId}.guesses`]: newGuesses,
                [`players.${playerId}.roundScore`]: 0,
                [`players.${playerId}.roundFinished`]: true,
            });
        } else {
             await updateDoc(gameRef, {
                [`players.${playerId}.guesses`]: newGuesses,
            });
        }
        
        setCurrentGuess('');

    }, [currentGuess, me, secretWord, gameRef, playerId]);
    
     useEffect(() => {
        const newKeyStatuses = { ...INITIAL_KEY_STATUS };
        me.guesses.forEach(guess => {
            guess.split('').forEach((char, index) => {
                if (secretWord[index] === char) {
                    newKeyStatuses[char] = LetterState.Correct;
                } else if (secretWord.includes(char) && newKeyStatuses[char] !== LetterState.Correct) {
                    newKeyStatuses[char] = LetterState.Present;
                } else if (!secretWord.includes(char)) {
                    newKeyStatuses[char] = LetterState.Absent;
                }
            });
        });
        setKeyStatuses(newKeyStatuses);
    }, [me.guesses, secretWord]);

    const handleKeyPress = useCallback((key: string) => {
        if (game.status !== GameStatus.Playing || me.roundFinished) return;

        if (key === 'backspace') {
            setCurrentGuess((prev) => prev.slice(0, -1));
        } else if (key === 'enter') {
            submitGuess();
        } else if (currentGuess.length < WORD_LENGTH && /^[a-z]$/.test(key)) {
            setCurrentGuess((prev) => prev + key);
        }
    }, [game.status, currentGuess, submitGuess, me.roundFinished]);
    
    const handleNext = useCallback(async () => {
        if (playerId !== game.hostId) return;

        if (game.currentRound < game.settings.rounds) {
            const batch = writeBatch(db);
            
            Object.keys(game.players).forEach(pId => {
                const playerRef = doc(db, 'games', game.id);
                batch.update(playerRef, {
                    [`players.${pId}.guesses`]: [],
                    [`players.${pId}.roundScore`]: 0,
                    [`players.${pId}.roundFinished`]: false
                });
            });

            batch.update(gameRef, {
                status: GameStatus.Playing,
                currentRound: game.currentRound + 1,
                roundStartTime: serverTimestamp(),
            });
            
            await batch.commit();

        } else {
            await updateDoc(gameRef, { status: GameStatus.GameOver });
        }
    }, [playerId, game, gameRef]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isLoading) return;
            const isModalOpen = game.status === GameStatus.RoundOver || game.status === GameStatus.GameOver;
            if (isModalOpen) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (game.status === GameStatus.GameOver) onReturnToLobby();
                    else handleNext();
                }
                return;
            }
            if (game.status === GameStatus.Playing) {
                 if (event.key === 'Enter') handleKeyPress('enter');
                 else if (event.key === 'Backspace') handleKeyPress('backspace');
                 else if (/^[a-z]$/i.test(event.key) && event.key.length === 1) handleKeyPress(event.key.toLowerCase());
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [game.status, isLoading, handleKeyPress, handleNext, onReturnToLobby]);

    const coloredGuesses = useMemo(() => {
        return me.guesses.map(guess => {
            const guessChars = guess.split('');
            const secretChars = secretWord.split('');
            const result: Letter[] = Array(WORD_LENGTH).fill(null).map((_, i) => ({ char: guessChars[i], state: LetterState.Absent }));
            result.forEach((l, i) => { if (secretChars[i] === l.char) { result[i].state = LetterState.Correct; secretChars[i] = ' '; } });
            result.forEach((l, i) => { if(l.state !== LetterState.Correct && secretChars.includes(l.char)) { result[i].state = LetterState.Present; secretChars[secretChars.indexOf(l.char)] = ' ';} });
            return result;
        });
    }, [me.guesses, secretWord]);
    
    const sortedPlayers = useMemo(() => Object.values(game.players).sort((a, b) => b.score - a.score), [game.players]);

    return (
        <div className="flex flex-col md:flex-row items-start justify-center gap-8 w-full">
            {isLoading && <Spinner />}

            <div className="flex-grow w-full max-w-lg">
                <div className="flex justify-between items-center w-full mb-2 p-2 bg-gray-800 rounded-lg">
                    <div className="text-lg">Round: <span className="font-bold text-purple-400">{game.currentRound} / {game.settings.rounds}</span></div>
                    <div className="text-lg">Score: <span className="font-bold text-purple-400">{me.score}</span></div>
                    <div className="text-lg">Time: <span className="font-bold text-purple-400">{timeLeft}s</span></div>
                </div>

                <WordleGrid guesses={coloredGuesses} currentGuess={me.roundFinished ? '' : currentGuess} errorMessage={errorMessage} />
                <Keyboard onKeyPress={handleKeyPress} keyStatuses={keyStatuses} />
            </div>

            <div className="w-full md:w-64 bg-gray-800 p-4 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-purple-400 border-b border-gray-700 pb-2">Scoreboard</h3>
                <ul className="space-y-3">
                    {sortedPlayers.map((player) => (
                        <li key={player.id} className={`p-3 rounded-lg transition-all duration-300 ${player.id === playerId ? 'bg-purple-900/50 ring-2 ring-purple-500' : 'bg-gray-700'}`}>
                            <div className="flex justify-between items-center font-bold">
                                <span className="truncate">{player.nickname}</span>
                                <span>{player.score}</span>
                            </div>
                            <div className="text-right text-xs text-gray-400 mt-1">
                                {player.roundFinished ? `Finished Round` : `Guess ${player.guesses.length + 1}/${MAX_GUESSES}`}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
            <GameModal
                isOpen={game.status === GameStatus.RoundOver || game.status === GameStatus.GameOver}
                status={game.status}
                roundScore={me.roundScore}
                totalScore={me.score}
                secretWord={secretWord}
                onNext={handleNext}
                onPlayAgain={onReturnToLobby}
                isFinalRound={game.currentRound === game.settings.rounds}
                isHost={playerId === game.hostId}
                players={sortedPlayers}
            />
        </div>
    );
};

export default GameScreen;