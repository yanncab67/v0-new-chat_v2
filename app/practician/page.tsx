'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/use-auth'
import { logOut } from '@/lib/auth'
import { RoleGuard } from '@/components/role-guard'
import { createPiece, getUserPieces, requestFiring, type Piece } from '@/lib/pieces'
import { compressImageWithMaxSize, getImageInfo } from '@/lib/image-compression'

export default function PracticianPage() {
  const router = useRouter()
  const { user, userData, loading } = useAuth('/login')
  const [pieces, setPieces] = useState<Piece[]>([])
  const [loadingPieces, setLoadingPieces] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [photo, setPhoto] = useState('')
  const [compressingPhoto, setCompressingPhoto] = useState(false)
  const [temperatureType, setTemperatureType] = useState<'Haute température' | 'Basse température'>(
    'Haute température'
  )
  const [clayType, setClayType] = useState<'Grès' | 'Faïence' | 'Porcelaine'>('Grès')
  const [notes, setNotes] = useState('')
  const [biscuitAlreadyDone, setBiscuitAlreadyDone] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [requestType, setRequestType] = useState<'biscuit' | 'emaillage' | null>(null)
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null)
  const [requestedDate, setRequestedDate] = useState('')

  useEffect(() => {
    if (userData) {
      loadPieces()
    }
  }, [userData])

  const loadPieces = async () => {
    if (!userData) return

    setLoadingPieces(true)
    try {
      const userPieces = await getUserPieces(userData.uid)
      setPieces(userPieces)
    } catch (error) {
      console.error('Erreur chargement pièces:', error)
      alert('Erreur lors du chargement des pièces')
    } finally {
      setLoadingPieces(false)
    }
  }

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCompressingPhoto(true)
    try {
      // Afficher les infos de l'image originale
      const info = await getImageInfo(file)
      console.log(`Image originale: ${info.width}x${info.height}px, ${info.sizeKB} KB`)

      // Compresser l'image (max 500 KB)
      const compressed = await compressImageWithMaxSize(file, 500)
      setPhoto(compressed)
    } catch (error) {
      console.error('Erreur compression image:', error)
      alert("Erreur lors de la compression de l'image")
    } finally {
      setCompressingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userData) return

    setSubmitting(true)
    try {
      const newPieceData: Omit<Piece, 'id'> = {
        photo,
        temperatureType,
        clayType,
        notes,
        biscuitAlreadyDone,
        biscuitCompleted: biscuitAlreadyDone,
        biscuitRequested: false,
        emaillageRequested: false,
        emaillageCompleted: false,
        submittedBy: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          uid: userData.uid,
        },
        submittedDate: new Date().toISOString(),
      }

      await createPiece(newPieceData)

      // Reset form
      setPhoto('')
      setTemperatureType('Haute température')
      setClayType('Grès')
      setNotes('')
      setBiscuitAlreadyDone(false)
      setShowForm(false)

      // Reload pieces
      await loadPieces()
    } catch (error) {
      console.error('Erreur création pièce:', error)
      alert('Erreur lors de la création de la pièce')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestFiring = (pieceId: string, type: 'biscuit' | 'emaillage') => {
    setSelectedPieceId(pieceId)
    setRequestType(type)
    setRequestedDate('')
    setShowDateModal(true)
  }

  const confirmFiringRequest = async () => {
    if (!requestedDate || !selectedPieceId || !requestType) return

    try {
      await requestFiring(selectedPieceId, requestType, requestedDate)

      setShowDateModal(false)
      setSelectedPieceId(null)
      setRequestType(null)
      setRequestedDate('')

      // Reload pieces
      await loadPieces()
    } catch (error) {
      console.error('Erreur demande cuisson:', error)
      alert('Erreur lors de la demande de cuisson')
    }
  }

  const activePieces = pieces.filter((p) => !(p.biscuitCompleted && p.emaillageCompleted))
  const completedPieces = pieces.filter((p) => p.biscuitCompleted && p.emaillageCompleted)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (!userData) {
    return null // Le hook useAuth va rediriger vers /login
  }

  return (
    <RoleGuard allowedRoles={['practician', 'admin']}>
      <div className="min-h-screen bg-gradient-to-b from-[#f5d4c5] to-white">
        {/* Header */}
        <div className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#8b6d47]">🏺 Mes Pièces</h1>
              <p className="text-sm text-gray-600 mt-1">
                {userData.firstName} {userData.lastName} ({userData.email})
              </p>
            </div>
            <div className="flex gap-3">
              {userData.role === 'admin' && (
                <Button
                  onClick={() => router.push('/admin')}
                  variant="outline"
                  className="border-[#8b6d47] text-[#8b6d47] hover:bg-[#8b6d47] hover:text-white"
                >
                  📊 Gestion Admin
                </Button>
              )}
              <Button
                onClick={async () => {
                  await logOut()
                  router.push('/')
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Add Piece Button */}
          <Button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-[#c8623e] hover:bg-[#a04f2e] text-white py-6 text-lg"
            disabled={submitting}
          >
            {showForm ? 'Annuler' : '+ Nouvelle Pièce'}
          </Button>

          {/* Add Piece Form */}
          {showForm && (
            <Card className="border-2 border-[#c8623e]">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Photo de la pièce</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoCapture}
                      className="mt-2"
                      disabled={compressingPhoto}
                    />
                    {compressingPhoto && (
                      <p className="text-sm text-blue-600 mt-2">
                        Compression de l'image en cours...
                      </p>
                    )}
                    {photo && !compressingPhoto && (
                      <img
                        src={photo || '/placeholder.svg'}
                        alt="Preview"
                        className="mt-4 w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>

                  <div>
                    <Label>Température de cuisson</Label>
                    <Select
                      value={temperatureType}
                      onValueChange={(value) =>
                        setTemperatureType(value as 'Haute température' | 'Basse température')
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Haute température">Haute température</SelectItem>
                        <SelectItem value="Basse température">Basse température</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Type de terre</Label>
                    <Select
                      value={clayType}
                      onValueChange={(value) =>
                        setClayType(value as 'Grès' | 'Faïence' | 'Porcelaine')
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grès">Grès</SelectItem>
                        <SelectItem value="Faïence">Faïence</SelectItem>
                        <SelectItem value="Porcelaine">Porcelaine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="biscuit-done"
                      checked={biscuitAlreadyDone}
                      onCheckedChange={(checked) => setBiscuitAlreadyDone(checked as boolean)}
                    />
                    <Label htmlFor="biscuit-done" className="cursor-pointer">
                      Le biscuit a déjà été effectué
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#8b6d47] hover:bg-[#6d5438]"
                    disabled={submitting || compressingPhoto}
                  >
                    {submitting
                      ? 'Ajout en cours...'
                      : compressingPhoto
                      ? 'Compression...'
                      : 'Ajouter la pièce'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loadingPieces && (
            <Card>
              <CardContent className="p-8 text-center text-gray-600">
                Chargement des pièces...
              </CardContent>
            </Card>
          )}

          {/* Active Pieces */}
          {!loadingPieces && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#8b6d47]">Pièces en cours</h2>
              {activePieces.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-600">
                    Aucune pièce en cours
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {activePieces.map((piece) => (
                    <Card key={piece.id}>
                      <CardContent className="p-4 space-y-4">
                        {piece.photo && (
                          <img
                            src={piece.photo || '/placeholder.svg'}
                            alt="Piece"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex gap-2">
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {piece.temperatureType}
                          </span>
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {piece.clayType}
                          </span>
                        </div>
                        {piece.notes && <p className="text-sm text-gray-600">{piece.notes}</p>}

                        <div className="space-y-2">
                          <Button
                            onClick={() => handleRequestFiring(piece.id!, 'biscuit')}
                            disabled={piece.biscuitCompleted || piece.biscuitRequested}
                            className="w-full"
                            variant={piece.biscuitCompleted ? 'secondary' : 'default'}
                          >
                            {piece.biscuitCompleted
                              ? '✓ Biscuit effectué'
                              : piece.biscuitRequested
                              ? '⏰ Biscuit demandé'
                              : 'Demander cuisson biscuit'}
                          </Button>

                          <Button
                            onClick={() => handleRequestFiring(piece.id!, 'emaillage')}
                            disabled={!piece.biscuitCompleted || piece.emaillageRequested}
                            className="w-full"
                            variant={piece.emaillageCompleted ? 'secondary' : 'default'}
                          >
                            {piece.emaillageCompleted
                              ? '✓ Émaillage effectué'
                              : piece.emaillageRequested
                              ? '⏰ Émaillage demandé'
                              : !piece.biscuitCompleted
                              ? '⏰ En attente du biscuit'
                              : 'Demander cuisson émaillage'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed Pieces History */}
          {!loadingPieces && completedPieces.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-green-700">Historique - Pièces terminées</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completedPieces.map((piece) => (
                  <Card key={piece.id} className="bg-green-50 border-l-4 border-green-600">
                    <CardContent className="p-4 space-y-4">
                      {piece.photo && (
                        <img
                          src={piece.photo || '/placeholder.svg'}
                          alt="Piece"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex gap-2">
                        <span className="text-xs bg-white px-2 py-1 rounded">
                          {piece.temperatureType}
                        </span>
                        <span className="text-xs bg-white px-2 py-1 rounded">{piece.clayType}</span>
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-semibold">
                          ✓ Terminée
                        </span>
                      </div>
                      {piece.notes && <p className="text-sm text-gray-600">{piece.notes}</p>}
                      {piece.biscuitCompletedDate && piece.emaillageCompletedDate && (
                        <div className="text-xs text-green-700">
                          <p>
                            Biscuit:{' '}
                            {new Date(piece.biscuitCompletedDate).toLocaleDateString('fr-FR')}
                          </p>
                          <p>
                            Émaillage:{' '}
                            {new Date(piece.emaillageCompletedDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Selection Modal */}
        {showDateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-[#8b6d47]">
                  Choisir la date souhaitée pour{' '}
                  {requestType === 'biscuit' ? 'le biscuit' : "l'émaillage"}
                </h3>
                <Input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowDateModal(false)
                      setSelectedPieceId(null)
                      setRequestType(null)
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={confirmFiringRequest}
                    className="flex-1 bg-[#8b6d47] hover:bg-[#6d5438]"
                  >
                    Confirmer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
