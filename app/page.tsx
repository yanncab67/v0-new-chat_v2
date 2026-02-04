"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5d4c5] via-slate-50 to-[#e8a089] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-2 border-[#c8623e] shadow-2xl">
        <CardContent className="pt-12 pb-12">
          {/* Pottery Icon */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-6">🏺</div>
            <h1 className="text-4xl font-bold text-[#8b6d47] mb-4 text-balance">
              Bienvenue sur l'interface de gestion des cuissons céramique de La CabAnnne
            </h1>
          </div>

          {/* Connect Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Se connecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
