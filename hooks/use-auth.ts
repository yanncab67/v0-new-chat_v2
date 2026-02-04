'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getCurrentUserData, UserData } from '@/lib/auth'

export function useAuth(redirectTo?: string) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Utilisateur connecté
        setUser(firebaseUser)

        // Récupérer les données depuis Firestore
        const data = await getCurrentUserData()
        setUserData(data)
        setLoading(false)
      } else {
        // Utilisateur non connecté
        setUser(null)
        setUserData(null)
        setLoading(false)

        // Rediriger vers la page de connexion si une redirection est spécifiée
        if (redirectTo) {
          router.push(redirectTo)
        }
      }
    })

    // Nettoyer l'écouteur
    return () => unsubscribe()
  }, [router, redirectTo])

  return { user, userData, loading }
}
