"use client"

import { useActionState, useEffect, useState, startTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { Sparkles, Eye, EyeOff, Check } from "lucide-react"
import { resetPassword } from "@/lib/services/user.service"
import { ResetPasswordSchema } from "@/lib/validate"
import type { z } from "zod"

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [showPassword, setShowPassword] = useState(false)

  const [state, formAction, pending] = useActionState(resetPassword, { success: false, error: undefined, message: undefined })

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: token || "",
      password: "",
    },
  })

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset token")
      router.push("/auth/forgot-password")
      return
    }
    form.setValue("token", token)
  }, [token, form, router])

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Password reset successfully!")
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, router])

  const onSubmit = async (data: z.infer<typeof ResetPasswordSchema>) => {
    if (!token) {
      toast.error("Invalid reset token")
      return
    }

    const formData = new FormData()
    formData.append("token", token)
    formData.append("password", data.password)
    startTransition(() => {
      formAction(formData)
    })
  }

  if (!token) {
    return null
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
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {passwordRequirements.map((req) => (
                          <div key={req.label} className="flex items-center gap-1.5 text-xs">
                            <Check
                              className={`w-3 h-3 ${req.test(field.value || "") ? "text-green-500" : "text-muted-foreground"}`}
                            />
                            <span
                              className={
                                req.test(field.value || "") ? "text-foreground" : "text-muted-foreground"
                              }
                            >
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
                <SubmitButton isValid={form.formState.isValid} pending={pending} className="w-full">
                  Reset Password
                </SubmitButton>
              </form>
            </Form>
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

