import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl transition-all duration-300 ${
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? <CheckCircle size={22} /> : <XCircle size={22} />}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="ml-4">
        <X size={18} />
      </button>
    </div>
  )
}