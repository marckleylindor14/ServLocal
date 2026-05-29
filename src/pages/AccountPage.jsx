import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import API_URL from '../config'
import { Upload, X } from 'lucide-react'

export default function AccountPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [photoPreview, setPhotoPreview] = useState(user?.photo || null)
  const [photoFile, setPhotoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user) navigate('/login')
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
      login(updatedUser, localStorage.getItem('token'))
      alert('Profil mis à jour !')
    } catch (err) {
      alert('Erreur: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground font-sans page-enter">
      <Header />
      <div className="pt-20"></div>
      <main className="max-w-md mx-auto px-4 py-12">
        <h2 className="text-3xl font-extrabold mb-6">Mon compte</h2>
        <form onSubmit={handleSave} className="space-y-6">
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
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:bg-primary/90 transition disabled:opacity-50">
            {uploading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </main>
    </div>
  )
}