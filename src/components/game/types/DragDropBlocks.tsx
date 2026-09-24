import React, { useState } from 'react';
import { DragDropBlocksQuestion } from '../../../data/questions';

interface Props {
  question: DragDropBlocksQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const DragDropBlocks: React.FC<Props> = ({ question, onAnswer }) => {
  const [available, setAvailable] = useState<string[]>([...question.blocks].sort(() => Math.random() - 0.5));
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (block: string) => {
    setAvailable(available.filter(b => b !== block));
    setSelected([...selected, block]);
  };

  const handleDeselect = (block: string) => {
    setSelected(selected.filter(b => b !== block));
    setAvailable([...available, block]);
  };

  const handleSubmit = () => {
    const isCorrect = JSON.stringify(selected) === JSON.stringify(question.correctSequence);
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-8">
      <div className="bg-black/30 p-4 rounded-xl border border-gray-800 min-h-[150px]">
        <h3 className="text-sm text-gray-500 mb-4 font-bold uppercase">Sua Sequência</h3>
        <div className="flex flex-col gap-2">
          {selected.map((block, idx) => (
            <button
              key={idx}
              onClick={() => handleDeselect(block)}
              className="text-left bg-cyan-900/40 border border-cyan-500/50 p-3 rounded-lg font-mono text-cyan-100 hover:bg-red-900/40 hover:border-red-500/50 transition-colors whitespace-pre"
            >
              <span className="text-cyan-500 mr-2">{idx + 1}.</span>
              {block}
            </button>
          ))}
          {selected.length === 0 && (
            <div className="text-gray-600 text-center py-4 text-sm font-mono border border-dashed border-gray-700 rounded-lg">
              Clique nos blocos abaixo na ordem correta
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm text-gray-500 mb-4 font-bold uppercase">Blocos Disponíveis</h3>
        <div className="flex flex-wrap gap-2">
          {available.map((block, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(block)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-600 p-3 rounded-lg font-mono text-gray-200 transition-colors whitespace-pre shadow-lg"
            >
              {block}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={available.length > 0}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
        >
          AVALIAR CÓDIGO
        </button>
      </div>
    </div>
  );
};
