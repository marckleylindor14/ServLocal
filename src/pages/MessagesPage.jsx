import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import PageTransition from '../components/PageTransition'
import TypingIndicator from '../components/TypingIndicator'
import DateSeparator from '../components/DateSeparator'
import BlockModal from '../components/BlockModal'
import API_URL from '../config'
import { Send, Search, ArrowLeft, CheckCheck, Check, MessageSquare, Smile, Ban, ImagePlus, X, Loader2 } from 'lucide-react'

export default function MessagesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showList, setShowList] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const pollingIntervalRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetch(`${API_URL}/api/conversations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(() => addToast('Impossible de charger les conversations.', 'error'))
  }, [user, navigate, addToast])

  useEffect(() => {
    if (!selectedConv) return

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/conversations/${selectedConv._id}/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setMessages(data)
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
        }
      } catch (err) {
        console.error('Erreur polling messages:', err)
      }
    }

    pollingIntervalRef.current = setInterval(fetchMessages, 3000)

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    }
  }, [selectedConv])

  const openConversation = async (conv) => {
    setSelectedConv(conv)
    setShowList(false)
    try {
      const res = await fetch(`${API_URL}/api/conversations/${conv._id}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])

      await fetch(`${API_URL}/api/conversations/${conv._id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    } catch {
      addToast('Impossible de charger les messages.', 'error')
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      addToast('Formats acceptés : JPEG ou PNG uniquement.', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image trop volumineuse (5 Mo max).', 'error')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Échec de l\'upload')
    }
    const data = await res.json()
    return data.url
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!selectedConv) return
    if (!newMessage.trim() && !imageFile) return

    const text = newMessage.trim()
    setNewMessage('')
    let imageUrl = null

    try {
      if (imageFile) {
        setUploadingImage(true)
        imageUrl = await uploadImage(imageFile)
      }

      const res = await fetch(`${API_URL}/api/conversations/${selectedConv._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text, image: imageUrl })
      })

      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        clearImage()
        await fetch(`${API_URL}/api/conversations/${selectedConv._id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      } else {
        addToast('Échec de l\'envoi.', 'error')
      }
    } catch (err) {
      addToast(err.message || 'Échec de l\'envoi.', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true
    const otherName = conv.participantsNames?.find(name => name !== user.name) || ''
    const serviceTitle = conv.serviceTitle || ''
    return otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           serviceTitle.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const goBack = () => {
    setSelectedConv(null)
    setShowList(true)
    setMessages([])
    clearImage()
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' })
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }

  const getOtherName = (conv) => {
    if (!conv?.participantsNames) return 'Utilisateur'
    return conv.participantsNames.find(name => name !== user?.name) || 'Utilisateur'
  }

  const getOtherId = (conv) => {
    if (!conv?.participants) return null
    return conv.participants.find(p => p !== user?.id)
  }

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500']
    let hash = 0
    for (let i = 0; i < (name?.length || 0); i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const renderMessages = () => {
    const grouped = []
    let lastDate = null
    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toDateString()
      if (msgDate !== lastDate) {
        grouped.push({ type: 'separator', date: msg.createdAt })
        lastDate = msgDate
      }
      grouped.push({ type: 'message', ...msg })
    })
    return grouped
  }

  const renderBubble = (item, isMobile) => {
    const isOwn = item.senderId === user.id
    return (
      <div key={item._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}>
        {!isOwn && (
          <div className={`w-7 h-7 rounded-full ${getAvatarColor(item.senderName)} flex items-center justify-center text-white font-bold text-xs shrink-0 mr-2 mt-auto`}>
            {item.senderName?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={`max-w-[${isMobile ? '75%' : '65%'}] px-2 py-2 ${
          isOwn
            ? 'bg-primary text-primary-foreground rounded-[20px] rounded-br-[6px]'
            : 'glass rounded-[20px] rounded-bl-[6px]'
        }`}>
          {item.image && (
            <div
              className="rounded-2xl overflow-hidden mb-1 cursor-pointer"
              onClick={() => setLightboxImage(item.image)}
            >
              <img
                src={item.image}
                alt="Photo"
                className="max-w-[240px] w-full h-auto object-cover"
              />
            </div>
          )}
          {item.text && (
            <p className={`text-[15px] leading-relaxed break-words ${item.image ? 'px-2 pt-1' : ''}`}>
              {item.text}
            </p>
          )}
          <div className={`flex items-center justify-end gap-1 mt-1 px-2 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
            <span className="text-[10px]">
              {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isOwn && (
              item.read ? (
                <CheckCheck size={14} className="text-primary-foreground" />
              ) : (
                <Check size={14} className="text-primary-foreground/50" />
              )
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />

        <div className={`md:hidden fixed inset-0 top-16 z-40 bg-background transition-transform duration-300 ${showList ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-border/40">
              <h1 className="text-2xl font-bold mb-3">Messages</h1>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-border/50 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <EmptyState icon={MessageSquare} title="Aucune conversation" description="Vos messages apparaîtront ici." />
              ) : (
                filteredConversations.map(conv => (
                  <button
                    key={conv._id}
                    onClick={() => openConversation(conv)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition text-left border-b border-border/20"
                  >
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(getOtherName(conv))} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                      {getOtherName(conv).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="font-semibold text-sm truncate">{getOtherName(conv)}</p>
                        <span className="text-[11px] text-muted-foreground ml-2 shrink-0">
                          {formatTime(conv.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.serviceTitle || 'Conversation'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={`md:hidden fixed inset-0 top-16 z-40 bg-background transition-transform duration-300 ${showList ? 'translate-x-full' : 'translate-x-0'}`}>
          {selectedConv && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 glass">
                <button onClick={goBack} className="p-1 -ml-1">
                  <ArrowLeft size={22} />
                </button>
                <div className={`w-9 h-9 rounded-full ${getAvatarColor(getOtherName(selectedConv))} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {getOtherName(selectedConv).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{getOtherName(selectedConv)}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{selectedConv.serviceTitle}</p>
                </div>
                <button onClick={() => setShowBlock(true)} className="p-2 text-muted-foreground hover:text-red-400 transition">
                  <Ban size={18} />
                </button>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3">
                {renderMessages().map((item, idx) => {
                  if (item.type === 'separator') {
                    return <DateSeparator key={`sep-${idx}`} date={item.date} />
                  }
                  return renderBubble(item, true)
                })}
                {isTyping && (
                  <div className="flex justify-start mb-2">
                    <div className="glass rounded-[20px] rounded-bl-[6px]">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border/40 glass-strong" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                {imagePreview && (
                  <div className="px-3 pt-3">
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Aperçu" className="h-24 rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSend} className="px-3 py-3">
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-muted-foreground hover:text-foreground transition shrink-0"
                    >
                      <ImagePlus size={22} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="flex-1 glass rounded-3xl flex items-end">
                      <textarea
                        rows={1}
                        placeholder="Votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend(e)
                          }
                        }}
                        className="flex-1 bg-transparent px-4 py-2.5 text-[15px] outline-none resize-none max-h-24"
                        style={{ minHeight: '40px' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={(!newMessage.trim() && !imageFile) || uploadingImage}
                      className={`p-3 rounded-full transition shrink-0 ${
                        (newMessage.trim() || imageFile) && !uploadingImage
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                          : 'bg-white/5 text-muted-foreground'
                      }`}
                    >
                      {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:flex max-w-6xl mx-auto px-4 pt-24 pb-6 h-screen">
          <div className="w-80 bg-card/50 border border-border/40 rounded-2xl overflow-hidden flex flex-col mr-4">
            <div className="px-4 py-3 border-b border-border/40">
              <h2 className="text-xl font-bold mb-3">Messages</h2>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-border/50 rounded-full py-2 pl-9 pr-4 text-sm outline-none focus:border-primary/50 transition"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <EmptyState icon={MessageSquare} title="Aucune conversation" description="Vos messages apparaîtront ici." />
              ) : (
                filteredConversations.map(conv => (
                  <button
                    key={conv._id}
                    onClick={() => openConversation(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left border-b border-border/20 ${
                      selectedConv?._id === conv._id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-full ${getAvatarColor(getOtherName(conv))} flex items-center justify-center text-white font-bold shrink-0`}>
                      {getOtherName(conv).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="font-semibold text-sm truncate">{getOtherName(conv)}</p>
                        <span className="text-[11px] text-muted-foreground ml-2 shrink-0">{formatTime(conv.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.serviceTitle}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 bg-card/50 border border-border/40 rounded-2xl overflow-hidden flex flex-col">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sélectionnez une conversation</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border/40">
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(getOtherName(selectedConv))} flex items-center justify-center text-white font-bold shrink-0`}>
                    {getOtherName(selectedConv).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{getOtherName(selectedConv)}</p>
                    <p className="text-xs text-muted-foreground">{selectedConv.serviceTitle}</p>
                  </div>
                  <button onClick={() => setShowBlock(true)} className="p-2 text-muted-foreground hover:text-red-400 transition">
                    <Ban size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-3">
                  {renderMessages().map((item, idx) => {
                    if (item.type === 'separator') {
                      return <DateSeparator key={`sep-${idx}`} date={item.date} />
                    }
                    return renderBubble(item, false)
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-border/40">
                  {imagePreview && (
                    <div className="px-5 pt-3">
                      <div className="relative inline-block">
                        <img src={imagePreview} alt="Aperçu" className="h-24 rounded-xl object-cover" />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSend} className="px-5 py-3">
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-muted-foreground hover:text-foreground transition shrink-0"
                      >
                        <ImagePlus size={22} />
                      </button>
                      <div className="flex-1 glass rounded-3xl">
                        <textarea
                          rows={1}
                          placeholder="Votre message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSend(e)
                            }
                          }}
                          className="w-full bg-transparent px-4 py-2.5 text-[15px] outline-none resize-none max-h-24"
                          style={{ minHeight: '40px' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={(!newMessage.trim() && !imageFile) || uploadingImage}
                        className={`p-3 rounded-full transition shrink-0 ${
                          (newMessage.trim() || imageFile) && !uploadingImage
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                            : 'bg-white/5 text-muted-foreground'
                        }`}
                      >
                        {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>

        {lightboxImage && (
          <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
            <button className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2" onClick={() => setLightboxImage(null)}>
              <X size={24} />
            </button>
            <img src={lightboxImage} alt="Vue agrandie" className="max-w-full max-h-full rounded-xl" onClick={(e) => e.stopPropagation()} />
          </div>
        )}

        {showBlock && selectedConv && (
          <BlockModal
            userId={getOtherId(selectedConv)}
            userName={getOtherName(selectedConv)}
            onClose={() => setShowBlock(false)}
            onBlocked={() => {
              setSelectedConv(null)
              setShowList(true)
              window.location.reload()
            }}
          />
        )}
      </div>
    </PageTransition>
  )
}