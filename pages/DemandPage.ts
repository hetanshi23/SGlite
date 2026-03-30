import { Page, Locator } from '@playwright/test';

export class DemandPage {
  readonly page: Page;

  // ── Page ──────────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly sidebarLink: Locator;
  readonly addDemandButton: Locator;

  // ── Table ─────────────────────────────────────────────────────────────────
  readonly table: Locator;
  readonly tableBody: Locator;

  // ── Add Demand dialog ─────────────────────────────────────────────────────
  readonly dialog: Locator;
  readonly addDialogHeading: Locator;
  readonly editDialogHeading: Locator;
  readonly itemCombobox: Locator;
  readonly quantityInput: Locator;
  readonly dateInput: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;

  // ── Toast ─────────────────────────────────────────────────────────────────
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading    = page.getByRole('heading', { name: 'Demand', level: 1 });
    this.sidebarLink    = page.getByRole('link', { name: 'Demand', exact: true });
    this.addDemandButton = page.getByRole('button', { name: 'Add Demand' });

    this.table     = page.locator('table');
    this.tableBody = page.locator('tbody');

    this.dialog           = page.getByRole('dialog');
    this.addDialogHeading = page.getByRole('dialog').getByRole('heading', { name: 'Add Demand' });
    this.editDialogHeading = page.getByRole('dialog').getByRole('heading', { name: 'Edit Demand' });
    this.itemCombobox     = page.getByRole('dialog').getByRole('combobox');
    this.quantityInput    = page.getByRole('dialog').locator('input[type="number"]');
    this.dateInput        = page.getByRole('dialog').locator('input[type="date"]');
    this.saveButton       = page.getByRole('dialog').getByRole('button', { name: 'Save' });
    this.closeButton      = page.getByRole('dialog').getByRole('button', { name: 'Close' });

    this.successToast = page.locator('li[role="status"]');
  }

  async goto() {
    await this.page.goto('/demand');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.sidebarLink.click();
    await this.page.waitForURL('**/demand');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async openAddDemandDialog() {
    await this.addDemandButton.click();
    await this.addDialogHeading.waitFor({ state: 'visible' });
  }

  async selectFirstItem(): Promise<string> {
    await this.itemCombobox.click();
    const first = this.page.getByRole('option').first();
    const name  = ((await first.textContent()) ?? '').trim();
    await first.click();
    return name;
  }

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

  async getRowData(rowIndex: number): Promise<{ item: string; quantity: string; date: string }> {
    const cells = this.tableBody.locator('tr').nth(rowIndex).locator('td');
    return {
      item:     ((await cells.nth(0).textContent()) ?? '').trim(),
      quantity: ((await cells.nth(1).textContent()) ?? '').trim(),
      date:     ((await cells.nth(2).textContent()) ?? '').trim(),
    };
  }

  async findRowIndexByItem(itemName: string): Promise<number> {
    const rows     = this.tableBody.locator('tr');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const text = await rows.nth(i).locator('td').nth(0).textContent();
      if (text?.trim() === itemName) return i;
    }
    return 0;
  }

  async findRowIndexByItemAndQty(itemName: string, qty: string): Promise<number> {
    const rows     = this.tableBody.locator('tr');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const item = await rows.nth(i).locator('td').nth(0).textContent();
      const q    = await rows.nth(i).locator('td').nth(1).textContent();
      if (item?.trim() === itemName && q?.trim() === qty) return i;
    }
    return 0;
  }

  getEditButtonForRow(rowIndex: number): Locator {
    return this.tableBody.locator('tr').nth(rowIndex).getByRole('button');
  }

  async openEditDialog(rowIndex: number) {
    await this.getEditButtonForRow(rowIndex).click();
    await this.editDialogHeading.waitFor({ state: 'visible' });
  }
}
