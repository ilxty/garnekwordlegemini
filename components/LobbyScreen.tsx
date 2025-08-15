
import React, { useState } from 'react';
import { type GameSettings } from '../types';
import { ROUND_OPTIONS, TIME_OPTIONS } from '../constants';

interface LobbyScreenProps {
    onGameStart: (settings: GameSettings) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onGameStart }) => {
    const [nickname, setNickname] = useState('');
    const [rounds, setRounds] = useState(ROUND_OPTIONS[1]);
    const [timeLimit, setTimeLimit] = useState(TIME_OPTIONS[1]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            onGameStart({ nickname: nickname.trim(), rounds, timeLimit });
        }
    };

    const SettingSelector = <T extends number,>({ label, options, value, onChange }: { label: string; options: T[]; value: T; onChange: (value: T) => void; }) => (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-400 mb-2">{label}</label>
            <div className="flex space-x-2">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 ${value === option
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">Game Setup</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-400 mb-2">
                        Nickname
                    </label>
                    <input
                        id="nickname"
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter your nickname"
                        className="w-full bg-gray-700 border-gray-600 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        required
                        maxLength={15}
                    />
                </div>
                
                <SettingSelector label="Number of Rounds" options={ROUND_OPTIONS} value={rounds} onChange={setRounds} />
                <SettingSelector label="Time Limit (Seconds)" options={TIME_OPTIONS} value={timeLimit} onChange={setTimeLimit} />
                
                <button
                    type="submit"
                    disabled={!nickname.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Start Game
                </button>
            </form>
        </div>
    );
};

export default LobbyScreen;
