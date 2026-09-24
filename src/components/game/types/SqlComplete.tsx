import React, { useState } from 'react';
import { SqlCompleteQuestion } from '../../../data/questions';

interface Props {
  question: SqlCompleteQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const SqlComplete: React.FC<Props> = ({ question, onAnswer }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    const isCorrect = input.trim().toLowerCase() === question.expectedWord.toLowerCase();
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#1e1e1e] p-6 rounded-xl font-mono text-lg leading-relaxed whitespace-pre shadow-inner">
        <span className="text-blue-400">{question.codeBefore}</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="bg-black/50 border border-cyan-500/50 outline-none text-yellow-300 px-2 py-1 rounded w-32 md:w-48 text-center mx-2 focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition"
          autoFocus
        />
        <span className="text-blue-400">{question.codeAfter}</span>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
        >
          CONFIRMAR
        </button>
      </div>
    </div>
  );
};
