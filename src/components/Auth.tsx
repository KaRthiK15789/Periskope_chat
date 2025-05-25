'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { FiLogIn, FiUserPlus } from 'react-icons/fi'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true)
    setError('')
    
    try {
      const { error } = type === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

      if (error) throw error
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <div className="flex justify-center">
          <img 
            src="/assets/periskope-logo.png" 
            alt="Periskope" 
            className="h-12"
          />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800">Welcome to Periskope Chat</h1>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-periskope focus:border-periskope"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-periskope focus:border-periskope"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleAuth('login')}
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-periskope hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-periskope"
            >
              <FiLogIn className="mr-2" />
              Sign In
            </button>
            <button
              onClick={() => handleAuth('signup')}
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-periskope"
            >
              <FiUserPlus className="mr-2" />
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
