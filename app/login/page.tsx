import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Logo } from "@/components/logo"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect("/dashboard")
  }

  const { callbackUrl } = await searchParams

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="bg-muted flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Logo className="self-center" />
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
