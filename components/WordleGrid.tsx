
import React from 'react';
import { type Guess } from '../types';
import { LetterState } from '../types';
import { MAX_GUESSES, WORD_LENGTH } from '../constants';

interface WordleGridProps {
    guesses: Guess[];
    currentGuess: string;
    errorMessage: string;
}

const getTileBgColor = (state: LetterState): string => {
    switch (state) {
        case LetterState.Correct:
            return 'bg-green-600';
        case LetterState.Present:
            return 'bg-yellow-500';
        case LetterState.Absent:
            return 'bg-gray-700';
        default:
            return 'bg-gray-800 border-gray-600';
    }
};

const GridRow: React.FC<{ guess?: Guess, isCurrent?: boolean, currentGuessValue?: string }> = ({ guess, isCurrent = false, currentGuessValue = '' }) => {
    const tiles = Array(WORD_LENGTH).fill(0);
    
    return (
        <div className="grid grid-cols-5 gap-1.5">
            {tiles.map((_, i) => {
                const char = guess ? guess[i].char : (isCurrent && currentGuessValue[i] ? currentGuessValue[i] : '');
                const state = guess ? guess[i].state : LetterState.Empty;
                const isSubmitted = !!guess;

                const tileClasses = `w-14 h-14 sm:w-16 sm:h-16 border-2 flex items-center justify-center text-3xl font-bold uppercase rounded-md transition-all duration-500 transform ${getTileBgColor(state)} ${isSubmitted ? 'border-transparent' : 'border-gray-600'}`;
                
                const animationDelay = isSubmitted ? `${i * 100}ms` : '0ms';

                return (
                    <div key={i} className={tileClasses} style={{ transitionDelay: animationDelay }}>
                        {char}
                    </div>
                );
            })}
        </div>
    );
};


const WordleGrid: React.FC<WordleGridProps> = ({ guesses, currentGuess, errorMessage }) => {
    const emptyRowsCount = MAX_GUESSES - guesses.length - 1;
    
    return (
        <div className="flex flex-col items-center mb-6">
            <div className={`h-6 mb-2 text-red-400 font-semibold transition-opacity duration-300 ${errorMessage ? 'opacity-100' : 'opacity-0'}`}>
                {errorMessage}
            </div>
            <div className="grid grid-rows-6 gap-1.5">
                {guesses.map((guess, i) => (
                    <GridRow key={i} guess={guess} />
                ))}
                {guesses.length < MAX_GUESSES && (
                    <GridRow isCurrent={true} currentGuessValue={currentGuess} />
                )}
                {emptyRowsCount > 0 && Array(emptyRowsCount).fill(0).map((_, i) => (
                    <GridRow key={i} />
                ))}
            </div>
        </div>
    );
};

export default WordleGrid;
