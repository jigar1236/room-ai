"use client"

import { useActionState, useEffect, startTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { Sparkles, ArrowLeft } from "lucide-react"
import { forgotPassword } from "@/lib/services/user.service"
import { ForgotPasswordSchema } from "@/lib/validate"
import type { z } from "zod"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(forgotPassword, { success: false, error: undefined, message: undefined })

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Password reset email sent!")
      form.reset()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, form])

  const onSubmit = async (data: z.infer<typeof ForgotPasswordSchema>) => {
    const formData = new FormData()
    formData.append("email", data.email)
    startTransition(() => {
      formAction(formData)
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
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>Enter your email address and we'll send you a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SubmitButton isValid={form.formState.isValid} pending={pending} className="w-full">
                  Send Reset Link
                </SubmitButton>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <Link href="/auth/signin" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-primary">
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

