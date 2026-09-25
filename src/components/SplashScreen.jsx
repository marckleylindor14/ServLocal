import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [mounted, setMounted] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fadeTimer = setTimeout(() => {
      if (!cancelled) setVisible(false)
    }, 1200)

    const unmountTimer = setTimeout(() => {
      if (!cancelled) setMounted(false)
    }, 1700)

    return () => {
      cancelled = true
      clearTimeout(fadeTimer)
      clearTimeout(unmountTimer)
    }
  }, [])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1E2A3A]"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)'
          }}
        >
          <motion.img
            src="/LOGO MYRA.png"
            alt="Myra"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-32 h-32 object-contain"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}