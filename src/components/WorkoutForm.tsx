import React, { useState, useEffect } from 'react';
import { Plus, X, Save, TrendingUp, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FREE_PLAN_WORKOUT_LIMIT = 2;

type WorkoutType = {
  id: string; user_id: string; name: string; category: string;
  description: string; units: string; created_at: string;
};
type PersonalRecord = {
  id: string; user_id: string; workout_type_id: string;
  pr_value: number; achieved_date: string; created_at: string;
  workout_types?: WorkoutType;
};
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';

interface WorkoutFormProps {
  onSaved: () => void;
  onUpgrade: () => void;
}

const categories = [
  { value: 'strength', label: 'Strength' },
  { value: 'metcon', label: 'MetCon' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'mobility', label: 'Mobility' },
  { value: 'olympic', label: 'Olympic Lifting' },
  { value: 'gymnastics', label: 'Gymnastics' },
];

export function WorkoutForm({ onSaved, onUpgrade }: WorkoutFormProps) {
  const { user } = useAuth();
  const { subscription, isActive } = useSubscription();
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workoutCount, setWorkoutCount] = useState<number>(0);

  const [formData, setFormData] = useState({
    workout_type_id: '',
    date: new Date().toISOString().split('T')[0],
    score_value: '',
    percentage: '',
    notes: '',
    rx: true,
  });

  const [newWorkout, setNewWorkout] = useState({
    name: '',
    category: 'strength',
    description: '',
    units: 'lbs',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);

    const [typesRes, prsRes, countRes] = await Promise.all([
      supabase.from('workout_types').select('*').eq('user_id', user.id).order('name'),
      supabase.from('personal_records').select('*, workout_types(*)').eq('user_id', user.id),
      supabase.from('workout_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    if (typesRes.data) setWorkoutTypes(typesRes.data);
    if (prsRes.data) setPersonalRecords(prsRes.data);
    if (countRes.count !== null) setWorkoutCount(countRes.count);
    setLoading(false);
  }

  const isPro = isActive();
  const atLimit = !isPro && workoutCount >= FREE_PLAN_WORKOUT_LIMIT;

  async function handleCreateWorkoutType(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const { data } = await supabase
      .from('workout_types')
      .insert({ ...newWorkout, user_id: user.id })
      .select()
      .single();

    if (data) {
      setWorkoutTypes([...workoutTypes, data]);
      setFormData({ ...formData, workout_type_id: data.id });
      setNewWorkout({ name: '', category: 'strength', description: '', units: 'lbs' });
      setShowNewWorkout(false);
    }
  }

  async function handleSaveLog(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !formData.workout_type_id) return;
    if (atLimit) { onUpgrade(); return; }

    const scoreValue = parseFloat(formData.score_value);
    const percentage = formData.percentage ? parseFloat(formData.percentage) : null;
    if (scoreValue < 0 || (percentage !== null && percentage < 0)) return;

    setSaving(true);
    const workout = workoutTypes.find((w) => w.id === formData.workout_type_id);

    const { data: logData } = await supabase.from('workout_logs').insert({
      user_id: user.id,
      workout_type_id: formData.workout_type_id,
      date: formData.date,
      score_value: scoreValue,
      percentage,
      notes: formData.notes,
      rx: formData.rx,
    }).select().single();

    if (logData) {
      const existingPR = personalRecords.find((pr) => pr.workout_type_id === formData.workout_type_id);
      const isPRScore = !existingPR || scoreValue > existingPR.pr_value;

      if (isPRScore && (workout?.category === 'strength' || workout?.category === 'olympic')) {
        if (existingPR) {
          await supabase
            .from('personal_records')
            .update({ pr_value: scoreValue, achieved_date: formData.date })
            .eq('id', existingPR.id);
        } else {
          await supabase.from('personal_records').insert({
            user_id: user.id,
            workout_type_id: formData.workout_type_id,
            pr_value: scoreValue,
            achieved_date: formData.date,
          });
        }
      }

      setWorkoutCount((c) => c + 1);
      setFormData({
        workout_type_id: '',
        date: new Date().toISOString().split('T')[0],
        score_value: '',
        percentage: '',
        notes: '',
        rx: true,
      });
      onSaved();
    }

    setSaving(false);
  }

  const selectedWorkout = workoutTypes.find((w) => w.id === formData.workout_type_id);
  const existingPR = personalRecords.find((pr) => pr.workout_type_id === formData.workout_type_id);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-orange-500" />
          Log Workout
        </h2>
        {!isPro && (
          <span className="text-xs text-slate-400 bg-slate-700/50 border border-slate-600 px-2 py-1 rounded">
            {workoutCount}/{FREE_PLAN_WORKOUT_LIMIT} free
          </span>
        )}
      </div>

      {atLimit ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Free Plan Limit Reached</p>
            <p className="text-slate-400 text-sm">
              You've used all {FREE_PLAN_WORKOUT_LIMIT} free workout logs. Upgrade to Pro for unlimited logging.
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all"
          >
            Upgrade to Pro — $1/mo
          </button>
        </div>
      ) : loading ? (
        <div className="text-slate-400 text-center py-8">Loading...</div>
      ) : (
        <form onSubmit={handleSaveLog} className="space-y-4">
          <div className="flex gap-3">
            <select
              value={formData.workout_type_id}
              onChange={(e) => setFormData({ ...formData, workout_type_id: e.target.value })}
              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              required
            >
              <option value="">Select workout...</option>
              {workoutTypes.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.units})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewWorkout(true)}
              className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {showNewWorkout && (
            <div className="bg-slate-700/30 rounded-lg p-4 space-y-3 border border-slate-600">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">New Exercise</h3>
                <button type="button" onClick={() => setShowNewWorkout(false)}>
                  <X className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Exercise name"
                value={newWorkout.name}
                onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <div className="flex gap-3">
                <select
                  value={newWorkout.category}
                  onChange={(e) => setNewWorkout({ ...newWorkout, category: e.target.value })}
                  className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Units"
                  value={newWorkout.units}
                  onChange={(e) => setNewWorkout({ ...newWorkout, units: e.target.value })}
                  className="w-24 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleCreateWorkoutType}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                Create Exercise
              </button>
            </div>
          )}

          {selectedWorkout && existingPR && (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-400">
                <TrendingUp className="w-4 h-4" />
                <span>PR: {existingPR.pr_value} {selectedWorkout.units}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Score ({selectedWorkout?.units || 'units'})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.score_value}
                onChange={(e) => setFormData({ ...formData, score_value: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Percentage of Max (optional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.percentage}
              onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="e.g., 85 for 85%"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rx}
                onChange={(e) => setFormData({ ...formData, rx: e.target.checked })}
                className="w-5 h-5 rounded bg-slate-700/50 border-slate-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-800"
              />
              <span className="text-slate-300">As Prescribed (Rx)</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
              placeholder="How did it feel? Any notes..."
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !formData.workout_type_id}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Workout'}
          </button>
        </form>
      )}
    </div>
  );
}
