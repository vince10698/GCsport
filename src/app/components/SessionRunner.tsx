import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ChevronRight } from 'lucide-react';
import type { Program } from '../types/program';

interface SessionRunnerProps {
  program: Program;
  onExit: () => void;
  onComplete?: () => void;
}

interface ExerciseStep {
  exerciseName: string;
  duration: number;
  type: 'active' | 'rest';
  phase: 'warmup' | 'main' | 'cooldown';
  circuitName: string;
  circuitRepetition?: number; // For main phase circuits
}

export function SessionRunner({ program, onExit, onComplete }: SessionRunnerProps) {
  const [steps, setSteps] = useState<ExerciseStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPreparation, setIsPreparation] = useState(true);
  const [preparationTime, setPreparationTime] = useState(5);
  const intervalRef = useRef<number | null>(null);

  // Build the sequence of steps when component mounts
  useEffect(() => {
    if (!program.structure) return;

    const allSteps: ExerciseStep[] = [];
    const { warmup, main, cooldown } = program.structure;

    // Warmup phase
    warmup.exercises.forEach((exercise) => {
      if (exercise.activeTime > 0) {
        allSteps.push({
          exerciseName: exercise.name,
          duration: exercise.activeTime,
          type: 'active',
          phase: 'warmup',
          circuitName: warmup.name,
        });
      }
      if (exercise.restTime > 0) {
        allSteps.push({
          exerciseName: exercise.name,
          duration: exercise.restTime,
          type: 'rest',
          phase: 'warmup',
          circuitName: warmup.name,
        });
      }
    });

    // Main phase (with repetitions)
    main.forEach((circuit) => {
      for (let rep = 1; rep <= circuit.repetitions; rep++) {
        circuit.exercises.forEach((exercise) => {
          if (exercise.activeTime > 0) {
            allSteps.push({
              exerciseName: exercise.name,
              duration: exercise.activeTime,
              type: 'active',
              phase: 'main',
              circuitName: circuit.name,
              circuitRepetition: rep,
            });
          }
          if (exercise.restTime > 0) {
            allSteps.push({
              exerciseName: exercise.name,
              duration: exercise.restTime,
              type: 'rest',
              phase: 'main',
              circuitName: circuit.name,
              circuitRepetition: rep,
            });
          }
        });
      }
    });

    // Cooldown phase
    cooldown.exercises.forEach((exercise) => {
      if (exercise.activeTime > 0) {
        allSteps.push({
          exerciseName: exercise.name,
          duration: exercise.activeTime,
          type: 'active',
          phase: 'cooldown',
          circuitName: cooldown.name,
        });
      }
      if (exercise.restTime > 0) {
        allSteps.push({
          exerciseName: exercise.name,
          duration: exercise.restTime,
          type: 'rest',
          phase: 'cooldown',
          circuitName: cooldown.name,
        });
      }
    });

    setSteps(allSteps);
    if (allSteps.length > 0) {
      setTimeLeft(allSteps[0].duration);
    }
  }, [program]);

  // Preparation countdown timer
  useEffect(() => {
    if (!isPreparation || isPaused) return;

    const prepInterval = window.setInterval(() => {
      setPreparationTime((prev) => {
        if (prev <= 1) {
          setIsPreparation(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(prepInterval);
  }, [isPreparation, isPaused]);

  // Timer logic
  useEffect(() => {
    if (isPaused || isComplete || steps.length === 0 || isPreparation) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next step
          setCurrentStepIndex((currentIndex) => {
            const nextIndex = currentIndex + 1;
            if (nextIndex >= steps.length) {
              setIsComplete(true);
              return currentIndex;
            }
            setTimeLeft(steps[nextIndex].duration);
            return nextIndex;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, isComplete, currentStepIndex, steps, isPreparation]);

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleSkip = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setTimeLeft(steps[nextIndex].duration);
    } else {
      setIsComplete(true);
    }
  };

  if (!program.structure || steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Cette session n'a pas de structure définie</p>
          <button
            onClick={onExit}
            className="mt-4 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <span className="text-zinc-200">Retour</span>
          </button>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'warmup':
        return 'Échauffement';
      case 'main':
        return 'Phase principale';
      case 'cooldown':
        return 'Étirements';
      default:
        return '';
    }
  };

  if (isComplete) {
    if (onComplete) {
      onComplete();
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-800/40 backdrop-blur-xl rounded-3xl border border-zinc-700/30 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl text-zinc-100 mb-2">Session terminée !</h2>
          <p className="text-zinc-400 mb-6">Bravo, vous avez terminé {program.name}</p>
          <button
            onClick={onExit}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all text-white font-medium shadow-lg shadow-orange-500/20"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Preparation screen
  if (isPreparation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
          {/* Header */}
          <header className="pt-8 pb-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-zinc-100 mb-1">{program.name}</h1>
                <p className="text-sm text-zinc-400">Préparez-vous</p>
              </div>
              <button
                onClick={onExit}
                className="p-2 hover:bg-zinc-800/50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
            {/* Preparation info */}
            <div className="text-center mb-12">
              <h2 className="text-3xl text-zinc-100 mb-4">Préparez-vous !</h2>
              <p className="text-zinc-400 mb-8">
                La session commence dans
              </p>
            </div>

            {/* Countdown */}
            <div className="relative mb-12">
              <div className="w-64 h-64 rounded-full bg-zinc-800/40 border-4 border-zinc-700/30 flex items-center justify-center relative overflow-hidden">
                {/* Animated ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="8"
                    strokeDasharray={`${(1 - preparationTime / 5) * 283} 283`}
                    className="transition-all duration-1000"
                  />
                </svg>

                <div className="text-center z-10">
                  <div className="text-8xl font-bold text-orange-400 mb-2">
                    {preparationTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Next exercise preview */}
            <div className="bg-zinc-800/40 backdrop-blur-xl rounded-2xl border border-zinc-700/30 p-6 w-full">
              <p className="text-sm text-zinc-400 mb-2">Premier exercice</p>
              <h3 className="text-zinc-100 mb-1">{currentStep.exerciseName}</h3>
              <p className="text-sm text-zinc-400">{currentStep.circuitName}</p>
            </div>

            {/* Control */}
            <div className="mt-8">
              <button
                onClick={() => setIsPreparation(false)}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all text-white font-medium shadow-lg shadow-orange-500/20"
              >
                Passer
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-6 pb-3 px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-zinc-100 mb-0.5">{program.name}</h1>
              <p className="text-xs text-zinc-400">{getPhaseLabel(currentStep.phase)}</p>
            </div>
            <button
              onClick={onExit}
              className="p-2 hover:bg-zinc-800/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
          {/* Exercise info */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full mb-3">
              <span className="text-xs text-zinc-400">
                {currentStep.circuitName}
                {currentStep.circuitRepetition && ` - Tour ${currentStep.circuitRepetition}`}
              </span>
            </div>
            <h2 className="text-2xl text-zinc-100 mb-3">{currentStep.exerciseName}</h2>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${
              currentStep.type === 'active' 
                ? 'bg-orange-500/20 border border-orange-500/50' 
                : 'bg-blue-500/20 border border-blue-500/50'
            }`}>
              <span className={`text-xs font-medium ${
                currentStep.type === 'active' ? 'text-orange-400' : 'text-blue-400'
              }`}>
                {currentStep.type === 'active' ? 'Exercice' : 'Récupération'}
              </span>
            </div>
          </div>

          {/* Timer */}
          <div className="relative mb-6">
            <div className="w-48 h-48 rounded-full bg-zinc-800/40 border-4 border-zinc-700/30 flex items-center justify-center relative overflow-hidden">
              {/* Animated ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke={currentStep.type === 'active' ? '#f97316' : '#3b82f6'}
                  strokeWidth="8"
                  strokeDasharray={`${(1 - timeLeft / currentStep.duration) * 283} 283`}
                  className="transition-all duration-1000"
                />
              </svg>

              <div className="text-center z-10">
                <div className="text-5xl font-bold text-zinc-100 mb-1">
                  {timeLeft}
                </div>
                <div className="text-xs text-zinc-400">
                  {currentStep.type === 'active' ? 'secondes' : 'repos'}
                </div>
              </div>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center text-xs text-zinc-400 mb-4">
            Exercice {currentStepIndex + 1} sur {steps.length}
          </div>

          {/* Next exercise preview */}
          {currentStepIndex < steps.length - 1 && (
            <div className="w-full bg-zinc-800/40 backdrop-blur-xl rounded-xl border border-zinc-700/30 p-3 mb-6">
              <p className="text-xs text-zinc-500 mb-1">Prochain exercice</p>
              <h3 className="text-sm text-zinc-100 mb-1">{steps[currentStepIndex + 1].exerciseName}</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{steps[currentStepIndex + 1].circuitName}</span>
                <span>•</span>
                <span className={steps[currentStepIndex + 1].type === 'active' ? 'text-orange-400' : 'text-blue-400'}>
                  {steps[currentStepIndex + 1].type === 'active' ? 'Exercice' : 'Récupération'}
                </span>
                <span>•</span>
                <span>{steps[currentStepIndex + 1].duration}s</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleTogglePause}
              className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-full flex items-center justify-center transition-colors"
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-zinc-200 ml-1" />
              ) : (
                <Pause className="w-5 h-5 text-zinc-200" />
              )}
            </button>
            <button
              onClick={handleSkip}
              className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 rounded-full flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-zinc-200" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}