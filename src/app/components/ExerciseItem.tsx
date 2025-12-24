import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import { GripVertical, Trash2, ChevronDown } from 'lucide-react';
import { TimeSelector } from './TimeSelector';

interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
}

interface ExerciseItemProps {
  exercise: Exercise;
  index: number;
  moveExercise: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (id: string) => void;
  onUpdateName: (id: string, name: string) => void;
  onUpdateDuration: (id: string, duration: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ItemType = 'EXERCISE';

export function ExerciseItem({
  exercise,
  index,
  moveExercise,
  onDelete,
  onUpdateName,
  onUpdateDuration,
}: ExerciseItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveExercise(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: () => {
      return { id: exercise.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  preview(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700/50 transition-all shadow-lg relative overflow-hidden ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      }`}
    >
      {/* Subtle metallic shine effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent" />
      
      {/* Header - Always visible */}
      <div 
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Drag handle */}
        <div 
          ref={drag} 
          className="cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5 text-zinc-600" />
        </div>

        {/* Exercise info */}
        <div className="flex-1 min-w-0">
          <div className="text-zinc-100 truncate">
            {exercise.name || 'Exercice sans nom'}
          </div>
          <div className="text-sm text-zinc-500 font-mono mt-0.5">
            {formatDuration(exercise.duration)}
          </div>
        </div>

        {/* Expand/Collapse indicator */}
        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-zinc-500" />
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(exercise.id);
          }}
          className="p-2 hover:bg-orange-500/10 rounded-xl transition-colors"
        >
          <Trash2 className="w-5 h-5 text-orange-500" />
        </button>
      </div>

      {/* Expanded content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 border-t border-zinc-700/30">
          {/* Exercise name input */}
          <div className="mb-4 mt-4">
            <label className="text-xs text-zinc-500 mb-2 block">Nom de l'exercice</label>
            <input
              type="text"
              value={exercise.name}
              onChange={(e) => onUpdateName(exercise.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Ex: Squats, Pompes..."
              className="w-full bg-zinc-700/30 border border-zinc-600 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 transition-colors text-zinc-100 placeholder:text-zinc-600"
            />
          </div>

          {/* Time selector */}
          <div>
            <label className="text-xs text-zinc-500 mb-3 block">Durée</label>
            <TimeSelector
              duration={exercise.duration}
              onChange={(duration) => onUpdateDuration(exercise.id, duration)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}