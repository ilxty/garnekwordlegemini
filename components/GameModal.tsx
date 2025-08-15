
import React from 'react';
import { GameStatus } from '../types';

interface GameModalProps {
    isOpen: boolean;
    status: GameStatus;
    roundScore: number;
    totalScore: number;
    secretWord: string;
    onNext: () => void;
    onPlayAgain: () => void;
    isFinalRound: boolean;
}

const GameModal: React.FC<GameModalProps> = ({ isOpen, status, roundScore, totalScore, secretWord, onNext, onPlayAgain, isFinalRound }) => {
    if (!isOpen) return null;

    const isWin = status === GameStatus.WonRound;
    const isGameOver = status === GameStatus.GameOver;

    const title = isGameOver ? "Game Over!" : (isWin ? "You Won This Round!" : "Round Lost");
    const titleColor = isGameOver ? 'text-purple-400' : (isWin ? 'text-green-400' : 'text-red-400');

    const nextButtonText = isFinalRound ? "View Final Score" : "Next Round";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
                <h2 className={`text-3xl font-bold mb-4 ${titleColor}`}>{title}</h2>
                
                {!isGameOver && (
                    <>
                        <p className="text-gray-400 mb-2">The word was:</p>
                        <p className="text-2xl font-bold tracking-widest uppercase text-white mb-6">{secretWord}</p>
                        <p className="text-lg">Round Score: <span className="font-bold text-yellow-400">+{roundScore}</span></p>
                    </>
                )}
                
                <p className="text-xl mt-2 mb-8">Total Score: <span className="font-bold text-purple-400">{totalScore}</span></p>
                
                {isGameOver ? (
                    <button
                        onClick={onPlayAgain}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity"
                    >
                        Play Again
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity"
                    >
                        {nextButtonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default GameModal;
