import { Clock, Dumbbell, Play, Flame } from 'lucide-react';

interface ProgramCardProps {
  name: string;
  duration: string;
  exerciseCount: number;
  calories: number;
  onStart: () => void;
}

export function ProgramCard({ name, duration, exerciseCount, calories, onStart }: ProgramCardProps) {
  return (
    <button
      onClick={onStart}
      className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-700/50 relative overflow-hidden transition-all active:scale-[0.98] hover:border-orange-500/30 group"
    >
      {/* Subtle metallic shine effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-500/30 to-transparent" />
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2 text-left flex-1">
          <h3 className="text-zinc-100">{name}</h3>
          <div className="flex items-center gap-3 text-zinc-400 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-400">{duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" />
              <span className="text-sm">{exerciseCount} exercices</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              <span className="text-sm">~{calories} kcal</span>
            </div>
          </div>
        </div>
        
        <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 fill-white text-white" />
        </div>
      </div>
    </button>
  );
}