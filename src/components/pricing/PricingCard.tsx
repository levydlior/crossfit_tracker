import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Check, CheckCircle2, Loader2 } from 'lucide-react'
import { StripeProduct, formatPrice } from '../../stripe-config'
import { createCheckoutSession } from '../../services/stripe'

interface PricingCardProps {
  product: StripeProduct
  isPopular?: boolean
  currentPlan?: boolean
}

export function PricingCard({ product, isPopular = false, currentPlan = false }: PricingCardProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      const { url } = await createCheckoutSession({
        priceId: product.priceId,
        mode: product.mode,
      })
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`relative w-full max-w-sm ${isPopular && !currentPlan ? 'border-blue-500 shadow-lg' : ''} ${currentPlan ? 'border-green-500 shadow-lg' : ''}`}>
      {currentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Plan Active
          </span>
        </div>
      )}
      {isPopular && !currentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-gray-600 ml-1">/month</span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Track unlimited workouts</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Create multiple workout types</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Personal records tracking</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Progress analytics</span>
          </li>
        </ul>
      </CardContent>

      <CardFooter>
        {currentPlan ? (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-green-50 border border-green-200 text-green-700 font-semibold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Plan Active
          </div>
        ) : (
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Redirecting...' : 'Get Started'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
