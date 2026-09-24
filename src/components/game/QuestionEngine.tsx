import React, { useState } from 'react';
import { Question } from '../../data/questions';
import { MultipleChoice } from './types/MultipleChoice';
import { SqlInput } from './types/SqlInput';
import { SqlComplete } from './types/SqlComplete';
import { ErrorHunt } from './types/ErrorHunt';
import { DiagramComplete } from './types/DiagramComplete';
import { DragDropBlocks } from './types/DragDropBlocks';
import { DragDropRelationship } from './types/DragDropRelationship';
import { useGame } from '../../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Props {
  question: Question;
}

export const QuestionEngine: React.FC<Props> = ({ question }) => {
  const { answerQuestion, progress } = useGame();
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState(false);

  const handleAnswer = (isCorrect: boolean) => {
    // The prompt says "Não mostrar se a resposta foi correta imediatamente. Isso evita que a aplicação forneça respostas durante a avaliação."
    // BUT in section 17: "Depois de confirmar uma questão: não permitir voltar. Registrar a resposta imediatamente."
    // So we just register and move to the next.
    
    // Wait, section 14: Checkpoints after each 10 questions. We can show that.
    
    answerQuestion(isCorrect, question.xp, question.category);
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple_choice':
        return <MultipleChoice question={question} onAnswer={handleAnswer} />;
      case 'sql_input':
        return <SqlInput question={question} onAnswer={handleAnswer} />;
      case 'sql_complete':
        return <SqlComplete question={question} onAnswer={handleAnswer} />;
      case 'error_hunt':
        return <ErrorHunt question={question} onAnswer={handleAnswer} />;
      case 'diagram_complete':
        return <DiagramComplete question={question} onAnswer={handleAnswer} />;
      case 'drag_drop_blocks':
        return <DragDropBlocks question={question} onAnswer={handleAnswer} />;
      case 'drag_drop_relationship':
        return <DragDropRelationship question={question} onAnswer={handleAnswer} />;
      default:
        return <div>Tipo de questão não implementado.</div>;
    }
  };

  return (
    <motion.div 
      key={question.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="w-full max-w-4xl bg-[#111827]/80 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-cyan-500 font-mono text-sm tracking-widest">{question.category}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight whitespace-pre-wrap">
            {question.text}
          </h2>
        </div>

        <div className="mt-8">
          {renderQuestion()}
        </div>
      </div>
      
      {/* Checkpoint overlay handled at Game level or here if index % 10 === 0, but we moved to next question already. 
          Actually, we should show checkpoint when progress.currentQuestionIndex % 10 === 0 AND index > 0.
      */}
    </motion.div>
  );
};
