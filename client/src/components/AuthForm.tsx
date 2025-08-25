import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AuthMode, AuthMethod, DebugData } from '../lib/types'
import { ApiService } from '../lib/api'
import { ZKService } from '../lib/zk'

interface AuthFormProps {
  onDebugData: (data: DebugData) => void
  onLoading: (loading: boolean) => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ onDebugData, onLoading }) => {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const zkService = ZKService.getInstance()

  const handleAuth = async (method: AuthMethod) => {
    setError('')
    setSuccess('')
    onLoading(true)

    try {
      if (mode === 'signup' && password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      let response
      let requestData

      if (method === 'traditional') {
        requestData = { email, password }
        
        if (mode === 'signup') {
          response = await ApiService.traditionalSignup(requestData)
        } else {
          response = await ApiService.traditionalLogin(requestData)
        }
      } else {
        // ZK method
        let salt: string
        let expectedHash: string

        if (mode === 'signup') {
          // Generate new salt for signup
          salt = zkService.generateSalt()
          // For signup, we don't need to pre-calculate the hash
          // The circuit will calculate it as password + salt
          expectedHash = '' // Will be set by the circuit
          
          const { proof, publicSignals } = await zkService.generateProof({
            password,
            salt,
            expectedHash
          })

          console.log('Proof publicSignals:', publicSignals)

          requestData = {
            email,
            proof,
            publicSignals,
            salt,
            expectedHash: publicSignals[1] // Use the hash from the proof
          }
          
          response = await ApiService.zkSignup(requestData)
        } else {
          // Get existing hash and salt for login
          const hashData = await ApiService.getPasswordHash(email)
          salt = hashData.salt
          expectedHash = hashData.hash

          const { proof, publicSignals } = await zkService.generateProof({
            password,
            salt,
            expectedHash
          })

          requestData = {
            email,
            proof,
            publicSignals
          }
          
          response = await ApiService.zkLogin(requestData)
        }
      }

      const debugData: DebugData = {
        method,
        mode,
        request: requestData,
        response,
        timestamp: Date.now()
      }

      onDebugData(debugData)

      if (response.success) {
        setSuccess(`${mode === 'signup' ? 'Account created' : 'Login'} successful!`)
        if (mode === 'login') {
          setPassword('')
        }
      } else {
        setError(response.message)
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      onLoading(false)
    }
  }

  const isFormValid = () => {
    if (!email || !password) return false
    if (mode === 'signup' && (!confirmPassword || password !== confirmPassword)) return false
    return true
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Auth Demo</h1>
        <p className="text-gray-600">Compare authentication methods</p>
      </div>

      <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-6">
        {/* Toggle */}
        <div className="relative bg-gray-100 rounded-xl p-1 mb-6">
          <div
            className={`absolute top-1 bottom-1 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${
              mode === 'login' ? 'left-1 right-1/2' : 'left-1/2 right-1'
            }`}
          />
          <div className="relative flex">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                mode === 'login' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                mode === 'signup' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Email"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Password"
          />

          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm Password"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleAuth('traditional')}
              disabled={!isFormValid()}
              className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all"
            >
              Traditional {mode}
            </button>

            <button
              onClick={() => handleAuth('zk')}
              disabled={!isFormValid()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all"
            >
              Zero-Knowledge {mode}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}