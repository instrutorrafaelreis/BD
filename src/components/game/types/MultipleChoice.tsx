import React, { useState } from 'react';
import { MultipleChoiceQuestion } from '../../../data/questions';
import { motion } from 'framer-motion';

interface Props {
  question: MultipleChoiceQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const MultipleChoice: React.FC<Props> = ({ question, onAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selected !== null) {
      onAnswer(selected === question.correctOption);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(idx)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selected === idx 
                ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
                : 'bg-black/40 border-gray-800 hover:border-gray-600 hover:bg-black/60'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono ${
                selected === idx ? 'border-cyan-500 text-cyan-400' : 'border-gray-700 text-gray-500'
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="text-lg">{option}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
        >
          CONFIRMAR
        </button>
      </div>
    </div>
  );
};
