import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function AddServicePage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    // Nettoyer et convertir le prix en nombre (enlever les symboles comme €)
    const priceNumber = price.trim() === '' ? null : Number(price.replace(',', '.').replace(/[^0-9.]/g, ''))
  
    try {
      const response = await fetch('http://localhost:3001/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          price: priceNumber,
          providerName: 'Utilisateur Test'
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

      <div className="pt-20" />

      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Proposer un service</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Renseignez les informations de votre offre. Elles seront visibles sur ServLocal.
        </p>

        <form onSubmit={handleSubmit} className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 md:p-8 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5">Titre</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ex. : Cours de guitare à domicile"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1.5">Catégorie</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ex. : Cours"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              placeholder="Décrivez votre prestation, votre expérience, vos disponibilités…"
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-1.5">Prix (optionnel)</label>
            <input
              id="price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Ex. : 45 ou 45€"
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-full hover:bg-primary/90 transition"
            >
              Publier le service
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center border border-border text-foreground font-semibold py-3 px-6 rounded-full hover:bg-muted/50 transition"
            >
              Annuler
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}