import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 800) // le logo reste visible 0,8 seconde

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#1E2A3A] transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <img
        src="/LOGO MYRA.png"
        alt="Myra"
        className="w-32 h-32 animate-pulse"
      />
    </div>
  )
}