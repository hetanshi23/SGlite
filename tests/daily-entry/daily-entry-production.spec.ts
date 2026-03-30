import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

test.describe('Daily Entry - Production Tab Workflow', () => {

  test.beforeEach(async ({ page }) => {
    // Clear session first to avoid redirect loop on retry
    await page.evaluate(() => localStorage.clear()).catch(() => {});
    await page.goto('https://sglite.lovable.app/auth', { timeout: 60000 });
    await page.waitForLoadState('networkidle');
    await page.locator('#email').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#email').fill(testData.validUser.email);
    await page.locator('#password').fill(testData.validUser.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/', { timeout: 15000 });
  });

  test('Login → Navigate to Daily Entry → Add Production Entry → Validate → Delete', async ({
    dailyEntryPage,
    page,
  }) => {

    // ── Step 1: Navigate to Daily Entry via sidebar ────────────────────────
    await test.step('Step 1 — Navigate to Daily Entry page via sidebar', async () => {
      await dailyEntryPage.navigateFromSidebar();

      await expect(page).toHaveURL(/\/daily-entry/, { timeout: 8000 });
      await expect(dailyEntryPage.heading).toBeVisible({ timeout: 5000 });
      await expect(dailyEntryPage.heading).toHaveText('Daily Entry');
    });

    // ── Step 2: Verify Production tab is active ────────────────────────────
    await test.step('Step 2 — Verify Production tab is active and form is visible', async () => {
      if (!(await dailyEntryPage.isProductionTabActive())) {
        await dailyEntryPage.productionTab.click();
      }
      await expect(dailyEntryPage.productionTab).toHaveAttribute('aria-selected', 'true', { timeout: 5000 });
      await expect(dailyEntryPage.logProductionHeading).toBeVisible({ timeout: 5000 });
      await expect(dailyEntryPage.processCombobox).toBeVisible({ timeout: 5000 });
      await expect(dailyEntryPage.saveProductionButton).toBeVisible({ timeout: 5000 });
      await expect(dailyEntryPage.saveProductionButton).toBeDisabled({ timeout: 5000 });
    });

    // ── Step 3: Select process and fill notes ──────────────────────────────
    await test.step('Step 3 — Select process from dropdown and fill notes', async () => {
      const options = await dailyEntryPage.getAvailableProcessOptions();
      expect(options.length).toBeGreaterThan(0);
      expect(options).toContain('PET Sheet Manufacturing');
      expect(options).toContain('PET Box Manufacturing');

      const selectedProcess = await dailyEntryPage.selectFirstAvailableProcess();
      expect(selectedProcess.length).toBeGreaterThan(0);
      await expect(dailyEntryPage.processCombobox).toContainText(selectedProcess, { timeout: 5000 });

      await dailyEntryPage.fillNotes('Automated test batch entry');
    });

    // ── Step 4: Scroll until Save button is visible ────────────────────────
    await test.step('Step 4 — Scroll until Save Production Entry button is visible', async () => {
      await page.evaluate(() => {
        const btn = document.querySelector('button[type="submit"]');
        if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      await dailyEntryPage.saveProductionButton.waitFor({ state: 'visible', timeout: 5000 });
      await expect(dailyEntryPage.saveProductionButton).toBeInViewport({ timeout: 5000 });
      await expect(dailyEntryPage.saveProductionButton).toBeEnabled({ timeout: 5000 });
    });

    // ── Step 5: Click Save and handle success or stock error ───────────────
    let savedEntryTime    = '';
    let savedEntryDetails = '';

    await test.step('Step 5 — Click Save Production Entry and handle response', async () => {
      await dailyEntryPage.saveProductionEntry();

      const anyToast = page.locator('li[role="status"]');
      await expect(anyToast).toBeVisible({ timeout: 8000 });

      const toastText = await anyToast.textContent();
      console.log('Toast message:', toastText);

      if (toastText?.includes('Production entry saved')) {
        await expect(dailyEntryPage.saveSuccessToast).toBeVisible({ timeout: 8000 });
        await expect(dailyEntryPage.saveSuccessToast).toHaveText('Production entry saved');
      } else {
        await expect(anyToast).toContainText('Insufficient stock', { timeout: 5000 });
        console.log('Stock validation triggered:', toastText);
        await expect(dailyEntryPage.processCombobox).toBeVisible({ timeout: 5000 });
      }
    });

    // ── Step 6: Assert entry added in table ───────────────────────────────
    await test.step('Step 6 — Assert production entry appears in entries table', async () => {
      await dailyEntryPage.scrollToEntriesTable();
      await dailyEntryPage.waitForTableStable();

      const rowCount = await dailyEntryPage.getTableRowCount();
      expect(rowCount).toBeGreaterThan(0);

      const firstEntry = await dailyEntryPage.getFirstEntryRow();
      expect(firstEntry.time.length).toBeGreaterThan(0);
      expect(firstEntry.type).toBe('Production');
      expect(firstEntry.details.length).toBeGreaterThan(0);
      expect(firstEntry.amount.length).toBeGreaterThan(0);
      expect(firstEntry.amount.toLowerCase()).toContain('out');

      // Store for delete verification
      savedEntryTime    = firstEntry.time;
      savedEntryDetails = firstEntry.details;

      await expect(page.getByRole('columnheader', { name: 'Time' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Details' })).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('columnheader', { name: 'Amount / Qty' })).toBeVisible({ timeout: 5000 });
    });

    // ── Step 7: Delete the recently added entry ────────────────────────────
    await test.step('Step 7 — Delete the recently added production entry', async () => {
      await dailyEntryPage.getDeleteButtonForRow(0).click();

      await expect(dailyEntryPage.deleteDialog).toBeVisible({ timeout: 5000 });
      await expect(dailyEntryPage.deleteDialog).toContainText('Are you sure?', { timeout: 5000 });
      await expect(dailyEntryPage.deleteDialog).toContainText('This action cannot be undone', { timeout: 5000 });
      await dailyEntryPage.deleteDialogConfirmButton.click();

      await expect(dailyEntryPage.deleteSuccessToast).toBeVisible({ timeout: 8000 });
      await expect(dailyEntryPage.deleteSuccessToast).toHaveText('Production entry deleted');

      // Verify deleted entry no longer exists — avoids flaky row count check on shared table
      await dailyEntryPage.waitForTableStable();
      const exists = await dailyEntryPage.specificEntryExistsInTable(savedEntryTime, savedEntryDetails);
      expect(exists).toBe(false);
    });

  });

});
