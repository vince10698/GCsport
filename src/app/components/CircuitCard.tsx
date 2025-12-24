import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ChevronDown, Plus, Trash2, Repeat } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';
import type { Circuit, Exercise } from '../types/program';

interface CircuitCardProps {
  circuit: Circuit;
  onUpdate: (circuit: Circuit) => void;
  onDelete: () => void;
  showRepetitions?: boolean;
}

export function CircuitCard({ circuit, onUpdate, onDelete, showRepetitions = false }: CircuitCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}`,
      name: '',
      activeTime: 30,
      restTime: 15,
    };
    onUpdate({
      ...circuit,
      exercises: [...circuit.exercises, newExercise],
    });
  };

  const deleteExercise = (id: string) => {
    onUpdate({
      ...circuit,
      exercises: circuit.exercises.filter((ex) => ex.id !== id),
    });
  };

  const updateExerciseName = (id: string, name: string) => {
    onUpdate({
      ...circuit,
      exercises: circuit.exercises.map((ex) => (ex.id === id ? { ...ex, name } : ex)),
    });
  };

  const updateExerciseActiveTime = (id: string, time: number) => {
    onUpdate({
      ...circuit,
      exercises: circuit.exercises.map((ex) => (ex.id === id ? { ...ex, activeTime: time } : ex)),
    });
  };

  const updateExerciseRestTime = (id: string, time: number) => {
    onUpdate({
      ...circuit,
      exercises: circuit.exercises.map((ex) => (ex.id === id ? { ...ex, restTime: time } : ex)),
    });
  };

  const moveExercise = useCallback((dragIndex: number, hoverIndex: number) => {
    const newExercises = [...circuit.exercises];
    const [removed] = newExercises.splice(dragIndex, 1);
    newExercises.splice(hoverIndex, 0, removed);
    onUpdate({
      ...circuit,
      exercises: newExercises,
    });
  }, [circuit, onUpdate]);

  const updateCircuitName = (name: string) => {
    onUpdate({ ...circuit, name });
  };

  const updateRepetitions = (repetitions: number) => {
    onUpdate({ ...circuit, repetitions: Math.max(1, repetitions) });
  };

  const calculateCircuitDuration = () => {
    const totalSeconds = circuit.exercises.reduce(
      (sum, ex) => sum + ex.activeTime + ex.restTime,
      0
    );
    return totalSeconds * circuit.repetitions;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}min ${secs}s` : `${secs}s`;
  };

  return (
    <div className="bg-zinc-800/50 rounded-2xl border border-zinc-700/50 overflow-hidden">
      {/* Circuit header */}
      <div className="p-4 border-b border-zinc-700/30">
        <div className="flex items-start gap-3 mb-3">
          <input
            type="text"
            value={circuit.name}
            onChange={(e) => updateCircuitName(e.target.value)}
            placeholder="Nom du circuit"
            className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600"
          />
          <button
            onClick={onDelete}
            className="p-2 hover:bg-orange-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-orange-500" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {showRepetitions && (
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-orange-500" />
              <button
                onClick={() => updateRepetitions(circuit.repetitions - 1)}
                className="w-6 h-6 bg-zinc-700/50 hover:bg-zinc-600/50 border border-zinc-600 rounded text-zinc-300 flex items-center justify-center text-sm transition-colors"
              >
                −
              </button>
              <span className="text-zinc-100 font-mono text-sm w-8 text-center">
                {circuit.repetitions}x
              </span>
              <button
                onClick={() => updateRepetitions(circuit.repetitions + 1)}
                className="w-6 h-6 bg-zinc-700/50 hover:bg-zinc-600/50 border border-zinc-600 rounded text-zinc-300 flex items-center justify-center text-sm transition-colors"
              >
                +
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">{circuit.exercises.length} exercices</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{formatDuration(calculateCircuitDuration())}</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto p-1"
          >
            <ChevronDown
              className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Circuit content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4">
          <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col gap-2">
              {circuit.exercises.map((exercise, index) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  index={index}
                  moveExercise={moveExercise}
                  onDelete={deleteExercise}
                  onUpdateName={updateExerciseName}
                  onUpdateActiveTime={updateExerciseActiveTime}
                  onUpdateRestTime={updateExerciseRestTime}
                />
              ))}
            </div>
          </DndProvider>

          {circuit.exercises.length === 0 && (
            <div className="text-center py-8">
              <p className="text-zinc-600 text-sm">Aucun exercice</p>
            </div>
          )}

          {/* Add exercise button */}
          <button
            onClick={addExercise}
            className="w-full mt-3 bg-zinc-700/30 hover:bg-zinc-700/50 border border-dashed border-zinc-600 text-zinc-400 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un exercice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
