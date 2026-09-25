import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext()

const MAX_TOASTS = 3
const DURATION = 3500

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)
  const timersRef = useRef(new Map())

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const addToast = useCallback((message, type = 'success') => {
    if (!message) return
    idRef.current += 1
    const id = idRef.current

    setToasts(prev => {
      const next = [...prev, { id, message, type }]
      return next.slice(-MAX_TOASTS)
    })

    const timer = setTimeout(() => removeToast(id), DURATION)
    timersRef.current.set(id, timer)
  }, [removeToast])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        className="fixed left-0 right-0 top-0 z-[9999] flex flex-col gap-2 px-3 pt-3 pointer-events-none sm:left-auto sm:right-4 sm:top-4 sm:px-0 sm:pt-0 sm:w-auto animate-[slide-down_0.3s_cubic-bezier(0.16,1,0.3,1)_both]"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto w-full sm:w-auto">
            <Toast {...toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}