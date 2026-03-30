import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Daily Entry - Sales Flow', () => {

  test.setTimeout(120000);

  test('should add two sales entries and delete only Entry 1, keeping Entry 2', async ({
    loginPage,
    dashboardPage,
    dailyEntryPage,
    salesPage,
    page,
  }) => {

    // ── Step 1: Login ─────────────────────────────────────────────────────────
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');

    // ── Step 2: Navigate to Daily Entry via sidebar ───────────────────────────
    await dashboardPage.dailyEntryTab.click();
    await dailyEntryPage.heading.waitFor({ state: 'visible' });

    // ── Step 3: Assert Daily Entry page loaded ────────────────────────────────
    await expect(page).toHaveURL(/\/daily-entry/);
    await expect(dailyEntryPage.heading).toHaveText('Daily Entry');
    await expect(dailyEntryPage.entriesTableHeading).toBeVisible();
    await expect(dailyEntryPage.entriesTable).toBeVisible();

    // ── Step 4: Click Sales tab ───────────────────────────────────────────────
    await dailyEntryPage.salesTab.click();
    await expect(dailyEntryPage.salesTab).toHaveAttribute('aria-selected', 'true');

    // ── Step 5: Assert Sales form loaded ─────────────────────────────────────
    await expect(salesPage.formHeading).toBeVisible();
    await expect(salesPage.buyerCombobox).toBeVisible();
    await expect(salesPage.invoiceInput).toBeVisible();
    await expect(salesPage.itemCombobox).toBeVisible();
    await expect(salesPage.quantityInput).toBeVisible();
    await expect(salesPage.rateInput).toBeVisible();
    await expect(salesPage.saveSaleButton).toBeVisible();

    // ════════════════════════════════════════════════════════════════════════
    // SALE ENTRY 1
    // ════════════════════════════════════════════════════════════════════════

    // ── Step 6a: Capture baseline before first save ───────────────────────────
    const rowsBeforeSave1 = await salesPage.waitForTableStable();

    // ── Step 7a: Fill and save first sale entry ───────────────────────────────
    const { buyer: buyer1, item: item1 } = await salesPage.fillSaleForm({
      invoiceNo: 'INV-SALE-AUTO-001',
      quantity:  '5',
      rate:      '200',
    });

    expect(buyer1.length, 'Buyer 1 name must not be empty').toBeGreaterThan(0);
    expect(item1.length,  'Item 1 name must not be empty').toBeGreaterThan(0);

    await expect(salesPage.buyerCombobox).toContainText(buyer1);
    await expect(salesPage.itemCombobox).toContainText(item1);
    await expect(salesPage.quantityInput).toHaveValue('5');
    await expect(salesPage.rateInput).toHaveValue('200');

    const taxable1 = await salesPage.taxableValueInput.inputValue();
    const total1   = await salesPage.totalInput.inputValue();
    expect(taxable1.length).toBeGreaterThan(0);
    expect(total1.length).toBeGreaterThan(0);

    await expect(salesPage.saveSaleButton).toBeEnabled();
    await salesPage.saveSale();

    // Validate first save
    await expect(salesPage.saveSuccessToast).toBeVisible();
    await expect(salesPage.saveSuccessToast).toHaveText('Sale recorded');

    // Scroll to entries table to display the newly added entry
    await salesPage.scrollToEntriesTable();

    const rowsAfterSave1 = await salesPage.waitForTableStable();
    expect(rowsAfterSave1 - rowsBeforeSave1).toBe(1);

    const savedEntry1 = await salesPage.getFirstEntryRow();
    const itemBase1   = item1.replace(/\s*\(.*?\)$/, '').trim();
    expect(savedEntry1.type).toBe('Sale');
    expect(savedEntry1.details).toContain(buyer1);
    expect(savedEntry1.details).toContain(itemBase1);
    expect(savedEntry1.details).toContain('5');
    expect(savedEntry1.amount).toContain('₹');

    // ════════════════════════════════════════════════════════════════════════
    // SALE ENTRY 2
    // ════════════════════════════════════════════════════════════════════════

    // Reset form by switching tabs — fully reinitialises React form state
    await salesPage.resetFormByTabSwitch();

    // ── Step 6b: Capture baseline before second save ──────────────────────────
    const rowsBeforeSave2 = await salesPage.waitForTableStable();

    // ── Step 7b: Fill and save second sale entry ──────────────────────────────
    const { buyer: buyer2, item: item2 } = await salesPage.fillSaleForm({
      invoiceNo: 'INV-SALE-AUTO-002',
      quantity:  '10',
      rate:      '150',
    });

    expect(buyer2.length, 'Buyer 2 name must not be empty').toBeGreaterThan(0);
    expect(item2.length,  'Item 2 name must not be empty').toBeGreaterThan(0);

    await expect(salesPage.buyerCombobox).toContainText(buyer2);
    await expect(salesPage.itemCombobox).toContainText(item2);
    await expect(salesPage.quantityInput).toHaveValue('10');
    await expect(salesPage.rateInput).toHaveValue('150');

    const taxable2 = await salesPage.taxableValueInput.inputValue();
    const total2   = await salesPage.totalInput.inputValue();
    expect(taxable2.length).toBeGreaterThan(0);
    expect(total2.length).toBeGreaterThan(0);

    await expect(salesPage.saveSaleButton).toBeEnabled();
    await salesPage.saveSale();

    // Validate second save
    await expect(salesPage.saveSuccessToast).toBeVisible();
    await expect(salesPage.saveSuccessToast).toHaveText('Sale recorded');

    // Scroll to entries table to display the newly added entry
    await salesPage.scrollToEntriesTable();

    const rowsAfterSave2 = await salesPage.waitForTableStable();
    expect(rowsAfterSave2 - rowsBeforeSave2).toBe(1);

    const savedEntry2 = await salesPage.getFirstEntryRow();
    const itemBase2   = item2.replace(/\s*\(.*?\)$/, '').trim();
    expect(savedEntry2.type).toBe('Sale');
    expect(savedEntry2.details).toContain(buyer2);
    expect(savedEntry2.details).toContain(itemBase2);
    expect(savedEntry2.details).toContain('10');
    expect(savedEntry2.amount).toContain('₹');

    // ════════════════════════════════════════════════════════════════════════
    // DELETE ENTRY 1 (second row — Entry 2 is newest/first, Entry 1 is below it)
    // ════════════════════════════════════════════════════════════════════════

    const entry1Time    = savedEntry1.time;
    const entry1Details = savedEntry1.details;

    // Entry 1 is at row index 1 (Entry 2 is at index 0 — newest first)
    const rowsBeforeDelete1 = await salesPage.waitForTableStable();
    await salesPage.getDeleteButtonForRow(1).click();
    await expect(salesPage.deleteDialog).toBeVisible();
    await expect(salesPage.deleteDialog).toContainText('Are you sure?');
    await expect(salesPage.deleteDialog).toContainText('This action cannot be undone');
    await salesPage.deleteDialogConfirmButton.click();

    await expect(salesPage.deleteSuccessToast).toBeVisible();
    await expect(salesPage.deleteSuccessToast).toHaveText('Sale deleted');

    const rowsAfterDelete1 = await salesPage.waitForTableStable();
    expect(rowsBeforeDelete1 - rowsAfterDelete1).toBe(1);

    // Entry 1 is gone
    expect(await salesPage.specificEntryExistsInTable(entry1Time, entry1Details)).toBe(false);

    // Entry 2 still exists in the table
    expect(await salesPage.specificEntryExistsInTable(savedEntry2.time, savedEntry2.details)).toBe(true);
  });

});
