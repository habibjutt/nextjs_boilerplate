"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

const USE_CASES = [
  "Personal project",
  "Startup / New product",
  "Enterprise tool",
  "Agency client work",
  "Learning / Demo",
]

export function OnboardingForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    company: "",
    useCase: "",
  })

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to complete onboarding")

      toast.success("Welcome aboard! 🎉")
      router.push("/dashboard")
    } catch (error) {
      toast.error(
        "Failed to save preferences. You can update them in your account settings."
      )
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {step === 1 ? "Tell us about yourself" : "What will you use this for?"}
        </CardTitle>
        <CardDescription>
          Step {step} of 2 —{" "}
          {step === 1
            ? "Just a couple of quick questions."
            : "This helps us tailor your experience."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company or Project Name (optional)</Label>
              <Input
                id="company"
                placeholder="Acme Inc."
                value={formData.company}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, company: e.target.value }))
                }
              />
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Continue
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleComplete}
            >
              Skip for now
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {USE_CASES.map((useCase) => (
              <button
                key={useCase}
                type="button"
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent ${
                  formData.useCase === useCase
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-input"
                }`}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, useCase }))
                }
              >
                {useCase}
              </button>
            ))}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleComplete}
                disabled={isLoading}
              >
                {isLoading ? "Setting up..." : "Get Started"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
