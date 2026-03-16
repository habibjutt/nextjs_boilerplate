"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { signUp, emailOtp } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"
import { isValidPhoneNumber, type Value } from "react-phone-number-input"
import { SocialLoginButtons } from "@/components/social-login-buttons"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.union([z.string(), z.undefined()]).optional().refine((val) => {
    if (!val || val.length === 0) return true;
    try {
      return isValidPhoneNumber(val);
    } catch {
      return false;
    }
  }, {
    message: 'Please enter a valid phone number',
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [phone, setPhone] = useState<Value | undefined>()
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [lastResendTime, setLastResendTime] = useState<number>(0)
  const RESEND_COOLDOWN = 60000 // 60 seconds

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const emailValue = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    const validation = signupSchema.safeParse({ 
      name, 
      email: emailValue, 
      phone,
      password, 
      confirmPassword 
    })

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      if (validation.error?.issues) {
        validation.error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
      }
      setErrors(fieldErrors)
      toast.error("Please fix the errors in the form")
      return
    }

    setIsLoading(true)

    try {
      const signupData: any = {
        email: emailValue,
        password,
        name,
      };
      
      if (phone) {
        signupData.phone = phone;
      }

      const { data, error } = await signUp.email(signupData);

      if (error) {
        toast.error(error.message || "Failed to create account")
        setIsLoading(false)
        return
      }

      setEmail(emailValue)
      setShowOtpVerification(true)
      toast.success("Account created! Please check your email for the verification code.")
      setLastResendTime(Date.now())
      setIsLoading(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to create account")
      setIsLoading(false)
    }
  }

  async function handleOtpVerification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await emailOtp.verifyEmail({
        email,
        otp,
      })

      if (error) {
        toast.error(error.message || "Invalid verification code")
        setIsLoading(false)
        return
      }

      toast.success("Email verified successfully!")
      router.push("/login")
    } catch (error: any) {
      toast.error(error.message || "Failed to verify email")
      setIsLoading(false)
    }
  }

  async function handleResendOtp() {
    const now = Date.now()
    const timeSinceLastResend = now - lastResendTime
    
    if (timeSinceLastResend < RESEND_COOLDOWN) {
      const remainingSeconds = Math.ceil((RESEND_COOLDOWN - timeSinceLastResend) / 1000)
      toast.error(`Please wait ${remainingSeconds} seconds before resending`)
      return
    }

    setIsLoading(true)
    try {
      const { error } = await emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      })

      if (error) {
        toast.error(error.message || "Failed to resend code")
      } else {
        toast.success("Verification code resent!")
        setLastResendTime(Date.now())
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code")
    } finally {
      setIsLoading(false)
    }
  }

  if (showOtpVerification) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a 6-digit code to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOtpVerification}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={isLoading}
                    className="text-center text-2xl tracking-widest"
                  />
                  <FieldDescription>
                    Enter the 6-digit code sent to your email
                  </FieldDescription>
                </Field>
                <Field>
                  <Button type="submit" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? "Verifying..." : "Verify Email"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    Resend Code
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name" className={errors.name ? "text-red-600" : ""}>
                  Full Name
                </FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm font-medium text-red-600 mt-1">
                    {errors.name}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className={errors.email ? "text-red-600" : ""}>
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={isLoading}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm font-medium text-red-600 mt-1">
                    {errors.email}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="phone" className={errors.phone ? "text-red-600" : ""}>
                  Phone Number (Optional)
                </FieldLabel>
                <PhoneInput
                  id="phone"
                  value={phone}
                  onChange={(value) => setPhone(value || undefined)}
                  placeholder="+1 (555) 000-0000"
                  disabled={isLoading}
                  error={!!errors.phone}
                  aria-invalid={errors.phone ? "true" : "false"}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && (
                  <p id="phone-error" className="text-sm font-medium text-red-600 mt-1">
                    {errors.phone}
                  </p>
                )}
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password" className={errors.password ? "text-red-600" : ""}>
                      Password
                    </FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      disabled={isLoading}
                      className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    {errors.password && (
                      <p id="password-error" className="text-sm font-medium text-red-600 mt-1">
                        {errors.password}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password" className={errors.confirmPassword ? "text-red-600" : ""}>
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      disabled={isLoading}
                      className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                      aria-invalid={errors.confirmPassword ? "true" : "false"}
                      aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                    />
                    {errors.confirmPassword && (
                      <p id="confirmPassword-error" className="text-sm font-medium text-red-600 mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="/login">Sign in</a>
                </FieldDescription>
              </Field>
              <SocialLoginButtons mode="signup" />
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{
          " "
        }
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
