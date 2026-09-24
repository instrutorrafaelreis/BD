import React, { useState } from 'react';
import { DragDropRelationshipQuestion } from '../../../data/questions';

interface Props {
  question: DragDropRelationshipQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const DragDropRelationship: React.FC<Props> = ({ question, onAnswer }) => {
  const [available, setAvailable] = useState<string[]>([...question.pieces].sort(() => Math.random() - 0.5));
  const [slots, setSlots] = useState<(string | null)[]>(Array(question.slotsCount).fill(null));

  const handleSelect = (piece: string) => {
    const emptyIndex = slots.indexOf(null);
    if (emptyIndex !== -1) {
      const newSlots = [...slots];
      newSlots[emptyIndex] = piece;
      setSlots(newSlots);
      setAvailable(available.filter(p => p !== piece));
    }
  };

  const handleDeselect = (piece: string, index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
    setAvailable([...available, piece]);
  };

  const handleSubmit = () => {
    const isCorrect = JSON.stringify(slots) === JSON.stringify(question.correctSequence);
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-8">
      <div className="bg-black/30 p-6 rounded-xl border border-gray-800">
        <h3 className="text-sm text-gray-500 mb-6 font-bold uppercase text-center">Área de Montagem</h3>
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
          {slots.map((slot, idx) => (
            <div key={idx} className="flex items-center">
              {slot ? (
                <button
                  onClick={() => handleDeselect(slot, idx)}
                  className="px-4 py-2 bg-blue-900/50 border border-blue-400/50 text-blue-200 rounded-lg hover:bg-red-900/50 hover:border-red-500/50 transition font-bold"
                >
                  {slot}
                </button>
              ) : (
                <div className="w-24 h-10 border-2 border-dashed border-gray-600 rounded-lg bg-gray-900/50 flex items-center justify-center text-xs text-gray-600">
                  vazio
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm text-gray-500 mb-4 font-bold uppercase">Peças Disponíveis</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {available.map((piece, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(piece)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded-lg shadow-lg transition font-bold"
            >
              {piece}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={slots.includes(null)}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
        >
          CONFIRMAR MODELO
        </button>
      </div>
    </div>
  );
};
