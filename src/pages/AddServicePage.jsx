import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import { Upload, X, Plus } from 'lucide-react'

export default function AddServicePage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [city, setCity] = useState('')

  // Galerie
  const [galleryFiles, setGalleryFiles] = useState([])       // Fichiers bruts
  const [galleryPreviews, setGalleryPreviews] = useState([]) // URLs locales pour aperçu
  const [uploading, setUploading] = useState(false)
  const fileGalleryRef = useRef(null)

  const { user } = useAuth()
  const navigate = useNavigate()

  // Erreurs de validation
  const [errors, setErrors] = useState({})

  const validateField = (name, value) => {
    const newErrors = { ...errors }
    if (!value || !String(value).trim()) {
      newErrors[name] = 'Ce champ est requis'
    } else if (name === 'title' && String(value).trim().length < 2) {
      newErrors[name] = 'Minimum 2 caractères'
    } else if (name === 'description' && String(value).trim().length < 10) {
      newErrors[name] = 'Minimum 10 caractères'
    } else {
      delete newErrors[name]
    }
    setErrors(newErrors)
  }

  // Gestion des fichiers sélectionnés
  const handleGalleryChange = (e) => {
    const newFiles = Array.from(e.target.files)
    // On garde au maximum 5 fichiers au total
    const combined = [...galleryFiles, ...newFiles].slice(0, 5)
    setGalleryFiles(combined)
    setGalleryPreviews(combined.map(f => URL.createObjectURL(f)))
    // Reset l'input pour permettre de resélectionner le même fichier si besoin
    if (fileGalleryRef.current) fileGalleryRef.current.value = ''
  }

  // Supprimer une image de la galerie
  const removeGalleryImage = (index) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index)
    const newPreviews = galleryPreviews.filter((_, i) => i !== index)
    setGalleryFiles(newFiles)
    setGalleryPreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.keys(errors).length > 0) return
    if (!user) {
      alert('Vous devez être connecté.')
      navigate('/login')
      return
    }

    setUploading(true)
    try {
      // 1) Upload de la galerie si fichiers présents
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

      // 2) Créer le service
      const priceNumber = price.trim() === '' ? null : Number(price.replace(',', '.').replace(/[^0-9.]/g, ''))

      const response = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
          city: city.trim(),
          price: priceNumber,
          providerName: user.name,
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
        setGalleryFiles([])
        setGalleryPreviews([])
        setErrors({})
      } else {
        alert('❌ ' + (data.details ? data.details.join(', ') : data.error))
      }
    } catch (err) {
      alert('❌ ' + (err.message || 'Erreur serveur'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20"></div>
        <main className="max-w-2xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-extrabold mb-4">Proposer un service</h2>
          <p className="text-muted-foreground mb-8">
            Remplissez ce formulaire pour apparaître dans les résultats près de chez vous.
          </p>

          <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Titre *</label>
              <input type="text" required value={title}
                onChange={e => { setTitle(e.target.value); validateField('title', e.target.value) }}
                placeholder="Ex : Réparation de vélo"
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie *</label>
              <select required value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition">
                <option value="" disabled>Sélectionnez une catégorie</option>
                {["Maison","Bien-être","Cours","Tech & Réparation","Événements","Animaux"].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ville *</label>
              <input type="text" required value={city}
                onChange={e => { setCity(e.target.value); validateField('city', e.target.value) }}
                placeholder="Ex : Paris"
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition" />
              {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea required value={description}
                onChange={e => { setDescription(e.target.value); validateField('description', e.target.value) }}
                rows={4}
                placeholder="Décrivez votre service, votre expérience..."
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition resize-none" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tarif (€)</label>
              <input type="text" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="Ex : 30€"
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition" />
            </div>

            {/* Galerie portfolio */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Galerie d'exemples (max 5 photos)
              </label>
              {galleryPreviews.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {galleryPreviews.map((src, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden h-24 bg-muted">
                        <img src={src} alt={`exemple ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {galleryFiles.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileGalleryRef.current?.click()}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Plus size={16} /> Ajouter d'autres photos
                    </button>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileGalleryRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition text-muted-foreground"
                >
                  <Upload size={24} className="mx-auto mb-2" />
                  Cliquez pour ajouter des photos (5 max)
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
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? 'Publication...' : 'Publier le service'}
            </button>
          </form>
        </main>
      </div>
    </PageTransition>
  )
}