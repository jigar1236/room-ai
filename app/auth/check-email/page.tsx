"use client"

import { useActionState, useEffect, useState, startTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sparkles, Mail, Loader2, CheckCircle2 } from "lucide-react"
import { resendVerificationEmail } from "@/lib/services/user.service"

const ResendEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export default function CheckEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email")
  const [showResendForm, setShowResendForm] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const [resendState, resendFormAction, resendPending] = useActionState(resendVerificationEmail, {
    success: false,
    error: undefined,
    message: undefined,
  })

  const resendForm = useForm<z.infer<typeof ResendEmailSchema>>({
    resolver: zodResolver(ResendEmailSchema),
    defaultValues: {
      email: emailParam || "",
    },
  })

  useEffect(() => {
    if (emailParam) {
      resendForm.setValue("email", emailParam)
    }
  }, [emailParam, resendForm])

  useEffect(() => {
    if (resendState.success) {
      toast.success(resendState.message || "Verification email sent!")
      setEmailSent(true)
      setShowResendForm(false)
    } else if (resendState.error) {
      toast.error(resendState.error)
    }
  }, [resendState])

  const handleResendEmail = async (data: z.infer<typeof ResendEmailSchema>) => {
    const formData = new FormData()
    formData.append("email", data.email)
    startTransition(() => {
      resendFormAction(formData)
    })
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
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              {emailParam
                ? `We've sent a verification link to ${emailParam}`
                : "We've sent a verification link to your email address"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to verify your account and complete your registration.
              </p>
              <p className="text-sm text-muted-foreground">
                The verification link will expire in 24 hours.
              </p>
            </div>

            {emailSent && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Verification email sent! Please check your inbox.
                </p>
              </div>
            )}

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
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowResendForm(false)
                        setEmailSent(false)
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={resendPending} className="flex-1">
                      {resendPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Resend
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Button
                onClick={() => {
                  setShowResendForm(true)
                  setEmailSent(false)
                }}
                variant="outline"
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Button>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center mb-4">
                Didn't receive the email? Check your spam folder or try resending.
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Link href="/auth/signin" className="text-sm text-primary hover:underline">
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

