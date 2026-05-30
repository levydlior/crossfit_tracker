import React, { useState } from 'react';
import { Dumbbell, LogOut, BarChart3, History, User, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { WorkoutForm } from './WorkoutForm';
import { WorkoutHistory } from './WorkoutHistory';
import { Statistics } from './Statistics';
import { UpgradeModal } from './UpgradeModal';

type Tab = 'log' | 'history' | 'stats';

export function Dashboard() {
  const { profile, subscription, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('log');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active';

  function handleWorkoutSaved() {
    setRefreshKey((k) => k + 1);
    setActiveTab('history');
  }

  const tabs = [
    { id: 'log' as Tab, label: 'Log Workout', icon: Dumbbell },
    { id: 'history' as Tab, label: 'History', icon: History },
    { id: 'stats' as Tab, label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">CrossFit Tracker</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isPro ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-full text-amber-400 text-xs font-semibold">
                  <Crown className="w-3.5 h-3.5" />
                  Pro
                </span>
              ) : (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/40 rounded-full text-orange-400 text-xs font-semibold hover:from-orange-500/30 hover:to-red-500/30 transition-all"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Upgrade
                </button>
              )}
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4" />
                <span className="text-sm hidden sm:block">{profile?.name || 'Athlete'}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            {activeTab === 'log' && (
              <WorkoutForm onSaved={handleWorkoutSaved} onUpgrade={() => setShowUpgrade(true)} />
            )}
            {activeTab === 'history' && <WorkoutHistory key={refreshKey} />}
            {activeTab === 'stats' && <Statistics key={refreshKey} />}
          </div>

          <div className="lg:col-span-1 space-y-6">
            {activeTab === 'log' && (
              <>
                <WorkoutHistory key={refreshKey + '-sidebar'} />
                <Statistics key={refreshKey + '-sidebar-stats'} />
              </>
            )}
          </div>
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
