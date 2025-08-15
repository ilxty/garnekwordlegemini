import React, { useState } from 'react';

interface LobbyScreenProps {
    onNicknameSet: (nickname: string) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onNicknameSet }) => {
    const [nickname, setNickname] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            onNicknameSet(nickname.trim());
        }
    };

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">Enter the Arena</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-400 mb-2">
                        Choose Your Nickname
                    </label>
                    <input
                        id="nickname"
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Your battle name..."
                        className="w-full bg-gray-700 border-gray-600 rounded-md py-3 px-4 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        required
                        maxLength={15}
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={!nickname.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </form>
        </div>
    );
};

export default LobbyScreen;