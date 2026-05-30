import React, { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { WorkoutForm } from '../components/WorkoutForm'
import { WorkoutHistory } from '../components/WorkoutHistory'
import { UpgradeModal } from '../components/UpgradeModal'
import { Plus, X } from 'lucide-react'

export function WorkoutsPage() {
  const { user, loading } = useAuth()
  const { isActive } = useSubscription()
  const [showForm, setShowForm] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  function handleSaved() {
    setShowForm(false)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
            <p className="mt-2 text-gray-600">
              Track your training sessions and monitor your progress
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Workout
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <WorkoutForm
              onSaved={handleSaved}
              onUpgrade={() => { setShowForm(false); setShowUpgrade(true) }}
            />
          </div>
        )}

        <WorkoutHistory key={refreshKey} />
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
