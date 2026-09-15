import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <div className="pt-20 pb-32 md:pb-16">
        <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-8"
          >
            <ArrowLeft size={16} />
            Retour
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
              <ShieldCheck size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">Politique de confidentialité</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Dernière mise à jour : 15 septembre 2026
              </p>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">1. Responsable du traitement</h2>
              <p>
                Le responsable du traitement des données personnelles collectées via l'application
                Myra est :
              </p>
              <ul className="list-none space-y-1 pl-4 border-l-2 border-primary/30">
                <li><strong className="text-foreground">Myra SRL</strong></li>
                <li>Contact : <a href="mailto:privacy.myra@gmail.com" className="text-primary hover:underline">privacy.myra@gmail.com</a></li>
              </ul>
              <p>
                Pour toute question relative à la présente politique ou à vos données personnelles,
                vous pouvez nous contacter à l'adresse e-mail indiquée ci-dessus.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">2. Données collectées</h2>
              <p>
                Dans le cadre de l'utilisation de Myra, nous collectons les catégories de données
                suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Données d'identification :</strong> nom, prénom, adresse e-mail.
                </li>
                <li>
                  <strong className="text-foreground">Données de compte :</strong> mot de passe (stocké sous forme chiffrée), photo de profil.
                </li>
                <li>
                  <strong className="text-foreground">Données de localisation :</strong> ville renseignée par l'utilisateur ou détectée automatiquement (avec son consentement).
                </li>
                <li>
                  <strong className="text-foreground">Données de vérification d'identité :</strong> photo de pièce d'identité (uniquement pour les prestataires souhaitant obtenir le badge « Vérifié »).
                </li>
                <li>
                  <strong className="text-foreground">Données de communication :</strong> messages échangés via la messagerie intégrée.
                </li>
                <li>
                  <strong className="text-foreground">Données de transaction :</strong> réservations, paiements (les données bancaires sont traitées directement par Stripe, nous ne les stockons pas).
                </li>
                <li>
                  <strong className="text-foreground">Données techniques :</strong> adresse IP, logs de connexion, type d'appareil.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">3. Finalités du traitement</h2>
              <p>Vos données sont utilisées pour les finalités suivantes :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Création et gestion de votre compte utilisateur.</li>
                <li>Mise en relation entre clients et prestataires de services.</li>
                <li>Fonctionnement de la messagerie intégrée.</li>
                <li>Vérification d'identité des prestataires (badge « Vérifié »).</li>
                <li>Traitement des réservations et des paiements.</li>
                <li>Envoi d'e-mails transactionnels (confirmation, réinitialisation de mot de passe).</li>
                <li>Amélioration du service et statistiques anonymes.</li>
                <li>Respect de nos obligations légales et réglementaires.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">4. Bases légales</h2>
              <p>Le traitement de vos données repose sur les bases légales suivantes :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Exécution du contrat :</strong> pour la fourniture du service Myra (création de compte, mise en relation, réservations, paiements).
                </li>
                <li>
                  <strong className="text-foreground">Consentement :</strong> pour la géolocalisation, l'envoi d'e-mails non transactionnels, et le dépôt de cookies non essentiels.
                </li>
                <li>
                  <strong className="text-foreground">Intérêt légitime :</strong> pour la sécurité de la plateforme, la prévention de la fraude et l'amélioration de nos services.
                </li>
                <li>
                  <strong className="text-foreground">Obligation légale :</strong> pour la conservation des données de facturation et le respect des obligations fiscales.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">5. Destinataires des données</h2>
              <p>
                Vos données peuvent être transmises aux sous-traitants suivants, dans le strict
                cadre de l'exécution de leurs services :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Render</strong> : hébergement du backend (États-Unis).</li>
                <li><strong className="text-foreground">Vercel</strong> : hébergement du frontend (États-Unis).</li>
                <li><strong className="text-foreground">Cloudinary</strong> : stockage des images (photos de profil, galeries de services, pièces d'identité) (États-Unis).</li>
                <li><strong className="text-foreground">Stripe</strong> : traitement des paiements (États-Unis / Irlande).</li>
                <li><strong className="text-foreground">Resend</strong> : envoi des e-mails transactionnels (États-Unis).</li>
                <li><strong className="text-foreground">Apple</strong> : distribution de l'application sur l'App Store (États-Unis).</li>
              </ul>
              <p>
                Certains de ces sous-traitants sont établis aux États-Unis, ce qui implique un
                transfert de vos données en dehors de l'Union européenne. Ces transferts sont
                encadrés par des garanties appropriées, conformément aux articles 44 et suivants
                du RGPD :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  soit par une décision d'adéquation de la Commission européenne (le{' '}
                  <strong className="text-foreground">EU-US Data Privacy Framework</strong>) ;
                </li>
                <li>
                  soit par la signature de{' '}
                  <strong className="text-foreground">clauses contractuelles types</strong> (CCT)
                  approuvées par la Commission européenne.
                </li>
              </ul>
              <p>
                Ces prestataires sont contractuellement tenus de garantir un niveau de protection
                de vos données équivalent à celui offert au sein de l'Union européenne.
                Aucune donnée n'est revendue à des tiers à des fins publicitaires ou commerciales.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">6. Durées de conservation</h2>
              <p>
                Vos données sont conservées pour la durée strictement nécessaire aux finalités
                décrites ci-dessus, puis supprimées ou anonymisées :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Données de compte (nom, e-mail, mot de passe) :</strong> conservées pendant toute la durée d'activité du compte, puis 3 ans après la dernière connexion.
                </li>
                <li>
                  <strong className="text-foreground">Photo de profil :</strong> conservée pendant toute la durée de vie du compte, puis supprimée immédiatement après la suppression du compte.
                </li>
                <li>
                  <strong className="text-foreground">Pièce d'identité (vérification) :</strong> supprimée immédiatement après validation ou refus de la demande, et au plus tard 3 mois après la décision.
                </li>
                <li>
                  <strong className="text-foreground">Messages :</strong> conservés pendant 3 ans après le dernier échange, puis supprimés automatiquement.
                </li>
                <li>
                  <strong className="text-foreground">Données de réservation et de paiement :</strong> conservées pendant 7 ans à compter de l'année suivant la transaction, conformément à la législation fiscale belge.
                </li>
                <li>
                  <strong className="text-foreground">Logs techniques :</strong> conservés 12 mois maximum.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">7. Vos droits</h2>
              <p>
                Conformément au RGPD, vous disposez des droits suivants sur vos données
                personnelles :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Droit d'accès :</strong> obtenir une copie des données que nous détenons sur vous.
                </li>
                <li>
                  <strong className="text-foreground">Droit de rectification :</strong> corriger des données inexactes ou incomplètes.
                </li>
                <li>
                  <strong className="text-foreground">Droit à l'effacement :</strong> demander la suppression de vos données (sous réserve de nos obligations légales).
                </li>
                <li>
                  <strong className="text-foreground">Droit à la portabilité :</strong> recevoir vos données dans un format structuré et lisible.
                </li>
                <li>
                  <strong className="text-foreground">Droit d'opposition :</strong> vous opposer au traitement de vos données pour des motifs légitimes.
                </li>
                <li>
                  <strong className="text-foreground">Droit à la limitation :</strong> demander la suspension temporaire du traitement.
                </li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous à{' '}
                <a href="mailto:privacy.myra@gmail.com" className="text-primary hover:underline">
                  privacy.myra@gmail.com
                </a>.
                Nous vous répondrons dans un délai maximum de 30 jours.
              </p>
              <p>
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une
                réclamation auprès de l'Autorité de protection des données (APD) :
              </p>
              <ul className="list-none space-y-1 pl-4 border-l-2 border-primary/30">
                <li>Rue de la Presse 35, 1000 Bruxelles</li>
                <li>
                  <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    www.autoriteprotectiondonnees.be
                  </a>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">8. Cookies et traceurs</h2>
              <p>
                Myra utilise uniquement des <strong className="text-foreground">cookies strictement nécessaires</strong> à
                son fonctionnement :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Cookie d'authentification :</strong> permet de maintenir votre session active après connexion.
                </li>
                <li>
                  <strong className="text-foreground">Stockage local (localStorage) :</strong> utilisé pour mémoriser vos préférences et votre jeton de connexion.
                </li>
              </ul>
              <p>
                Ces cookies ne nécessitent pas votre consentement préalable, car ils sont indispensables
                au fonctionnement du service que vous avez demandé.
              </p>
              <p>
                <strong className="text-foreground">Aucun cookie analytique, publicitaire ou de suivi tiers n'est utilisé.</strong>{' '}
                Si cela devait changer à l'avenir, nous vous demanderions votre consentement explicite
                avant tout dépôt, conformément aux règles de l'APD.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">9. Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
                protéger vos données contre tout accès non autorisé, altération ou destruction :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Chiffrement des mots de passe (bcrypt).</li>
                <li>Communication sécurisée via HTTPS.</li>
                <li>Limitation des tentatives de connexion (protection contre les attaques par force brute).</li>
                <li>Validation et assainissement de toutes les entrées utilisateur.</li>
                <li>Accès restreint aux données sensibles (pièces d'identité).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">10. Âge minimum</h2>
              <p>
                L'utilisation de Myra est réservée aux personnes âgées de <strong className="text-foreground">16 ans et plus</strong>.
                Nous ne collectons pas sciemment de données concernant des enfants de moins de 16 ans.
                Si vous estimez qu'un mineur nous a fourni des données, contactez-nous pour que nous
                procédions à leur suppression.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">11. Modification de la politique</h2>
              <p>
                Nous nous réservons le droit de modifier la présente politique de confidentialité à
                tout moment. En cas de modification substantielle, nous vous informerons par e-mail
                ou via une notification dans l'application. La date de dernière mise à jour est
                indiquée en haut de cette page.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">12. Contact</h2>
              <p>
                Pour toute question relative à cette politique ou à vos données personnelles :
              </p>
              <ul className="list-none space-y-1 pl-4 border-l-2 border-primary/30">
                <li><strong className="text-foreground">Myra SRL</strong></li>
                <li>
                  E-mail :{' '}
                  <a href="mailto:privacy.myra@gmail.com" className="text-primary hover:underline">
                    privacy.myra@gmail.com
                  </a>
                </li>
              </ul>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-border/40 text-center">
            <p className="text-xs text-muted-foreground">
              © 2026 Myra SRL. Tous droits réservés.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}