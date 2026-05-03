import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import API_URL from '../config'

export default function AddServicePage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Vous devez être connecté pour proposer un service.')
      navigate('/login')
      return
    }

    const priceNumber = price.trim() === '' ? null : Number(price.replace(',', '.').replace(/[^0-9.]/g, ''))

    try {
      const response = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          price: priceNumber,
          providerName: user.name
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ Service publié avec succès !')
        setTitle('')
        setCategory('')
        setDescription('')
        setPrice('')
      } else {
        alert('❌ Erreur : ' + (data.details ? data.details.join(', ') : data.error))
      }
    } catch (error) {
      alert('❌ Impossible de contacter le serveur.')
    }
  }

  return (
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
          <div>
            <label className="block text-sm font-medium mb-1">Photo du service</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground cursor-pointer hover:border-primary transition">
              Cliquez pour télécharger une image (bientôt disponible)
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-full hover:bg-primary/90 transition">
            Publier le service
          </button>
        </form>
      </main>
    </div>
  )
}