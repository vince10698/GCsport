import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Clock } from 'lucide-react';
import { CircuitCard } from './CircuitCard';
import { GCLogo } from './GCLogo';
import type { Circuit, ProgramStructure } from '../types/program';

interface CreateProgramProps {
  onBack: () => void;
  onSave: (program: ProgramStructure) => void;
  initialStructure?: ProgramStructure;
}

export function CreateProgram({ onBack, onSave, initialStructure }: CreateProgramProps) {
  const [programName, setProgramName] = useState(initialStructure?.name || '');
  
  const [warmup, setWarmup] = useState<Circuit>(
    initialStructure?.warmup || {
      id: 'warmup',
      name: 'Échauffement',
      exercises: [],
      repetitions: 1,
    }
  );

  const [mainCircuits, setMainCircuits] = useState<Circuit[]>(
    initialStructure?.main || [
      {
        id: `circuit-${Date.now()}`,
        name: 'Circuit 1',
        exercises: [],
        repetitions: 3,
      },
    ]
  );

  const [cooldown, setCooldown] = useState<Circuit>(
    initialStructure?.cooldown || {
      id: 'cooldown',
      name: 'Étirements',
      exercises: [],
      repetitions: 1,
    }
  );

  const addMainCircuit = () => {
    const newCircuit: Circuit = {
      id: `circuit-${Date.now()}`,
      name: `Circuit ${mainCircuits.length + 1}`,
      exercises: [],
      repetitions: 3,
    };
    setMainCircuits([...mainCircuits, newCircuit]);
  };

  const updateMainCircuit = (index: number, circuit: Circuit) => {
    const newCircuits = [...mainCircuits];
    newCircuits[index] = circuit;
    setMainCircuits(newCircuits);
  };

  const deleteMainCircuit = (index: number) => {
    setMainCircuits(mainCircuits.filter((_, i) => i !== index));
  };

  const calculateTotalDuration = () => {
    const warmupDuration = warmup.exercises.reduce(
      (sum, ex) => sum + ex.activeTime + ex.restTime,
      0
    );
    const mainDuration = mainCircuits.reduce((sum, circuit) => {
      const circuitDuration = circuit.exercises.reduce(
        (s, ex) => s + ex.activeTime + ex.restTime,
        0
      );
      return sum + circuitDuration * circuit.repetitions;
    }, 0);
    const cooldownDuration = cooldown.exercises.reduce(
      (sum, ex) => sum + ex.activeTime + ex.restTime,
      0
    );
    const totalSeconds = warmupDuration + mainDuration + cooldownDuration;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} min ${secs > 0 ? `${secs} s` : ''}`.trim();
  };

  const getTotalExerciseCount = () => {
    return (
      warmup.exercises.length +
      mainCircuits.reduce((sum, c) => sum + c.exercises.length, 0) +
      cooldown.exercises.length
    );
  };

  const handleSave = () => {
    if (!programName.trim()) {
      alert('Veuillez donner un nom à votre programme');
      return;
    }

    const structure: ProgramStructure = {
      name: programName,
      warmup,
      main: mainCircuits,
      cooldown,
    };

    onSave(structure);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-12 pb-6 px-6 sticky top-0 bg-gradient-to-b from-zinc-900 to-zinc-900/95 backdrop-blur-sm z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 mb-6 -ml-2 p-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <h1 className="text-zinc-100 mb-6">Créer une session</h1>

          {/* Program name input */}
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="Nom de la session"
            className="w-full bg-zinc-800/50 border-2 border-zinc-700 rounded-2xl px-5 py-4 outline-none focus:border-orange-500 transition-colors text-zinc-100 placeholder:text-zinc-500 mb-4"
          />

          {/* Summary */}
          <div className="bg-zinc-800/30 rounded-2xl p-4 border border-zinc-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-300">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-sm">Durée totale : {calculateTotalDuration()}</span>
            </div>
            <span className="text-sm text-zinc-400">
              {getTotalExerciseCount()} exercices
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 pb-32">
          {/* Warmup Section */}
          <section className="mb-6">
            <h2 className="text-zinc-300 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-center justify-center text-orange-400 text-sm">
                1
              </span>
              Échauffement
            </h2>
            <CircuitCard
              circuit={warmup}
              onUpdate={setWarmup}
              onDelete={() => {}}
              showRepetitions={false}
            />
          </section>

          {/* Main Section */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-zinc-300 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-center justify-center text-orange-400 text-sm">
                  2
                </span>
                Phase d'intensité
              </h2>
              <button
                onClick={addMainCircuit}
                className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Circuit
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {mainCircuits.map((circuit, index) => (
                <CircuitCard
                  key={circuit.id}
                  circuit={circuit}
                  onUpdate={(updated) => updateMainCircuit(index, updated)}
                  onDelete={() => deleteMainCircuit(index)}
                  showRepetitions={true}
                />
              ))}
            </div>
          </section>

          {/* Cooldown Section */}
          <section className="mb-6">
            <h2 className="text-zinc-300 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-center justify-center text-orange-400 text-sm">
                3
              </span>
              Étirements
            </h2>
            <CircuitCard
              circuit={cooldown}
              onUpdate={setCooldown}
              onDelete={() => {}}
              showRepetitions={false}
            />
          </section>
        </main>

        {/* Fixed bottom save button */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 via-zinc-900 to-transparent pt-6 pb-8 px-6">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white py-5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
            >
              <span>Enregistrer la session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}