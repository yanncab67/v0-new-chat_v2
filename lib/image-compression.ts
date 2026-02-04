/**
 * Utilitaires pour la compression et le redimensionnement d'images
 * Optimisé pour les photos de smartphones récents
 */

export interface CompressionOptions {
  maxWidth?: number // Largeur maximale en pixels (défaut: 1200)
  maxHeight?: number // Hauteur maximale en pixels (défaut: 1200)
  quality?: number // Qualité JPEG de 0 à 1 (défaut: 0.85)
  mimeType?: string // Type MIME (défaut: 'image/jpeg')
}

/**
 * Compresse et redimensionne une image
 * @param file - Le fichier image à compresser
 * @param options - Options de compression
 * @returns Promise<string> - Image en base64
 */
export async function compressImage(file: File, options: CompressionOptions = {}): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.85, mimeType = 'image/jpeg' } = options

  return new Promise((resolve, reject) => {
    // Vérifier que c'est bien une image
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier doit être une image'))
      return
    }

    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))

    reader.onload = (e) => {
      const img = new Image()

      img.onerror = () => reject(new Error("Erreur de chargement de l'image"))

      img.onload = () => {
        try {
          // Calculer les nouvelles dimensions en conservant le ratio
          let { width, height } = img

          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }

          // Créer un canvas pour redimensionner
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Impossible de créer le contexte canvas'))
            return
          }

          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height)

          // Convertir en base64 avec compression
          const compressedBase64 = canvas.toDataURL(mimeType, quality)

          // Vérifier la taille finale
          const sizeInKB = Math.round((compressedBase64.length * 3) / 4 / 1024)
          console.log(`Image compressée: ${width}x${height}px, ~${sizeInKB} KB`)

          resolve(compressedBase64)
        } catch (error) {
          reject(error)
        }
      }

      img.src = e.target?.result as string
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Compresse une image avec validation de taille maximale
 * Réessaye avec une qualité inférieure si l'image est trop lourde
 * @param file - Le fichier image à compresser
 * @param maxSizeKB - Taille maximale en KB (défaut: 500)
 * @returns Promise<string> - Image en base64
 */
export async function compressImageWithMaxSize(
  file: File,
  maxSizeKB: number = 500
): Promise<string> {
  let quality = 0.85
  let compressed: string

  // Essayer avec différentes qualités jusqu'à atteindre la taille cible
  while (quality > 0.3) {
    compressed = await compressImage(file, { quality })

    const sizeInKB = Math.round((compressed.length * 3) / 4 / 1024)

    if (sizeInKB <= maxSizeKB) {
      console.log(`Image finale: ~${sizeInKB} KB (qualité: ${Math.round(quality * 100)}%)`)
      return compressed
    }

    // Réduire la qualité de 10%
    quality -= 0.1
  }

  // Si toujours trop lourd, réduire les dimensions
  console.warn('Image toujours trop lourde, réduction des dimensions...')
  return compressImage(file, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.7,
  })
}

/**
 * Obtenir les informations d'une image (dimensions, taille)
 * @param file - Le fichier image
 * @returns Promise avec les infos
 */
export async function getImageInfo(file: File): Promise<{
  width: number
  height: number
  sizeKB: number
  type: string
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))

    reader.onload = (e) => {
      const img = new Image()

      img.onerror = () => reject(new Error("Erreur de chargement de l'image"))

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          sizeKB: Math.round(file.size / 1024),
          type: file.type,
        })
      }

      img.src = e.target?.result as string
    }

    reader.readAsDataURL(file)
  })
}
