import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CheckCircle, ArrowRight } from 'lucide-react'

export function SuccessPage() {
  const { refetch } = useSubscription()

  useEffect(() => {
    // Refetch subscription data after successful payment
    const timer = setTimeout(() => {
      refetch()
    }, 2000)

    return () => clearTimeout(timer)
  }, [refetch])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Thank you for your purchase. Your subscription is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              You now have access to all premium features. Start tracking your workouts and achieving your fitness goals!
            </p>
            <div className="flex flex-col space-y-2">
              <Link to="/dashboard">
                <Button className="w-full">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/workouts">
                <Button variant="outline" className="w-full">
                  Start Tracking Workouts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}