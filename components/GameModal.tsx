import React from 'react';
import { GameStatus, Player } from '../types';

interface GameModalProps {
    isOpen: boolean;
    status: GameStatus;
    roundScore: number;
    totalScore: number;
    secretWord: string;
    onNext: () => void;
    onPlayAgain: () => void;
    isFinalRound: boolean;
    isHost: boolean;
    players: Player[];
}

const GameModal: React.FC<GameModalProps> = ({ isOpen, status, roundScore, totalScore, secretWord, onNext, onPlayAgain, isFinalRound, isHost, players }) => {
    if (!isOpen) return null;

    const isGameOver = status === GameStatus.GameOver;
    const isRoundOver = status === GameStatus.RoundOver;
    const isWin = roundScore > 0;

    const title = isGameOver ? "Game Over!" : "Round Complete";
    const titleColor = 'text-purple-400';

    const nextButtonText = isFinalRound ? "View Final Score" : "Next Round";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 shadow-2xl max-w-md w-full text-center animate-fade-in-up">
                <h2 className={`text-3xl font-bold mb-4 ${titleColor}`}>{title}</h2>
                
                {isGameOver ? (
                    <>
                        <p className="text-xl mb-4 text-gray-300">Final Standings:</p>
                        <ul className="space-y-2 text-left mb-8">
                            {players.map((p, index) => (
                                <li key={p.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <span className="font-bold text-lg">{index + 1}. {p.nickname}</span>
                                    <span className="font-semibold text-purple-400">{p.score} pts</span>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                     <>
                        <p className="text-gray-400 mb-2">The word was:</p>
                        <p className="text-2xl font-bold tracking-widest uppercase text-white mb-6">{secretWord}</p>
                        <p className="text-lg">Your Round Score: <span className={`font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                            {isWin ? `+${roundScore}`: '0'}
                        </span></p>
                         <p className="text-xl mt-2 mb-8">Your Total Score: <span className="font-bold text-purple-400">{totalScore}</span></p>
                    </>
                )}
                
                {isGameOver ? (
                    <button
                        onClick={onPlayAgain}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity"
                    >
                        Play Again
                    </button>
                ) : (
                    isHost ? (
                         <button
                            onClick={onNext}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity"
                        >
                            {nextButtonText}
                        </button>
                    ) : (
                        <p className="text-gray-400 italic">Waiting for host to start the next round...</p>
                    )
                )}
            </div>
        </div>
    );
};

export default GameModal;