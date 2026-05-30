import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getProductByPriceId } from '../stripe-config'

export interface UserSubscription {
  customer_id: string | null
  subscription_id: string | null
  subscription_status: string | null
  price_id: string | null
  current_period_start: number | null
  current_period_end: number | null
  cancel_at_period_end: boolean | null
  payment_method_brand: string | null
  payment_method_last4: string | null
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle()

      if (error) {
        throw error
      }

      setSubscription(data)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
    } finally {
      setLoading(false)
    }
  }

  const getSubscriptionPlan = () => {
    if (!subscription?.price_id) return null
    return getProductByPriceId(subscription.price_id)
  }

  const isActive = () => {
    return subscription?.subscription_status === 'active'
  }

  const isTrialing = () => {
    return subscription?.subscription_status === 'trialing'
  }

  const isCanceled = () => {
    return subscription?.subscription_status === 'canceled'
  }

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    getSubscriptionPlan,
    isActive,
    isTrialing,
    isCanceled
  }
}