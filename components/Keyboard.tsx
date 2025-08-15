
import React from 'react';
import { KEYBOARD_LAYOUT } from '../constants';
import { type KeyStatus, LetterState } from '../types';

interface KeyboardProps {
    onKeyPress: (key: string) => void;
    keyStatuses: KeyStatus;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, keyStatuses }) => {

    const getKeyBgColor = (key: string): string => {
        const state = keyStatuses[key];
        switch (state) {
            case LetterState.Correct:
                return 'bg-green-600';
            case LetterState.Present:
                return 'bg-yellow-500';
            case LetterState.Absent:
                return 'bg-gray-700';
            default:
                return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-4">
            {KEYBOARD_LAYOUT.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1.5 my-1.5">
                    {row.map((key) => {
                        const isSpecialKey = key === 'enter' || key === 'backspace';
                        return (
                            <button
                                key={key}
                                onClick={() => onKeyPress(key)}
                                className={`h-14 rounded-md font-semibold uppercase text-white transition-colors duration-200 ${isSpecialKey ? 'flex-grow px-2 text-xs' : 'flex-1'} ${getKeyBgColor(key)}`}
                            >
                                {key === 'backspace' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 002.828 0L21 12M3 12l6.414-6.414a2 2 0 012.828 0L21 12" />
                                    </svg>
                                ) : key}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Keyboard;
