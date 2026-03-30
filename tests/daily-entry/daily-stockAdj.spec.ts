import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Daily Entry - Stock Adjustment Tab', () => {

  test.setTimeout(120000);

  test('should add two adjustments and delete only Entry 1, keeping Entry 2', async ({
    loginPage,
    dashboardPage,
    dailyEntryPage,
    stockAdjPage,
    page,
  }) => {

    // ── Step 1: Login with valid credentials ──────────────────────────────────
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');

    // ── Step 2: Navigate to Daily Entry via sidebar ───────────────────────────
    await dashboardPage.dailyEntryTab.click();
    await dailyEntryPage.heading.waitFor({ state: 'visible' });

    // ── Step 3: Assert Daily Entry page loaded ────────────────────────────────
    await expect(page).toHaveURL(/\/daily-entry/);
    await expect(dailyEntryPage.heading).toHaveText('Daily Entry');
    await expect(dailyEntryPage.entriesTable).toBeVisible();

    // ── Step 4: Click Stock Adj. tab ──────────────────────────────────────────
    await expect(dailyEntryPage.stockAdjTab).toBeVisible();
    await dailyEntryPage.stockAdjTab.click();
    await expect(dailyEntryPage.stockAdjTab).toHaveAttribute('aria-selected', 'true');

    // ── Step 5: Assert Stock Adjustment form loaded ───────────────────────────
    await expect(stockAdjPage.formHeading).toBeVisible();
    await expect(stockAdjPage.itemCombobox).toBeVisible();
    await expect(stockAdjPage.quantityInput).toBeVisible();
    await expect(stockAdjPage.reasonInput).toBeVisible();
    await expect(stockAdjPage.saveAdjustmentButton).toBeVisible();
    await expect(stockAdjPage.entriesTableHeading).toBeVisible();

    // ════════════════════════════════════════════════════════════════════════
    // ADJUSTMENT ENTRY 1
    // ════════════════════════════════════════════════════════════════════════

    // ── Step 6a: Capture baseline before first save ───────────────────────────
    const rowsBeforeSave1 = await stockAdjPage.waitForTableStable();

    // ── Step 7a: Select item, enter quantity and reason ───────────────────────
    const { item: item1 } = await stockAdjPage.fillAdjustmentForm({
      quantity: '50',
      reason:   'Opening balance adjustment',
    });

    expect(item1.length, 'Item 1 name must not be empty').toBeGreaterThan(0);
    await expect(stockAdjPage.itemCombobox).toContainText(item1);
    await expect(stockAdjPage.quantityInput).toHaveValue('50');
    await expect(stockAdjPage.reasonInput).toHaveValue('Opening balance adjustment');

    // ── Step 8a: Click Save Adjustment ───────────────────────────────────────
    await expect(stockAdjPage.saveAdjustmentButton).toBeEnabled();
    await stockAdjPage.saveAdjustment();

    // ── Step 9a: Validate first save ─────────────────────────────────────────
    await expect(stockAdjPage.saveSuccessToast).toBeVisible();
    await expect(stockAdjPage.saveSuccessToast).toHaveText('Stock adjustment saved');

    // Scroll to entries table to display the newly added entry
    await stockAdjPage.scrollToEntriesTable();

    const rowsAfterSave1 = await stockAdjPage.waitForTableStable();
    expect(rowsAfterSave1 - rowsBeforeSave1).toBe(1);

    const savedEntry1 = await stockAdjPage.getFirstEntryRow();
    const itemBase1   = item1.replace(/\s*\(.*?\)$/, '').trim();
    expect(savedEntry1.type).toBe('Adjustment');
    expect(savedEntry1.details).toContain(itemBase1);
    expect(savedEntry1.amount).toContain('50');

    // ════════════════════════════════════════════════════════════════════════
    // ADJUSTMENT ENTRY 2
    // ════════════════════════════════════════════════════════════════════════

    // Reset form by switching tabs to reinitialise React form state
    await stockAdjPage.resetFormByTabSwitch();

    // ── Step 6b: Capture baseline before second save ──────────────────────────
    const rowsBeforeSave2 = await stockAdjPage.waitForTableStable();

    // ── Step 7b: Select item, enter quantity and reason ───────────────────────
    const { item: item2 } = await stockAdjPage.fillAdjustmentForm({
      quantity: '25',
      reason:   'Physical count correction',
    });

    expect(item2.length, 'Item 2 name must not be empty').toBeGreaterThan(0);
    await expect(stockAdjPage.itemCombobox).toContainText(item2);
    await expect(stockAdjPage.quantityInput).toHaveValue('25');
    await expect(stockAdjPage.reasonInput).toHaveValue('Physical count correction');

    // ── Step 8b: Click Save Adjustment ───────────────────────────────────────
    await expect(stockAdjPage.saveAdjustmentButton).toBeEnabled();
    await stockAdjPage.saveAdjustment();

    // ── Step 9b: Validate second save ────────────────────────────────────────
    await expect(stockAdjPage.saveSuccessToast).toBeVisible();
    await expect(stockAdjPage.saveSuccessToast).toHaveText('Stock adjustment saved');

    // Scroll to entries table to display the newly added entry
    await stockAdjPage.scrollToEntriesTable();

    const rowsAfterSave2 = await stockAdjPage.waitForTableStable();
    expect(rowsAfterSave2 - rowsBeforeSave2).toBe(1);

    const savedEntry2 = await stockAdjPage.getFirstEntryRow();
    const itemBase2   = item2.replace(/\s*\(.*?\)$/, '').trim();
    expect(savedEntry2.type).toBe('Adjustment');
    expect(savedEntry2.details).toContain(itemBase2);
    expect(savedEntry2.amount).toContain('25');

    // ════════════════════════════════════════════════════════════════════════
    // DELETE ENTRY 1 ONLY (row index 1 — Entry 2 is newest/first at index 0)
    // ════════════════════════════════════════════════════════════════════════

    const entry1Time    = savedEntry1.time;
    const entry1Details = savedEntry1.details;

    const rowsBeforeDelete = await stockAdjPage.waitForTableStable();

    // Entry 1 is at row index 1 (Entry 2 is at index 0 — newest first)
    await stockAdjPage.getDeleteButtonForRow(1).click();

    await expect(stockAdjPage.deleteDialog).toBeVisible();
    await expect(stockAdjPage.deleteDialog).toContainText('Are you sure?');
    await expect(stockAdjPage.deleteDialog).toContainText('This action cannot be undone');
    await stockAdjPage.deleteDialogConfirmButton.click();

    // Validate deletion
    await expect(stockAdjPage.deleteSuccessToast).toBeVisible();
    await expect(stockAdjPage.deleteSuccessToast).toHaveText('Adjustment deleted');

    const rowsAfterDelete = await stockAdjPage.waitForTableStable();
    expect(rowsBeforeDelete - rowsAfterDelete).toBe(1);

    // Entry 1 is gone
    expect(await stockAdjPage.specificEntryExistsInTable(entry1Time, entry1Details)).toBe(false);

    // Entry 2 still exists
    expect(await stockAdjPage.specificEntryExistsInTable(savedEntry2.time, savedEntry2.details)).toBe(true);
  });

});
