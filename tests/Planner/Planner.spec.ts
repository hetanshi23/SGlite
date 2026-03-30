import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Planner Page - Workflow', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test('Login → Navigate → Verify UI → Verify Sections → Date Filters → Production Plans → Change Status', async ({
    plannerPage,
    page,
  }) => {

    // ── Step 1: Navigate to Planner via sidebar ────────────────────────────
    await test.step('Step 1 — Navigate to Planner page via sidebar', async () => {
      await plannerPage.navigateFromSidebar();

      await expect(page).toHaveURL(/\/planner/);
      await expect(plannerPage.pageHeading).toBeVisible();
      await expect(plannerPage.pageHeading).toHaveText('Production Planner');
    });

    // ── Step 2: Verify page UI elements ───────────────────────────────────
    await test.step('Step 2 — Verify all page UI elements are visible', async () => {
      // Date filter inputs
      await expect(plannerPage.fromDateInput).toBeVisible();
      await expect(plannerPage.toDateInput).toBeVisible();
      await expect(plannerPage.fromDateInput).toBeEnabled();
      await expect(plannerPage.toDateInput).toBeEnabled();

      // Date labels
      await expect(page.locator('label').filter({ hasText: 'From' })).toBeVisible();
      await expect(page.locator('label').filter({ hasText: 'To' })).toBeVisible();

      // All 3 section cards
      await expect(plannerPage.mrpHeading).toBeVisible();
      await expect(plannerPage.suggestionsHeading).toBeVisible();
      await expect(plannerPage.plansHeading).toBeVisible();
    });

    // ── Step 3: Verify MRP section ─────────────────────────────────────────
    await test.step('Step 3 — Verify MRP — Material Requirements section', async () => {
      await expect(plannerPage.mrpHeading).toContainText('MRP');
      await expect(plannerPage.mrpHeading).toContainText('Material Requirements');
      await expect(plannerPage.mrpCard).toBeVisible();

      // Default date shows no requirements
      await expect(plannerPage.mrpEmptyMessage).toBeVisible();
      await expect(plannerPage.mrpEmptyMessage).toHaveText('No material requirements for selected period.');
    });

    // ── Step 4: Verify Production Suggestions section ──────────────────────
    await test.step('Step 4 — Verify Production Suggestions section', async () => {
      await expect(plannerPage.suggestionsHeading).toHaveText('Production Suggestions');
      await expect(plannerPage.suggestionsCard).toBeVisible();

      // Default date shows no demand
      await expect(plannerPage.suggestionsEmptyMessage).toBeVisible();
      await expect(plannerPage.suggestionsEmptyMessage).toHaveText('No demand in selected period.');
    });

    // ── Step 5: Verify Production Plans section and table ─────────────────
    await test.step('Step 5 — Verify Production Plans table and column headers', async () => {
      await expect(plannerPage.plansHeading).toContainText('Production Plans');
      await expect(plannerPage.plansTable).toBeVisible();

      // Column headers
      await expect(page.getByRole('columnheader', { name: 'Process' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Qty (batches)' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();

      // Plans table has rows
      const rowCount = await plannerPage.getPlansRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

    // ── Step 6: Verify Production Plans data ──────────────────────────────
    await test.step('Step 6 — Verify Production Plans rows have valid data', async () => {
      const rowCount = await plannerPage.getPlansRowCount();

      for (let i = 0; i < rowCount; i++) {
        const row = await plannerPage.getRowData(i);

        // Process name must not be empty
        expect(row.process.length).toBeGreaterThan(0);

        // Qty must be a number (can be negative)
        expect(row.qty).toMatch(/^-?\d+$/);

        // Date must be valid format
        expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // Status must not be empty
        expect(row.status.length).toBeGreaterThan(0);
      }

      // Verify known processes exist
      const rows = page.locator('tbody tr');
      await expect(rows.filter({ has: page.locator('td', { hasText: 'PET Sheet Manufacturing' }) })).toBeVisible();
      await expect(rows.filter({ has: page.locator('td', { hasText: 'PET Box Manufacturing' }) })).toBeVisible();
    });

    // ── Step 7: Verify status combobox in each row ─────────────────────────
    await test.step('Step 7 — Verify status combobox is visible and enabled in each row', async () => {
      const rowCount = await plannerPage.getPlansRowCount();

      for (let i = 0; i < rowCount; i++) {
        const combobox = plannerPage.getStatusComboboxForRow(i);
        await expect(combobox).toBeVisible();
        await expect(combobox).toBeEnabled();
        // Status must have some text value
        const statusText = await combobox.textContent();
        expect(statusText?.trim().length).toBeGreaterThan(0);
      }
    });

    // ── Step 8: Change status of first plan row ────────────────────────────
    await test.step('Step 8 — Verify status dropdown opens and shows all options', async () => {
      const combobox = plannerPage.getStatusComboboxForRow(0);
      await expect(combobox).toBeVisible();
      await expect(combobox).toBeEnabled();

      // Open dropdown and verify all status options are available
      await combobox.click();
      await expect(page.getByRole('option', { name: 'Planned', exact: true })).toBeVisible();
      await expect(page.getByRole('option', { name: 'In Progress', exact: true })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Completed', exact: true })).toBeVisible();

      // Select In Progress
      await page.getByRole('option', { name: 'In Progress', exact: true }).click();
      await page.waitForTimeout(800);
      await expect(combobox).toContainText('In Progress');
    });

    // ── Step 9: Change status back to Planned ─────────────────────────────
    await test.step('Step 9 — Change status back to Planned', async () => {
      const combobox = plannerPage.getStatusComboboxForRow(0);
      await combobox.click();
      await page.getByRole('option', { name: 'Planned', exact: true }).click();
      await page.waitForTimeout(800);
      await expect(combobox).toContainText('Planned');
    });

    // ── Step 10: Apply date range filter and verify sections update ────────
    await test.step('Step 10 — Apply date range filter and verify sections respond', async () => {
      const today     = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await plannerPage.setDateRange(lastMonth, today);

      // Verify date inputs updated
      await expect(plannerPage.fromDateInput).toHaveValue(lastMonth);
      await expect(plannerPage.toDateInput).toHaveValue(today);

      // All sections still visible after date change
      await expect(plannerPage.mrpCard).toBeVisible();
      await expect(plannerPage.suggestionsCard).toBeVisible();
      await expect(plannerPage.plansTable).toBeVisible();
    });

    // ── Step 11: Verify MRP and Suggestions update with wider date range ───
    await test.step('Step 11 — Verify MRP and Suggestions sections with wider date range', async () => {
      const wideFrom = '2026-01-01';
      const wideTo   = '2026-12-31';

      await plannerPage.setDateRange(wideFrom, wideTo);

      await expect(plannerPage.fromDateInput).toHaveValue(wideFrom);
      await expect(plannerPage.toDateInput).toHaveValue(wideTo);

      // Sections must remain visible and stable
      await expect(plannerPage.mrpHeading).toBeVisible();
      await expect(plannerPage.suggestionsHeading).toBeVisible();
      await expect(plannerPage.plansHeading).toBeVisible();
      await expect(plannerPage.plansTable).toBeVisible();

      // Plans table still has rows
      const rowCount = await plannerPage.getPlansRowCount();
      expect(rowCount).toBeGreaterThan(0);
    });

  });

});
