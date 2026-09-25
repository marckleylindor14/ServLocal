import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function CGUModal({ onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Conditions Générales d'Utilisation"
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition press"
          aria-label="Fermer"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl md:text-2xl font-bold mb-4 pr-10">Conditions Générales d'Utilisation</h2>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p><strong>1. Objet</strong><br />Les présentes CGU régissent l'utilisation de la plateforme Myra, service de mise en relation entre prestataires et clients.</p>
          <p><strong>2. Services proposés</strong><br />Myra permet aux utilisateurs de proposer des services (prestataires) ou de rechercher des services (clients). Myra n'emploie pas les prestataires et ne garantit pas la réalisation des services.</p>
          <p><strong>3. Inscription et compte</strong><br />L'utilisateur doit fournir des informations exactes et maintenir son compte à jour. Il est responsable de la confidentialité de son mot de passe.</p>
          <p><strong>4. Responsabilités</strong><br />Myra agit en tant que plateforme de mise en relation. Les transactions et prestations se font entre utilisateurs. Myra ne saurait être tenue responsable en cas de litige entre utilisateurs.</p>
          <p><strong>5. Tarifs et commissions</strong><br />Myra prélève une commission de 10% sur chaque prestation réservée et payée via la plateforme. Ce pourcentage peut être modifié avec un préavis de 30 jours.</p>
          <p><strong>6. Protection des données</strong><br />Les données personnelles sont traitées conformément à la réglementation en vigueur (RGPD). Aucune donnée n'est revendue à des tiers.</p>
          <p><strong>7. Résiliation</strong><br />L'utilisateur peut supprimer son compte à tout moment. Myra se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes conditions.</p>
          <p><strong>8. Modification des CGU</strong><br />Myra peut modifier ces conditions. Les utilisateurs seront informés par email ou notification sur la plateforme. La poursuite de l'utilisation vaut acceptation des nouvelles conditions.</p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold press"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}