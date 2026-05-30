import React, { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Activity, Target, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react'

type RecentLog = {
  id: string
  date: string
  score_value: number
  rx: boolean
  workout_types: { name: string; units: string } | null
}

type Stats = {
  totalWorkouts: number
  personalRecords: number
  thisWeek: number
  recentLogs: RecentLog[]
}

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { loading: subLoading, getSubscriptionPlan, isActive } = useSubscription()
  const [stats, setStats] = useState<Stats>({ totalWorkouts: 0, personalRecords: 0, thisWeek: 0, recentLogs: [] })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadStats()
  }, [user])

  async function loadStats() {
    if (!user) return
    setStatsLoading(true)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]

    const [totalRes, prRes, weekRes, recentRes] = await Promise.all([
      supabase.from('workout_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('personal_records').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('workout_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('date', weekAgoStr),
      supabase.from('workout_logs').select('id, date, score_value, rx, workout_types(name, units)').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
    ])

    setStats({
      totalWorkouts: totalRes.count ?? 0,
      personalRecords: prRes.count ?? 0,
      thisWeek: weekRes.count ?? 0,
      recentLogs: (recentRes.data as RecentLog[]) ?? [],
    })
    setStatsLoading(false)
  }

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const currentPlan = getSubscriptionPlan()
  const active = isActive()

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back! Here's your fitness overview.</p>
          </div>
          {active && currentPlan && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              {currentPlan.name} — Active
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '—' : stats.totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">All time logged sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal Records</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '—' : stats.personalRecords}</div>
              <p className="text-xs text-muted-foreground">Across all exercises</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '—' : stats.thisWeek}</div>
              <p className="text-xs text-muted-foreground">Sessions in the last 7 days</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
            <CardDescription>Your 5 most recent sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : stats.recentLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No workouts recorded yet</p>
                <p className="text-sm mt-1">
                  Head to the{' '}
                  <Link to="/workouts" className="text-blue-600 hover:text-blue-500 font-medium">
                    Workouts
                  </Link>{' '}
                  tab to log your first session.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.workout_types?.name ?? 'Workout'}</p>
                        <p className="text-xs text-gray-500">{formatDate(log.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.rx && (
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">Rx</span>
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        {log.score_value} {log.workout_types?.units}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-3">
                  <Link to="/workouts" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                    View all workouts →
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
