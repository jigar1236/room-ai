"use client"

import { useActionState, useEffect, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react"
import { verifyEmail } from "@/lib/services/user.service"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const processedTokenRef = useRef<string | null>(null)

  const [state, formAction, pending] = useActionState(verifyEmail, { success: false, error: undefined, message: undefined })

  useEffect(() => {
    if (token && token !== processedTokenRef.current) {
      processedTokenRef.current = token
      const formData = new FormData()
      formData.append("token", token)
      formAction(formData)
    }
  }, [token])

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Email verified successfully!")
      setTimeout(() => {
        router.push("/auth/signin?verified=true")
      }, 2000)
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, router])

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-2xl text-foreground">RoomAI</span>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Email Verification</CardTitle>
              <CardDescription>Invalid verification link</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                The verification link is invalid or missing. Please check your email for the correct link.
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Link href="/auth/signin">
                <Button variant="outline">Go to Sign In</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-foreground">RoomAI</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Email Verification</CardTitle>
            <CardDescription>
              {pending ? "Verifying your email..." : state.success ? "Email verified!" : "Verification failed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {pending ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Please wait while we verify your email address...</p>
              </div>
            ) : state.success ? (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="text-sm text-muted-foreground">{state.message || "Your email has been verified successfully!"}</p>
                <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground">{state.error || "Failed to verify email"}</p>
                <Link href="/auth/signin">
                  <Button variant="outline">Go to Sign In</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}

