import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

const PAUSE        = 1500;
const PROCESS_NAME = 'PET Box Manufacturing';

test.describe('Production Log — Full Workflow', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test('Login → Navigate → Verify UI → Save Entry (Sufficient Stock) → Verify Table → Save Entry (Insufficient Stock) → Verify Error', async ({
    productionPage,
    page,
  }) => {

    // ── Step 1: Navigate to Production Log ───────────────────────────────────
    await test.step('Step 1 — Navigate to Production Log', async () => {
      await productionPage.navigateFromSidebar();
      await expect(page).toHaveURL(/\/production/);
      await expect(productionPage.pageHeading).toHaveText('Production Log');
      await expect(productionPage.newEntryButton).toBeVisible();
      await expect(productionPage.newEntryButton).toBeEnabled();
      await page.waitForTimeout(PAUSE);
    });

    // ── Step 2: Verify page UI ────────────────────────────────────────────────
    await test.step('Step 2 — Verify page UI elements', async () => {
      await expect(productionPage.fromDateInput).toBeVisible();
      await expect(productionPage.toDateInput).toBeVisible();
      await expect(productionPage.quickPeriodCombobox).toBeVisible();
      await expect(productionPage.table).toBeVisible();

      const headers = page.locator('th');
      await expect(headers.nth(0)).toHaveText('Date');
      await expect(headers.nth(1)).toHaveText('Process');
      await expect(headers.nth(2)).toHaveText('Total In');
      await expect(headers.nth(3)).toHaveText('Total Out');
      await expect(headers.nth(4)).toHaveText('Difference');
      await expect(headers.nth(5)).toHaveText('Notes');
      await page.waitForTimeout(PAUSE);
    });

    // ── Step 3: Verify dialog form elements ──────────────────────────────────
    await test.step('Step 3 — Verify New Entry dialog form elements', async () => {
      await productionPage.openNewEntryDialog();
      await expect(productionPage.dialog).toBeVisible();
      await expect(productionPage.dialogHeading).toHaveText('New Production Entry');
      await expect(productionPage.dialogDateInput).toBeVisible();
      await expect(productionPage.dialogProcessCombobox).toContainText('Select process');
      await expect(productionPage.dialogNotesTextarea).toBeVisible();
      await expect(productionPage.dialogSaveButton).toBeDisabled();
      await page.waitForTimeout(PAUSE);

      // Verify process dropdown options
      await productionPage.dialogProcessCombobox.click();
      await expect(page.getByRole('option', { name: 'PET Sheet Manufacturing' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'PET Box Manufacturing' })).toBeVisible();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(PAUSE);

      await productionPage.dialogCloseButton.click();
      await expect(productionPage.dialog).not.toBeVisible();
      await page.waitForTimeout(PAUSE);
    });

    // ── Step 4: Positive — Save entry with sufficient stock (qty = 0) ─────────
    await test.step('Step 4 — Open dialog and select process', async () => {
      await productionPage.openNewEntryDialog();
      await expect(productionPage.dialogSaveButton).toBeDisabled();
      await productionPage.selectProcess(PROCESS_NAME);
      await expect(productionPage.dialogProcessCombobox).toContainText(PROCESS_NAME);
      await expect(productionPage.dialogSaveButton).toBeEnabled();
      await page.waitForTimeout(PAUSE);
    });

    await test.step('Step 5 — Set all quantities to 0 (within stock)', async () => {
      await productionPage.setAllInputQties(0);
      await expect(productionPage.dialogInlineError).not.toBeVisible();
      await page.waitForTimeout(PAUSE);
    });

    const notes = `ProdLog-${Date.now()}`;
    await test.step('Step 6 — Fill notes and save entry', async () => {
      await productionPage.fillNotes(notes);
      await expect(productionPage.dialogNotesTextarea).toHaveValue(notes);
      await page.waitForTimeout(PAUSE);
    });

    const rowsBefore = await productionPage.waitForTableStable();

    await test.step('Step 7 — Save and verify dialog closes', async () => {
      await productionPage.saveEntry();
      await expect(productionPage.dialog).not.toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(PAUSE);
    });

    await test.step('Step 8 — Verify entry created in table', async () => {
      const rowsAfter = await productionPage.waitForTableStable();
      expect(rowsAfter).toBe(rowsBefore + 1);

      const firstRow = await productionPage.getFirstRowData();
      expect(firstRow.process).toContain(PROCESS_NAME);
      expect(firstRow.notes).toContain(notes);
      expect(firstRow.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(firstRow.totalIn).toMatch(/^\d+\.\d{2}$/);
      expect(firstRow.totalOut).toMatch(/^\d+\.\d{2}$/);
      await page.waitForTimeout(PAUSE);
    });

    // ── Step 9: Negative — Save entry with insufficient stock ─────────────────
    await test.step('Step 9 — Open dialog for insufficient stock test', async () => {
      await productionPage.openNewEntryDialog();
      await productionPage.selectProcess(PROCESS_NAME);
      await expect(productionPage.dialogProcessCombobox).toContainText(PROCESS_NAME);
      await expect(productionPage.dialogSaveButton).toBeEnabled();
      await page.waitForTimeout(PAUSE);
    });

    await test.step('Step 10 — Set quantity to 999999 (exceeds available stock)', async () => {
      await productionPage.setInputQty(0, 999999);
      await page.waitForTimeout(PAUSE);
    });

    const rowsBeforeNegative = await productionPage.waitForTableStable();

    await test.step('Step 11 — Attempt save and verify error message', async () => {
      await productionPage.saveEntry();
      await expect(productionPage.dialogInlineError).toBeVisible({ timeout: 8000 });
      await expect(productionPage.dialogInlineError).toContainText('Insufficient stock');
      await expect(productionPage.dialogInlineError).toContainText('Available:');
      await page.waitForTimeout(PAUSE);
    });

    await test.step('Step 12 — Verify dialog stays open and no entry created', async () => {
      await expect(productionPage.dialog).toBeVisible();
      await expect(productionPage.dialogHeading).toHaveText('New Production Entry');

      const rowsAfterNegative = await productionPage.waitForTableStable();
      expect(rowsAfterNegative).toBe(rowsBeforeNegative);
      await page.waitForTimeout(PAUSE);
    });

    await test.step('Step 13 — Close dialog', async () => {
      await productionPage.dialogCloseButton.click();
      await expect(productionPage.dialog).not.toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(PAUSE);
    });

  });

});
