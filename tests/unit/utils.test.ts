import { describe, it, expect } from "vitest"

describe("Utility functions", () => {
  it("should validate email format", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test("user@example.com")).toBe(true)
    expect(emailRegex.test("invalid-email")).toBe(false)
    expect(emailRegex.test("user@domain")).toBe(false)
  })

  it("should format currency correctly", () => {
    const formatCurrency = (amount: number, currency = "USD") =>
      new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100)

    expect(formatCurrency(1000)).toBe("$10.00")
    expect(formatCurrency(9999)).toBe("$99.99")
  })

  it("should generate slug from title", () => {
    const slugify = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

    expect(slugify("Hello World")).toBe("hello-world")
    expect(slugify("My Blog Post!")).toBe("my-blog-post")
  })
})
