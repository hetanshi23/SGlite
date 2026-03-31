import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Dashboard Tests', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test('Login → Verify Dashboard UI → Total Items → Search → Filter → Low Stock → Stock Adjustment', async ({ dashboardPage, page }) => {

    // ── Step 1: Verify Dashboard UI ────────────────────────────────────────
      await test.step('Step 1 — Verify dashboard page UI elements', async () => {
      await expect(page).toHaveURL('https://sglite.lovable.app/', { timeout: 8000 });
      await expect(dashboardPage.heading).toBeVisible({ timeout: 5000 });
      expect(await dashboardPage.getHeadingText()).toBe('Dashboard');
      await expect(dashboardPage.sidebar).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.header).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.totalItems).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.lowStock).toBeVisible({ timeout: 5000 });
    });

    // ── Step 2: Click Total Items → navigate to Inventory ─────────────────
    await test.step('Step 2 — Click Total Items card and verify Inventory page', async () => {
      await dashboardPage.clickTotalItems();

      await expect(page).toHaveURL(/\/inventory/, { timeout: 8000 });
      await expect(dashboardPage.inventoryHeading).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.inventoryTable).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.searchInput).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.categoryCombobox).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.lowStockOnlyCheckbox).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.stockAdjustmentButton).toBeVisible({ timeout: 5000 });

      // Table column headers
      await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Category' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Unit' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Stock' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Min Threshold' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible({ timeout: 5000 });
    });

    // ── Step 3: Search available item and assert result ────────────────────
    await test.step('Step 3 — Search an available item and assert it appears', async () => {
      const firstItem = await dashboardPage.getFirstItemName();
      expect(firstItem.length).toBeGreaterThan(0);

      await dashboardPage.searchInput.fill(firstItem);
      await page.waitForTimeout(500);

      const rowCount = await dashboardPage.getInventoryRowCount();
      expect(rowCount).toBeGreaterThan(0);

      const firstRowText = await dashboardPage.inventoryTableBody.locator('tr').first().textContent();
      expect(firstRowText).toContain(firstItem);
    });

    // ── Step 4: Search unavailable item → assert "No items found." ─────────
    await test.step('Step 4 — Search unavailable item and assert No items found message', async () => {
      await dashboardPage.searchInput.fill('XYZNOTEXIST99999');
      await page.waitForTimeout(500);

      await expect(dashboardPage.noItemsMessage).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.noItemsMessage).toHaveText('No items found.');
    });

    // ── Step 5: Clear search and verify all items restored ─────────────────
    await test.step('Step 5 — Clear search and verify all items restored', async () => {
      await dashboardPage.searchInput.clear();
      await page.waitForTimeout(500);

      const rowCount = await dashboardPage.getInventoryRowCount();
      expect(rowCount).toBeGreaterThan(0);
      await expect(dashboardPage.noItemsMessage).not.toBeVisible({ timeout: 3000 });
    });

    // ── Step 6: Apply category filters one by one ─────────────────────────
    await test.step('Step 6a — Apply Raw Materials filter and verify', async () => {
      await dashboardPage.selectCategory('Raw Materials');
      await page.waitForTimeout(500);
      await expect(dashboardPage.categoryCombobox).toContainText('Raw Materials', { timeout: 5000 });
      await expect(dashboardPage.inventoryTable).toBeVisible({ timeout: 5000 });
    });

    await test.step('Step 6b — Apply Intermediate filter and verify', async () => {
      await dashboardPage.selectCategory('Intermediate');
      await page.waitForTimeout(500);
      await expect(dashboardPage.categoryCombobox).toContainText('Intermediate', { timeout: 5000 });
      await expect(dashboardPage.inventoryTable).toBeVisible({ timeout: 5000 });
    });

    await test.step('Step 6c — Apply All Categories filter and verify', async () => {
      await dashboardPage.selectCategory('All Categories');
      await page.waitForTimeout(500);
      await expect(dashboardPage.categoryCombobox).toContainText('All Categories', { timeout: 5000 });
      await expect(dashboardPage.inventoryTable).toBeVisible({ timeout: 5000 });
      const rowCount = await dashboardPage.getInventoryRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    // ── Step 7: Click Low Stock Only checkbox ─────────────────────────────
    await test.step('Step 7 — Click Low Stock Only checkbox and verify result', async () => {
      await expect(dashboardPage.lowStockOnlyCheckbox).toHaveAttribute('aria-checked', 'false', { timeout: 5000 });
      await dashboardPage.lowStockOnlyCheckbox.click();
      await expect(dashboardPage.lowStockOnlyCheckbox).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });
      await page.waitForTimeout(500);

      const rowCount = await dashboardPage.getInventoryRowCount();
      if (rowCount > 0) {
        await expect(dashboardPage.inventoryTable).toBeVisible({ timeout: 5000 });
      } else {
        await expect(dashboardPage.noItemsMessage).toBeVisible({ timeout: 5000 });
        await expect(dashboardPage.noItemsMessage).toHaveText('No items found.');
      }

      // Uncheck to reset
      await dashboardPage.lowStockOnlyCheckbox.click();
      await expect(dashboardPage.lowStockOnlyCheckbox).toHaveAttribute('aria-checked', 'false', { timeout: 5000 });
    });

    // ── Step 8: Click Stock Adjustment and add one adjustment ─────────────
    await test.step('Step 8 — Click Stock Adjustment button and add one adjustment', async () => {
      await dashboardPage.stockAdjustmentButton.click();

      await expect(dashboardPage.adjDialog).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('dialog').getByRole('heading', { name: 'Stock Adjustment' })).toBeVisible({ timeout: 5000 });

      await expect(dashboardPage.adjItemCombobox).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.adjQuantityInput).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.adjDateInput).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.adjReasonInput).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.adjSaveButton).toBeDisabled({ timeout: 5000 });

      const selectedItem = await dashboardPage.selectFirstAdjItem();
      expect(selectedItem.length).toBeGreaterThan(0);

      await dashboardPage.adjQuantityInput.fill('10');
      await dashboardPage.adjReasonInput.fill('Test adjustment - automated');

      await expect(dashboardPage.adjSaveButton).toBeEnabled({ timeout: 5000 });
      await dashboardPage.adjSaveButton.click();

      await expect(dashboardPage.adjSuccessToast).toBeVisible({ timeout: 8000 });
      await expect(dashboardPage.adjDialog).not.toBeVisible({ timeout: 5000 });
    });
// ── Step 9: Navigate back to Dashboard ────────────────────────────────
    await test.step('Step 9 — Navigate back to Dashboard', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(dashboardPage.heading).toBeVisible({ timeout: 5000 });
      await expect(page).toHaveURL('https://sglite.lovable.app/', { timeout: 5000 });
    });

    // ── Step 10: Click Low Stock card ────────────────────────────────────
    await test.step('Step 10 — Click Low Stock card and assert Inventory page opens with filter', async () => {
      await expect(dashboardPage.lowStock).toBeVisible({ timeout: 5000 });
      await dashboardPage.clickLowStock();

      await expect(page).toHaveURL(/\/inventory/, { timeout: 8000 });
      await expect(dashboardPage.inventoryHeading).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.inventoryHeading).toHaveText('Inventory', { timeout: 5000 });
      // Low Stock Only checkbox must be pre-checked
      await expect(dashboardPage.lowStockOnlyCheckbox).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });
      await expect(dashboardPage.inventoryTable).toBeVisible({ timeout: 5000 });
    });

    // ── Step 11: Navigate back to Dashboard and click Purchases (Month) ──────
    await test.step('Step 11 — Navigate back to Dashboard and click Purchases (Month) card', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(dashboardPage.heading).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.purchasesMonth).toBeVisible({ timeout: 5000 });

      await dashboardPage.purchasesMonth.locator('..').locator('..').click();
      await page.waitForURL('**/purchases', { timeout: 8000 });

      await expect(page).toHaveURL(/\/purchases/, { timeout: 5000 });
      await expect(page.getByRole('heading', { name: 'Purchases', level: 1 })).toBeVisible({ timeout: 5000 });
    });

    // ── Step 12: Navigate back to Dashboard and click Sales (Month) ────────
    await test.step('Step 12 — Navigate back to Dashboard and click Sales (Month) card', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(dashboardPage.heading).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.salesMonth).toBeVisible({ timeout: 5000 });

      await dashboardPage.salesMonth.locator('..').locator('..').click();
      await page.waitForURL('**/sales', { timeout: 8000 });

      await expect(page).toHaveURL(/\/sales/, { timeout: 5000 });
      await expect(page.getByRole('heading', { name: 'Sales', level: 1 })).toBeVisible({ timeout: 5000 });
    });

  });

});