'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface RoleGuardProps {
  allowedRoles: ('admin' | 'practician')[]
  children: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({ allowedRoles, children, redirectTo }: RoleGuardProps) {
  const { userData, loading } = useAuth('/login')
  const router = useRouter()

  useEffect(() => {
    if (!loading && userData) {
      // Vérifier si l'utilisateur a le bon rôle
      if (!allowedRoles.includes(userData.role as any)) {
        // Rediriger selon le rôle
        if (userData.role === 'admin') {
          router.push(redirectTo || '/admin')
        } else {
          router.push(redirectTo || '/practician')
        }
      }
    }
  }, [userData, loading, allowedRoles, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🏺</div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  // Vérifier le rôle
  if (!allowedRoles.includes(userData.role as any)) {
    return null
  }

  return <>{children}</>
}
