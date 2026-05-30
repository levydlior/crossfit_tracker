import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Filter, Trash2, Pencil, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

type WorkoutType = {
  id: string; user_id: string; name: string; category: string;
  description: string; units: string; created_at: string;
};
type WorkoutLog = {
  id: string; user_id: string; workout_type_id: string; date: string;
  score_value: number; percentage: number | null; notes: string;
  rx: boolean; created_at: string; workout_types?: WorkoutType;
};

async function recalcPR(userId: string, workoutTypeId: string, category: string) {
  if (category !== 'strength' && category !== 'olympic') return;

  const { data: remaining } = await supabase
    .from('workout_logs')
    .select('score_value, date')
    .eq('user_id', userId)
    .eq('workout_type_id', workoutTypeId)
    .order('score_value', { ascending: false })
    .limit(1);

  const { data: existingPR } = await supabase
    .from('personal_records')
    .select('id')
    .eq('user_id', userId)
    .eq('workout_type_id', workoutTypeId)
    .maybeSingle();

  if (!remaining || remaining.length === 0) {
    if (existingPR) {
      await supabase.from('personal_records').delete().eq('id', existingPR.id);
    }
    return;
  }

  const best = remaining[0];
  if (existingPR) {
    await supabase
      .from('personal_records')
      .update({ pr_value: best.score_value, achieved_date: best.date })
      .eq('id', existingPR.id);
  } else {
    await supabase.from('personal_records').insert({
      user_id: userId,
      workout_type_id: workoutTypeId,
      pr_value: best.score_value,
      achieved_date: best.date,
    });
  }
}

export function WorkoutHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWorkout, setFilterWorkout] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ score_value: '', percentage: '', notes: '', rx: true, date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);

    const [logsRes, typesRes] = await Promise.all([
      supabase
        .from('workout_logs')
        .select('*, workout_types(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(50),
      supabase.from('workout_types').select('*').eq('user_id', user.id).order('name'),
    ]);

    if (logsRes.data) setLogs(logsRes.data);
    if (typesRes.data) setWorkoutTypes(typesRes.data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!user) return;
    const log = logs.find((l) => l.id === id);
    const { error } = await supabase.from('workout_logs').delete().eq('id', id);
    if (!error) {
      setLogs(logs.filter((l) => l.id !== id));
      if (log?.workout_types) {
        await recalcPR(user.id, log.workout_type_id, log.workout_types.category);
      }
    }
  }

  function startEdit(log: WorkoutLog) {
    setEditingId(log.id);
    setEditForm({
      score_value: String(log.score_value),
      percentage: log.percentage !== null ? String(log.percentage) : '',
      notes: log.notes ?? '',
      rx: log.rx,
      date: log.date,
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(log: WorkoutLog) {
    if (!user) return;
    const scoreValue = parseFloat(editForm.score_value);
    const percentage = editForm.percentage ? parseFloat(editForm.percentage) : null;
    if (isNaN(scoreValue) || scoreValue < 0) return;

    setSaving(true);
    const { data, error } = await supabase
      .from('workout_logs')
      .update({
        score_value: scoreValue,
        percentage,
        notes: editForm.notes,
        rx: editForm.rx,
        date: editForm.date,
      })
      .eq('id', log.id)
      .select('*, workout_types(*)')
      .single();

    if (!error && data) {
      setLogs(logs.map((l) => (l.id === log.id ? data : l)));
      setEditingId(null);
      if (log.workout_types) {
        await recalcPR(user.id, log.workout_type_id, log.workout_types.category);
      }
    }
    setSaving(false);
  }

  const filteredLogs = filterWorkout
    ? logs.filter((log) => log.workout_type_id === filterWorkout)
    : logs;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Workout History
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {showFilters && (
        <div className="mb-4">
          <select
            value={filterWorkout}
            onChange={(e) => setFilterWorkout(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All workouts</option>
            {workoutTypes.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-center py-8">Loading...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-slate-400 text-center py-8">
          No workouts logged yet. Start tracking your progress!
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all group"
            >
              {editingId === log.id ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-semibold">{log.workout_types?.name}</span>
                    <button onClick={cancelEdit} className="text-slate-400 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Score ({log.workout_types?.units})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editForm.score_value}
                        onChange={(e) => setEditForm({ ...editForm, score_value: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">% of Max (optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={editForm.percentage}
                      onChange={(e) => setEditForm({ ...editForm, percentage: e.target.value })}
                      placeholder="e.g. 85"
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.rx}
                        onChange={(e) => setEditForm({ ...editForm, rx: e.target.checked })}
                        className="w-4 h-4 rounded bg-slate-700/50 border-slate-600 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-slate-300 text-sm">Rx</span>
                    </label>
                    <button
                      onClick={() => handleSaveEdit(log)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">{log.workout_types?.name}</span>
                        {log.rx && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded">
                            Rx
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-sm">{formatDate(log.date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {log.score_value}
                        <span className="text-sm text-slate-400 ml-1">{log.workout_types?.units}</span>
                      </div>
                      {log.percentage !== null && (
                        <div className="flex items-center gap-1 text-green-400 text-sm justify-end">
                          <TrendingUp className="w-4 h-4" />
                          {log.percentage}%
                        </div>
                      )}
                    </div>
                  </div>
                  {log.notes && (
                    <div className="mt-2 pt-2 border-t border-slate-600/50 text-slate-400 text-sm">
                      {log.notes}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => startEdit(log)}
                      className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
