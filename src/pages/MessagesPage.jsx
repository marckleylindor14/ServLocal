import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'
import PageTransition from '../components/PageTransition'
import TypingIndicator from '../components/TypingIndicator'
import DateSeparator from '../components/DateSeparator'
import API_URL from '../config'
import { Send, Search, ArrowLeft, CheckCheck, MessageSquare, Smile, MoreVertical } from 'lucide-react'

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
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

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

  const openConversation = async (conv) => {
    setSelectedConv(conv)
    setShowList(false)
    try {
      const res = await fetch(`${API_URL}/api/conversations/${conv._id}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch {
      addToast('Impossible de charger les messages.', 'error')
    }
  }
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

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConv) return
    const text = newMessage.trim()
    setNewMessage('')
    try {
      const res = await fetch(`${API_URL}/api/conversations/${selectedConv._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text })
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      } else {
        addToast('Échec de l\'envoi.', 'error')
      }
    } catch {
      addToast('Échec de l\'envoi.', 'error')
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
                <EmptyState
                  icon={MessageSquare}
                  title="Aucune conversation"
                  description="Vos messages apparaîtront ici."
                />
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
                <button className="p-2 text-muted-foreground">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3">
                {renderMessages().map((item, idx) => {
                  if (item.type === 'separator') {
                    return <DateSeparator key={`sep-${idx}`} date={item.date} />
                  }
                  const isOwn = item.senderId === user.id
                  return (
                    <div key={item._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}>
                      {!isOwn && (
                        <div className={`w-7 h-7 rounded-full ${getAvatarColor(item.senderName)} flex items-center justify-center text-white font-bold text-xs shrink-0 mr-2 mt-auto`}>
                          {item.senderName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`max-w-[75%] px-4 py-2.5 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-[20px] rounded-br-[6px]'
                          : 'glass rounded-[20px] rounded-bl-[6px]'
                      }`}>
                        <p className="text-[15px] leading-relaxed break-words">{item.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                          <span className="text-[10px]">
                            {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  )
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

              <form onSubmit={handleSend} className="px-3 py-3 border-t border-border/40 glass-strong">
                <div className="flex items-end gap-2">
                  <button type="button" className="p-2 text-muted-foreground hover:text-foreground transition shrink-0">
                    <Smile size={22} />
                  </button>
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
                    disabled={!newMessage.trim()}
                    className={`p-3 rounded-full transition shrink-0 ${
                      newMessage.trim()
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                        : 'bg-white/5 text-muted-foreground'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
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
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-3">
                  {renderMessages().map((item, idx) => {
                    if (item.type === 'separator') {
                      return <DateSeparator key={`sep-${idx}`} date={item.date} />
                    }
                    const isOwn = item.senderId === user.id
                    return (
                      <div key={item._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}>
                        {!isOwn && (
                          <div className={`w-7 h-7 rounded-full ${getAvatarColor(item.senderName)} flex items-center justify-center text-white font-bold text-xs shrink-0 mr-2 mt-auto`}>
                            {item.senderName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`max-w-[65%] px-4 py-2.5 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-[20px] rounded-br-[6px]'
                            : 'glass rounded-[20px] rounded-bl-[6px]'
                        }`}>
                          <p className="text-[15px] leading-relaxed break-words">{item.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                            <span className="text-[10px]">
                              {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwn && <CheckCheck size={12} />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="px-5 py-3 border-t border-border/40">
                  <div className="flex items-end gap-2">
                    <button type="button" className="p-2 text-muted-foreground hover:text-foreground transition shrink-0">
                      <Smile size={22} />
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
                      disabled={!newMessage.trim()}
                      className={`p-3 rounded-full transition shrink-0 ${
                        newMessage.trim()
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                          : 'bg-white/5 text-muted-foreground'
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}