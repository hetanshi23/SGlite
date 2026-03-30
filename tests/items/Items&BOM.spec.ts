import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Items & BOM Page - Full Workflow', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test('Login → Navigate → Verify UI → Verify Tabs → Add Item → Verify Table → Edit Item → Verify Updated → Validate BOM', async ({
    itemsBomPage,
    page,
  }) => {

    const ts          = Date.now().toString().slice(-6);
    const itemName    = `TestItem${ts}`;
    const updatedName = `EditItem${ts}`;

    // ── Step 1: Navigate to Items & BOM via sidebar ────────────────────────
    await test.step('Step 1 — Navigate to Items & BOM page via sidebar', async () => {
      await itemsBomPage.navigateFromSidebar();

      await expect(page).toHaveURL(/\/items/);
      await expect(itemsBomPage.pageHeading).toBeVisible();
      await expect(itemsBomPage.pageHeading).toHaveText('Items & BOM');
      await expect(itemsBomPage.addItemButton).toBeVisible();
      await expect(itemsBomPage.addItemButton).toBeEnabled();
    });

    // ── Step 2: Verify page UI elements ───────────────────────────────────
    await test.step('Step 2 — Verify page UI — tabs, table headers and BOM section', async () => {
      // All 4 category tabs visible
      await expect(itemsBomPage.rawMaterialsTab).toBeVisible();
      await expect(itemsBomPage.intermediateTab).toBeVisible();
      await expect(itemsBomPage.finishedTab).toBeVisible();
      await expect(itemsBomPage.byproductTab).toBeVisible();

      // Raw Materials tab active by default
      await expect(itemsBomPage.rawMaterialsTab).toHaveAttribute('aria-selected', 'true');

      // Table column headers using role-based selectors
      await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Unit' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'HSN' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'GST %' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Min Threshold' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();

      // BOM section visible
      await expect(itemsBomPage.bomHeading).toBeVisible();
    });

    // ── Step 3: Verify all category tabs switch correctly ──────────────────
    await test.step('Step 3 — Verify all category tabs switch and show table', async () => {
      await itemsBomPage.intermediateTab.click();
      await expect(itemsBomPage.intermediateTab).toHaveAttribute('aria-selected', 'true');
      await expect(itemsBomPage.table).toBeVisible();

      await itemsBomPage.finishedTab.click();
      await expect(itemsBomPage.finishedTab).toHaveAttribute('aria-selected', 'true');
      await expect(itemsBomPage.table).toBeVisible();

      await itemsBomPage.byproductTab.click();
      await expect(itemsBomPage.byproductTab).toHaveAttribute('aria-selected', 'true');
      await expect(itemsBomPage.table).toBeVisible();

      // Return to Raw Materials for next steps
      await itemsBomPage.rawMaterialsTab.click();
      await expect(itemsBomPage.rawMaterialsTab).toHaveAttribute('aria-selected', 'true');
    });

    // ── Step 4: Open Add Item dialog and verify form elements ──────────────
    await test.step('Step 4 — Open Add Item dialog and verify all form fields', async () => {
      await itemsBomPage.openAddItemDialog();

      await expect(itemsBomPage.dialog).toBeVisible();
      await expect(itemsBomPage.addDialogHeading).toHaveText('Add Item');
      await expect(itemsBomPage.nameInput).toBeVisible();
      await expect(itemsBomPage.categoryCombobox).toBeVisible();
      await expect(itemsBomPage.categoryCombobox).toContainText('Raw Material');
      await expect(itemsBomPage.unitInput).toBeVisible();
      await expect(itemsBomPage.hsnInput).toBeVisible();
      await expect(itemsBomPage.gstInput).toBeVisible();
      await expect(itemsBomPage.minThresholdInput).toBeVisible();
      await expect(itemsBomPage.saveButton).toBeDisabled();

      await itemsBomPage.closeButton.click();
      await expect(itemsBomPage.dialog).not.toBeVisible();
    });

    // ── Step 5: Add a new Raw Material item ───────────────────────────────
    await test.step('Step 5 — Add a new Raw Material item with all fields', async () => {
      const rowsBefore = await itemsBomPage.waitForTableStable();

      await itemsBomPage.openAddItemDialog();
      await itemsBomPage.nameInput.fill(itemName);
      await itemsBomPage.unitInput.fill('kg');
      await itemsBomPage.hsnInput.fill('39076100');
      await itemsBomPage.gstInput.fill('18');
      await itemsBomPage.minThresholdInput.fill('50');

      await expect(itemsBomPage.saveButton).toBeEnabled();
      await itemsBomPage.saveButton.click();
      await expect(itemsBomPage.dialog).not.toBeVisible({ timeout: 8000 });

      const rowsAfter = await itemsBomPage.waitForTableStable();
      expect(rowsAfter).toBe(rowsBefore + 1);
    });

    // ── Step 6: Verify item in table with role-based assertions ───────────
    await test.step('Step 6 — Verify new item appears in table with correct data', async () => {
      const row = page.locator('tbody tr').filter({ has: page.locator('td', { hasText: itemName }) }).first();
      await expect(row).toBeVisible({ timeout: 8000 });

      await expect(row.getByRole('cell', { name: itemName })).toHaveText(itemName);
      await expect(row.getByRole('cell', { name: 'kg' })).toHaveText('kg');
      await expect(row.getByRole('cell', { name: '39076100' })).toHaveText('39076100');
      await expect(row.getByRole('cell', { name: '18' })).toContainText('18');
      await expect(row.getByRole('cell', { name: '50' })).toHaveText('50');
    });

    // ── Step 7: Edit the item ──────────────────────────────────────────────
    await test.step('Step 7 — Edit the item and update name and threshold', async () => {
      const rowIndex = await itemsBomPage.findRowIndexByName(itemName);
      expect(rowIndex).toBeGreaterThanOrEqual(0);

      await itemsBomPage.openEditDialog(rowIndex);
      await expect(itemsBomPage.editDialogHeading).toHaveText('Edit Item');

      // Verify pre-filled values
      await expect(itemsBomPage.nameInput).toHaveValue(itemName);
      await expect(itemsBomPage.unitInput).toHaveValue('kg');
      await expect(itemsBomPage.hsnInput).toHaveValue('39076100');
      await expect(itemsBomPage.gstInput).toHaveValue('18');
      await expect(itemsBomPage.minThresholdInput).toHaveValue('50');

      // Update name and threshold
      await itemsBomPage.nameInput.fill(updatedName);
      await itemsBomPage.minThresholdInput.fill('100');

      await expect(itemsBomPage.saveButton).toBeEnabled();
      await itemsBomPage.saveButton.click();
      await expect(itemsBomPage.dialog).not.toBeVisible({ timeout: 8000 });
    });

    // ── Step 8: Verify updated item in table ───────────────────────────────
    await test.step('Step 8 — Verify updated item name and threshold in table', async () => {
      const updatedRow = page.locator('tbody tr').filter({ has: page.locator('td', { hasText: updatedName }) }).first();
      await expect(updatedRow).toBeVisible({ timeout: 8000 });

      await expect(updatedRow.getByRole('cell', { name: updatedName })).toHaveText(updatedName);
      await expect(updatedRow.locator('td').nth(4)).toHaveText('100');

      // Old name must no longer exist
      await expect(page.locator('tbody td').filter({ hasText: itemName })).not.toBeVisible();
    });

    // ── Step 9: Validate BOM section — Stage headings and badges ──────────
    await test.step('Step 9 — Validate BOM section headings and input/output counts', async () => {
      await expect(itemsBomPage.bomHeading).toBeVisible();

      // Stage 1 heading and badge
      await expect(itemsBomPage.stage1Heading).toBeVisible();
      await expect(itemsBomPage.stage1Heading).toContainText('Stage 1: PET Sheet Manufacturing');
      await expect(itemsBomPage.stage1Badge).toContainText('6 inputs, 2 outputs');

      // Stage 2 heading and badge
      await expect(itemsBomPage.stage2Heading).toBeVisible();
      await expect(itemsBomPage.stage2Heading).toContainText('Stage 2: PET Box Manufacturing');
      await expect(itemsBomPage.stage2Badge).toContainText('2 inputs, 2 outputs');
    });

    // ── Step 10: Expand Stage 1 and validate Inputs, Outputs, Byproduct ───
    await test.step('Step 10 — Expand Stage 1 and validate Inputs and Outputs tables', async () => {
      await itemsBomPage.expandStage(1);

      // Add BOM Entry button visible after expand
      await expect(itemsBomPage.addBomEntryButton).toBeVisible();

      // Inputs section heading
      await expect(page.locator('h4').filter({ hasText: 'Inputs' })).toBeVisible();

      // Validate specific input items
      const inputsTable = itemsBomPage.getStageInputsTable();
      await expect(inputsTable).toHaveCount(6);

      const inputItems = await inputsTable.locator('td').nth(0).allTextContents().catch(async () => {
        const rows = inputsTable;
        const count = await rows.count();
        const names: string[] = [];
        for (let i = 0; i < count; i++) {
          names.push(((await rows.nth(i).locator('td').nth(0).textContent()) ?? '').trim());
        }
        return names;
      });

      // Verify key input items exist
      await expect(inputsTable.filter({ has: page.locator('td', { hasText: 'PET Granules' }) })).toBeVisible();
      await expect(inputsTable.filter({ has: page.locator('td', { hasText: 'PET Flakes' }) })).toBeVisible();
      await expect(inputsTable.filter({ has: page.locator('td', { hasText: 'Master Batch' }) })).toBeVisible();
      await expect(inputsTable.filter({ has: page.locator('td', { hasText: 'Color Additive' }) })).toBeVisible();

      // Verify input quantities
      await expect(inputsTable.filter({ has: page.locator('td', { hasText: 'PET Granules' }) }).locator('td').nth(1)).toHaveText('200 kg');
      await expect(inputsTable.filter({ has: page.locator('td', { hasText: 'PET Flakes' }) }).locator('td').nth(1)).toHaveText('200 kg');

      // Outputs section heading
      await expect(page.locator('h4').filter({ hasText: 'Outputs' })).toBeVisible();

      // Validate output items
      const outputsTable = itemsBomPage.getStageOutputsTable();
      await expect(outputsTable).toHaveCount(2);

      await expect(outputsTable.filter({ has: page.locator('td', { hasText: 'PET Sheet' }) })).toBeVisible();
      await expect(outputsTable.filter({ has: page.locator('td', { hasText: 'Sheet Waste' }) })).toBeVisible();

      // Verify output quantities
      await expect(outputsTable.filter({ has: page.locator('td', { hasText: 'PET Sheet' }) }).locator('td').nth(1)).toHaveText('400 kg');
      await expect(outputsTable.filter({ has: page.locator('td', { hasText: 'Sheet Waste' }) }).locator('td').nth(1)).toHaveText('25 kg');

      // Validate Byproduct column — PET Sheet is not byproduct, Sheet Waste is
      await expect(outputsTable.filter({ has: page.locator('td', { hasText: 'PET Sheet' }) }).locator('td').nth(2)).toHaveText('-');
      await expect(outputsTable.filter({ has: page.locator('td', { hasText: 'Sheet Waste' }) }).locator('td').nth(2)).toContainText('Yes');
    });

    // ── Step 11: Validate Stage 2 and business logic (Stage 1 output → Stage 2 input) ──
    await test.step('Step 11 — Expand Stage 2 and validate business logic chain', async () => {
      await itemsBomPage.expandStage(2);

      // Stage 2 inputs table
      const stage2Inputs = itemsBomPage.getStageInputsTable();
      await expect(stage2Inputs).toHaveCount(2);

      // PET Sheet (Stage 1 output) must appear as Stage 2 input — business logic chain
      await expect(stage2Inputs.filter({ has: page.locator('td', { hasText: 'PET Sheet' }) })).toBeVisible();

      // Stage 2 outputs
      const stage2Outputs = itemsBomPage.getStageOutputsTable();
      await expect(stage2Outputs).toHaveCount(2);

      // PET Box is the finished product output
      await expect(stage2Outputs.filter({ has: page.locator('td', { hasText: 'PET Box' }) })).toBeVisible();
    });

  });

});
