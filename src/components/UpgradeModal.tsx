import React from 'react';
import { X, Zap, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  onClose: () => void;
}

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const navigate = useNavigate();

  function handleViewPlans() {
    onClose();
    navigate('/pricing');
  }

  const proFeatures = [
    'Unlimited workout logs',
    'Full history & statistics',
    'Personal records tracking',
    'All exercise categories',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-b border-slate-700 px-6 py-8 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Upgrade to Pro</h2>
          <p className="text-slate-400 text-sm">Unlock unlimited workout tracking</p>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold text-white">$1</span>
            <span className="text-slate-400 ml-1">/month</span>
          </div>

          <ul className="space-y-3">
            {proFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-slate-300 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleViewPlans}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            See Available Plans
          </button>

          <p className="text-xs text-slate-500 text-center">
            Secured by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
