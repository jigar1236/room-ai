"use client"

import { useActionState, useEffect, Suspense, useRef, useState, startTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sparkles, CheckCircle2, Loader2, Mail } from "lucide-react"
import { verifyEmail, resendVerificationEmail } from "@/lib/services/user.service"

const ResendEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const processedTokenRef = useRef<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showResendForm, setShowResendForm] = useState(false)

  const [state, formAction, pending] = useActionState(verifyEmail, { success: false, error: undefined, message: undefined })
  const [resendState, resendFormAction, resendPending] = useActionState(resendVerificationEmail, {
    success: false,
    error: undefined,
    message: undefined,
  })

  const resendForm = useForm<z.infer<typeof ResendEmailSchema>>({
    resolver: zodResolver(ResendEmailSchema),
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    if (token && token !== processedTokenRef.current) {
      processedTokenRef.current = token
      const formData = new FormData()
      formData.append("token", token)
      startTransition(() => {
        formAction(formData)
      })
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
      // If token is expired or invalid, show resend option
      if (state.error.includes("expired") || state.error.includes("Invalid")) {
        setShowResendForm(true)
      }
    }
  }, [state, router])

  useEffect(() => {
    if (resendState.success) {
      toast.success(resendState.message || "Verification email sent!")
      setShowResendForm(false)
      resendForm.reset()
    } else if (resendState.error) {
      toast.error(resendState.error)
    }
  }, [resendState, resendForm])

  const handleResendEmail = async (data: z.infer<typeof ResendEmailSchema>) => {
    const formData = new FormData()
    formData.append("email", data.email)
    startTransition(() => {
      resendFormAction(formData)
    })
  }

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
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                The verification link is invalid or missing. Please check your email for the correct link.
              </p>
              {showResendForm ? (
                <Form {...resendForm}>
                  <form onSubmit={resendForm.handleSubmit(handleResendEmail)} className="space-y-4">
                    <FormField
                      control={resendForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={resendPending} className="w-full">
                      {resendPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Resend Verification Email
                    </Button>
                  </form>
                </Form>
              ) : (
                <Button
                  onClick={() => setShowResendForm(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </Button>
              )}
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
          <CardContent className="text-center space-y-4">
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
                {showResendForm ? (
                  <div className="w-full space-y-4">
                    <Form {...resendForm}>
                      <form onSubmit={resendForm.handleSubmit(handleResendEmail)} className="space-y-4">
                        <FormField
                          control={resendForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={resendPending} className="w-full">
                          {resendPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Resend Verification Email
                        </Button>
                      </form>
                    </Form>
                    <Button
                      onClick={() => setShowResendForm(false)}
                      variant="ghost"
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={() => setShowResendForm(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </Button>
                    <Link href="/auth/check-email" className="w-full">
                      <Button variant="outline" className="w-full">
                        Go to Check Email Page
                      </Button>
                    </Link>
                  </>
                )}
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
