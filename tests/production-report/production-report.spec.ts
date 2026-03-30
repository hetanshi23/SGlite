import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Production Report Page - Workflow (Stable)', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test('Login → Navigate → Verify UI → KPI Cards → Stage Cards → Waste Summary → Daily Log → Date Filter', async ({
    productionReportPage,
    page,
  }) => {

    // ── Step 1: Navigate ─────────────────────────
    await test.step('Step 1 — Navigate to Production Report', async () => {
      await productionReportPage.navigateFromSidebar();

      await expect(page).toHaveURL(/\/production-report/);
      await expect(productionReportPage.pageHeading).toHaveText('Production Report');
      await page.waitForTimeout(1500);
    });

    // ── Step 2: Verify UI ────────────────────────
    await test.step('Step 2 — Verify UI elements', async () => {
      await expect(productionReportPage.startDateInput).toBeVisible();
      await expect(productionReportPage.endDateInput).toBeVisible();
      await expect(productionReportPage.quickPeriodCombobox).toBeVisible();
      await expect(productionReportPage.exportExcelButton).toBeEnabled();

      await expect(productionReportPage.totalBatchesCard).toBeVisible();
      await expect(productionReportPage.totalInputCard).toBeVisible();
      await expect(productionReportPage.totalOutputCard).toBeVisible();
      await expect(productionReportPage.totalWasteCard).toBeVisible();
      await page.waitForTimeout(1500);
    });

    // ── Step 3: KPI Cards (FIXED 🔥) ─────────────
    await test.step('Step 3 — Verify KPI values (stable)', async () => {

      // Wait until batches > 0 (handles async load)
      await expect.poll(async () => {
        const text = await productionReportPage.totalBatchesValue.textContent();
        return parseInt(text?.trim() || '0');
      }).toBeGreaterThan(0);

      // Validate other KPI values
      await expect(productionReportPage.totalInputValue).toContainText('kg');
      await expect(productionReportPage.totalOutputValue).toContainText('kg');
      await expect(productionReportPage.totalWasteValue).toContainText('kg');
      await page.waitForTimeout(1500);
    });

    // ── Step 4: Stage Cards ─────────────────────
    await test.step('Step 4 — Verify Stage Cards', async () => {
      await expect(productionReportPage.stage1Heading).toContainText('Stage 1');
      await expect(productionReportPage.stage2Heading).toContainText('Stage 2');

      const stage1Text = await productionReportPage.getStageText(1);
      expect(stage1Text).toContain('Total In:');
      expect(stage1Text).toContain('Total Out:');
      expect(stage1Text).toContain('Efficiency:');

      const stage2Text = await productionReportPage.getStageText(2);
      expect(stage2Text).toContain('Total In:');
      await page.waitForTimeout(1500);
    });

    // ── Step 5: Materials Table ─────────────────
    await test.step('Step 5 — Validate Materials table', async () => {
      const table = page.locator('text=Materials Consumed').locator('..').locator('table').first();

      await expect(table).toBeVisible();

      const rows = await table.locator('tbody tr').count();
      expect(rows).toBeGreaterThan(0);
      await page.waitForTimeout(1500);
    });

    // ── Step 6: Products Table ──────────────────
    await test.step('Step 6 — Validate Products table', async () => {
      const table = page.locator('text=Products & Waste Produced').locator('..').locator('table').first();

      await expect(table).toBeVisible();

      const rows = await table.locator('tbody tr').count();
      expect(rows).toBeGreaterThan(0);
      await page.waitForTimeout(1500);
    });

    // ── Step 7: Waste Summary ───────────────────
    await test.step('Step 7 — Validate Waste Summary', async () => {
      await expect(productionReportPage.wasteSummaryHeading).toBeVisible();

      const rows = await productionReportPage.getWasteSummaryRowCount();
      expect(rows).toBeGreaterThan(0);
      await page.waitForTimeout(1500);
    });

    // ── Step 8: Daily Log ───────────────────────
    await test.step('Step 8 — Validate Daily Production Log', async () => {
      const count = await productionReportPage.getDailyLogRowCount();
      expect(count).toBeGreaterThan(0);

      const row = await productionReportPage.getDailyLogRow(0);
      expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      await page.waitForTimeout(1500);
    });

    // ── Step 9: Date Filter ─────────────────────
    await test.step('Step 9 — Apply date filter', async () => {
      await productionReportPage.setDateRange('2026-01-01', '2026-12-31');

      await expect(productionReportPage.startDateInput).toHaveValue('2026-01-01');
      await expect(productionReportPage.endDateInput).toHaveValue('2026-12-31');
      await page.waitForTimeout(1500);
    });

    // ── Step 10: Export Button ──────────────────
    await test.step('Step 10 — Verify Export button', async () => {
      await expect(productionReportPage.exportExcelButton).toBeEnabled();
      await page.waitForTimeout(1500);
    });
  });
});