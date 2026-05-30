import { supabase } from '../lib/supabase'

export interface CreateCheckoutSessionParams {
  priceId: string
  mode: 'payment' | 'subscription'
  successUrl?: string
  cancelUrl?: string
}

export async function createCheckoutSession({
  priceId,
  mode,
  successUrl = `${window.location.origin}/success`,
  cancelUrl = `${window.location.origin}/pricing`
}: CreateCheckoutSessionParams) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.access_token) {
    throw new Error('User not authenticated')
  }

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_id: priceId,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create checkout session')
  }

  const data = await response.json()
  return data
}