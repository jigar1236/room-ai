import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreditBadgeProps {
  credits: number
  total: number
  variant?: "default" | "compact"
  className?: string
}

export function CreditBadge({ credits, total, variant = "default", className }: CreditBadgeProps) {
  const percentage = (credits / total) * 100
  const isLow = percentage < 20

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
          isLow ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
          className,
        )}
      >
        <Zap className="w-3 h-3" />
        {credits}
      </div>
    )
  }

  return (
    <div className={cn("bg-muted rounded-lg p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-primary" />
          Credits
        </span>
        <span className={cn("text-sm font-bold", isLow ? "text-destructive" : "text-foreground")}>
          {credits}/{total}
        </span>
      </div>
      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", isLow ? "bg-destructive" : "bg-primary")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
