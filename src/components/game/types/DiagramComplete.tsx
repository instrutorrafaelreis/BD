import React, { useState } from 'react';
import { DiagramCompleteQuestion } from '../../../data/questions';

interface Props {
  question: DiagramCompleteQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const DiagramComplete: React.FC<Props> = ({ question, onAnswer }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    const isCorrect = input.trim().toLowerCase() === question.expectedAnswer.toLowerCase();
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 flex justify-center">
        <div className="bg-black/50 p-4 border border-cyan-500/30 rounded-lg inline-block text-center font-mono text-cyan-300">
          <div className="border-b border-cyan-500/30 pb-2 mb-2 font-bold">{question.diagramCode}</div>
          <div className="text-left text-sm space-y-1 text-gray-300">
            <div>id_aluno PK</div>
            <div>nome</div>
            <div className="mt-2 pt-2 border-t border-dashed border-gray-700">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="???"
                className="bg-transparent border border-cyan-500 outline-none px-2 py-1 text-yellow-300 w-full text-center rounded focus:shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                autoFocus
              />
            </div>
          </div>
        </div>
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
