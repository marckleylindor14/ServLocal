import { useEffect } from 'react'
import { motion } from 'framer-motion'
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
      className="fixed inset-0 z-[60] flex flex-col justify-end sm:justify-center items-center bg-black/70 backdrop-blur-sm sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Conditions Générales d'Utilisation"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl overflow-hidden grid"
        style={{
          gridTemplateRows: 'auto 1fr auto',
          height: 'calc(100dvh - 1rem)',
          maxHeight: 'calc(100dvh - 1rem)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="relative px-5 sm:px-6 pt-3 sm:pt-4 pb-3 border-b border-border/40">
          <div className="sm:hidden w-10 h-1 rounded-full bg-muted-foreground/40 mx-auto mb-3" />
          <h2 className="text-lg sm:text-2xl font-bold pr-10 leading-tight">
            Conditions Générales d'Utilisation
          </h2>
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-5 right-4 text-muted-foreground hover:text-foreground transition press"
            aria-label="Fermer"
          >
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p><strong>1. Objet</strong><br />Les présentes CGU régissent l'utilisation de la plateforme Myra, service de mise en relation entre prestataires et clients.</p>
          <p><strong>2. Services proposés</strong><br />Myra permet aux utilisateurs de proposer des services (prestataires) ou de rechercher des services (clients). Myra n'emploie pas les prestataires et ne garantit pas la réalisation des services.</p>
          <p><strong>3. Inscription et compte</strong><br />L'utilisateur doit fournir des informations exactes et maintenir son compte à jour. Il est responsable de la confidentialité de son mot de passe.</p>
          <p><strong>4. Responsabilités</strong><br />Myra agit en tant que plateforme de mise en relation. Les transactions et prestations se font entre utilisateurs. Myra ne saurait être tenue responsable en cas de litige entre utilisateurs.</p>
          <p><strong>5. Tarifs et commissions</strong><br />Myra prélève une commission de 10% sur chaque prestation réservée et payée via la plateforme. Ce pourcentage peut être modifié avec un préavis de 30 jours.</p>
          <p><strong>6. Protection des données</strong><br />Les données personnelles sont traitées conformément à la réglementation en vigueur (RGPD). Aucune donnée n'est revendue à des tiers.</p>
          <p><strong>7. Résiliation</strong><br />L'utilisateur peut supprimer son compte à tout moment. Myra se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes conditions.</p>
          <p><strong>8. Modification des CGU</strong><br />Myra peut modifier ces conditions. Les utilisateurs seront informés par email ou notification sur la plateforme. La poursuite de l'utilisation vaut acceptation des nouvelles conditions.</p>
        </div>

        <div className="px-5 sm:px-6 py-3 border-t border-border/40 bg-card">
          <button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold press"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  )
}