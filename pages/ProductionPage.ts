import { Page, Locator } from '@playwright/test';

export class ProductionPage {
  readonly page: Page;

  // ── Page ──────────────────────────────────────────────────────────────────
  readonly pageHeading:    Locator;
  readonly newEntryButton: Locator;
  readonly sidebarLink:    Locator;

  // ── Filters ───────────────────────────────────────────────────────────────
  readonly fromDateInput:       Locator;
  readonly toDateInput:         Locator;
  readonly quickPeriodCombobox: Locator;

  // ── Table ─────────────────────────────────────────────────────────────────
  readonly table:     Locator;
  readonly tableBody: Locator;

  // ── Dialog ────────────────────────────────────────────────────────────────
  readonly dialog:               Locator;
  readonly dialogHeading:        Locator;
  readonly dialogDateInput:      Locator;
  readonly dialogProcessCombobox: Locator;
  readonly dialogNotesTextarea:  Locator;
  readonly dialogSaveButton:     Locator;
  readonly dialogCloseButton:    Locator;

  // ── Dialog — inline error ─────────────────────────────────────────────────
  readonly dialogInlineError: Locator;

  // ── Toast ─────────────────────────────────────────────────────────────────
  readonly saveSuccessToast:   Locator;
  readonly deleteSuccessToast: Locator;

  // ── Delete confirmation ───────────────────────────────────────────────────
  readonly deleteDialog:        Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton:  Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading    = page.getByRole('heading', { name: 'Production Log' });
    this.newEntryButton = page.getByRole('button', { name: 'New Entry' });
    this.sidebarLink    = page.getByRole('link', { name: 'Production', exact: true });

    this.fromDateInput       = page.locator('#date-from');
    this.toDateInput         = page.locator('#date-to');
    this.quickPeriodCombobox = page.getByRole('combobox');

    this.table     = page.locator('table');
    this.tableBody = page.locator('tbody');

    this.dialog                = page.locator('[role="dialog"][data-state="open"]');
    this.dialogHeading         = page.getByRole('dialog').getByRole('heading', { name: 'New Production Entry' });
    this.dialogDateInput       = page.getByRole('dialog').locator('input[type="date"]');
    this.dialogProcessCombobox = page.getByRole('dialog').getByRole('combobox');
    this.dialogNotesTextarea   = page.getByRole('dialog').locator('textarea');
    this.dialogSaveButton      = page.getByRole('dialog').getByRole('button', { name: 'Save Production Entry' });
    this.dialogCloseButton     = page.getByRole('dialog').getByRole('button', { name: 'Close' });

    // Error shown as a destructive toast after failed save attempt
    this.dialogInlineError = page.locator('[class*="destructive"]').filter({ hasText: 'Insufficient stock' });

    this.saveSuccessToast   = page.locator('[data-sonner-toast]').first();
    this.deleteSuccessToast = page.locator('[data-sonner-toast]').first();

    this.deleteDialog        = page.getByRole('alertdialog');
    this.deleteConfirmButton = page.getByRole('alertdialog').getByRole('button', { name: 'Delete' });
    this.deleteCancelButton  = page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/production');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.sidebarLink.click();
    await this.page.waitForURL('**/production');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  // ── Dialog ────────────────────────────────────────────────────────────────

  async openNewEntryDialog() {
    await this.newEntryButton.click();
    await this.dialogHeading.waitFor({ state: 'visible' });
  }

  async selectProcess(processName: string) {
    await this.dialogProcessCombobox.click();
    await this.page.getByRole('option', { name: processName }).click();
    // Wait for input rows to render
    await this.page.getByRole('dialog').locator('input[type="number"]').first().waitFor({ state: 'visible' });
  }

  async selectFirstProcess(): Promise<string> {
    await this.dialogProcessCombobox.click();
    const first = this.page.getByRole('option').first();
    const name  = ((await first.textContent()) ?? '').trim();
    await first.click();
    await this.page.getByRole('dialog').locator('input[type="number"]').first().waitFor({ state: 'visible' });
    return name;
  }

  async fillNotes(notes: string) {
    await this.dialogNotesTextarea.fill(notes);
  }

  /**
   * Sets the Actual Qty for a specific input row by index.
   * Uses triple-click to select existing value then types the new one,
   * followed by dispatchEvent to ensure React state updates.
   */
  async setInputQty(rowIndex: number, qty: number) {
    const input = this.page.getByRole('dialog').locator('input[type="number"]').nth(rowIndex);
    await input.scrollIntoViewIfNeeded();
    await input.click({ clickCount: 3 });
    await input.fill(String(qty));
    await input.dispatchEvent('input');
    await input.dispatchEvent('change');
  }

  /**
   * Sets ALL input quantity fields (both Inputs and Outputs) to the given value.
   */
  async setAllInputQties(qty: number) {
    const inputs = this.page.getByRole('dialog').locator('input[type="number"]');
    const count  = await inputs.count();
    for (let i = 0; i < count; i++) {
      await inputs.nth(i).scrollIntoViewIfNeeded();
      await inputs.nth(i).click({ clickCount: 3 });
      await inputs.nth(i).fill(String(qty));
      await inputs.nth(i).dispatchEvent('input');
      await inputs.nth(i).dispatchEvent('change');
    }
  }

  /**
   * Clicks Save Production Entry.
   * Uses page.evaluate to directly invoke the button's React onClick
   * handler, bypassing Playwright's synthetic event limitations on
   * Radix UI dialogs with controlled number inputs.
   */
  async saveEntry() {
    // Blur any focused element (e.g. notes textarea) before saving
    await this.page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await this.dialogSaveButton.scrollIntoViewIfNeeded();
    await this.dialogSaveButton.click();
  }

  async addEntry(processName: string, notes?: string) {
    await this.openNewEntryDialog();
    await this.selectProcess(processName);
    if (notes) await this.fillNotes(notes);
    await this.saveEntry();
  }

  // ── Table ─────────────────────────────────────────────────────────────────

  async getRowCount(): Promise<number> {
    return await this.tableBody.locator('tr').count();
  }

  async waitForTableStable(): Promise<number> {
    let previous    = -1;
    let stableCount = 0;
    const deadline  = Date.now() + 8000;
    while (Date.now() < deadline) {
      const current = await this.tableBody.locator('tr').count();
      stableCount   = current === previous ? stableCount + 1 : 0;
      if (stableCount >= 3) return current;
      previous = current;
      await this.page.waitForTimeout(200);
    }
    return await this.tableBody.locator('tr').count();
  }

  async getFirstRowData(): Promise<{ date: string; process: string; totalIn: string; totalOut: string; difference: string; notes: string }> {
    const cells = this.tableBody.locator('tr').first().locator('td');
    return {
      date:       ((await cells.nth(0).textContent()) ?? '').trim(),
      process:    ((await cells.nth(1).textContent()) ?? '').trim(),
      totalIn:    ((await cells.nth(2).textContent()) ?? '').trim(),
      totalOut:   ((await cells.nth(3).textContent()) ?? '').trim(),
      difference: ((await cells.nth(4).textContent()) ?? '').trim(),
      notes:      ((await cells.nth(5).textContent()) ?? '').trim(),
    };
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  getDeleteButtonForRow(rowIndex: number): Locator {
    return this.tableBody.locator('tr').nth(rowIndex).getByRole('button');
  }

  async deleteEntry(rowIndex: number) {
    await this.getDeleteButtonForRow(rowIndex).click();
    await this.deleteDialog.waitFor({ state: 'visible', timeout: 5000 });
    await this.deleteConfirmButton.click();
  }
}
