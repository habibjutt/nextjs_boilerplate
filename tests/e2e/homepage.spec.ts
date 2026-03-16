import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("should load and display key sections", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/SaaS/)
    await expect(page.locator("header")).toBeVisible()
    await expect(page.locator("footer")).toBeVisible()
  })

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/")
    await page.click("a[href='/login']")
    await expect(page).toHaveURL("/login")
  })

  test("should navigate to signup page", async ({ page }) => {
    await page.goto("/")
    await page.click("a[href='/signup']")
    await expect(page).toHaveURL("/signup")
  })
})

test.describe("Auth pages", () => {
  test("login page should display form", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("input[type='email']")).toBeVisible()
    await expect(page.locator("input[type='password']")).toBeVisible()
    await expect(page.locator("button[type='submit']")).toBeVisible()
  })

  test("signup page should display form", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.locator("input[name='name']")).toBeVisible()
    await expect(page.locator("input[type='email']")).toBeVisible()
    await expect(page.locator("input[type='password']")).toBeVisible()
  })

  test("404 page should be shown for invalid routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist")
    await expect(page.locator("h1")).toContainText("404")
  })
})
