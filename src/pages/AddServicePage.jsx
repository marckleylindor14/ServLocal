import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import API_URL from '../config'
import { Upload, X } from 'lucide-react'

export default function AddServicePage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('')

  // Photo de profil (avatar)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileAvatarRef = useRef(null)

  // Galerie (portfolio)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const fileGalleryRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Gestion avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }
  const clearAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileAvatarRef.current) fileAvatarRef.current.value = ''
  }

  // Gestion galerie
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5) // max 5
    setGalleryFiles(files)
    const previews = files.map(f => URL.createObjectURL(f))
    setGalleryPreviews(previews)
  }
  const clearGallery = () => {
    setGalleryFiles([])
    setGalleryPreviews([])
    if (fileGalleryRef.current) fileGalleryRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Vous devez être connecté pour proposer un service.')
      navigate('/login')
      return
    }

    try {
      setUploading(true)

      // 1) Upload avatar si présent
      let avatarUrl = null
      if (avatarFile) {
        const formData = new FormData()
        formData.append('image', avatarFile)
        const res = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Échec upload avatar')
        }
        const data = await res.json()
        avatarUrl = data.url
      }

      // 2) Upload galerie si fichiers présents
      let galleryUrls = []
      if (galleryFiles.length > 0) {
        const formData = new FormData()
        galleryFiles.forEach(file => formData.append('gallery', file))
        const res = await fetch(`${API_URL}/api/upload-gallery`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Échec upload galerie')
        }
        const data = await res.json()
        galleryUrls = data.urls
      }

      // 3) Créer le service
      const priceNumber = price.trim() === '' ? null : Number(price.replace(',', '.').replace(/[^0-9.]/g, ''))

      const response = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          city,
          price: priceNumber,
          providerName: user.name,
          image: avatarUrl || undefined,
          gallery: galleryUrls
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ Service publié avec succès !')
        setTitle('')
        setCategory('')
        setDescription('')
        setPrice('')
        setCity('')
        clearAvatar()
        clearGallery()
      } else {
        alert('❌ Erreur : ' + (data.details ? data.details.join(', ') : data.error))
      }
    } catch (error) {
      alert('❌ ' + (error.message || 'Impossible de contacter le serveur.'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans page-enter">
      <Header />
      <div className="pt-20"></div>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-extrabold mb-4">Proposer un service</h2>
        <p className="text-muted-foreground mb-8">
          Remplissez ce formulaire pour apparaître dans les résultats près de chez vous.
        </p>

        <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Titre du service *</label>
            <input type="text" required value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Réparation de vélo"
              className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground placeholder-muted-foreground outline-none focus:border-primary transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Catégorie *</label>
            <select required value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground outline-none focus:border-primary transition">
              <option value="" disabled>Sélectionnez une catégorie</option>
              {["Maison", "Bien-être", "Cours", "Tech & Réparation", "Événements", "Animaux"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ville *</label>
            <input type="text" required value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex : Paris, Lyon..."
              className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground placeholder-muted-foreground outline-none focus:border-primary transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea required value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Décrivez votre service, votre expérience..."
              className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground placeholder-muted-foreground outline-none focus:border-primary transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tarif (€)</label>
            <input type="text" value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex : 30€ ou À partir de 25€"
              className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground placeholder-muted-foreground outline-none focus:border-primary transition" />
          </div>

          {/* Photo de profil */}
          <div>
            <label className="block text-sm font-medium mb-1">Photo de profil</label>
            {avatarPreview ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2">
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                <button type="button" onClick={clearAvatar} className="absolute top-0 right-0 bg-black/60 text-white p-1 rounded-full">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileAvatarRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground cursor-pointer hover:border-primary transition"
              >
                <Upload size={20} className="mx-auto mb-1" />
                <span className="text-sm">Photo de profil</span>
              </div>
            )}
            <input ref={fileAvatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>

          {/* Galerie portfolio */}
          <div>
            <label className="block text-sm font-medium mb-1">Galerie portfolio (max 5 photos)</label>
            {galleryPreviews.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {galleryPreviews.map((src, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden h-24">
                      <img src={src} alt={`portfolio ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = galleryFiles.filter((_, i) => i !== idx)
                          const newPreviews = galleryPreviews.filter((_, i) => i !== idx)
                          setGalleryFiles(newFiles)
                          setGalleryPreviews(newPreviews)
                        }}
                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => fileGalleryRef.current?.click()}
                  className="text-xs text-primary hover:underline"
                >
                  + Ajouter d'autres photos
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileGalleryRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground cursor-pointer hover:border-primary transition"
              >
                <Upload size={24} className="mx-auto mb-2" />
                Cliquez pour ajouter des photos d'exemple
              </div>
            )}
            <input
              ref={fileGalleryRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-full hover:bg-primary/90 transition disabled:opacity-50"
          >
            {uploading ? 'Téléchargement en cours...' : 'Publier le service'}
          </button>
        </form>
      </main>
    </div>
  )
}