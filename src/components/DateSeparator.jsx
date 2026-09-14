export default function DateSeparator({ date }) {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
  
    let label
    if (d.toDateString() === today.toDateString()) {
      label = "Aujourd'hui"
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Hier"
    } else {
      label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    }
  
    return (
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[11px] text-muted-foreground font-medium px-2">{label}</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>
    )
  }