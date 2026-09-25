import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Header from '../components/Header'
import PageTransition from '../components/PageTransition'

export default function CGUPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 pb-32 md:pb-8"></div>
        <main className="max-w-2xl mx-auto px-4 py-6 md:py-12">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition press mb-6"
          >
            <ArrowLeft size={16} />
            Retour aux paramètres
          </Link>

          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Conditions Générales d'Utilisation
          </h1>
          <div className="title-bar mb-8" />

          <div className="space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base md:text-lg font-bold text-foreground mb-2">1. Objet</h2>
              <p>Les présentes CGU régissent l'utilisation de la plateforme Myra, service de mise en relation entre prestataires et clients.</p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-bold text-foreground mb-2">2. Services proposés</h2>
              <p>Myra permet aux utilisateurs de proposer des services (prestataires) ou de rechercher des services (clients). Myra n'emploie pas les prestataires et ne garantit pas la réalisation des services.</p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-bold text-foreground mb-2">3. Inscription et compte</h2>
              <p>L'utilisateur doit fournir des informations exactes et maintenir son compte à jour. Il est responsable de la confidentialité de son mot de passe.</p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-bold text-foreground mb-2">4. Responsabilités</h2>
              <p>Myra agit en tant que plateforme de mise en relation. Les transactions et prestations se font entre utilisateurs. Myra ne saurait être tenue responsable en cas de litige entre utilisateurs.</p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-bold text-foreground mb-2">5. Tarifs et commissions</h2>
              <p>Myra prélève une commission de 10% sur chaque prestation réservée et payée via la plateforme. Ce pourcentage peut être modifié avec un préavis de 30 jours.</p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-bold text-foreground mb-2">6. Protection des données</h2>
              <p>Les données personnelles sont traitées conformément à la réglementation en vigueur (RGPD). Aucune donnée n'est revendue à des tiers.</p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-bold text-foreground mb-2">7. Résiliation</h2>
              <p>L'utilisateur peut supprimer son compte à tout moment. Myra se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes conditions.</p>
            </section>

            <section>
              <h2 className="text-base md:text-lg font-bold text-foreground mb-2">8. Modification des CGU</h2>
              <p>Myra peut modifier ces conditions. Les utilisateurs seront informés par email ou notification sur la plateforme. La poursuite de l'utilisation vaut acceptation des nouvelles conditions.</p>
            </section>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}