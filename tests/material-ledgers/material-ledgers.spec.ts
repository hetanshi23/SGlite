import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

const PAUSE       = 1500;
const TEST_ITEM   = 'PET Granules';
const TEST_MONTH  = '2026-03';

test.describe('Material Ledgers — Full Workflow', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test(
    'Login → Navigate → Verify UI → Item Dropdown → Select Item → Verify Ledger → Validate Columns → Validate Rows → Validate Total Row → Change Month',
    async ({ materialLedgersPage, page }) => {

      // ── Step 1: Navigate ────────────────────────────────────────────────
      await test.step('Step 1 — Navigate to Material Ledgers', async () => {
        await materialLedgersPage.navigateFromSidebar();
        await expect(page).toHaveURL(/\/ledgers/);
        await expect(materialLedgersPage.pageHeading).toHaveText('Material Ledgers');
        await page.waitForTimeout(PAUSE);
      });

      // ── Step 2: Verify UI elements ──────────────────────────────────────
      await test.step('Step 2 — Verify UI elements', async () => {
        await expect(materialLedgersPage.itemSelect).toBeVisible();
        await expect(materialLedgersPage.monthInput).toBeVisible();
        await expect(materialLedgersPage.emptyState).toBeVisible();
        await page.waitForTimeout(PAUSE);
      });

      // ── Step 3: Verify item dropdown options ────────────────────────────
      await test.step('Step 3 — Verify item dropdown has options', async () => {
        const items = await materialLedgersPage.getAvailableItems();
        expect(items.length).toBeGreaterThan(0);
        // Each option should have a name and unit in parentheses
        for (const item of items) {
          expect(item).toMatch(/.+\(.+\)/);
        }
        await page.waitForTimeout(PAUSE);
      });

      // ── Step 4: Select item and verify ledger loads ─────────────────────
      await test.step(`Step 4 — Select "${TEST_ITEM}" and verify ledger loads`, async () => {
        await materialLedgersPage.selectItem(TEST_ITEM);

        // Empty state should be gone
        await expect(materialLedgersPage.emptyState).not.toBeVisible();

        // Ledger heading should show item name and month
        await expect(materialLedgersPage.ledgerHeading).toContainText(TEST_ITEM);
        await expect(materialLedgersPage.ledgerHeading).toContainText('Ledger for');

        // Table should be visible
        await expect(materialLedgersPage.table).toBeVisible();
        await page.waitForTimeout(PAUSE);
      });

      // ── Step 5: Validate column headers ────────────────────────────────
      await test.step('Step 5 — Validate table column headers', async () => {
        const headers = await materialLedgersPage.getColumnHeaders();
        expect(headers).toContain('Date');
        expect(headers).toContain('Opening');
        expect(headers).toContain('Purchase');
        expect(headers).toContain('Prod. In');
        expect(headers).toContain('Prod. Out');
        expect(headers).toContain('Sales');
        expect(headers).toContain('Adj.');
        expect(headers).toContain('Closing');
        expect(headers.length).toBe(8);
        await page.waitForTimeout(PAUSE);
      });

      // ── Step 6: Validate data rows ──────────────────────────────────────
      let rows: Awaited<ReturnType<typeof materialLedgersPage.getAllRows>>;

      await test.step('Step 6 — Validate data rows', async () => {
        const rowCount = await materialLedgersPage.getRowCount();
        // A month has 28–31 days
        expect(rowCount).toBeGreaterThanOrEqual(28);
        expect(rowCount).toBeLessThanOrEqual(31);

        rows = await materialLedgersPage.getAllRows();

        for (const row of rows) {
          // Date format: DD/MM/YYYY
          expect(row.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
          // All numeric columns must be finite numbers
          expect(isFinite(row.opening)).toBe(true);
          expect(isFinite(row.purchase)).toBe(true);
          expect(isFinite(row.prodIn)).toBe(true);
          expect(isFinite(row.prodOut)).toBe(true);
          expect(isFinite(row.sales)).toBe(true);
          expect(isFinite(row.adj)).toBe(true);
          expect(isFinite(row.closing)).toBe(true);
        }
        await page.waitForTimeout(PAUSE);
      });

      // ── Step 7: Validate Total row ──────────────────────────────────────
      await test.step('Step 7 — Validate Total summary row', async () => {
        const label = await materialLedgersPage.getTotalRowLabel();
        expect(label).toBe('Total');

        const total = await materialLedgersPage.getTotalRow();

        // Total purchase must equal sum of daily purchases
        const sumPurchase = rows.reduce((s, r) => s + r.purchase, 0);
        expect(Math.abs(total.purchase - sumPurchase)).toBeLessThanOrEqual(0.01);

        // Total prodIn must equal sum of daily prodIn
        const sumProdIn = rows.reduce((s, r) => s + r.prodIn, 0);
        expect(Math.abs(total.prodIn - sumProdIn)).toBeLessThanOrEqual(0.01);

        // Total prodOut must equal sum of daily prodOut
        const sumProdOut = rows.reduce((s, r) => s + r.prodOut, 0);
        expect(Math.abs(total.prodOut - sumProdOut)).toBeLessThanOrEqual(0.01);

        // Total sales must equal sum of daily sales
        const sumSales = rows.reduce((s, r) => s + r.sales, 0);
        expect(Math.abs(total.sales - sumSales)).toBeLessThanOrEqual(0.01);

        await page.waitForTimeout(PAUSE);
      });

      // ── Step 8: Validate month filter ──────────────────────────────────
      await test.step('Step 8 — Validate month input reflects selected month', async () => {
        const currentMonth = await materialLedgersPage.getSelectedMonth();
        expect(currentMonth).toBe(TEST_MONTH);
        await page.waitForTimeout(PAUSE);
      });

      // ── Step 9: Change month and verify ledger reloads ──────────────────
      await test.step('Step 9 — Change month and verify ledger updates', async () => {
        const newMonth = '2026-01';
        await materialLedgersPage.setMonth(newMonth);

        const updatedMonth = await materialLedgersPage.getSelectedMonth();
        expect(updatedMonth).toBe(newMonth);

        // Heading should reflect the new month
        await expect(materialLedgersPage.ledgerHeading).toContainText('January 2026');

        // Table should still be visible with rows
        await expect(materialLedgersPage.table).toBeVisible();
        const rowCount = await materialLedgersPage.getRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(28);

        await page.waitForTimeout(PAUSE);
      });

      // ── Step 10: Switch item and verify ledger updates ──────────────────
      await test.step('Step 10 — Switch item and verify ledger updates', async () => {
        await materialLedgersPage.selectItem('PET Sheet');

        await expect(materialLedgersPage.ledgerHeading).toContainText('PET Sheet');
        await expect(materialLedgersPage.table).toBeVisible();

        const rowCount = await materialLedgersPage.getRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(28);

        await page.waitForTimeout(PAUSE);
      });

    }
  );

});
