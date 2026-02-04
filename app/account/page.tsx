"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AccountPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/")
      return
    }
    const user = JSON.parse(userStr)
    setCurrentUser(user)
    setFirstName(user.firstName || "")
    setLastName(user.lastName || "")
    setEmail(user.email || "")
  }, [router])

  const handleSaveInfo = () => {
    if (!firstName || !lastName || !email) {
      setMessage("Veuillez remplir tous les champs")
      setMessageType("error")
      return
    }

    // Check if email is already used by another user
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const emailExists = users.some((u: any) => u.email === email && u.email !== currentUser.email)
    if (emailExists) {
      setMessage("Cet email est deja utilise par un autre compte")
      setMessageType("error")
      return
    }

    // Update user in users list
    const updatedUsers = users.map((u: any) => {
      if (u.email === currentUser.email) {
        return { ...u, firstName, lastName, email }
      }
      return u
    })
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Update current user
    const updatedUser = { ...currentUser, firstName, lastName, email }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)

    // Update pieces submitted by this user
    const pieces = JSON.parse(localStorage.getItem("pieces") || "[]")
    const updatedPieces = pieces.map((p: any) => {
      if (p.submittedBy?.email === currentUser.email) {
        return {
          ...p,
          submittedBy: {
            ...p.submittedBy,
            firstName,
            lastName,
            email,
          },
        }
      }
      return p
    })
    localStorage.setItem("pieces", JSON.stringify(updatedPieces))

    setMessage("Informations mises a jour avec succes")
    setMessageType("success")
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Veuillez remplir tous les champs de mot de passe")
      setMessageType("error")
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage("Les nouveaux mots de passe ne correspondent pas")
      setMessageType("error")
      return
    }

    if (newPassword.length < 6) {
      setMessage("Le nouveau mot de passe doit contenir au moins 6 caracteres")
      setMessageType("error")
      return
    }

    // Check current password
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.email === currentUser.email)
    if (!user || user.password !== currentPassword) {
      setMessage("Mot de passe actuel incorrect")
      setMessageType("error")
      return
    }

    // Update password
    const updatedUsers = users.map((u: any) => {
      if (u.email === currentUser.email) {
        return { ...u, password: newPassword }
      }
      return u
    })
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setMessage("Mot de passe modifie avec succes")
    setMessageType("success")
  }

  const handleGoBack = () => {
    if (currentUser?.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/practician")
    }
  }

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5d4c5] to-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#8b6d47]">Mon Compte</h1>
              <p className="text-slate-600 mt-1">Gerez vos informations personnelles</p>
            </div>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="border-[#8b6d47] text-[#8b6d47] hover:bg-[#8b6d47] hover:text-white bg-transparent"
            >
              Retour
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {message}
          </div>
        )}

        {/* Personal Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-[#8b6d47]">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prenom</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prenom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                {currentUser.role === "admin" ? "Administrateur" : "Praticien"}
              </div>
            </div>
            <Button onClick={handleSaveInfo} className="bg-[#c8623e] hover:bg-[#b8523e]">
              Enregistrer les modifications
            </Button>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#8b6d47]">Changer le mot de passe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Votre mot de passe actuel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Votre nouveau mot de passe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>
            <Button onClick={handleChangePassword} className="bg-[#c8623e] hover:bg-[#b8523e]">
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
