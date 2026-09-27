import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  text: string;
}

const SortableItem = ({ id, text }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-gray-800 border border-gray-600 p-3 rounded mb-2 cursor-grab active:cursor-grabbing font-mono text-sm text-green-300">
      {text}
    </div>
  );
};

export const ScrambledCode: React.FC<{ correctLines: string[], onChange: (lines: string[]) => void }> = ({ correctLines, onChange }) => {
  const [items, setItems] = useState<{ id: string, text: string }[]>([]);

  useEffect(() => {
    // Shuffle lines on mount
    const shuffled = [...correctLines].map(text => ({ id: Math.random().toString(36).substr(2, 9), text })).sort(() => Math.random() - 0.5);
    setItems(shuffled);
  }, [correctLines]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onChange(newItems.map(i => i.text));
        return newItems;
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <p className="text-sm text-gray-400 mb-4">Arraste e solte as linhas para colocá-las na ordem correta:</p>
          {items.map(item => (
            <SortableItem key={item.id} id={item.id} text={item.text} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
