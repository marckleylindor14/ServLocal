import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header'

export default function ProviderPage() {
  const { id } = useParams()
  const [pro, setPro] = useState(null)

  useEffect(() => {
    fetch(`http://localhost:3001/api/services/${id}`)
      .then(res => res.json())
      .then(data => setPro(data))
      .catch(err => console.error('Erreur chargement prestataire:', err))
  }, [id])

  if (!pro) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        Chargement...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header identique */}
    <Header />

      <div className="pt-20"></div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={pro.image || 'https://i.pravatar.cc/100?img=4'}
              alt={pro.title}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <h2 className="text-2xl font-bold">{pro.title}</h2>
              <p className="text-primary font-semibold">{pro.category}</p>
              <span className="inline-flex items-center text-xs text-primary mt-1">
                <span className="mr-1">🛡️</span> {pro.verified ? 'Vérifié' : 'Non vérifié'}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">{pro.description}</p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold">Tarif</h3>
            <p className="text-primary font-medium">{pro.price || 'Non spécifié'}</p>
          </div>

          <button className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-full hover:bg-primary/90 transition">
            Contacter le prestataire
          </button>
        </div>
      </main>
    </div>
  )
}