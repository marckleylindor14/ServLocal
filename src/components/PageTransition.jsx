import { motion, useReducedMotion } from 'framer-motion'
import { useLocation, useNavigationType } from 'react-router-dom'

export default function PageTransition({ children, disabled = false }) {
  const location = useLocation()
  const navType = useNavigationType()
  const prefersReduced = useReducedMotion()

  if (disabled || prefersReduced) {
    return (
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    )
  }

  const isBack = navType === 'POP'
  const offset = 60

  return (
    <motion.div
      key={location.pathname}
      initial={{ x: isBack ? -offset : offset, opacity: 0.3 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isBack ? offset : -offset, opacity: 0 }}
      transition={{
        x: { type: 'spring', stiffness: 400, damping: 38, mass: 0.9 },
        opacity: { duration: 0.22, ease: 'easeOut' }
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}