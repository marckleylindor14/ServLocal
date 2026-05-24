import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import API_URL from '../config'
import { Send } from 'lucide-react'

export default function MessagesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetch(`${API_URL}/api/conversations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setConversations(data))
      .catch(err => setError('Impossible de charger les conversations.'))
  }, [user, navigate])

  const openConversation = async (conv) => {
    setSelectedConv(conv)
    try {
      const res = await fetch(`${API_URL}/api/conversations/${conv._id}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      setMessages(data)
    } catch (err) {
      setError('Impossible de charger les messages.')
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    try {
      const res = await fetch(`${API_URL}/api/conversations/${selectedConv._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: newMessage })
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        setNewMessage('')
      }
    } catch (err) {
      setError('Échec de l\'envoi.')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground font-sans page-enter">
      <Header />
      <div className="pt-20"></div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-extrabold mb-6">Messages</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
          {/* Liste des conversations */}
          <div className="md:col-span-1 bg-card backdrop-blur-md border border-border rounded-2xl p-4 overflow-y-auto">
            {conversations.length === 0 && (
              <p className="text-muted-foreground">Aucune conversation pour le moment.</p>
            )}
            {conversations.map(conv => (
              <div
                key={conv._id}
                onClick={() => openConversation(conv)}
                className={`p-3 rounded-lg cursor-pointer mb-2 hover:bg-white/5 transition ${
                  selectedConv?._id === conv._id ? 'bg-primary/10' : ''
                }`}
              >
                <p className="font-medium truncate">{conv.serviceTitle}</p>
                <p className="text-sm text-muted-foreground truncate">
                  Avec {conv.participantsNames.find(name => name !== user.name)}
                </p>
              </div>
            ))}
          </div>

          {/* Messages de la conversation sélectionnée */}
          <div className="md:col-span-2 bg-card backdrop-blur-md border border-border rounded-2xl p-4 flex flex-col">
            {!selectedConv ? (
              <p className="text-muted-foreground m-auto">Sélectionnez une conversation pour commencer.</p>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {messages.map(msg => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] p-3 rounded-xl ${
                        msg.senderId === user.id ? 'bg-primary/20' : 'bg-white/5'
                      }`}>
                        <p className="text-xs text-muted-foreground mb-1">
                          {msg.senderName} · {new Date(msg.createdAt).toLocaleString()}
                        </p>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Votre message..."
                    className="flex-1 bg-white/5 border border-border rounded-full py-3 px-5 text-foreground outline-none focus:border-primary transition"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition">
                    <Send size={18} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}