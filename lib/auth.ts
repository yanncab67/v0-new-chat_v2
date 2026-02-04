import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

// Interface pour les données utilisateur
export interface UserData {
  uid: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'practician'
  createdAt: string
}

// Créer un nouveau compte
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<UserData> {
  try {
    // Créer le compte Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Créer le document utilisateur dans Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      firstName,
      lastName,
      role: 'practician', // Par défaut, tout le monde est "user"
      createdAt: new Date().toISOString(),
    }

    await setDoc(doc(db, 'users', user.uid), userData)

    return userData
  } catch (error: any) {
    console.error('Erreur inscription:', error)
    throw new Error(getErrorMessage(error.code))
  }
}

// Se connecter
export async function signIn(email: string, password: string): Promise<UserData> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))

    if (!userDoc.exists()) {
      throw new Error('Profil utilisateur introuvable')
    }

    return userDoc.data() as UserData
  } catch (error: any) {
    console.error('Erreur connexion:', error)
    throw new Error(getErrorMessage(error.code))
  }
}

// Se déconnecter
export async function logOut(): Promise<void> {
  await signOut(auth)
}

// Récupérer les données de l'utilisateur connecté
export async function getCurrentUserData(): Promise<UserData | null> {
  const user = auth.currentUser
  if (!user) return null

  const userDoc = await getDoc(doc(db, 'users', user.uid))
  if (!userDoc.exists()) return null

  return userDoc.data() as UserData
}

// Messages d'erreur en français
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Cet email est déjà utilisé'
    case 'auth/invalid-email':
      return 'Adresse email invalide'
    case 'auth/operation-not-allowed':
      return 'Opération non autorisée'
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères'
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé'
    case 'auth/user-not-found':
      return 'Aucun compte ne correspond à cet email'
    case 'auth/wrong-password':
      return 'Mot de passe incorrect'
    case 'auth/invalid-credential':
      return 'Identifiants incorrects'
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard'
    default:
      return 'Une erreur est survenue. Réessayez'
  }
}
