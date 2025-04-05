import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test('should load the home page', async ({ page }) => {
        await page.goto('/');

        // Check if the page title is present
        await expect(page).toHaveTitle(/Create Next App/);

        // Check if the Next.js logo is visible
        const logo = page.getByAltText('Next.js logo');
        await expect(logo).toBeVisible();

        // Check if the getting started text is present
        const gettingStarted = page.getByText(/Get started by editing/i);
        await expect(gettingStarted).toBeVisible();

        // Check if the deployment link is present and clickable
        const deployLink = page.getByText('Deploy now');
        await expect(deployLink).toBeVisible();
        await expect(deployLink).toHaveAttribute('href', /vercel\.com/);
    });
}); 