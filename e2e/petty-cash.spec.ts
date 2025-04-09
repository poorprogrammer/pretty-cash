import { test, expect } from '@playwright/test';

test.describe('Petty Cash Management System', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application before each test
        await page.goto('/');
        // Wait for the page to load
        await page.waitForSelector('h1:has-text("Petty Cash Management")');
    });

    test('should display the main page with navigation tabs', async ({ page }) => {
        // Check if all navigation tabs are present
        await expect(page.locator('button:has-text("List Entries")')).toBeVisible();
        await expect(page.locator('button:has-text("New Entry")')).toBeVisible();
        await expect(page.locator('button:has-text("Reports")')).toBeVisible();

        // Check if the List Entries tab is active by default
        await expect(page.locator('button:has-text("List Entries")')).toHaveClass(/border-blue-500/);
    });

    test('should create a new petty cash entry', async ({ page }) => {
        // Navigate to the New Entry tab
        await page.click('button:has-text("New Entry")');
        await page.waitForSelector('h2:has-text("New Petty Cash Entry")');

        // Fill in the form
        const today = new Date().toISOString().split('T')[0];
        await page.fill('input[name="date"]', today);
        await page.fill('input[name="amount"]', '1500');
        await page.fill('input[name="description"]', 'Office supplies for team');
        await page.selectOption('select[name="category"]', '1'); // Office Supplies
        await page.selectOption('select[name="requester"]', '1'); // John Doe
        await page.fill('textarea[name="notes"]', 'Monthly office supplies');

        // Submit the form
        await page.click('button:has-text("Submit")');

        // Check for success message
        await expect(page.locator('div.bg-green-100:has-text("Entry created successfully")')).toBeVisible();

        // Navigate to the List tab to verify the entry was created
        await page.click('button:has-text("List Entries")');
        await page.waitForSelector('table');

        // Check if the new entry is in the list
        await expect(page.locator('td:has-text("Office supplies for team")')).toBeVisible();
        await expect(page.locator('td:has-text("฿1,500.00")')).toBeVisible();
        await expect(page.locator('td:has-text("John Doe")')).toBeVisible();
    });

    test('should update the status of an entry', async ({ page }) => {
        // First create a new entry
        await page.click('button:has-text("New Entry")');
        await page.waitForSelector('h2:has-text("New Petty Cash Entry")');

        const today = new Date().toISOString().split('T')[0];
        await page.fill('input[name="date"]', today);
        await page.fill('input[name="amount"]', '2000');
        await page.fill('input[name="description"]', 'Travel expenses for conference');
        await page.selectOption('select[name="category"]', '2'); // Travel
        await page.selectOption('select[name="requester"]', '2'); // Jane Smith
        await page.click('button:has-text("Submit")');

        // Wait for success message and navigate to list
        await expect(page.locator('div.bg-green-100:has-text("Entry created successfully")')).toBeVisible();
        await page.click('button:has-text("List Entries")');
        await page.waitForSelector('table');

        // Find the entry and update its status
        const row = page.locator('tr:has-text("Travel expenses for conference")');
        await row.locator('select').selectOption('approved');

        // Verify the status was updated
        await expect(row.locator('select')).toHaveValue('approved');
    });

    test('should delete an entry', async ({ page }) => {
        // First create a new entry
        await page.click('button:has-text("New Entry")');
        await page.waitForSelector('h2:has-text("New Petty Cash Entry")');

        const today = new Date().toISOString().split('T')[0];
        await page.fill('input[name="date"]', today);
        await page.fill('input[name="amount"]', '3000');
        await page.fill('input[name="description"]', 'Team lunch');
        await page.selectOption('select[name="category"]', '3'); // Meals
        await page.selectOption('select[name="requester"]', '3'); // Bob Wilson
        await page.click('button:has-text("Submit")');

        // Wait for success message and navigate to list
        await expect(page.locator('div.bg-green-100:has-text("Entry created successfully")')).toBeVisible();
        await page.click('button:has-text("List Entries")');
        await page.waitForSelector('table');

        // Find the entry and click delete
        const row = page.locator('tr:has-text("Team lunch")');
        await row.locator('button:has-text("Delete")').click();

        // Confirm deletion
        await page.locator('button:has-text("Yes, delete")').click();

        // Verify the entry was deleted
        await expect(row).not.toBeVisible();
    });

    test('should generate a summary report', async ({ page }) => {
        // Create a test entry first
        await page.click('button:has-text("New Entry")');
        await page.waitForSelector('h2:has-text("New Petty Cash Entry")');

        // Fill in the form
        const today = new Date();
        await page.fill('input[name="date"]', today.toISOString().split('T')[0]);
        await page.fill('input[name="amount"]', '1500');
        await page.fill('input[name="description"]', 'Test entry for report');
        await page.selectOption('select[name="category"]', '1');
        await page.selectOption('select[name="requester"]', '1');
        await page.fill('textarea[name="notes"]', 'Test notes');

        // Submit the form
        await page.click('button:has-text("Submit")');
        await expect(page.locator('div.bg-green-100:has-text("Entry created successfully")')).toBeVisible();

        // Navigate to Reports tab
        await page.click('button:has-text("Reports")');
        await page.waitForSelector('h2:has-text("Generate Reports")');

        // Set date range (last month)
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        // Wait for and fill date inputs
        await page.waitForSelector('input[name="startDate"]');
        await page.fill('input[name="startDate"]', lastMonth.toISOString().split('T')[0]);
        await page.fill('input[name="endDate"]', today.toISOString().split('T')[0]);

        // Generate the report
        await page.click('button:has-text("Generate Report")');

        // Wait for loading state to finish
        await page.waitForSelector('button:has-text("Generating...")', { state: 'detached', timeout: 10000 });

        // Check for errors
        const errorElement = await page.locator('div.bg-red-100');
        if (await errorElement.isVisible()) {
            throw new Error(`Report generation failed: ${await errorElement.textContent()}`);
        }

        // Wait for report data to appear
        await page.waitForSelector('h3:has-text("Summary Report")', { timeout: 10000 });
        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('should generate a category report', async ({ page }) => {
        // Create a test entry first
        await page.click('button:has-text("New Entry")');
        await page.waitForSelector('h2:has-text("New Petty Cash Entry")');

        // Fill in the form
        const today = new Date();
        await page.fill('input[name="date"]', today.toISOString().split('T')[0]);
        await page.fill('input[name="amount"]', '2000');
        await page.fill('input[name="description"]', 'Test entry for category report');
        await page.selectOption('select[name="category"]', '1');
        await page.selectOption('select[name="requester"]', '1');
        await page.fill('textarea[name="notes"]', 'Test notes');

        // Submit the form
        await page.click('button:has-text("Submit")');
        await expect(page.locator('div.bg-green-100:has-text("Entry created successfully")')).toBeVisible();

        // Navigate to Reports tab
        await page.click('button:has-text("Reports")');
        await page.waitForSelector('h2:has-text("Generate Reports")');

        // Select category report type
        await page.selectOption('select[name="reportType"]', 'category');

        // Wait for and select category
        await page.waitForSelector('select[name="category"]');
        await page.selectOption('select[name="category"]', '1');

        // Set date range
        await page.waitForSelector('input[name="startDate"]');
        await page.fill('input[name="startDate"]', today.toISOString().split('T')[0]);
        await page.fill('input[name="endDate"]', today.toISOString().split('T')[0]);

        // Generate the report
        await page.click('button:has-text("Generate Report")');

        // Wait for loading state to finish
        await page.waitForSelector('button:has-text("Generating...")', { state: 'detached', timeout: 10000 });

        // Check for errors
        const errorElement = await page.locator('div.bg-red-100');
        if (await errorElement.isVisible()) {
            throw new Error(`Report generation failed: ${await errorElement.textContent()}`);
        }

        // Wait for report data to appear
        await page.waitForSelector('h3:has-text("Category Report")', { timeout: 10000 });
        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('should generate a requester report', async ({ page }) => {
        // Create a test entry first
        await page.click('button:has-text("New Entry")');
        await page.waitForSelector('h2:has-text("New Petty Cash Entry")');

        // Fill in the form
        const today = new Date();
        await page.fill('input[name="date"]', today.toISOString().split('T')[0]);
        await page.fill('input[name="amount"]', '3000');
        await page.fill('input[name="description"]', 'Test entry for requester report');
        await page.selectOption('select[name="category"]', '1');
        await page.selectOption('select[name="requester"]', '1');
        await page.fill('textarea[name="notes"]', 'Test notes');

        // Submit the form
        await page.click('button:has-text("Submit")');
        await expect(page.locator('div.bg-green-100:has-text("Entry created successfully")')).toBeVisible();

        // Navigate to Reports tab
        await page.click('button:has-text("Reports")');
        await page.waitForSelector('h2:has-text("Generate Reports")');

        // Select requester report type
        await page.selectOption('select[name="reportType"]', 'requester');

        // Wait for and select requester
        await page.waitForSelector('select[name="requester"]');
        await page.selectOption('select[name="requester"]', '1');

        // Set date range
        await page.waitForSelector('input[name="startDate"]');
        await page.fill('input[name="startDate"]', today.toISOString().split('T')[0]);
        await page.fill('input[name="endDate"]', today.toISOString().split('T')[0]);

        // Generate the report
        await page.click('button:has-text("Generate Report")');

        // Wait for loading state to finish
        await page.waitForSelector('button:has-text("Generating...")', { state: 'detached', timeout: 10000 });

        // Check for errors
        const errorElement = await page.locator('div.bg-red-100');
        if (await errorElement.isVisible()) {
            throw new Error(`Report generation failed: ${await errorElement.textContent()}`);
        }

        // Wait for report data to appear
        await page.waitForSelector('h3:has-text("Requester Report")', { timeout: 10000 });
        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('should export a report to CSV', async ({ page }) => {
        // Create a test entry first
        await page.click('button:has-text("New Entry")');
        await page.waitForSelector('h2:has-text("New Petty Cash Entry")');

        // Fill in the form
        const today = new Date();
        await page.fill('input[name="date"]', today.toISOString().split('T')[0]);
        await page.fill('input[name="amount"]', '4000');
        await page.fill('input[name="description"]', 'Test entry for CSV export');
        await page.selectOption('select[name="category"]', '1');
        await page.selectOption('select[name="requester"]', '1');
        await page.fill('textarea[name="notes"]', 'Test notes');

        // Submit the form
        await page.click('button:has-text("Submit")');
        await expect(page.locator('div.bg-green-100:has-text("Entry created successfully")')).toBeVisible();

        // Navigate to Reports tab
        await page.click('button:has-text("Reports")');
        await page.waitForSelector('h2:has-text("Generate Reports")');

        // Set date range
        await page.waitForSelector('input[name="startDate"]');
        await page.fill('input[name="startDate"]', today.toISOString().split('T')[0]);
        await page.fill('input[name="endDate"]', today.toISOString().split('T')[0]);

        // Generate the report
        await page.click('button:has-text("Generate Report")');

        // Wait for loading state to finish
        await page.waitForSelector('button:has-text("Generating...")', { state: 'detached', timeout: 10000 });

        // Check for errors
        const errorElement = await page.locator('div.bg-red-100');
        if (await errorElement.isVisible()) {
            throw new Error(`Report generation failed: ${await errorElement.textContent()}`);
        }

        // Wait for report data to appear
        await page.waitForSelector('h3:has-text("Summary Report")', { timeout: 10000 });
        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

        // Click export button
        await page.click('button:has-text("Export to CSV")');

        // Wait for download to start
        const downloadPromise = page.waitForEvent('download');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.csv');
    });
}); 