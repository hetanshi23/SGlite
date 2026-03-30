import { Page, Locator } from '@playwright/test';

export class DailyEntryPage {
  readonly page: Page;

  // Page structure
  readonly heading: Locator;
  readonly entriesTableHeading: Locator;

  // Tabs
  readonly productionTab: Locator;
  readonly purchasesTab: Locator;
  readonly salesTab: Locator;
  readonly stockAdjTab: Locator;

  // Production form
  readonly logProductionHeading: Locator;
  readonly processCombobox: Locator;
  readonly dateInput: Locator;
  readonly saveProductionButton: Locator;

  // Entries table
  readonly entriesTable: Locator;
  readonly entriesTableBody: Locator;

  // Delete confirmation dialog (Radix renders as role="alertdialog")
  readonly deleteDialog: Locator;
  readonly deleteDialogConfirmButton: Locator;
  readonly deleteDialogCancelButton: Locator;

  // Toasts
  readonly saveSuccessToast: Locator;
  readonly deleteSuccessToast: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading              = page.getByRole('heading', { name: 'Daily Entry', level: 1 });
    this.entriesTableHeading  = page.getByRole('heading', { name: /Entries for/ });
    this.logProductionHeading = page.getByRole('heading', { name: 'Log Production Batch' });

    this.productionTab = page.getByRole('tab', { name: 'Production' });
    this.purchasesTab  = page.getByRole('tab', { name: 'Purchases' });
    this.salesTab      = page.getByRole('tab', { name: 'Sales' });
    this.stockAdjTab   = page.getByRole('tab', { name: 'Stock Adj.' });

    this.processCombobox      = page.getByRole('combobox');
    this.dateInput            = page.locator('input[type="date"]');
    this.saveProductionButton = page.getByRole('button', { name: 'Save Production Entry' });

    this.entriesTable     = page.locator('table').filter({ has: page.locator('th', { hasText: 'Time' }) });
    this.entriesTableBody = page.locator('table').filter({ has: page.locator('th', { hasText: 'Time' }) }).locator('tbody');

    // Radix AlertDialog renders as role="alertdialog"
    this.deleteDialog              = page.getByRole('alertdialog');
    this.deleteDialogConfirmButton = page.getByRole('alertdialog').getByRole('button', { name: 'Delete' });
    this.deleteDialogCancelButton  = page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' });

    this.saveSuccessToast   = page.locator('li[role="status"]').filter({ hasText: 'Production entry saved' });
    this.deleteSuccessToast = page.locator('li[role="status"]').filter({ hasText: 'Production entry deleted' });
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/daily-entry');
    await this.page.waitForLoadState('networkidle');
    await this.heading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.page.getByRole('link', { name: 'Daily Entry' }).click();
    await this.page.waitForURL('**/daily-entry');
    await this.heading.waitFor({ state: 'visible' });
  }

  // ─── Tab ──────────────────────────────────────────────────────────────────

  async isProductionTabActive(): Promise<boolean> {
    return (await this.productionTab.getAttribute('aria-selected')) === 'true';
  }

  // ─── Dropdown ─────────────────────────────────────────────────────────────

  async getAvailableProcessOptions(): Promise<string[]> {
    await this.processCombobox.click();
    const options = this.page.locator('[role="option"]');
    await options.first().waitFor({ state: 'visible', timeout: 5000 });
    const count   = await options.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = ((await options.nth(i).textContent()) ?? '').trim();
      if (text) labels.push(text);
    }
    await this.page.keyboard.press('Escape');
    return labels;
  }

  async selectProcess(processName: string) {
    await this.processCombobox.click();
    await this.page.getByRole('option', { name: processName }).click();
  }

  async selectFirstAvailableProcess(): Promise<string> {
    await this.processCombobox.click();
    const firstOption = this.page.getByRole('option').first();
    const name = ((await firstOption.textContent()) ?? '').trim();
    await firstOption.click();
    return name;
  }

  // ─── Save ─────────────────────────────────────────────────────────────────

  async saveProductionEntry() {
    await this.saveProductionButton.click();
  }

  async fillNotes(notes: string) {
    await this.page.locator('textarea[placeholder="Any remarks about this batch..."]').fill(notes);
  }

  async scrollToEntriesTable() {
    await this.entriesTableHeading.scrollIntoViewIfNeeded();
    await this.entriesTable.waitFor({ state: 'visible' });
  }

  // ─── Table ────────────────────────────────────────────────────────────────

  async getTableRowCount(): Promise<number> {
    return await this.entriesTableBody.locator('tr').count();
  }

  // Waits until the row count is stable for 3 consecutive polls (600ms)
  // Handles lazy/streaming table loads on a shared live dataset
  async waitForTableStable(): Promise<number> {
    let previous = -1;
    let stableCount = 0;
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      const current = await this.entriesTableBody.locator('tr').count();
      stableCount = current === previous ? stableCount + 1 : 0;
      if (stableCount >= 3) return current;
      previous = current;
      await this.page.waitForTimeout(200);
    }
    return await this.entriesTableBody.locator('tr').count();
  }

  async waitForRowCountAtLeast(expectedMin: number) {
    await this.page.waitForFunction(
      (n) => document.querySelectorAll('tbody tr').length >= n,
      expectedMin,
      { timeout: 10000 }
    );
  }

  async waitForRowCountAtMost(expectedMax: number) {
    await this.page.waitForFunction(
      (n) => document.querySelectorAll('tbody tr').length <= n,
      expectedMax,
      { timeout: 10000 }
    );
  }

  async getFirstEntryRow(): Promise<{ time: string; type: string; details: string; amount: string }> {
    const cells = this.entriesTableBody.locator('tr').first().locator('td');
    return {
      time:    ((await cells.nth(0).textContent()) ?? '').trim(),
      type:    ((await cells.nth(1).textContent()) ?? '').trim(),
      details: ((await cells.nth(2).textContent()) ?? '').trim(),
      amount:  ((await cells.nth(3).textContent()) ?? '').trim(),
    };
  }

  // Checks if a row with both matching time AND details exists in the table
  async specificEntryExistsInTable(time: string, details: string): Promise<boolean> {
    const rows  = this.entriesTableBody.locator('tr');
    const count = await rows.count();
    if (count === 0) return false;
    for (let i = 0; i < count; i++) {
      const cells   = rows.nth(i).locator('td');
      const cellCount = await cells.count();
      if (cellCount < 3) continue;
      const rowTime = ((await cells.nth(0).textContent()) ?? '').trim();
      const rowDet  = ((await cells.nth(2).textContent()) ?? '').trim();
      if (rowTime === time && rowDet === details) return true;
    }
    return false;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  getDeleteButtonForRow(rowIndex: number): Locator {
    return this.entriesTableBody.locator('tr').nth(rowIndex).locator('td').last().locator('button');
  }

  async deleteEntry(rowIndex: number) {
    await this.getDeleteButtonForRow(rowIndex).click();
    await this.deleteDialog.waitFor({ state: 'visible', timeout: 5000 });
    await this.deleteDialogConfirmButton.click();
  }
}
