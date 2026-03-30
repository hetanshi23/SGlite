import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Daily Entry - Purchases Flow', () => {

  test.setTimeout(120000);

  test('should add and delete a purchase entry end-to-end', async ({
    loginPage,
    dashboardPage,
    dailyEntryPage,
    purchasesPage,
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

    // ── Step 4: Click Purchases tab ───────────────────────────────────────────
    await dailyEntryPage.purchasesTab.click();
    await expect(dailyEntryPage.purchasesTab).toHaveAttribute('aria-selected', 'true');

    // ── Step 5: Assert Purchases form loaded ──────────────────────────────────
    await expect(purchasesPage.formHeading).toBeVisible();
    await expect(purchasesPage.supplierCombobox).toBeVisible();
    await expect(purchasesPage.invoiceInput).toBeVisible();
    await expect(purchasesPage.itemCombobox).toBeVisible();
    await expect(purchasesPage.quantityInput).toBeVisible();
    await expect(purchasesPage.rateInput).toBeVisible();
    await expect(purchasesPage.savePurchaseButton).toBeVisible();

    // ── Step 6: Capture stable baseline row count ─────────────────────────────
    const rowsBefore = await purchasesPage.waitForTableStable();

    // ── Step 7: Fill purchase form ────────────────────────────────────────────
    const { supplier, item } = await purchasesPage.fillPurchaseForm({
      invoiceNo: 'INV-AUTO-001',
      quantity:  '10',
      rate:      '100',
    });

    expect(supplier.length, 'Supplier name must not be empty').toBeGreaterThan(0);
    expect(item.length,     'Item name must not be empty').toBeGreaterThan(0);

    // Assert comboboxes reflect selections
    await expect(purchasesPage.supplierCombobox).toContainText(supplier);
    await expect(purchasesPage.itemCombobox).toContainText(item);

    // Assert quantity and rate are filled
    await expect(purchasesPage.quantityInput).toHaveValue('10');
    await expect(purchasesPage.rateInput).toHaveValue('100');

    // Assert read-only computed fields are non-empty (auto-calculated by app)
    const taxableValue = await purchasesPage.taxableValueInput.inputValue();
    const total        = await purchasesPage.totalInput.inputValue();
    expect(taxableValue.length).toBeGreaterThan(0);
    expect(total.length).toBeGreaterThan(0);

    // ── Step 8: Save the purchase entry ──────────────────────────────────────
    await expect(purchasesPage.savePurchaseButton).toBeEnabled();
    await purchasesPage.savePurchase();

    // ── Step 9: Validate save result ──────────────────────────────────────────

    // 9a — Success toast with exact text
    await expect(purchasesPage.saveSuccessToast).toBeVisible();
    await expect(purchasesPage.saveSuccessToast).toHaveText('Purchase recorded');

    // Scroll to entries table to display the newly added entry
    await purchasesPage.scrollToEntriesTable();

    // 9b — Row count increased by exactly 1
    const rowsAfterSave = await purchasesPage.waitForTableStable();
    expect(rowsAfterSave - rowsBefore).toBe(1);

    // 9c — Newest entry is at the top; validate all columns
    const savedEntry = await purchasesPage.getFirstEntryRow();

    // Type badge
    expect(savedEntry.type).toBe('Purchase');

    // Details format: "Supplier — ItemName x Quantity"
    // Item name in table strips the unit suffix e.g. "ABC123 (kg)" → "ABC123"
    const itemBaseName = item.replace(/\s*\(.*?\)$/, '').trim();
    expect(savedEntry.details).toContain(supplier);
    expect(savedEntry.details).toContain(itemBaseName);
    expect(savedEntry.details).toContain('10');

    // Amount: contains rupee symbol and the total value
    expect(savedEntry.amount).toContain('₹');
    expect(savedEntry.amount.length).toBeGreaterThan(1);

    // ── Step 10: Edit — not available (no edit button in Purchases table) ─────
    // The Purchases table exposes only a delete action per row.
    // Edit functionality is not present in the current UI.

    // ── Step 11: Delete the newly added entry ─────────────────────────────────

    // 11a — Capture time + details as a unique row identifier
    const entryTime    = savedEntry.time;
    const entryDetails = savedEntry.details;

    // 11b — Click the trash icon on the first row
    await purchasesPage.getDeleteButtonForRow(0).click();

    // 11c — Confirmation alertdialog appears — assert content then confirm
    await expect(purchasesPage.deleteDialog).toBeVisible();
    await expect(purchasesPage.deleteDialog).toContainText('Are you sure?');
    await expect(purchasesPage.deleteDialog).toContainText('This action cannot be undone');
    await purchasesPage.deleteDialogConfirmButton.click();

    // 11d — Validate deletion

    // Delete success toast
    await expect(purchasesPage.deleteSuccessToast).toBeVisible();
    await expect(purchasesPage.deleteSuccessToast).toHaveText('Purchase deleted');

    // Row count decreased by exactly 1
    const rowsAfterDelete = await purchasesPage.waitForTableStable();
    expect(rowsAfterDelete).toBe(rowsAfterSave - 1);

    // Deleted entry (time + details) no longer exists in the table
    expect(
      await purchasesPage.specificEntryExistsInTable(entryTime, entryDetails)
    ).toBe(false);
  });

});
