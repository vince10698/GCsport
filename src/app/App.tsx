import { useState } from 'react';
import { Settings, Target } from 'lucide-react';
import { ProgramCard } from './components/ProgramCard';
import { CreateProgram } from './components/CreateProgram';
import { ManageSessions } from './components/ManageSessions';
import { SessionRunner } from './components/SessionRunner';
import { WeeklyGoal } from './components/WeeklyGoal';
import { GCLogo } from './components/GCLogo';
import type { Program, ProgramStructure } from './types/program';

const initialPrograms: Program[] = [
  {
    id: 1,
    name: 'Cardio Intense',
    duration: '30 min',
    exerciseCount: 8,
    calories: 285,
  },
  {
    id: 2,
    name: 'Force & Endurance',
    duration: '45 min',
    exerciseCount: 12,
    calories: 380,
  },
  {
    id: 3,
    name: 'HIIT Express',
    duration: '20 min',
    exerciseCount: 6,
    calories: 220,
  },
  {
    id: 4,
    name: 'Renforcement musculaire',
    duration: '35 min',
    exerciseCount: 10,
    calories: 310,
  },
];

export default function App() {
  const [view, setView] = useState<'home' | 'create' | 'manage' | 'run' | 'goal'>('home');
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  const [runningProgramId, setRunningProgramId] = useState<number | null>(null);
  const [weeklyGoalDays, setWeeklyGoalDays] = useState<number[]>([]);
  const [completedDates, setCompletedDates] = useState<string[]>([]);

  const handleStartProgram = (programId: number) => {
    setRunningProgramId(programId);
    setView('run');
  };

  const handleCreateProgram = () => {
    setEditingProgramId(null);
    setView('create');
  };

  const handleBackToHome = () => {
    setEditingProgramId(null);
    setRunningProgramId(null);
    setView('home');
  };

  const handleEditProgram = (programId: number) => {
    setEditingProgramId(programId);
    setView('create');
  };

  const handleDuplicateProgram = (programId: number) => {
    const programToDuplicate = programs.find(p => p.id === programId);
    if (!programToDuplicate || !programToDuplicate.structure) return;

    const duplicatedProgram: Program = {
      ...programToDuplicate,
      id: Date.now(),
      name: `${programToDuplicate.name} (copie)`,
      structure: { ...programToDuplicate.structure },
    };

    setPrograms([duplicatedProgram, ...programs]);
  };

  const handleDeleteProgram = (programId: number) => {
    setPrograms(programs.filter(p => p.id !== programId));
  };

  const handleSaveProgram = (structure: ProgramStructure) => {
    // Calculate total active time (excluding rest time)
    const warmupActiveTime = structure.warmup.exercises.reduce(
      (sum, ex) => sum + ex.activeTime,
      0
    );
    const mainActiveTime = structure.main.reduce((sum, circuit) => {
      const circuitActiveTime = circuit.exercises.reduce(
        (s, ex) => s + ex.activeTime,
        0
      );
      return sum + circuitActiveTime * circuit.repetitions;
    }, 0);
    const cooldownActiveTime = structure.cooldown.exercises.reduce(
      (sum, ex) => sum + ex.activeTime,
      0
    );
    const totalActiveSeconds = warmupActiveTime + mainActiveTime + cooldownActiveTime;
    
    // Estimate calories: ~9 kcal per minute of active exercise
    const estimatedCalories = Math.round((totalActiveSeconds / 60) * 9);

    // Calculate total duration (including rest)
    const warmupDuration = structure.warmup.exercises.reduce(
      (sum, ex) => sum + ex.activeTime + ex.restTime,
      0
    );
    const mainDuration = structure.main.reduce((sum, circuit) => {
      const circuitDuration = circuit.exercises.reduce(
        (s, ex) => s + ex.activeTime + ex.restTime,
        0
      );
      return sum + circuitDuration * circuit.repetitions;
    }, 0);
    const cooldownDuration = structure.cooldown.exercises.reduce(
      (sum, ex) => sum + ex.activeTime + ex.restTime,
      0
    );
    const totalSeconds = warmupDuration + mainDuration + cooldownDuration;
    const mins = Math.floor(totalSeconds / 60);

    // Calculate total exercise count
    const exerciseCount =
      structure.warmup.exercises.length +
      structure.main.reduce((sum, c) => sum + c.exercises.length, 0) +
      structure.cooldown.exercises.length;
    
    if (editingProgramId !== null) {
      // Update existing program
      const updatedProgram: Program = {
        id: editingProgramId,
        name: structure.name,
        duration: `${mins} min`,
        exerciseCount: exerciseCount,
        calories: estimatedCalories,
        structure: structure,
      };

      setPrograms(programs.map(p => 
        p.id === editingProgramId ? updatedProgram : p
      ));
    } else {
      // Create new program
      const newProgram: Program = {
        id: Date.now(),
        name: structure.name,
        duration: `${mins} min`,
        exerciseCount: exerciseCount,
        calories: estimatedCalories,
        structure: structure,
      };

      setPrograms([newProgram, ...programs]);
    }

    setEditingProgramId(null);
    setView('home');
  };

  const handleSaveWeeklyGoal = (days: number[]) => {
    setWeeklyGoalDays(days);
  };

  const handleSessionComplete = () => {
    // Add today's date to completed dates
    const today = new Date().toISOString().split('T')[0];
    if (!completedDates.includes(today)) {
      setCompletedDates([...completedDates, today]);
    }
  };

  if (view === 'create') {
    const editingProgram = editingProgramId !== null 
      ? programs.find(p => p.id === editingProgramId) 
      : null;

    return (
      <CreateProgram 
        onBack={handleBackToHome} 
        onSave={handleSaveProgram}
        initialStructure={editingProgram?.structure}
      />
    );
  }

  if (view === 'manage') {
    return (
      <ManageSessions 
        programs={programs}
        onBack={handleBackToHome}
        onCreate={handleCreateProgram}
        onEdit={handleEditProgram}
        onDuplicate={handleDuplicateProgram}
        onDelete={handleDeleteProgram}
      />
    );
  }

  if (view === 'run') {
    const runningProgram = runningProgramId !== null 
      ? programs.find(p => p.id === runningProgramId) 
      : null;

    if (!runningProgram) {
      return null;
    }

    return (
      <SessionRunner 
        program={runningProgram}
        onExit={handleBackToHome}
        onComplete={handleSessionComplete}
      />
    );
  }

  if (view === 'goal') {
    return (
      <WeeklyGoal 
        onBack={handleBackToHome}
        initialDays={weeklyGoalDays}
        onSave={handleSaveWeeklyGoal}
        completedDates={completedDates}
      />
    );
  }

  // Calculate completed days for this week
  const getCompletedDaysThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return completedDates
      .filter(dateStr => {
        const date = new Date(dateStr);
        return date >= startOfWeek && date < endOfWeek;
      })
      .map(dateStr => new Date(dateStr).getDay());
  };

  const completedDaysThisWeek = getCompletedDaysThisWeek();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Mobile container */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-12 pb-8 px-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <GCLogo className="w-14 h-14" />
              <h1 className="text-zinc-100">GC</h1>
            </div>
            <button
              onClick={() => setView('manage')}
              className="p-2.5 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 rounded-xl transition-colors"
            >
              <Settings className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
          <p className="text-zinc-400">Choisissez une session et démarrez</p>
        </header>

        {/* Programs list */}
        <main className="flex-1 px-6 pb-8">
          <div className="flex flex-col gap-4">
            {/* Weekly Goal Card */}
            <button
              onClick={() => setView('goal')}
              className="bg-zinc-800/40 backdrop-blur-xl rounded-2xl border border-zinc-700/30 p-4 hover:border-orange-500/30 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/50 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-zinc-100 mb-1">Objectif hebdomadaire</h3>
                    <p className="text-sm text-zinc-400">
                      {weeklyGoalDays.length === 0
                        ? 'Définissez vos jours d\'entraînement'
                        : `${weeklyGoalDays.length} ${weeklyGoalDays.length > 1 ? 'jours' : 'jour'} par semaine`}
                    </p>
                  </div>
                </div>
                {weeklyGoalDays.length > 0 && (
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                      const isPlanned = weeklyGoalDays.includes(day);
                      const isCompleted = completedDaysThisWeek.includes(day);
                      return (
                        <div
                          key={day}
                          className={`w-1.5 h-8 rounded-full transition-all ${
                            isCompleted && isPlanned
                              ? 'bg-green-500'
                              : isPlanned
                              ? 'bg-orange-500'
                              : 'bg-zinc-700/50'
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </button>

            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                name={program.name}
                duration={program.duration}
                exerciseCount={program.exerciseCount}
                calories={program.calories}
                onStart={() => handleStartProgram(program.id)}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}