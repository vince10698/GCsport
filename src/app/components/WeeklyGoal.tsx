import { useState } from 'react';
import { ArrowLeft, Target, Check } from 'lucide-react';

interface WeeklyGoalProps {
  onBack: () => void;
  initialDays?: number[];
  onSave: (days: number[]) => void;
  completedDates?: string[]; // Dates in format YYYY-MM-DD
}

const DAYS = [
  { id: 1, short: 'L', full: 'Lundi' },
  { id: 2, short: 'M', full: 'Mardi' },
  { id: 3, short: 'M', full: 'Mercredi' },
  { id: 4, short: 'J', full: 'Jeudi' },
  { id: 5, short: 'V', full: 'Vendredi' },
  { id: 6, short: 'S', full: 'Samedi' },
  { id: 0, short: 'D', full: 'Dimanche' },
];

export function WeeklyGoal({ onBack, initialDays = [], onSave, completedDates = [] }: WeeklyGoalProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>(initialDays);

  // Get current week's completed days
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

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  const handleSave = () => {
    onSave(selectedDays);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-12 pb-8 px-6">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-zinc-800/50 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <h1 className="text-zinc-100">Objectif hebdomadaire</h1>
          </div>
          <p className="text-zinc-400">Planifiez vos jours d'entraînement</p>
        </header>

        {/* Main content */}
        <main className="flex-1 px-6 pb-8">
          {/* Goal card */}
          <div className="bg-zinc-800/40 backdrop-blur-xl rounded-2xl border border-zinc-700/30 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/50 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-zinc-100">Mon objectif</h2>
                <p className="text-sm text-zinc-400">
                  {selectedDays.length} {selectedDays.length > 1 ? 'jours' : 'jour'} par semaine
                </p>
              </div>
            </div>

            {/* Progress visualization */}
            <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
                style={{ width: `${(selectedDays.length / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Weekly progress */}
          {selectedDays.length > 0 && (
            <div className="bg-zinc-800/40 backdrop-blur-xl rounded-2xl border border-zinc-700/30 p-6 mb-6">
              <h3 className="text-zinc-100 mb-4">Progression cette semaine</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-400">
                  {completedDaysThisWeek.length} / {selectedDays.length} sessions complétées
                </span>
                <span className="text-sm font-medium text-orange-400">
                  {selectedDays.length > 0 ? Math.round((completedDaysThisWeek.length / selectedDays.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                  style={{ width: `${selectedDays.length > 0 ? (completedDaysThisWeek.length / selectedDays.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Days selection */}
          <div className="space-y-3">
            <h3 className="text-zinc-300 mb-4">Sélectionnez vos jours</h3>
            <div className="grid grid-cols-2 gap-3">
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day.id);
                const isCompleted = completedDaysThisWeek.includes(day.id);
                return (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/50'
                        : 'bg-zinc-800/40 border-zinc-700/30 hover:border-zinc-600/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                            : 'bg-zinc-700/50 text-zinc-400'
                        }`}
                      >
                        {day.short}
                      </div>
                      <span
                        className={`transition-colors ${
                          isSelected ? 'text-zinc-100' : 'text-zinc-400'
                        }`}
                      >
                        {day.full}
                      </span>
                      {isCompleted && <Check className="w-4 h-4 text-green-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-zinc-800/30 border border-zinc-700/30 rounded-xl">
            <p className="text-sm text-zinc-400">
              💡 <span className="text-zinc-300">Conseil :</span> Pour des résultats
              optimaux, planifiez au moins 3 séances par semaine avec un jour de repos
              entre chaque session.
            </p>
          </div>
        </main>

        {/* Save button */}
        <footer className="px-6 pb-8">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl transition-all text-white font-medium shadow-lg shadow-orange-500/20"
          >
            Enregistrer mon objectif
          </button>
        </footer>
      </div>
    </div>
  );
}