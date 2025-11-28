"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  isValid?: boolean
  pending?: boolean
  children: React.ReactNode
}

export function SubmitButton({
  isValid = true,
  pending = false,
  children,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || pending || !isValid}
      className={cn(className)}
      {...props}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}

