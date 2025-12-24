export interface Exercise {
  id: string;
  name: string;
  activeTime: number; // seconds
  restTime: number; // seconds
}

export interface Circuit {
  id: string;
  name: string;
  exercises: Exercise[];
  repetitions: number; // Number of times this circuit is repeated
}

export interface ProgramStructure {
  name: string;
  warmup: Circuit;
  main: Circuit[];
  cooldown: Circuit;
}

export interface Program {
  id: number;
  name: string;
  duration: string;
  exerciseCount: number;
  calories: number; // Estimated calories burned
  structure?: ProgramStructure;
}