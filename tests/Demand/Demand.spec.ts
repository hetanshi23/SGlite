import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Demand Page - Workflow', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test('Login → Navigate → Verify UI → Add Demand → Verify Table → Edit Demand → Verify Updated', async ({
    demandPage,
    page,
  }) => {

    const today      = new Date().toISOString().split('T')[0];
    const updatedQty = '999';
    let   addedItem  = '';
    let   addedRowIndex = 0;

    // ── Step 1: Navigate to Demand via sidebar ─────────────────────────────
    await test.step('Step 1 — Navigate to Demand page via sidebar', async () => {
      await demandPage.navigateFromSidebar();

      await expect(page).toHaveURL(/\/demand/);
      await expect(demandPage.pageHeading).toBeVisible();
      await expect(demandPage.pageHeading).toHaveText('Demand');
      await expect(demandPage.addDemandButton).toBeVisible();
      await expect(demandPage.addDemandButton).toBeEnabled();
    });

    // ── Step 2: Verify page UI ─────────────────────────────────────────────
    await test.step('Step 2 — Verify page UI elements', async () => {
      await expect(demandPage.table).toBeVisible();

      const headers = page.locator('th');
      await expect(headers.nth(0)).toHaveText('Item');
      await expect(headers.nth(1)).toHaveText('Quantity');
      await expect(headers.nth(2)).toHaveText('Date');
      await expect(headers.nth(3)).toHaveText('Actions');
    });

    // ── Step 3: Open Add Demand dialog and verify form elements ────────────
    await test.step('Step 3 — Open Add Demand dialog and verify form elements', async () => {
      await demandPage.openAddDemandDialog();

      await expect(demandPage.dialog).toBeVisible();
      await expect(demandPage.addDialogHeading).toBeVisible();
      await expect(demandPage.itemCombobox).toBeVisible();
      await expect(demandPage.quantityInput).toBeVisible();
      await expect(demandPage.dateInput).toBeVisible();

      // Save disabled until item is selected
      await expect(demandPage.saveButton).toBeDisabled();
      await expect(demandPage.itemCombobox).toContainText('Select item');

      await demandPage.closeButton.click();
      await expect(demandPage.dialog).not.toBeVisible();
    });

    // ── Step 4: Add a new demand entry ─────────────────────────────────────
    await test.step('Step 4 — Add a new demand entry', async () => {
      const rowsBefore = await demandPage.waitForTableStable();

      await demandPage.openAddDemandDialog();

      // Select first available item
      addedItem = await demandPage.selectFirstItem();
      expect(addedItem).toBeTruthy();
      await expect(demandPage.itemCombobox).toContainText(addedItem);

      // Fill quantity and date
      await demandPage.quantityInput.fill('100');
      await demandPage.dateInput.fill(today);

      await expect(demandPage.saveButton).toBeEnabled();
      await demandPage.saveButton.click();

      // Dialog closes after save
      await expect(demandPage.dialog).not.toBeVisible({ timeout: 8000 });

      // Row count increased by 1
      const rowsAfter = await demandPage.waitForTableStable();
      expect(rowsAfter).toBe(rowsBefore + 1);
    });

    // ── Step 5: Verify entry in table ──────────────────────────────────────
    await test.step('Step 5 — Verify demand entry appears in table with correct data', async () => {
      await expect(demandPage.table).toBeVisible();

      // Find the row matching item name AND today's date to avoid picking stale rows
      const rows = page.locator('tbody tr').filter({ has: page.locator('td', { hasText: addedItem }) });
      const rowCount = await rows.count();
      let targetRow = rows.first();
      for (let i = 0; i < rowCount; i++) {
        const qty = await rows.nth(i).locator('td').nth(1).textContent();
        if (qty?.trim() === '100') { targetRow = rows.nth(i); break; }
      }
      await expect(targetRow).toBeVisible({ timeout: 8000 });

      const cells = targetRow.locator('td');
      await expect(cells.nth(0)).toHaveText(addedItem);
      await expect(cells.nth(1)).toHaveText('100');
      await expect(cells.nth(2)).toContainText(/\d{4}-\d{2}-\d{2}/);
    });

    // ── Step 6: Edit the demand entry ──────────────────────────────────────
    await test.step('Step 6 — Edit the demand entry and update quantity', async () => {
      addedRowIndex = await demandPage.findRowIndexByItemAndQty(addedItem, '100');

      await demandPage.openEditDialog(addedRowIndex);
      await expect(demandPage.editDialogHeading).toBeVisible();

      // Verify pre-filled values
      await expect(demandPage.itemCombobox).toContainText(addedItem);
      await expect(demandPage.quantityInput).toHaveValue('100');

      // Update quantity
      await demandPage.quantityInput.fill(updatedQty);
      await expect(demandPage.saveButton).toBeEnabled();
      await demandPage.saveButton.click();

      await expect(demandPage.dialog).not.toBeVisible({ timeout: 8000 });
    });

    // ── Step 7: Verify updated data in table ───────────────────────────────
    await test.step('Step 7 — Verify updated quantity appears in table', async () => {
      const row = page.locator('tbody tr').filter({ has: page.locator('td', { hasText: addedItem }) }).first();
      await expect(row).toBeVisible({ timeout: 8000 });

      await expect(row.locator('td').nth(0)).toHaveText(addedItem);
      await expect(row.locator('td').nth(1)).toHaveText(updatedQty);
    });

  });

});
