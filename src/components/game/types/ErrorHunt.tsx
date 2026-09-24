import React, { useState } from 'react';
import { ErrorHuntQuestion } from '../../../data/questions';

interface Props {
  question: ErrorHuntQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const ErrorHunt: React.FC<Props> = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selected !== null) {
      onAnswer(selected === question.correctOption);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1e1e1e] p-6 rounded-xl font-mono text-red-400 whitespace-pre shadow-inner overflow-x-auto border border-red-900/30">
        {question.code}
      </div>

      <div className="grid gap-3 mt-6">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(idx)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selected === idx 
                ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.2)]' 
                : 'bg-black/40 border-gray-800 hover:border-gray-600 hover:bg-black/60'
            }`}
          >
            <span className="text-sm md:text-base">{option}</span>
          </button>
        ))}
      </div>

      <div className="pt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
        >
          REPORTAR BUG
        </button>
      </div>
    </div>
  );
};
