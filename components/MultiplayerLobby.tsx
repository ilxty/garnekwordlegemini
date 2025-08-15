
import React, { useState } from 'react';
import { Game, GameSettings, GameStatus, Player } from '../types';
import { ROUND_OPTIONS, TIME_OPTIONS } from '../constants';
import { db } from '../firebaseConfig';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp, collection } from 'firebase/firestore';
import { generateSecretWords } from '../services/geminiService';
import Spinner from './Spinner';

interface MultiplayerLobbyProps {
    nickname: string;
    playerId: string;
    game: Game | null;
    onJoinGame: (gameId: string) => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ nickname, playerId, game, onJoinGame }) => {
    const [joinGameId, setJoinGameId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State for host's game settings
    const [rounds, setRounds] = useState(ROUND_OPTIONS[1]);
    const [timeLimit, setTimeLimit] = useState(TIME_OPTIONS[1]);
    
    const isHost = game?.hostId === playerId;

    const handleCreateGame = async () => {
        setIsLoading(true);
        const gameId = doc(collection(db, 'games')).id.substring(0, 6).toUpperCase();
        try {
            const secretWords = await generateSecretWords(rounds);

            const hostPlayer: Player = {
                id: playerId,
                nickname,
                score: 0,
                guesses: [],
                roundScore: 0,
                roundFinished: false,
            };

            const newGame: Game = {
                id: gameId,
                hostId: playerId,
                settings: { rounds, timeLimit },
                players: { [playerId]: hostPlayer },
                status: GameStatus.Waiting,
                currentRound: 1,
                secretWords,
                roundStartTime: null,
            };
            
            await setDoc(doc(db, 'games', gameId), newGame);
            onJoinGame(gameId);
        } catch (e) {
            setError('Failed to create game. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinGame = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = joinGameId.toUpperCase();
        if (!id) return;
        setIsLoading(true);
        setError('');

        const gameRef = doc(db, 'games', id);
        const gameDoc = await getDoc(gameRef);

        if (gameDoc.exists() && gameDoc.data().status === GameStatus.Waiting) {
            const newPlayer: Player = {
                id: playerId,
                nickname,
                score: 0,
                guesses: [],
                roundScore: 0,
                roundFinished: false,
            };
            await updateDoc(gameRef, {
                [`players.${playerId}`]: newPlayer
            });
            onJoinGame(id);
        } else {
            setError('Game not found or has already started.');
        }
        setIsLoading(false);
    };
    
    const handleStartGame = async () => {
        if (!game || !isHost) return;
        setIsLoading(true);
        const gameRef = doc(db, 'games', game.id);
        // Update settings in case host changed them
        const secretWords = await generateSecretWords(rounds);
        await updateDoc(gameRef, {
            status: GameStatus.Playing,
            roundStartTime: serverTimestamp(),
            settings: { rounds, timeLimit },
            secretWords,
        });
        setIsLoading(false);
    }
    
    const SettingSelector = <T extends number,>({ label, options, value, onChange, disabled }: { label: string; options: T[]; value: T; onChange: (value: T) => void; disabled: boolean }) => (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-400 mb-2">{label}</label>
            <div className="flex space-x-2">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        disabled={disabled}
                        className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 ${value === option
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50'
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
    
    if (isLoading) return <Spinner />;

    if (game) {
        return (
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto animate-fade-in">
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-200">Game Lobby</h2>
                <div className="text-center mb-6">
                    <p className="text-gray-400">Share this code with your friends:</p>
                    <div className="my-2 p-3 bg-gray-900 rounded-lg text-3xl font-mono tracking-widest text-purple-400 cursor-pointer"
                         onClick={() => navigator.clipboard.writeText(game.id)}>
                        {game.id}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-3">Players ({Object.keys(game.players).length}/8)</h3>
                        <ul className="space-y-2 bg-gray-700 p-3 rounded-md min-h-[120px]">
                            {(Object.values(game.players) as Player[]).map(p => (
                                <li key={p.id} className="text-white font-medium">{p.nickname} {p.id === game.hostId && '(Host)'}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <SettingSelector label="Rounds" options={ROUND_OPTIONS} value={isHost ? rounds : game.settings.rounds} onChange={setRounds} disabled={!isHost} />
                        <SettingSelector label="Time (Seconds)" options={TIME_OPTIONS} value={isHost ? timeLimit: game.settings.timeLimit} onChange={setTimeLimit} disabled={!isHost} />
                    </div>
                </div>

                <div className="mt-8">
                    {isHost ? (
                        <button
                            onClick={handleStartGame}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity"
                        >
                            Start Game
                        </button>
                    ) : (
                        <p className="text-center text-gray-400 italic">Waiting for host to start the game...</p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto animate-fade-in">
             <div className="space-y-6">
                <button onClick={handleCreateGame} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity duration-200">
                    Create New Game
                </button>
                
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <form onSubmit={handleJoinGame} className="space-y-3">
                    <div>
                        <label htmlFor="joinGameId" className="block text-sm font-medium text-gray-400 mb-2">
                            Join with Game Code
                        </label>
                        <input
                            id="joinGameId"
                            type="text"
                            value={joinGameId}
                            onChange={(e) => setJoinGameId(e.target.value)}
                            placeholder="Enter 6-letter code"
                            className="w-full bg-gray-700 border-gray-600 rounded-md py-3 px-4 text-white uppercase focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            maxLength={6}
                        />
                    </div>
                    <button type="submit" disabled={!joinGameId} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        Join Game
                    </button>
                     {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default MultiplayerLobby;