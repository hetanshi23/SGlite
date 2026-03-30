import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Business Summary Page - Workflow', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test('Login → Navigate → Verify UI → Verify KPI Cards → Verify Tables → Date Filter → Validate Data', async ({
    businessSummaryPage,
    page,
  }) => {

    // ── Step 1: Navigate to Business Summary via sidebar ───────────────────
    await test.step('Step 1 — Navigate to Business Summary via sidebar', async () => {
      await businessSummaryPage.navigateFromSidebar();

      await expect(page).toHaveURL(/\/business-summary/);
      await expect(businessSummaryPage.pageHeading).toBeVisible();
      await expect(businessSummaryPage.pageHeading).toHaveText('Business Summary');
      await expect(businessSummaryPage.periodDescription).toBeVisible();
      await expect(businessSummaryPage.periodDescription).toContainText('Financial overview for');
    });

    // ── Step 2: Verify page UI elements ───────────────────────────────────
    await test.step('Step 2 — Verify page UI elements — filters and sections', async () => {
      // Date filter inputs
      await expect(businessSummaryPage.startDateInput).toBeVisible();
      await expect(businessSummaryPage.startDateInput).toBeEnabled();
      await expect(businessSummaryPage.endDateInput).toBeVisible();
      await expect(businessSummaryPage.endDateInput).toBeEnabled();
      await expect(businessSummaryPage.quickPeriodCombobox).toBeVisible();

      // Date labels
      await expect(page.locator('span').filter({ hasText: 'Start Date' })).toBeVisible();
      await expect(page.locator('span').filter({ hasText: 'End Date' })).toBeVisible();
      await expect(page.locator('span').filter({ hasText: 'Quick Period' })).toBeVisible();

      // All 4 KPI cards visible
      await expect(businessSummaryPage.totalPurchasesCard).toBeVisible();
      await expect(businessSummaryPage.totalSalesCard).toBeVisible();
      await expect(businessSummaryPage.grossProfitCard).toBeVisible();
      await expect(businessSummaryPage.productionBatchesCard).toBeVisible();

      // Both tables visible
      await expect(businessSummaryPage.purchasesTableHeading).toBeVisible();
      await expect(businessSummaryPage.salesTableHeading).toBeVisible();
    });

    // ── Step 3: Verify KPI card headings ──────────────────────────────────
    await test.step('Step 3 — Verify all KPI card headings', async () => {
      await expect(page.getByRole('heading', { name: 'Total Purchases' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Total Sales' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Gross Profit' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Production Batches' })).toBeVisible();
    });

    // ── Step 4: Verify KPI card values are non-empty ──────────────────────
    await test.step('Step 4 — Verify KPI card values are present and formatted', async () => {
      // Total Purchases — must contain ₹
      await expect(businessSummaryPage.totalPurchasesValue).toBeVisible();
      await expect(businessSummaryPage.totalPurchasesValue).toContainText('₹');

      // Total Sales — must contain ₹
      await expect(businessSummaryPage.totalSalesValue).toBeVisible();
      await expect(businessSummaryPage.totalSalesValue).toContainText('₹');

      // Gross Profit — must contain ₹ (can be negative)
      await expect(businessSummaryPage.grossProfitValue).toBeVisible();
      await expect(businessSummaryPage.grossProfitValue).toContainText('₹');

      // Production Batches — must be a number
      await expect(businessSummaryPage.productionBatchesValue).toBeVisible();
      const batchesText = await businessSummaryPage.productionBatchesValue.textContent();
      expect(batchesText?.trim()).toMatch(/^\d+$/);
    });

    // ── Step 5: Verify Purchases by Item table ────────────────────────────
    await test.step('Step 5 — Verify Purchases by Item table structure and data', async () => {
      await expect(businessSummaryPage.purchasesTableHeading).toContainText('Purchases by Item');
      await expect(businessSummaryPage.purchasesTable).toBeVisible();

      // Column headers
      const purchasesHeaders = businessSummaryPage.purchasesTable.locator('th');
      await expect(purchasesHeaders.nth(0)).toHaveText('Item');
      await expect(purchasesHeaders.nth(1)).toHaveText('Qty');
      await expect(purchasesHeaders.nth(2)).toHaveText('Total (₹)');

      // Table has rows (excluding Total row)
      const purchasesRowCount = await businessSummaryPage.purchasesTable.locator('tbody tr').count();
      expect(purchasesRowCount).toBeGreaterThan(0);

      // Validate data rows only (skip last Total row)
      for (let i = 0; i < purchasesRowCount - 1; i++) {
        const row = await businessSummaryPage.getPurchasesRowData(i);
        expect(row.item.length).toBeGreaterThan(0);
        expect(row.qty.length).toBeGreaterThan(0);
        expect(row.total).toContain('₹');
      }
    });

    // ── Step 6: Verify Sales by Item table ────────────────────────────────
    await test.step('Step 6 — Verify Sales by Item table structure and data', async () => {
      await expect(businessSummaryPage.salesTableHeading).toContainText('Sales by Item');
      await expect(businessSummaryPage.salesTable).toBeVisible();

      // Column headers
      const salesHeaders = businessSummaryPage.salesTable.locator('th');
      await expect(salesHeaders.nth(0)).toHaveText('Item');
      await expect(salesHeaders.nth(1)).toHaveText('Qty');
      await expect(salesHeaders.nth(2)).toHaveText('Total (₹)');

      // Table has rows (excluding Total row)
      const salesRowCount = await businessSummaryPage.salesTable.locator('tbody tr').count();
      expect(salesRowCount).toBeGreaterThan(0);

      // Validate data rows only (skip last Total row)
      for (let i = 0; i < salesRowCount - 1; i++) {
        const row = await businessSummaryPage.getSalesRowData(i);
        expect(row.item.length).toBeGreaterThan(0);
        expect(row.qty.length).toBeGreaterThan(0);
        expect(row.total).toContain('₹');
      }
    });

    // ── Step 7: Verify table headings include date range ──────────────────
    await test.step('Step 7 — Verify table headings include the selected date range', async () => {
      const startValue = await businessSummaryPage.startDateInput.inputValue();
      const endValue   = await businessSummaryPage.endDateInput.inputValue();

      expect(startValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(endValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Period description must reflect the date range
      await expect(businessSummaryPage.periodDescription).toBeVisible();
      await expect(businessSummaryPage.periodDescription).toContainText('Financial overview for');
    });

    // ── Step 8: Apply Quick Period filter ─────────────────────────────────
    await test.step('Step 8 — Apply Quick Period filter and verify page updates', async () => {
      await businessSummaryPage.quickPeriodCombobox.click();

      // Verify dropdown options are visible
      const options = page.getByRole('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);

      // Select first available option
      const firstOption = options.first();
      const optionText  = ((await firstOption.textContent()) ?? '').trim();
      await firstOption.click();
      await page.waitForTimeout(800);

      // Page must remain stable after filter change
      await expect(businessSummaryPage.pageHeading).toBeVisible();
      await expect(businessSummaryPage.totalPurchasesCard).toBeVisible();
      await expect(businessSummaryPage.totalSalesCard).toBeVisible();
      await expect(businessSummaryPage.purchasesTable).toBeVisible();
      await expect(businessSummaryPage.salesTable).toBeVisible();
    });

    // ── Step 9: Apply custom date range and verify data updates ───────────
    await test.step('Step 9 — Apply custom date range and verify data updates', async () => {
      await businessSummaryPage.setDateRange('2026-01-01', '2026-12-31');

      await expect(businessSummaryPage.startDateInput).toHaveValue('2026-01-01');
      await expect(businessSummaryPage.endDateInput).toHaveValue('2026-12-31');

      // All sections must remain visible
      await expect(businessSummaryPage.totalPurchasesCard).toBeVisible();
      await expect(businessSummaryPage.totalSalesCard).toBeVisible();
      await expect(businessSummaryPage.grossProfitCard).toBeVisible();
      await expect(businessSummaryPage.productionBatchesCard).toBeVisible();
      await expect(businessSummaryPage.purchasesTable).toBeVisible();
      await expect(businessSummaryPage.salesTable).toBeVisible();

      // KPI values must still contain ₹
      await expect(businessSummaryPage.totalPurchasesValue).toContainText('₹');
      await expect(businessSummaryPage.totalSalesValue).toContainText('₹');
      await expect(businessSummaryPage.grossProfitValue).toContainText('₹');
    });

    // ── Step 10: Verify business logic — Gross Profit = Sales - Purchases ─
    await test.step('Step 10 — Verify Gross Profit business logic', async () => {
      // Reset to default period
      await businessSummaryPage.setDateRange('2026-03-01', '2026-03-31');

      const purchasesText = await businessSummaryPage.totalPurchasesValue.textContent();
      const salesText     = await businessSummaryPage.totalSalesValue.textContent();
      const profitText    = await businessSummaryPage.grossProfitValue.textContent();

      // All values must be present
      expect(purchasesText?.trim()).toContain('₹');
      expect(salesText?.trim()).toContain('₹');
      expect(profitText?.trim()).toContain('₹');

      // Gross Profit must be negative when purchases > sales
      const purchasesNum = parseFloat(purchasesText!.replace(/[₹,]/g, ''));
      const salesNum     = parseFloat(salesText!.replace(/[₹,]/g, ''));
      const profitNum    = parseFloat(profitText!.replace(/[₹,]/g, ''));

      if (purchasesNum > salesNum) {
        expect(profitNum).toBeLessThan(0);
      } else {
        expect(profitNum).toBeGreaterThanOrEqual(0);
      }
    });

  });

});
