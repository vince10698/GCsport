import { Minus, Plus } from 'lucide-react';

interface TimeSelectorProps {
  duration: number; // in seconds
  onChange: (duration: number) => void;
}

export function TimeSelector({ duration, onChange }: TimeSelectorProps) {
  const maxDuration = 600; // 10 minutes max for visual gauge
  const percentage = Math.min((duration / maxDuration) * 100, 100);
  
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustMinutes = (amount: number) => {
    const newDuration = Math.max(0, duration + amount * 60);
    onChange(newDuration);
  };

  const adjustSeconds = (amount: number) => {
    const newDuration = Math.max(0, duration + amount);
    onChange(newDuration);
  };

  // Calculate arc path for the circular gauge
  const size = 80;
  const strokeWidth = 6;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      {/* Circular gauge */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#3f3f46"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#orangeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Time display in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-zinc-100 text-sm font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Precise controls */}
      <div className="flex gap-4">
        {/* Minutes control */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => adjustMinutes(1)}
            className="bg-zinc-700/50 hover:bg-zinc-600/50 border border-zinc-600 text-zinc-300 p-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center py-1">
            <span className="text-zinc-100 font-mono text-lg">{minutes.toString().padStart(2, '0')}</span>
            <span className="text-zinc-500 text-xs">min</span>
          </div>
          <button
            onClick={() => adjustMinutes(-1)}
            className="bg-zinc-700/50 hover:bg-zinc-600/50 border border-zinc-600 text-zinc-300 p-1.5 rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div className="flex items-center">
          <span className="text-zinc-600 text-xl">:</span>
        </div>

        {/* Seconds control */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => adjustSeconds(1)}
            className="bg-zinc-700/50 hover:bg-zinc-600/50 border border-zinc-600 text-zinc-300 p-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center py-1">
            <span className="text-zinc-100 font-mono text-lg">{seconds.toString().padStart(2, '0')}</span>
            <span className="text-zinc-500 text-xs">sec</span>
          </div>
          <button
            onClick={() => adjustSeconds(-1)}
            className="bg-zinc-700/50 hover:bg-zinc-600/50 border border-zinc-600 text-zinc-300 p-1.5 rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick presets */}
      <div className="flex flex-col gap-1.5 ml-auto">
        <button
          onClick={() => onChange(30)}
          className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
            duration === 30
              ? 'bg-orange-500/20 border border-orange-500 text-orange-400'
              : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:border-zinc-600'
          }`}
        >
          30s
        </button>
        <button
          onClick={() => onChange(60)}
          className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
            duration === 60
              ? 'bg-orange-500/20 border border-orange-500 text-orange-400'
              : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:border-zinc-600'
          }`}
        >
          1min
        </button>
        <button
          onClick={() => onChange(120)}
          className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
            duration === 120
              ? 'bg-orange-500/20 border border-orange-500 text-orange-400'
              : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:border-zinc-600'
          }`}
        >
          2min
        </button>
      </div>
    </div>
  );
}