import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Purchases Page - Workflow', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test('Login → Navigate → Verify UI → Create Supplier → Create Purchase → Verify → Edit → Verify Updated', async ({
    purchasesPageNew,
    page,
  }) => {

    const ts             = Date.now().toString().slice(-8);
    const supplierName   = `AutoSupplier${ts}`;
    const invoiceNo      = `INVAUTO${ts}`;
    const updatedInvoice = `INVEDIT${ts}`;
    let   selectedSupplier = '';

    // ── Step 1: Navigate to Purchases via sidebar ──────────────────────────
    await test.step('Step 1 — Navigate to Purchases page via sidebar', async () => {
      await purchasesPageNew.navigateFromSidebar();

      await expect(page).toHaveURL(/\/purchases/);
      await expect(purchasesPageNew.pageHeading).toHaveText('Purchases');
      await expect(purchasesPageNew.manageSuppliersButton).toBeVisible();
      await expect(purchasesPageNew.newPurchaseButton).toBeEnabled();
    });

    // ── Step 2: Verify page UI ─────────────────────────────────────────────
    await test.step('Step 2 — Verify page UI elements', async () => {
      await expect(purchasesPageNew.totalPurchasesStat).toBeVisible();
      await expect(purchasesPageNew.invoicesStat).toBeVisible();
      await expect(purchasesPageNew.fromDateInput).toBeVisible();
      await expect(purchasesPageNew.toDateInput).toBeVisible();
      await expect(purchasesPageNew.table).toBeVisible();

      const headers = page.locator('th');
      await expect(headers.nth(0)).toHaveText('Date');
      await expect(headers.nth(1)).toHaveText('Supplier');
      await expect(headers.nth(2)).toHaveText('Invoice');
      await expect(headers.nth(3)).toHaveText('Item');
      await expect(headers.nth(4)).toHaveText('Qty');
      await expect(headers.nth(5)).toHaveText('Rate');
      await expect(headers.nth(6)).toHaveText('Taxable');
      await expect(headers.nth(7)).toHaveText('GST');
      await expect(headers.nth(8)).toHaveText('Total');
      await expect(headers.nth(9)).toHaveText('Actions');
    });

    // ── Step 3: Create Supplier ────────────────────────────────────────────
    await test.step('Step 3 — Create a new supplier and verify it appears in list', async () => {
      await purchasesPageNew.openManageSuppliers();
      await expect(page.getByRole('heading', { name: 'Manage Suppliers' })).toBeVisible();
      await expect(purchasesPageNew.addSupplierButton).toBeDisabled();

      await purchasesPageNew.supplierNameInput.fill(supplierName);
      await expect(purchasesPageNew.addSupplierButton).toBeEnabled();
      await purchasesPageNew.supplierGstinInput.fill('27ABCDE1234F1Z5');
      await purchasesPageNew.supplierAddressInput.fill('123 Test Street Mumbai');
      await purchasesPageNew.supplierPhoneInput.fill('9876543210');
      await purchasesPageNew.addSupplierButton.click();

      await expect(
        page.getByRole('dialog').locator('ul li p').filter({ hasText: supplierName })
      ).toBeVisible({ timeout: 8000 });

      await purchasesPageNew.closeManageSuppliers();
      await expect(purchasesPageNew.suppliersDialog).not.toBeVisible();
    });

    // ── Step 4: Create Purchase using an existing supplier from dropdown ───
    await test.step('Step 4 — Create a new purchase using an existing supplier from dropdown', async () => {
      await purchasesPageNew.openNewPurchaseDialog();
      await expect(purchasesPageNew.purchaseDialogHeading).toBeVisible();
      await expect(purchasesPageNew.savePurchaseButton).toBeDisabled();

      // Select first available existing supplier from dropdown
      selectedSupplier = await purchasesPageNew.selectFirstSupplier();
      expect(selectedSupplier).toBeTruthy();
      await expect(purchasesPageNew.supplierCombobox).toContainText(selectedSupplier);

      await purchasesPageNew.invoiceInput.fill(invoiceNo);

      const itemName = await purchasesPageNew.selectFirstItem();
      expect(itemName).toBeTruthy();

      await purchasesPageNew.quantityInput.fill('5');
      await purchasesPageNew.rateInput.fill('200');

      await expect(purchasesPageNew.savePurchaseButton).toBeEnabled();
      await purchasesPageNew.savePurchase();

      await expect(purchasesPageNew.saveSuccessToast).toBeVisible({ timeout: 8000 });
      await expect(purchasesPageNew.purchaseDialog).not.toBeVisible();
    });

    // ── Step 5: Verify Purchase in table ───────────────────────────────────
    await test.step('Step 5 — Verify purchase appears in table with correct data', async () => {
      const row = page.locator('tbody tr').filter({ has: page.locator('td', { hasText: invoiceNo }) });
      await expect(row).toBeVisible({ timeout: 8000 });

      const cells = row.locator('td');
      await expect(cells.nth(0)).toContainText(/\d{4}-\d{2}-\d{2}/);
      await expect(cells.nth(1)).toHaveText(selectedSupplier);
      await expect(cells.nth(2)).toHaveText(invoiceNo);
      await expect(cells.nth(4)).toHaveText('5');
    });

    // ── Step 6: Edit Purchase ──────────────────────────────────────────────
    await test.step('Step 6 — Edit the purchase using the stored invoice number', async () => {
      const rows     = page.locator('tbody tr');
      const rowCount = await rows.count();
      let targetIndex = 0;
      for (let i = 0; i < rowCount; i++) {
        const text = await rows.nth(i).locator('td').nth(2).textContent();
        if (text?.trim() === invoiceNo) { targetIndex = i; break; }
      }

      await purchasesPageNew.openEditDialog(targetIndex);
      await expect(purchasesPageNew.editDialogHeading).toBeVisible();
      await expect(purchasesPageNew.editInvoiceInput).toHaveValue(invoiceNo);
      await expect(purchasesPageNew.editQuantityInput).toHaveValue('5');

      await purchasesPageNew.editInvoiceInput.fill(updatedInvoice);
      await purchasesPageNew.editQuantityInput.fill('10');
      await purchasesPageNew.editRateInput.fill('300');

      await expect(purchasesPageNew.savePurchaseButton).toBeEnabled();
      await purchasesPageNew.savePurchase();

      await expect(purchasesPageNew.saveSuccessToast).toBeVisible({ timeout: 8000 });
      await expect(purchasesPageNew.purchaseDialog).not.toBeVisible();
    });

    // ── Step 7: Verify Updated Data ────────────────────────────────────────
    await test.step('Step 7 — Verify updated invoice and data in table', async () => {
      const updatedRow = page.locator('tbody tr').filter({ has: page.locator('td', { hasText: updatedInvoice }) });
      await expect(updatedRow).toBeVisible({ timeout: 8000 });

      await expect(updatedRow.locator('td').nth(1)).toHaveText(selectedSupplier);
      await expect(updatedRow.locator('td').nth(2)).toHaveText(updatedInvoice);
      await expect(updatedRow.locator('td').nth(4)).toHaveText('10');

      // Old invoice must no longer exist
      await expect(
        page.locator('tbody td').filter({ hasText: invoiceNo })
      ).not.toBeVisible();
    });

  });

});
