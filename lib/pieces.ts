import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// Interface pour une pièce
export interface Piece {
  id?: string // ID Firestore (optionnel car généré automatiquement)
  photo: string // Base64 de la photo
  temperatureType: 'Haute température' | 'Basse température'
  clayType: 'Grès' | 'Faïence' | 'Porcelaine'
  notes: string
  biscuitAlreadyDone: boolean
  biscuitCompleted: boolean
  biscuitRequested: boolean
  biscuitDate?: string
  biscuitCompletedDate?: string
  emaillageRequested: boolean
  emaillageCompleted: boolean
  emaillageDate?: string
  emaillageCompletedDate?: string
  submittedBy: {
    firstName: string
    lastName: string
    email: string
    uid: string
  }
  submittedDate: string
}

// Créer une nouvelle pièce
export async function createPiece(pieceData: Omit<Piece, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'pieces'), {
      ...pieceData,
      submittedDate: new Date().toISOString(),
    })
    return docRef.id
  } catch (error) {
    console.error('Erreur création pièce:', error)
    throw new Error('Impossible de créer la pièce')
  }
}

// Récupérer toutes les pièces d'un utilisateur
export async function getUserPieces(uid: string): Promise<Piece[]> {
  try {
    const q = query(
      collection(db, 'pieces'),
      where('submittedBy.uid', '==', uid),
      orderBy('submittedDate', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const pieces: Piece[] = []

    querySnapshot.forEach((doc) => {
      pieces.push({
        id: doc.id,
        ...doc.data(),
      } as Piece)
    })

    return pieces
  } catch (error) {
    console.error('Erreur récupération pièces:', error)
    throw new Error('Impossible de récupérer les pièces')
  }
}

// Récupérer toutes les pièces (pour admin)
export async function getAllPieces(): Promise<Piece[]> {
  try {
    const q = query(collection(db, 'pieces'), orderBy('submittedDate', 'desc'))

    const querySnapshot = await getDocs(q)
    const pieces: Piece[] = []

    querySnapshot.forEach((doc) => {
      pieces.push({
        id: doc.id,
        ...doc.data(),
      } as Piece)
    })

    return pieces
  } catch (error) {
    console.error('Erreur récupération toutes les pièces:', error)
    throw new Error('Impossible de récupérer les pièces')
  }
}

// Récupérer une pièce par ID
export async function getPieceById(pieceId: string): Promise<Piece | null> {
  try {
    const docRef = doc(db, 'pieces', pieceId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Piece
    }
    return null
  } catch (error) {
    console.error('Erreur récupération pièce:', error)
    throw new Error('Impossible de récupérer la pièce')
  }
}

// Mettre à jour une pièce
export async function updatePiece(pieceId: string, updates: Partial<Piece>): Promise<void> {
  try {
    const docRef = doc(db, 'pieces', pieceId)
    await updateDoc(docRef, updates)
  } catch (error) {
    console.error('Erreur mise à jour pièce:', error)
    throw new Error('Impossible de mettre à jour la pièce')
  }
}

// Demander une cuisson (biscuit ou émaillage)
export async function requestFiring(
  pieceId: string,
  type: 'biscuit' | 'emaillage',
  requestedDate: string
): Promise<void> {
  try {
    const updates: Partial<Piece> = {}

    if (type === 'biscuit') {
      updates.biscuitRequested = true
      updates.biscuitDate = requestedDate
    } else {
      updates.emaillageRequested = true
      updates.emaillageDate = requestedDate
    }

    await updatePiece(pieceId, updates)
  } catch (error) {
    console.error('Erreur demande cuisson:', error)
    throw new Error('Impossible de demander la cuisson')
  }
}

// Marquer une cuisson comme complétée (admin uniquement)
export async function completeFiring(
  pieceId: string,
  type: 'biscuit' | 'emaillage'
): Promise<void> {
  try {
    const updates: Partial<Piece> = {}

    if (type === 'biscuit') {
      updates.biscuitCompleted = true
      updates.biscuitCompletedDate = new Date().toISOString()
    } else {
      updates.emaillageCompleted = true
      updates.emaillageCompletedDate = new Date().toISOString()
    }

    await updatePiece(pieceId, updates)
  } catch (error) {
    console.error('Erreur complétion cuisson:', error)
    throw new Error('Impossible de marquer la cuisson comme complétée')
  }
}

// Supprimer une pièce (admin uniquement)
export async function deletePiece(pieceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'pieces', pieceId))
  } catch (error) {
    console.error('Erreur suppression pièce:', error)
    throw new Error('Impossible de supprimer la pièce')
  }
}
