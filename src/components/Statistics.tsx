import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Target, Calendar } from 'lucide-react';
import { supabase, WorkoutLog, WorkoutType, PersonalRecord } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Statistics() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);

    const [logsRes, prsRes] = await Promise.all([
      supabase
        .from('workout_logs')
        .select('*, workout_types(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: true }),
      supabase
        .from('personal_records')
        .select('*, workout_types(*)')
        .eq('user_id', user.id)
        .order('achieved_date', { ascending: false }),
    ]);

    if (logsRes.data) setLogs(logsRes.data);
    if (prsRes.data) setPersonalRecords(prsRes.data);
    setLoading(false);
  }

  const workoutTypes = Array.from(new Set(logs.map((log) => log.workout_type_id)));

  const stats = {
    totalWorkouts: logs.length,
    rxPercentage: logs.filter((log) => log.rx).length / (logs.length || 1) * 100,
    thisMonth:
      new Set(
        logs
          .filter((log) => {
            const logDate = new Date(log.date);
            const now = new Date();
            return (
              logDate.getMonth() === now.getMonth() &&
              logDate.getFullYear() === now.getFullYear()
            );
          })
          .map((log) => log.date)
      ).size,
    avgPercentage:
      logs.filter((log) => log.percentage !== null).reduce((sum, log) => sum + (log.percentage || 0), 0) /
      (logs.filter((log) => log.percentage !== null).length || 1),
  };

  const selectedLogs = selectedWorkout
    ? logs.filter((log) => log.workout_type_id === selectedWorkout)
    : [];

  const progressData = selectedLogs.slice(-10).map((log) => ({
    date: log.date,
    value: log.score_value,
    percentage: log.percentage,
  }));

  const maxScore =
    progressData.length > 0 ? Math.max(...progressData.map((p) => p.value)) : 0;
  const minScore =
    progressData.length > 0 ? Math.min(...progressData.map((p) => p.value)) : 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-orange-500" />
        Statistics
      </h2>

      {loading ? (
        <div className="text-slate-400 text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Total Workouts
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalWorkouts}</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Target className="w-4 h-4" />
                Rx Rate
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.rxPercentage.toFixed(0)}%
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                This Month
              </div>
              <div className="text-3xl font-bold text-white">{stats.thisMonth}</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Award className="w-4 h-4" />
                Avg %
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.avgPercentage.toFixed(0)}%
              </div>
            </div>
          </div>

          {personalRecords.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-3">Personal Records</h3>
              <div className="grid gap-3">
                {personalRecords.slice(0, 6).map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-orange-400" />
                      <span className="text-white font-medium">
                        {pr.workout_types?.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {pr.pr_value}
                        <span className="text-sm text-slate-400 ml-1">
                          {pr.workout_types?.units}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(pr.achieved_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {workoutTypes.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Progress Chart</h3>
              <select
                value={selectedWorkout}
                onChange={(e) => setSelectedWorkout(e.target.value)}
                className="w-full mb-4 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select workout to chart...</option>
                {logs
                  .filter((log, idx, arr) => arr.findIndex((l) => l.workout_type_id === log.workout_type_id) === idx)
                  .map((log) => (
                    <option key={log.workout_type_id} value={log.workout_type_id}>
                      {log.workout_types?.name}
                    </option>
                  ))}
              </select>

              {progressData.length > 1 && (
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                  <div className="h-48 flex items-end justify-between gap-1">
                    {progressData.map((point, idx) => {
                      const height =
                        maxScore > minScore
                          ? ((point.value - minScore) / (maxScore - minScore)) * 100
                          : 50;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center flex-1 h-full justify-end"
                        >
                          <div className="w-full flex flex-col items-center">
                            <span className="text-xs text-slate-400 mb-1">
                              {point.value}
                            </span>
                            <div
                              className="w-full bg-gradient-to-t from-orange-500 to-red-400 rounded-t transition-all hover:from-orange-400 hover:to-red-300"
                              style={{ height: `${Math.max(height, 5)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 mt-1 truncate w-full text-center">
                            {new Date(point.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
