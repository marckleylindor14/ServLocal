import { Star } from 'lucide-react'

export default function StarRating({ rating = 0, maxStars = 5, onRate, readonly = false }) {
  return (
    <div className="flex gap-1">
      {[...Array(maxStars)].map((_, i) => {
        const starValue = i + 1
        return (
          <Star
            key={i}
            size={20}
            className={`cursor-pointer transition ${
              starValue <= rating
                ? 'fill-primary text-primary'
                : 'fill-none text-muted-foreground'
            }`}
            onClick={() => {
              if (!readonly && onRate) onRate(starValue)
            }}
            style={{ cursor: readonly ? 'default' : 'pointer' }}
          />
        )
      })}
    </div>
  )
}