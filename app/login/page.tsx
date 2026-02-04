'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { signUp, signIn } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    try {
      const userData = await signIn(email, password)

      // Rediriger selon le rôle
      if (userData.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/practician') // ⬅️ Changé de /admin/mes-pieces à /practician
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    setError('')
    setLoading(true)

    // Validations
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      await signUp(email, password, firstName, lastName)

      // Connexion automatique après inscription (toujours practician)
      router.push('/practician') // ⬅️ Changé
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5d4c5] via-slate-50 to-[#e8a089] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-[#c8623e] shadow-xl">
        <CardContent className="pt-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏺</div>
            <h1 className="text-3xl font-bold text-[#8b6d47]">Kiln Management</h1>
            <p className="text-slate-600 mt-2">Gestion des cuissons céramiques</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`flex-1 ${
                mode === 'login'
                  ? 'bg-[#c8623e] text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Connexion
            </Button>
            <Button
              onClick={() => {
                setMode('signup')
                setError('')
              }}
              className={`flex-1 ${
                mode === 'signup'
                  ? 'bg-[#c8623e] text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Créer un compte
            </Button>
          </div>

          {/* Form */}
          <div className="space-y-4 mb-6">
            {mode === 'signup' && (
              <>
                <input
                  type="text"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-[#c8623e] focus:outline-none"
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-[#c8623e] focus:outline-none"
                  disabled={loading}
                />
              </>
            )}
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-[#c8623e] focus:outline-none"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-[#c8623e] focus:outline-none"
              disabled={loading}
            />
            {mode === 'signup' && (
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-[#c8623e] focus:outline-none"
                disabled={loading}
              />
            )}
          </div>

          {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

          {/* Submit Button */}
          <Button
            onClick={mode === 'login' ? handleLogin : handleSignup}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer un compte'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
