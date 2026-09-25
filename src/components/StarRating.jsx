import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import * as haptics from '../utils/haptics'

function triggerHaptic() {
  try {
    const fn = haptics.light || haptics.tap || haptics.impact || haptics.haptic || haptics.default
    if (typeof fn === 'function') fn()
  } catch {}
}

export default function StarRating({
  rating = 0,
  maxStars = 5,
  onRate,
  readonly = false,
  size = 20
}) {
  const [hovered, setHovered] = useState(0)

  const displayed = hovered > 0 && !readonly ? hovered : rating

  const handleClick = (value) => {
    if (readonly || !onRate) return
    triggerHaptic()
    onRate(value)
  }

  return (
    <div
      className="flex gap-1"
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={readonly ? `Note : ${rating} sur ${maxStars}` : 'Choisir une note'}
      onMouseLeave={() => setHovered(0)}
    >
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1
        const isActive = starValue <= displayed

        return (
          <motion.button
            key={i}
            type="button"
            disabled={readonly}
            whileTap={readonly ? undefined : { scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readonly && setHovered(starValue)}
            onFocus={() => !readonly && setHovered(starValue)}
            onBlur={() => setHovered(0)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} bg-transparent p-0 flex items-center justify-center`}
            style={{ minWidth: size, minHeight: size, width: size, height: size }}
            aria-label={`Noter ${starValue} sur ${maxStars}`}
            aria-checked={!readonly ? starValue === rating : undefined}
            role={readonly ? undefined : 'radio'}
          >
            <Star
              size={size}
              className={`transition-colors duration-150 ${
                isActive ? 'fill-primary text-primary' : 'fill-none text-muted-foreground'
              }`}
            />
          </motion.button>
        )
      })}
    </div>
  )
}