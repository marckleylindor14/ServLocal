import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import PageTransition from '../components/PageTransition'
import API_URL from '../config'
import {
  Upload, X, Loader2, Lock, BarChart3, Eye, EyeOff,
  ShieldCheck, Clock, AlertTriangle, Ban, User, Trash2, Eye as EyeIcon
} from 'lucide-react'

export default function AccountPage() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [name, setName] = useState(user?.name || '')
  const [photoPreview, setPhotoPreview] = useState(user?.photo || null)
  const [photoFile, setPhotoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [stats, setStats] = useState(null)

  const [verificationDoc, setVerificationDoc] = useState(null)
  const [verificationDocPreview, setVerificationDocPreview] = useState(null)
  const [verificationSubmitting, setVerificationSubmitting] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')
  const verificationFileRef = useRef(null)

  const [privacy, setPrivacy] = useState({
    hideEmail: user?.privacy?.hideEmail || false,
    hideName: user?.privacy?.hideName || false
  })
  const [privacySaving, setPrivacySaving] = useState(false)

  const [blockedUsers, setBlockedUsers] = useState([])

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetch(`${API_URL}/api/user/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats(null))

    fetch(`${API_URL}/api/blocks`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setBlockedUsers(Array.isArray(data) ? data : []))
      .catch(() => setBlockedUsers([]))
  }, [user, navigate])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }
  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(user?.photo || null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  const handleSave = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      let photoUrl = user?.photo || null
      if (photoFile) {
        const formData = new FormData()
        formData.append('image', photoFile)
        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData
        })
        if (!uploadRes.ok) throw new Error('Échec upload')
        const uploadData = await uploadRes.json()
        photoUrl = uploadData.url
      }
      const res = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, photo: photoUrl })
      })
      if (!res.ok) throw new Error('Erreur mise à jour')
      const updatedUser = await res.json()
      login({ ...updatedUser, isAdmin: user.isAdmin, privacy: user.privacy }, localStorage.getItem('token'))
      addToast('Profil mis à jour !', 'success')
    } catch (err) {
      addToast('Erreur : ' + err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (!currentPassword || !newPassword) {
      setPasswordError('Veuillez remplir tous les champs.')
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        setPasswordSuccess('Mot de passe modifié avec succès !')
        setCurrentPassword('')
        setNewPassword('')
        addToast('Mot de passe modifié !', 'success')
      } else {
        setPasswordError(data.error || 'Erreur')
        addToast(data.error || 'Erreur', 'error')
      }
    } catch {
      setPasswordError('Impossible de contacter le serveur.')
      addToast('Impossible de contacter le serveur.', 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleVerificationDocChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVerificationDoc(file)
      setVerificationDocPreview(URL.createObjectURL(file))
    }
  }
  const clearVerificationDoc = () => {
    setVerificationDoc(null)
    setVerificationDocPreview(null)
    if (verificationFileRef.current) verificationFileRef.current.value = ''
  }
  const handleRequestVerification = async () => {
    if (!verificationDoc) {
      addToast('Veuillez sélectionner une pièce d\'identité.', 'error')
      return
    }
    setVerificationSubmitting(true)
    setVerificationMessage('')
    try {
      const formData = new FormData()
      formData.append('document', verificationDoc)
      const res = await fetch(`${API_URL}/api/user/request-verification`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      })
      if (!res.ok) throw new Error('Échec de l\'envoi')
      const data = await res.json()
      setVerificationMessage(data.message)
      clearVerificationDoc()
      login({ ...user, verificationStatus: 'pending' }, localStorage.getItem('token'))
      addToast(data.message, 'success')
    } catch (err) {
      addToast('Erreur : ' + err.message, 'error')
    } finally {
      setVerificationSubmitting(false)
    }
  }

  const togglePrivacy = async (key) => {
    const newValue = !privacy[key]
    const newPrivacy = { ...privacy, [key]: newValue }
    setPrivacy(newPrivacy)
    setPrivacySaving(true)
    try {
      const res = await fetch(`${API_URL}/api/user/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newPrivacy)
      })
      if (res.ok) {
        const data = await res.json()
        login({ ...user, privacy: data.privacy }, localStorage.getItem('token'))
        addToast('Préférence enregistrée.', 'success')
      }
    } catch {
      addToast('Erreur', 'error')
      setPrivacy(privacy)
    } finally {
      setPrivacySaving(false)
    }
  }

  const handleUnblock = async (blockId) => {
    if (!confirm('Débloquer cet utilisateur ?')) return
    try {
      await fetch(`${API_URL}/api/blocks/${blockId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setBlockedUsers(prev => prev.filter(b => b._id !== blockId))
      addToast('Utilisateur débloqué.', 'success')
    } catch {
      addToast('Erreur', 'error')
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    if (!deletePassword) {
      setDeleteError('Mot de passe requis.')
      return
    }
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/user/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password: deletePassword })
      })
      if (res.ok) {
        addToast('Compte supprimé.', 'success')
        logout()
        navigate('/')
      } else {
        const data = await res.json()
        setDeleteError(data.error || 'Erreur')
      }
    } catch {
      setDeleteError('Impossible de contacter le serveur.')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!user) return null

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <div className="pt-20 pb-32 md:pb-8"></div>
        <main className="max-w-2xl mx-auto px-4 py-6 md:py-12 space-y-8">
          <h2 className="text-3xl font-extrabold">Mon compte</h2>

          <form onSubmit={handleSave} className="space-y-6 bg-card/50 backdrop-blur-md border border-border/40 rounded-2xl p-6">
            <h3 className="text-xl font-bold">Informations personnelles</h3>
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                {photoPreview ? (
                  <img src={photoPreview} alt="profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Upload size={32} />
                  </div>
                )}
                {photoFile && (
                  <button type="button" onClick={clearPhoto} className="absolute top-0 right-0 bg-black/60 text-white p-1 rounded-full">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 text-sm text-primary hover:underline">
                Changer la photo
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-foreground outline-none focus:border-primary transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={user.email} disabled className="w-full bg-white/5 border border-border rounded-lg py-3 px-4 text-muted-foreground" />
            </div>
            <button type="submit" disabled={uploading}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {uploading && <Loader2 size={18} className="animate-spin" />}
              {uploading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>

          <div className="bg-card/50 backdrop-blur-md border border-border/40 rounded-2xl p-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <EyeIcon size={20} /> Confidentialité
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex-1">
                  <p className="font-medium text-sm">Masquer mon nom</p>
                  <p className="text-xs text-muted-foreground">Votre nom n'apparaîtra pas publiquement.</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePrivacy('hideName')}
                  disabled={privacySaving}
                  className={`relative w-12 h-7 rounded-full transition ${privacy.hideName ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${privacy.hideName ? 'translate-x-5' : ''}`} />
                </button>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex-1">
                  <p className="font-medium text-sm">Masquer mon email</p>
                  <p className="text-xs text-muted-foreground">Votre email ne sera jamais partagé aux autres utilisateurs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePrivacy('hideEmail')}
                  disabled={privacySaving}
                  className={`relative w-12 h-7 rounded-full transition ${privacy.hideEmail ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${privacy.hideEmail ? 'translate-x-5' : ''}`} />
                </button>
              </label>
            </div>
          </div>

          {blockedUsers.length > 0 && (
            <div className="bg-card/50 backdrop-blur-md border border-border/40 rounded-2xl p-6">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Ban size={20} /> Utilisateurs bloqués ({blockedUsers.length})
              </h3>
              <div className="space-y-3">
                {blockedUsers.map(b => (
                  <div key={b._id} className="flex items-center gap-3 border-b border-border/40 pb-3 last:border-0">
                    {b.blockedPhoto ? (
                      <img src={b.blockedPhoto} alt={b.blockedName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User size={16} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{b.blockedName}</p>
                      <p className="text-xs text-muted-foreground">Bloqué le {new Date(b.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <button
                      onClick={() => handleUnblock(b._id)}
                      className="text-xs border border-primary text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition"
                    >
                      Débloquer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card/50 backdrop-blur-md border border-border/40 rounded-2xl p-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><ShieldCheck size={20} /> Vérification du profil</h3>
            {user.verificationStatus === 'verified' && (
              <div className="flex items-center gap-2 text-green-400">
                <ShieldCheck size={24} />
                <span>Votre profil est vérifié.</span>
              </div>
            )}
            {user.verificationStatus === 'pending' && (
              <div className="flex items-center gap-2 text-yellow-400">
                <Clock size={24} />
                <span>Votre demande est en cours d'examen.</span>
              </div>
            )}
            {user.verificationStatus === 'rejected' && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={24} />
                <span>Votre demande a été refusée.</span>
              </div>
            )}
            {(user.verificationStatus === 'none' || user.verificationStatus === 'rejected' || !user.verificationStatus) && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Pour obtenir le badge "Profil vérifié", envoyez une photo de votre pièce d'identité.
                </p>
                {verificationDocPreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img src={verificationDocPreview} alt="Aperçu" className="w-full h-full object-cover" />
                    <button type="button" onClick={clearVerificationDoc} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"><X size={18} /></button>
                  </div>
                ) : (
                  <div onClick={() => verificationFileRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition text-muted-foreground">
                    <Upload size={24} className="mx-auto mb-2" />
                    Cliquez pour télécharger votre pièce d'identité
                  </div>
                )}
                <input ref={verificationFileRef} type="file" accept="image/jpeg,image/png" onChange={handleVerificationDocChange} className="hidden" />
                {verificationMessage && <p className="text-green-400 text-sm">{verificationMessage}</p>}
                <button
                  onClick={handleRequestVerification}
                  disabled={!verificationDoc || verificationSubmitting}
                  className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verificationSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {verificationSubmitting ? 'Envoi...' : 'Envoyer ma pièce d\'identité'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-card/50 backdrop-blur-md border border-border/40 rounded-2xl p-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><BarChart3 size={20} /> Mes statistiques</h3>
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Services proposés" value={stats.totalServices} />
                <StatCard label="Réservations reçues" value={stats.bookingsReceived} />
                <StatCard label="Réservations faites" value={stats.bookingsMade} />
                <StatCard label="En attente (reçues)" value={stats.pendingReceived} />
                <StatCard label="Confirmées (reçues)" value={stats.confirmedReceived} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            )}
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6 bg-card/50 backdrop-blur-md border border-border/40 rounded-2xl p-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Lock size={20} /> Changer le mot de passe</h3>
            {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-400 text-sm">{passwordSuccess}</p>}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
              <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-lg py-3 pl-4 pr-12 outline-none focus:border-primary transition" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition">
                {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
              <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-lg py-3 pl-4 pr-12 outline-none focus:border-primary transition" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition">
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button type="submit" disabled={passwordLoading}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {passwordLoading && <Loader2 size={18} className="animate-spin" />}
              {passwordLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>

          <div className="bg-red-500/5 border border-red-400/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-red-400">
              <Trash2 size={20} /> Supprimer mon compte
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Cette action est <strong className="text-foreground">irréversible</strong>. Toutes vos publications, réservations, messages et avis seront définitivement supprimés.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="border border-red-400 text-red-400 px-5 py-2.5 rounded-full font-semibold hover:bg-red-400 hover:text-white transition text-sm"
              >
                Supprimer mon compte
              </button>
            ) : (
              <div className="space-y-3">
                {deleteError && <p className="text-red-400 text-sm">{deleteError}</p>}
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Entrez votre mot de passe pour confirmer"
                  className="w-full bg-white/5 border border-red-400/40 rounded-lg py-3 px-4 outline-none focus:border-red-400 transition"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError('') }}
                    className="flex-1 border border-border text-muted-foreground py-2.5 rounded-full font-semibold hover:border-foreground transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-500 text-white py-2.5 rounded-full font-semibold hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {deleteLoading ? 'Suppression...' : 'Confirmer la suppression'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}