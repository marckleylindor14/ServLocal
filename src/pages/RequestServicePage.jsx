import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import { Upload, X, Plus } from 'lucide-react'

export default function RequestServicePage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [city, setCity] = useState('')

  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const fileGalleryRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()

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

  const handleGalleryChange = (e) => {
    const newFiles = Array.from(e.target.files)
    const validFiles = []
    const rejected = []

    for (const file of newFiles) {
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        validFiles.push(file)
      } else {
        rejected.push(file.name)
      }
    }

    if (rejected.length > 0) {
      addToast(`Fichiers ignorés (non JPEG/PNG) : ${rejected.join(', ')}`, 'error')
    }

    const combined = [...galleryFiles, ...validFiles].slice(0, 5)
    setGalleryFiles(combined)
    setGalleryPreviews(combined.map(f => URL.createObjectURL(f)))
    if (fileGalleryRef.current) fileGalleryRef.current.value = ''
  }

  const removeGalleryImage = (index) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index)
    const newPreviews = galleryPreviews.filter((_, i) => i !== index)
    setGalleryFiles(newFiles)
    setGalleryPreviews(newPreviews)
  }

  const uploadSingleImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Échec upload')
    }
    const data = await res.json()
    return data.url
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.keys(errors).length > 0) return
    if (!user) {
      addToast('Vous devez être connecté.', 'error')
      navigate('/login')
      return
    }

    setUploading(true)
    try {
      let galleryUrls = []
      if (galleryFiles.length > 0) {
        galleryUrls = await Promise.all(
          galleryFiles.map(file => uploadSingleImage(file))
        )
      }

      const priceNumber = budget.trim() === '' ? null : Number(budget.replace(',', '.').replace(/[^0-9.]/g, ''))

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
          gallery: galleryUrls,
          type: 'demand'
        })
      })

      const data = await response.json()
      if (response.ok) {
        addToast('✅ Demande publiée avec succès !', 'success')
        setTitle('')
        setCategory('')
        setDescription('')
        setBudget('')
        setCity('')
        setGalleryFiles([])
        setGalleryPreviews([])
        setErrors({})
      } else {
        addToast('❌ ' + (data.details ? data.details.join(', ') : data.error), 'error')
      }
    } catch (err) {
      addToast('❌ ' + (err.message || 'Erreur serveur'), 'error')
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
          <h2 className="text-3xl font-extrabold mb-4">Demander un service</h2>
          <p className="text-muted-foreground mb-8">
            Décrivez le service dont vous avez besoin. Les prestataires vous contacteront.
          </p>

          <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium mb-1">Titre de la demande *</label>
              <input type="text" required value={title}
                onChange={e => { setTitle(e.target.value); validateField('title', e.target.value) }}
                placeholder="Ex : J'ai besoin d'un plombier"
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition" />
              {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Catégorie */}
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

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium mb-1">Ville *</label>
              <input type="text" required value={city}
                onChange={e => { setCity(e.target.value); validateField('city', e.target.value) }}
                placeholder="Ex : Paris"
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition" />
              {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea required value={description}
                onChange={e => { setDescription(e.target.value); validateField('description', e.target.value) }}
                rows={4}
                placeholder="Décrivez votre besoin, vos contraintes..."
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition resize-none" />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium mb-1">Budget (€)</label>
              <input type="text" inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value)}
                placeholder="Ex : 50€ ou À discuter"
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition" />
            </div>

            {/* Galerie (pour illustrer le besoin, optionnel) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Photos d'exemple (max 5, formats JPEG ou PNG uniquement)
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
                  Cliquez pour ajouter des photos (facultatif)
                </div>
              )}
              <input
                ref={fileGalleryRef}
                type="file"
                accept="image/jpeg,image/png"
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
              {uploading ? 'Publication...' : 'Publier la demande'}
            </button>
          </form>
        </main>
      </div>
    </PageTransition>
  )
}