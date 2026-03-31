import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

/**
 * Dashboard Combined Test Suite
 * Covers: UI, summary cards, sections, action buttons,
 * inventory flows, card navigation, sidebar, security
 */

test.describe('Dashboard Combined Suite', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  // ── Reusable Helpers ───────────────────────────────────────────────────────

  const clickSidebarItem = async (dashboardPage: any, name: string) => {
    const link = dashboardPage.sidebar.getByRole('link', { name, exact: true });
    await expect(link).toBeVisible({ timeout: 10000 });
    await link.scrollIntoViewIfNeeded();
    await link.click();
  };

  const goBackToDashboard = async (page: any) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  };

  // ── TC-DASH-001: Dashboard UI, Summary Cards, Sections & Action Buttons ────
  test('TC-DASH-001: Dashboard landing, summary cards, sections and action buttons', async ({ dashboardPage, page }) => {

    await test.step('Validate dashboard base UI and all 4 summary cards', async () => {
      await expect(dashboardPage.heading).toBeVisible({ timeout: 8000 });
      await expect(dashboardPage.sidebar).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.header).toBeVisible({ timeout: 5000 });
      expect(await dashboardPage.getHeadingText()).toContain('Dashboard');

      const cards = [
        dashboardPage.totalItems,
        dashboardPage.lowStock,
        dashboardPage.purchasesMonth,
        dashboardPage.salesMonth,
      ];

      for (const card of cards) {
        await expect(card).toBeVisible({ timeout: 5000 });
        const text = await card.textContent() || '';
        expect(text.trim().length).toBeGreaterThan(0);
        expect(Number.isFinite(Number(text.replace(/[^0-9.]/g, '')))).toBeTruthy();
      }
    });

    await test.step('Validate all sections — Shortage Alerts, Recent Production, Active Plans, Upcoming Demand', async () => {
      const getSection = (text: RegExp) =>
        page.locator('div').filter({ hasText: text }).first();

      const shortage   = getSection(/Shortage Alerts/i);
      const production = getSection(/Recent Production/i);
      const demand     = getSection(/Upcoming Demand/i);
      const plans      = getSection(/Active Plans/i);

      await expect(shortage).toBeVisible({ timeout: 5000 });
      expect(await shortage.locator('li').count()).toBeGreaterThanOrEqual(0);

      await expect(production).toBeVisible({ timeout: 5000 });
      expect(await production.locator('tr').count()).toBeGreaterThanOrEqual(0);

      await expect(plans).toBeVisible({ timeout: 5000 });
      expect(await plans.locator('tr').count()).toBeGreaterThanOrEqual(0);

      await expect(demand).toBeVisible({ timeout: 5000 });
      const demandRows = await demand.locator('tr').count();
      if (demandRows === 0) {
        await expect(demand.getByText('No upcoming demand entries')).toBeVisible();
      } else {
        expect(demandRows).toBeGreaterThan(0);
      }
    });

    await test.step('Validate action buttons navigate correctly', async () => {
      const actions = [
        { label: 'Log Production', button: dashboardPage.logProductionButton, url: /\/production/ },
        { label: 'Add Purchase',   button: dashboardPage.addPurchaseButton,   url: /\/purchases/ },
        { label: 'Add Sale',       button: dashboardPage.addSaleButton,       url: /\/sales/ },
      ];

      for (const action of actions) {
        await expect(action.button).toBeVisible({ timeout: 5000 });
        await expect(action.button).toBeEnabled({ timeout: 5000 });
        await action.button.click();
        await expect(page).toHaveURL(action.url, { timeout: 8000 });
        await goBackToDashboard(page);
      }
    });
  });

  // ── TC-DASH-006: Total Items → Inventory Navigation & Flows ───────────────
  test('TC-DASH-006: Total Items card → Inventory page flows', async ({ dashboardPage, page }) => {

    await test.step('Click Total Items card and verify Inventory page', async () => {
      await dashboardPage.clickTotalItems();
      await expect(page).toHaveURL(/\/inventory/, { timeout: 8000 });
      await expect(dashboardPage.inventoryHeading).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.inventoryTable).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.searchInput).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.categoryCombobox).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.lowStockOnlyCheckbox).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.stockAdjustmentButton).toBeVisible({ timeout: 5000 });

      await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Category' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Unit' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Stock' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Min Threshold' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible({ timeout: 5000 });
    });

    await test.step('Search valid item and assert it appears', async () => {
      const firstItem = await dashboardPage.getFirstItemName();
      expect(firstItem.length).toBeGreaterThan(0);
      await dashboardPage.searchInput.fill(firstItem);
      await page.waitForTimeout(500);
      const rowCount = await dashboardPage.getInventoryRowCount();
      expect(rowCount).toBeGreaterThan(0);
      const firstRowText = await dashboardPage.inventoryTableBody.locator('tr').first().textContent();
      expect(firstRowText).toContain(firstItem);
    });

    await test.step('Search invalid item and assert "No items found." message', async () => {
      await dashboardPage.searchInput.fill('XYZNOTEXIST99999');
      await page.waitForTimeout(500);
      await expect(dashboardPage.noItemsMessage).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.noItemsMessage).toHaveText('No items found.');
    });

    await test.step('Clear search and verify all items restored', async () => {
      await dashboardPage.searchInput.clear();
      await page.waitForTimeout(500);
      const rowCount = await dashboardPage.getInventoryRowCount();
      expect(rowCount).toBeGreaterThan(0);
      await expect(dashboardPage.noItemsMessage).not.toBeVisible({ timeout: 3000 });
    });

    await test.step('Apply Raw Materials category filter', async () => {
      await dashboardPage.selectCategory('Raw Materials');
      await page.waitForTimeout(500);
      await expect(dashboardPage.categoryCombobox).toContainText('Raw Materials', { timeout: 5000 });
      await expect(dashboardPage.inventoryTable).toBeVisible({ timeout: 5000 });
    });

    await test.step('Apply Intermediate category filter', async () => {
      await dashboardPage.selectCategory('Intermediate');
      await page.waitForTimeout(500);
      await expect(dashboardPage.categoryCombobox).toContainText('Intermediate', { timeout: 5000 });
      await expect(dashboardPage.inventoryTable).toBeVisible({ timeout: 5000 });
    });

    await test.step('Reset to All Categories filter', async () => {
      await dashboardPage.selectCategory('All Categories');
      await page.waitForTimeout(500);
      await expect(dashboardPage.categoryCombobox).toContainText('All Categories', { timeout: 5000 });
      const rowCount = await dashboardPage.getInventoryRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    await test.step('Click Low Stock Only checkbox — verify checked and table/message', async () => {
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

      await dashboardPage.lowStockOnlyCheckbox.click();
      await expect(dashboardPage.lowStockOnlyCheckbox).toHaveAttribute('aria-checked', 'false', { timeout: 5000 });
    });

    await test.step('Stock Adjustment — open dialog, fill and save', async () => {
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
  });

  // ── TC-DASH-007: Dashboard Card Navigation ────────────────────────────────
  test('TC-DASH-007: Dashboard card navigation — Low Stock, Purchases, Sales', async ({ dashboardPage, page }) => {

    await test.step('Navigate back to Dashboard', async () => {
      await goBackToDashboard(page);
      await expect(dashboardPage.heading).toBeVisible({ timeout: 5000 });
    });

    await test.step('Click Low Stock card → Inventory with filter pre-applied', async () => {
      await expect(dashboardPage.lowStock).toBeVisible({ timeout: 5000 });
      await dashboardPage.clickLowStock();
      await expect(page).toHaveURL(/\/inventory/, { timeout: 8000 });
      await expect(dashboardPage.inventoryHeading).toBeVisible({ timeout: 5000 });
      await expect(dashboardPage.lowStockOnlyCheckbox).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });
      await goBackToDashboard(page);
    });

    await test.step('Click Purchases (Month) card → Purchases page', async () => {
      await expect(dashboardPage.purchasesMonth).toBeVisible({ timeout: 5000 });
      await dashboardPage.purchasesMonth.locator('..').locator('..').click();
      await page.waitForURL('**/purchases', { timeout: 8000 });
      await expect(page).toHaveURL(/\/purchases/, { timeout: 5000 });
      await expect(page.getByRole('heading', { name: 'Purchases', level: 1 })).toBeVisible({ timeout: 5000 });
      await goBackToDashboard(page);
    });

    await test.step('Click Sales (Month) card → Sales page', async () => {
      await expect(dashboardPage.salesMonth).toBeVisible({ timeout: 5000 });
      await dashboardPage.salesMonth.locator('..').locator('..').click();
      await page.waitForURL('**/sales', { timeout: 8000 });
      await expect(page).toHaveURL(/\/sales/, { timeout: 5000 });
      await expect(page.getByRole('heading', { name: 'Sales', level: 1 })).toBeVisible({ timeout: 5000 });
      await goBackToDashboard(page);
    });
  });

  // ── TC-DASH-005: Sidebar Navigation ───────────────────────────────────────
  test('TC-DASH-005: Sidebar navigation items route correctly', async ({ dashboardPage, page }) => {

    const sidebarItems = [
      { name: 'Dashboard',        url: /\/$/ },
      { name: 'Daily Entry',      url: /\/daily-entry/ },
      { name: 'Production',       url: /\/production/ },
      { name: 'Purchases',        url: /\/purchases/ },
      { name: 'Sales',            url: /\/sales/ },
      { name: 'Demand',           url: /\/demand/ },
      { name: 'Items & BOM',      url: /\/items/ },
      { name: 'Planner',          url: /\/planner/ },
      { name: 'Business Summary', url: /\/business-summary/ },
    ];

    await expect(dashboardPage.sidebar).toBeVisible({ timeout: 5000 });

    for (const item of sidebarItems) {
      await test.step(`Sidebar → ${item.name}`, async () => {
        await clickSidebarItem(dashboardPage, item.name);
        await expect(page).toHaveURL(item.url, { timeout: 8000 });
        await goBackToDashboard(page);
      });
    }
  });

  // ── TC-DASH-SEC-001: Unauthorized Access ──────────────────────────────────
  test('TC-DASH-SEC-001: Unauthorized access redirects to login', async ({ page }) => {

    await test.step('Clear session and verify redirect to auth', async () => {
      await page.evaluate(() => localStorage.clear());
      await page.context().clearCookies();
      await page.goto('/');
      await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 5000 });
    });
  });

});
