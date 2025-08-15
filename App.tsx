
import React, { useState, useCallback } from 'react';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import { type GameSettings } from './types';

const App: React.FC = () => {
    const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);

    const handleGameStart = useCallback((settings: GameSettings) => {
        setGameSettings(settings);
    }, []);
    
    const handleReturnToLobby = useCallback(() => {
        setGameSettings(null);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                    Gemini Wordle Battle
                </h1>
                <p className="text-gray-400 mt-2">How many words can you guess against the clock?</p>
            </header>
            
            <main className="w-full max-w-2xl">
                {!gameSettings ? (
                    <LobbyScreen onGameStart={handleGameStart} />
                ) : (
                    <GameScreen settings={gameSettings} onReturnToLobby={handleReturnToLobby} />
                )}
            </main>
        </div>
    );
};

export default App;
