import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { SignupForm } from '../components/auth/SignupForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Dumbbell, MailCheck } from 'lucide-react'

export function SignupPage() {
  const { user, loading } = useAuth()
  const [signedUp, setSignedUp] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  if (signedUp) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <MailCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-gray-900">Check your inbox</CardTitle>
              <CardDescription className="text-base mt-2">
                We sent a verification link to{' '}
                <span className="font-semibold text-gray-800">{registeredEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Click the link in the email to activate your account. Once verified, you can sign in and start tracking your workouts.
              </p>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Already verified?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Dumbbell className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>
              Create your account to start tracking your fitness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm
              onSuccess={(email) => {
                setRegisteredEmail(email)
                setSignedUp(true)
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
