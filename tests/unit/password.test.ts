import { describe, it, expect } from "vitest"

const getPasswordStrength = (password: string): string => {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return "Weak"
  if (score === 2) return "Fair"
  if (score === 3) return "Strong"
  return "Very Strong"
}

describe("Password strength checker", () => {
  it("should return Weak for short passwords", () => {
    expect(getPasswordStrength("pass")).toBe("Weak")
    expect(getPasswordStrength("short")).toBe("Weak")
  })

  it("should return Strong for complex passwords", () => {
    expect(getPasswordStrength("MySecure1")).toBe("Strong")
  })

  it("should return Very Strong for very complex passwords", () => {
    expect(getPasswordStrength("MySecure1!Pass#")).toBe("Very Strong")
  })
})
