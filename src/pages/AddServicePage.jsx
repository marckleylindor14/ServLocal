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

  // Galerie portfolio
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const fileGalleryRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    setGalleryFiles(files)
    setGalleryPreviews(files.map(f => URL.createObjectURL(f)))
  }
  const clearGallery = () => {
    setGalleryFiles([])
    setGalleryPreviews([])
    if (fileGalleryRef.current) fileGalleryRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Connectez-vous.')
      navigate('/login')
      return
    }
    setUploading(true)
    try {
      // Upload galerie
      let galleryUrls = []
      if (galleryFiles.length > 0) {
        const formData = new FormData()
        galleryFiles.forEach(f => formData.append('gallery', f))
        const res = await fetch(`${API_URL}/api/upload-gallery`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData
        })
        if (!res.ok) throw new Error('Échec upload galerie')
        const data = await res.json()
        galleryUrls = data.urls
      }

      const priceNumber = price.trim() === '' ? null : Number(price.replace(',', '.').replace(/[^0-9.]/g, ''))

      const response = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          category,
          description,
          city,
          price: priceNumber,
          providerName: user.name,
          gallery: galleryUrls
        })
      })

      const data = await response.json()
      if (response.ok) {
        alert('✅ Service publié !')
        setTitle('')
        setCategory('')
        setDescription('')
        setPrice('')
        setCity('')
        clearGallery()
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
    <div className="min-h-screen bg-background text-foreground font-sans page-enter">
      <Header />
      <div className="pt-20"></div>
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-extrabold mb-4">Proposer un service</h2>
        <p className="text-muted-foreground mb-8">Remplissez ce formulaire pour apparaître près de chez vous.</p>

        <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex : Réparation de vélo"
              className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition" />
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
            <input type="text" required value={city} onChange={e => setCity(e.target.value)} placeholder="Ex : Paris"
              className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4}
              placeholder="Décrivez votre service..."
              className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tarif (€)</label>
            <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="Ex : 30€"
              className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 outline-none focus:border-primary transition" />
          </div>

          {/* Galerie portfolio */}
          <div>
            <label className="block text-sm font-medium mb-1">Galerie d'exemples (max 5 photos)</label>
            {galleryPreviews.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {galleryPreviews.map((src, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden h-24">
                      <img src={src} alt={`ex ${idx}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => {
                        const newFiles = galleryFiles.filter((_, i) => i !== idx)
                        const newPrevs = galleryPreviews.filter((_, i) => i !== idx)
                        setGalleryFiles(newFiles)
                        setGalleryPreviews(newPrevs)
                      }} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"><X size={12} /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => fileGalleryRef.current?.click()} className="text-xs text-primary hover:underline">
                  + Ajouter d'autres photos
                </button>
              </div>
            ) : (
              <div onClick={() => fileGalleryRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition text-muted-foreground">
                <Upload size={24} className="mx-auto mb-2" />
                Cliquez pour ajouter des photos
              </div>
            )}
            <input ref={fileGalleryRef} type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
          </div>

          <button type="submit" disabled={uploading}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:bg-primary/90 transition disabled:opacity-50">
            {uploading ? 'Publication...' : 'Publier le service'}
          </button>
        </form>
      </main>
    </div>
  )
}