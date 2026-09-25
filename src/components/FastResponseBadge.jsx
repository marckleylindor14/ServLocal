import { Zap } from 'lucide-react'

export default function FastResponseBadge({ size = 'md' }) {
  const sizes = {
    sm: { icon: 11, text: 'text-[10px]', padding: 'px-2 py-0.5' },
    md: { icon: 13, text: 'text-[11px]', padding: 'px-2.5 py-1' }
  }
  const s = sizes[size] || sizes.md

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary font-medium ${s.padding} ${s.text}`}>
      <Zap size={s.icon} className="fill-primary" />
      Répond en moins d'une heure
    </span>
  )
}