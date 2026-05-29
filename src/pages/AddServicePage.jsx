import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Vous devez être connecté pour proposer un service.')
      navigate('/login')
      return
    }

    try {
      let imageUrl = null

      // 1) Upload de l'image si sélectionnée
      if (imageFile) {
        setUploading(true)
        const formData = new FormData()
        formData.append('image', imageFile)

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })

        if (!uploadRes.ok) {
          const errData = await uploadRes.json()
          throw new Error(errData.error || 'Échec upload image')
        }

        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
        setUploading(false)
      }

      // 2) Créer le service
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
          image: imageUrl || undefined // si pas d'image, le serveur mettra l'image par défaut
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
        clearImage()
      } else {
        alert('❌ Erreur : ' + (data.details ? data.details.join(', ') : data.error))
      }
    } catch (error) {
      alert('❌ ' + (error.message || 'Impossible de contacter le serveur.'))
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

          {/* Photo du service */}
          <div>
            <label className="block text-sm font-medium mb-1">Photo du service</label>
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground cursor-pointer hover:border-primary transition"
              >
                <Upload size={24} className="mx-auto mb-2" />
                Cliquez pour télécharger une image
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-full hover:bg-primary/90 transition disabled:opacity-50"
          >
            {uploading ? 'Téléchargement de l\'image...' : 'Publier le service'}
          </button>
        </form>
      </main>
    </div>
  )
}