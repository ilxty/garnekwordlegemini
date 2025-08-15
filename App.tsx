
import React, { useState, useCallback, useEffect } from 'react';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import MultiplayerLobby from './components/MultiplayerLobby';
import { Game, GameStatus } from './types';
import { db } from './firebaseConfig';
import { doc, onSnapshot, collection } from 'firebase/firestore';

const App: React.FC = () => {
    const [nickname, setNickname] = useState<string | null>(localStorage.getItem('nickname'));
    const [playerId, setPlayerId] = useState<string | null>(localStorage.getItem('playerId'));
    const [gameId, setGameId] = useState<string | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    
    useEffect(() => {
        if (playerId) return;
        const newPlayerId = doc(collection(db, 'players')).id;
        setPlayerId(newPlayerId);
        localStorage.setItem('playerId', newPlayerId);
    }, [playerId]);

    const handleNicknameSet = useCallback((name: string) => {
        setNickname(name);
        localStorage.setItem('nickname', name);
    }, []);
    
    const handleJoinGame = useCallback((newGameId: string) => {
        setGameId(newGameId);
    }, []);

    const handleReturnToLobby = useCallback(() => {
        setGameId(null);
        setGame(null);
    }, []);
    
    useEffect(() => {
        if (!gameId) return;

        const unsub = onSnapshot(doc(db, "games", gameId), (doc) => {
            if (doc.exists()) {
                setGame(doc.data() as Game);
            } else {
                console.error("Game not found!");
                setGameId(null);
                setGame(null);
            }
        });

        return () => unsub();
    }, [gameId]);


    const renderContent = () => {
        if (!nickname || !playerId) {
            return <LobbyScreen onNicknameSet={handleNicknameSet} />;
        }
        if (game && game.status !== GameStatus.Waiting) {
             return <GameScreen 
                        game={game} 
                        playerId={playerId} 
                        onReturnToLobby={handleReturnToLobby} 
                    />
        }
        return <MultiplayerLobby 
                    nickname={nickname}
                    playerId={playerId}
                    game={game} 
                    onJoinGame={handleJoinGame}
                />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Gemini Wordle Battle
                </h1>
                <p className="text-gray-400 mt-2">Challenge your friends in a real-time word-guessing showdown!</p>
            </header>
            
            <main className="w-full max-w-4xl">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;