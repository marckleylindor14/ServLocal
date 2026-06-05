import { PackageOpen } from 'lucide-react'

export default function EmptyState({ icon: Icon = PackageOpen, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={64} className="text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {actionLabel && (
        <button onClick={onAction} className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium">
          {actionLabel}
        </button>
      )}
    </div>
  )
}