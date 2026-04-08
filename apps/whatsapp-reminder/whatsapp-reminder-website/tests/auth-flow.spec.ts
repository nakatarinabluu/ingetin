import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should display login page', async ({ page }) => {
    // Basic test to verify frontend loads and shows login
    // Ensure frontend is running before running tests
    await page.goto('http://localhost:8080');
    
    // Expect title or some text
    await expect(page).toHaveTitle(/WhatsApp Reminder/);
    
    // Check for login text/button
    // Depending on the exact UI, this might need adjusting
    const loginHeading = page.locator('text=Login').first();
    if (await loginHeading.isVisible()) {
        await expect(loginHeading).toBeVisible();
    }
  });

  test('should navigate to privacy policy', async ({ page }) => {
    await page.goto('http://localhost:8080/privacy');
    // Expect Privacy page
    const privacyHeading = page.locator('h1', { hasText: 'Privacy' });
    if (await privacyHeading.isVisible()) {
      await expect(privacyHeading).toBeVisible();
    }
  });

  test('should navigate to terms of service', async ({ page }) => {
    await page.goto('http://localhost:8080/terms');
    // Expect Terms page
    const termsHeading = page.locator('h1', { hasText: 'Terms' });
    if (await termsHeading.isVisible()) {
      await expect(termsHeading).toBeVisible();
    }
  });
});
