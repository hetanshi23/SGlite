import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Sales Page - Workflow', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test('Login → Navigate → Verify UI → Create Buyer → Create Sale → Verify → Edit → Verify Updated', async ({
    salesPageNew,
    page,
  }) => {

    const ts             = Date.now().toString().slice(-8);
    const buyerName      = `AutoBuyer${ts}`;
    const invoiceNo      = `SLINVAUTO${ts}`;
    const updatedInvoice = `SLINVEDIT${ts}`;
    let   selectedBuyer  = '';

    // ── Step 1: Navigate to Sales via sidebar ──────────────────────────────
    await test.step('Step 1 — Navigate to Sales page via sidebar', async () => {
      await salesPageNew.navigateFromSidebar();

      await expect(page).toHaveURL(/\/sales/);
      await expect(salesPageNew.pageHeading).toHaveText('Sales');
      await expect(salesPageNew.manageBuyersButton).toBeVisible();
      await expect(salesPageNew.newSaleButton).toBeEnabled();
    });

    // ── Step 2: Verify page UI ─────────────────────────────────────────────
    await test.step('Step 2 — Verify page UI elements', async () => {
      await expect(salesPageNew.totalSalesStat).toBeVisible();
      await expect(salesPageNew.invoicesStat).toBeVisible();
      await expect(salesPageNew.fromDateInput).toBeVisible();
      await expect(salesPageNew.toDateInput).toBeVisible();
      await expect(salesPageNew.table).toBeVisible();

      const headers = page.locator('th');
      await expect(headers.nth(0)).toHaveText('Date');
      await expect(headers.nth(1)).toHaveText('Buyer');
      await expect(headers.nth(2)).toHaveText('Invoice');
      await expect(headers.nth(3)).toHaveText('Item');
      await expect(headers.nth(4)).toHaveText('Qty');
      await expect(headers.nth(5)).toHaveText('Rate');
      await expect(headers.nth(6)).toHaveText('Taxable');
      await expect(headers.nth(7)).toHaveText('GST');
      await expect(headers.nth(8)).toHaveText('Total');
      await expect(headers.nth(9)).toHaveText('Actions');
    });

    // ── Step 3: Create Buyer ───────────────────────────────────────────────
    await test.step('Step 3 — Create a new buyer and verify it appears in list', async () => {
      await salesPageNew.openManageBuyers();
      await expect(page.getByRole('heading', { name: 'Manage Buyers' })).toBeVisible();

      await expect(salesPageNew.buyerNameInput).toBeVisible();
      await expect(salesPageNew.addBuyerButton).toBeDisabled();

      await salesPageNew.buyerNameInput.fill(buyerName);
      await expect(salesPageNew.addBuyerButton).toBeEnabled();
      await salesPageNew.buyerGstinInput.fill('27ABCDE1234F1Z5');
      await salesPageNew.buyerAddressInput.fill('456 Test Avenue Mumbai');
      await salesPageNew.buyerPhoneInput.fill('9876543210');
      await salesPageNew.addBuyerButton.click();

      // Verify buyer appears in list
      await expect(
        page.getByRole('dialog').locator('ul li p').filter({ hasText: buyerName })
      ).toBeVisible({ timeout: 8000 });

      await salesPageNew.closeManageBuyers();
      await expect(salesPageNew.buyersDialog).not.toBeVisible();
    });

    // ── Step 4: Create Sale using an existing buyer from dropdown ──────────
    await test.step('Step 4 — Create a new sale using an existing buyer from dropdown', async () => {
      await salesPageNew.openNewSaleDialog();
      await expect(salesPageNew.saleDialogHeading).toBeVisible();
      await expect(salesPageNew.saveSaleButton).toBeDisabled();

      // Select first available existing buyer
      selectedBuyer = await salesPageNew.selectFirstBuyer();
      expect(selectedBuyer).toBeTruthy();
      await expect(salesPageNew.buyerCombobox).toContainText(selectedBuyer);

      await salesPageNew.invoiceInput.fill(invoiceNo);

      const itemName = await salesPageNew.selectFirstItem();
      expect(itemName).toBeTruthy();

      await salesPageNew.quantityInput.fill('10');
      await salesPageNew.rateInput.fill('150');

      await expect(salesPageNew.saveSaleButton).toBeEnabled();
      await salesPageNew.saveSale();

      await expect(salesPageNew.saleDialog).not.toBeVisible({ timeout: 10000 });
    });

    // ── Step 5: Verify Sale in table ───────────────────────────────────────
    await test.step('Step 5 — Verify sale appears in table with correct data', async () => {
      const row = page.locator('tbody tr').filter({ has: page.locator('td', { hasText: invoiceNo }) });
      await expect(row).toBeVisible({ timeout: 8000 });

      const cells = row.locator('td');
      await expect(cells.nth(0)).toContainText(/\d{4}-\d{2}-\d{2}/);
      await expect(cells.nth(1)).toHaveText(selectedBuyer);
      await expect(cells.nth(2)).toHaveText(invoiceNo);
      await expect(cells.nth(4)).toHaveText('10');
    });

    // ── Step 6: Edit Sale ──────────────────────────────────────────────────
    await test.step('Step 6 — Edit the sale using the stored invoice number', async () => {
      const rows     = page.locator('tbody tr');
      const rowCount = await rows.count();
      let targetIndex = 0;
      for (let i = 0; i < rowCount; i++) {
        const text = await rows.nth(i).locator('td').nth(2).textContent();
        if (text?.trim() === invoiceNo) { targetIndex = i; break; }
      }

      await salesPageNew.openEditDialog(targetIndex);
      await expect(salesPageNew.editDialogHeading).toBeVisible();

      // Verify pre-filled values
      await expect(salesPageNew.editInvoiceInput).toHaveValue(invoiceNo);
      await expect(salesPageNew.editQuantityInput).toHaveValue('10');

      // Update fields
      await salesPageNew.editInvoiceInput.fill(updatedInvoice);
      await salesPageNew.editQuantityInput.fill('20');
      await salesPageNew.editRateInput.fill('200');

      await expect(salesPageNew.saveSaleButton).toBeEnabled();
      await salesPageNew.saveSale();

      await expect(salesPageNew.saleDialog).not.toBeVisible({ timeout: 10000 });
    });

    // ── Step 7: Verify Updated Data ────────────────────────────────────────
    await test.step('Step 7 — Verify updated invoice and data in table', async () => {
      const updatedRow = page.locator('tbody tr').filter({ has: page.locator('td', { hasText: updatedInvoice }) });
      await expect(updatedRow).toBeVisible({ timeout: 8000 });

      await expect(updatedRow.locator('td').nth(1)).toHaveText(selectedBuyer);
      await expect(updatedRow.locator('td').nth(2)).toHaveText(updatedInvoice);
      await expect(updatedRow.locator('td').nth(4)).toHaveText('20');

      // Old invoice must no longer exist
      await expect(
        page.locator('tbody td').filter({ hasText: invoiceNo })
      ).not.toBeVisible();
    });

  });

});
