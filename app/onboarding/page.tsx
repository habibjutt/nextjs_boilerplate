import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { OnboardingForm } from "@/components/onboarding-form"
import Header from "@/components/header"

export const metadata = {
  title: "Welcome! Let's get started",
}

export default async function OnboardingPage() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              Welcome, {session.user.name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Let&apos;s set up your account in just a few steps.
            </p>
          </div>
          <OnboardingForm />
        </div>
      </main>
    </div>
  )
}
