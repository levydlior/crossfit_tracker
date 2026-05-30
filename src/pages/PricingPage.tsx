import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { PricingCard } from '../components/pricing/PricingCard'
import { stripeProducts } from '../stripe-config'
import { Navigate } from 'react-router-dom'

export function PricingPage() {
  const { user, loading: authLoading } = useAuth()
  const { subscription, loading: subLoading, isActive } = useSubscription()

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

  const activePriceId = isActive() ? subscription?.price_id : null

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Unlock your fitness potential with our premium features
          </p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {stripeProducts.map((product, index) => (
            <PricingCard
              key={product.id}
              product={product}
              isPopular={index === 0}
              currentPlan={activePriceId === product.priceId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
