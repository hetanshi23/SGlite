import { Page, Locator } from '@playwright/test';

export class SalesPage {
  readonly page: Page;

  // ── Page / Tab structure ───────────────────────────────────────────────────
  readonly formHeading: Locator;
  readonly entriesTableHeading: Locator;
  readonly entriesTable: Locator;
  readonly entriesTableBody: Locator;

  // ── Form fields ───────────────────────────────────────────────────────────
  readonly dateInput: Locator;
  readonly buyerCombobox: Locator;
  readonly invoiceInput: Locator;
  readonly itemCombobox: Locator;
  readonly quantityInput: Locator;
  readonly rateInput: Locator;
  // Editable tax fields
  readonly igstInput: Locator;
  readonly cgstInput: Locator;
  readonly sgstInput: Locator;
  // Read-only computed fields (input[readonly], no type attribute)
  readonly taxableValueInput: Locator;
  readonly totalInput: Locator;

  readonly saveSaleButton: Locator;

  // ── Delete confirmation (Radix AlertDialog) ───────────────────────────────
  readonly deleteDialog: Locator;
  readonly deleteDialogConfirmButton: Locator;
  readonly deleteDialogCancelButton: Locator;

  // ── Toasts ────────────────────────────────────────────────────────────────
  readonly saveSuccessToast: Locator;
  readonly deleteSuccessToast: Locator;

  constructor(page: Page) {
    this.page = page;

    this.formHeading         = page.getByRole('heading', { name: 'Record Sale' });
    this.entriesTableHeading = page.getByRole('heading', { name: /Entries for/ });
    this.entriesTable        = page.locator('table');
    this.entriesTableBody    = page.locator('tbody');

    this.dateInput    = page.locator('input[type="date"]');
    this.buyerCombobox = page.getByRole('combobox').first();
    this.invoiceInput = page.locator('input[placeholder="e.g. INV-001"]');
    this.itemCombobox = page.getByRole('combobox').nth(1);
    // Number inputs in DOM order: qty[0], rate[1], igst[2], cgst[3], sgst[4]
    this.quantityInput = page.locator('input[type="number"]').nth(0);
    this.rateInput     = page.locator('input[type="number"]').nth(1);
    this.igstInput     = page.locator('input[type="number"]').nth(2);
    this.cgstInput     = page.locator('input[type="number"]').nth(3);
    this.sgstInput     = page.locator('input[type="number"]').nth(4);
    // Read-only computed: input[readonly] — no type attribute
    this.taxableValueInput = page.locator('input[readonly]').nth(0);
    this.totalInput        = page.locator('input[readonly]').nth(1);

    this.saveSaleButton = page.getByRole('button', { name: 'Save Sale' });

    this.deleteDialog              = page.getByRole('alertdialog');
    this.deleteDialogConfirmButton = page.getByRole('alertdialog').getByRole('button', { name: 'Delete' });
    this.deleteDialogCancelButton  = page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' });

    this.saveSuccessToast   = page.locator('li[role="status"]').filter({ hasText: 'Sale recorded' });
    this.deleteSuccessToast = page.locator('li[role="status"]').filter({ hasText: 'Sale deleted' });
  }

  // ── Dropdown helpers ──────────────────────────────────────────────────────

  async selectFirstBuyer(): Promise<string> {
    await this.buyerCombobox.click();
    const first = this.page.getByRole('option').first();
    const name  = ((await first.textContent()) ?? '').trim();
    await first.click();
    return name;
  }

  async selectFirstItem(): Promise<string> {
    await this.itemCombobox.click();
    const first = this.page.getByRole('option').first();
    const name  = ((await first.textContent()) ?? '').trim();
    await first.click();
    return name;
  }

  // ── Form fill ─────────────────────────────────────────────────────────────

  async fillSaleForm(data: {
    invoiceNo: string;
    quantity: string;
    rate: string;
  }): Promise<{ buyer: string; item: string }> {
    const buyer = await this.selectFirstBuyer();
    await this.invoiceInput.fill(data.invoiceNo);
    const item = await this.selectFirstItem();
    await this.quantityInput.fill(data.quantity);
    await this.rateInput.fill(data.rate);
    return { buyer, item };
  }

  // Resets the form by clicking away to another tab then back to Sales
  async resetFormByTabSwitch() {
    await this.page.getByRole('tab', { name: 'Production' }).click();
    await this.page.waitForTimeout(300);
    await this.page.getByRole('tab', { name: 'Sales' }).click();
    await this.formHeading.waitFor({ state: 'visible' });
  }

  async saveSale() {
    await this.saveSaleButton.click();
  }

  async scrollToEntriesTable() {
    await this.entriesTableHeading.scrollIntoViewIfNeeded();
    await this.entriesTable.waitFor({ state: 'visible' });
  }

  // ── Table helpers ─────────────────────────────────────────────────────────

  async getTableRowCount(): Promise<number> {
    return await this.entriesTableBody.locator('tr').count();
  }

  // Polls until row count is stable for 3 consecutive 200ms ticks
  async waitForTableStable(): Promise<number> {
    let previous    = -1;
    let stableCount = 0;
    const deadline  = Date.now() + 8000;
    while (Date.now() < deadline) {
      const current = await this.entriesTableBody.locator('tr').count();
      stableCount   = current === previous ? stableCount + 1 : 0;
      if (stableCount >= 3) return current;
      previous = current;
      await this.page.waitForTimeout(200);
    }
    return await this.entriesTableBody.locator('tr').count();
  }

  async waitForRowCountAtLeast(min: number) {
    await this.page.waitForFunction(
      (n) => document.querySelectorAll('tbody tr').length >= n,
      min,
      { timeout: 10000 }
    );
  }

  async waitForRowCountAtMost(max: number) {
    await this.page.waitForFunction(
      (n) => document.querySelectorAll('tbody tr').length <= n,
      max,
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

  // Unique row lookup by time + details (handles shared live table)
  async specificEntryExistsInTable(time: string, details: string): Promise<boolean> {
    const rows  = this.entriesTableBody.locator('tr');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const cells   = rows.nth(i).locator('td');
      const rowTime = ((await cells.nth(0).textContent()) ?? '').trim();
      const rowDet  = ((await cells.nth(2).textContent()) ?? '').trim();
      if (rowTime === time && rowDet === details) return true;
    }
    return false;
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  getDeleteButtonForRow(rowIndex: number): Locator {
    return this.entriesTableBody
      .locator('tr').nth(rowIndex)
      .locator('td').last()
      .locator('button');
  }

  async deleteEntry(rowIndex: number) {
    await this.getDeleteButtonForRow(rowIndex).click();
    await this.deleteDialog.waitFor({ state: 'visible', timeout: 5000 });
    await this.deleteDialogConfirmButton.click();
  }
}
