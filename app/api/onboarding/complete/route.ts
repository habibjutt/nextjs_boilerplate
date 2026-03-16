import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    // company and useCase collected but not yet persisted to a dedicated field.
    // Add an `onboardingCompletedAt DateTime?` (and optionally a `metadata Json?`)
    // column to the User model in prisma/schema.prisma to store this data.
    const { company, useCase } = body as { company?: string; useCase?: string }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // Touch updatedAt to record that onboarding was visited.
        // Replace with onboardingCompletedAt once the migration is applied.
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    )
  }
}
