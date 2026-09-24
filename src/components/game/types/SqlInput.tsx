import React, { useState } from 'react';
import { SqlInputQuestion } from '../../../data/questions';

interface Props {
  question: SqlInputQuestion;
  onAnswer: (isCorrect: boolean) => void;
}

export const SqlInput: React.FC<Props> = ({ question, onAnswer }) => {
  const [input, setInput] = useState(question.initialCode || '');

  const normalizeSql = (sql: string) => {
    return sql
      .toLowerCase()
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/;\s*$/, '') // remove trailing semicolon
      .replace(/\s*\(\s*/g, '(')
      .replace(/\s*\)\s*/g, ')')
      .replace(/\s*,\s*/g, ',')
      .trim();
  };

  const handleSubmit = () => {
    const normalizedInput = normalizeSql(input);
    const isCorrect = question.expectedQuery.some(expected => normalizeSql(expected) === normalizedInput);
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-4">
      <div className="bg-black border border-gray-800 rounded-xl overflow-hidden font-mono">
        <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full h-48 bg-transparent text-green-400 p-4 outline-none resize-none"
          placeholder=">_ Escreva seu código SQL aqui..."
          spellCheck={false}
        />
      </div>

      <div className="pt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition"
        >
          EXECUTAR
        </button>
      </div>
    </div>
  );
};
