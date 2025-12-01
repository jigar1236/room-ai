"use client"

import { useActionState, useEffect, useState, startTransition } from "react"
import { useForm, FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/lib/auth-config"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Sparkles, Eye, EyeOff } from "lucide-react"
import { actionHandleGoogleSignIn, actionHandleLogin, State } from "./action"
import { SignInSchema } from "@/lib/validate"
import { ERROR, SUCCESS } from "@/lib/constants"
import type { z } from "zod"

export default function SignInPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [state, formAction] = useActionState<State, FormData>(
    actionHandleLogin,
    { status: "", message: "" },
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("verified") === "true") {
      toast.success("Email verification successful! You can now sign in.")
    }
  }, [])

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "all",
  })

  const {
    control,
    formState: { isValid },
    setError,
  } = form

  useEffect(() => {
    if (!state) {
      return
    }

    if (state.status === SUCCESS) {
      toast.success(state?.message || "Signed in successfully!")
      router.push("/dashboard")
      router.refresh()
    }

    if (state.status === ERROR) {
      toast.error(state?.message || "Failed to sign in")
      if (state.errors) {
        state.errors.forEach((error) => {
          setError(error.path as FieldPath<z.infer<typeof SignInSchema>>, {
            message: error.message,
          })
        })
      }
    }
  }, [state, router, setError])

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      toast.error("Failed to sign in with Google")
    }
  }

  const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)

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
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={() => actionHandleGoogleSignIn()} className="w-full">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or continue with email
              </span>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            {...field}
                            className="border-border focus:border-border/60 bg-card focus:bg-card mt-1"
                            type="email"
                          />
                        </FormControl>
                        <FormMessage className="text-destructive mt-2 min-h-[20px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-foreground font-semibold">
                            Password
                          </FormLabel>
                          <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative mt-1">
                            <Input
                              id="password"
                              placeholder="Enter your password"
                              type={showPassword ? "text" : "password"}
                              {...field}
                              className="border-border focus:border-border/60 bg-card focus:bg-card"
                            />
                            <span
                              onClick={() => setShowPassword(!showPassword)}
                              onKeyDown={() => setShowPassword(!showPassword)}
                              role="button"
                              tabIndex={0}
                              className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transform cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage className="text-destructive mt-2 min-h-[20px] font-bold" />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal">
                      Remember me for 30 days
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    disabled={!isValid}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our{" "}
          <Link href="#" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
