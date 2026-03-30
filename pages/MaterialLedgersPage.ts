import { Page, Locator } from '@playwright/test';

export interface LedgerRow {
  date:     string;
  opening:  number;
  purchase: number;
  prodIn:   number;
  prodOut:  number;
  sales:    number;
  adj:      number;
  closing:  number;
}

export interface LedgerTotalRow {
  opening:  number;
  purchase: number;
  prodIn:   number;
  prodOut:  number;
  sales:    number;
  adj:      number;
  closing:  number;
}

export class MaterialLedgersPage {
  readonly page: Page;

  // ── Page ──────────────────────────────────────────────────────────────────
  readonly pageHeading:   Locator;
  readonly sidebarLink:   Locator;
  readonly ledgerHeading: Locator;

  // ── Filters ───────────────────────────────────────────────────────────────
  readonly itemSelect:    Locator;
  readonly monthInput:    Locator;

  // ── Table ─────────────────────────────────────────────────────────────────
  readonly table:      Locator;
  readonly tableHead:  Locator;
  readonly tableBody:  Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading   = page.getByRole('heading', { name: 'Material Ledgers', level: 1 });
    this.sidebarLink   = page.getByRole('link', { name: 'Material Ledgers', exact: true });
    this.ledgerHeading = page.locator('h3');

    this.itemSelect = page.locator('#item-select');
    this.monthInput = page.locator('#month-picker');

    this.table      = page.locator('table');
    this.tableHead  = page.locator('thead');
    this.tableBody  = page.locator('tbody');
    this.emptyState = page.locator('text=Select an item to view its ledger.');
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async goto() {
    await this.page.goto('/ledgers');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.sidebarLink.click();
    await this.page.waitForURL('**/ledgers');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  // ── Filters ───────────────────────────────────────────────────────────────

  async getAvailableItems(): Promise<string[]> {
    await this.itemSelect.click();
    await this.page.waitForTimeout(400);
    const options = await this.page.locator('[role="option"]').allTextContents();
    await this.page.keyboard.press('Escape');
    return options.map(o => o.trim());
  }

  async selectItem(itemName: string) {
    await this.itemSelect.click();
    await this.page.waitForTimeout(400);
    await this.page.locator('[role="option"]').filter({ hasText: itemName }).click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }

  async setMonth(yearMonth: string) {
    // yearMonth format: YYYY-MM
    await this.monthInput.fill(yearMonth);
    await this.monthInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }

  async getSelectedMonth(): Promise<string> {
    return (await this.monthInput.inputValue()).trim();
  }

  // ── Table Helpers ─────────────────────────────────────────────────────────

  async getColumnHeaders(): Promise<string[]> {
    const headers = await this.tableHead.locator('th').allTextContents();
    return headers.map(h => h.trim());
  }

  // Returns count of data rows (excludes Total row)
  async getRowCount(): Promise<number> {
    const total = await this.tableBody.locator('tr').count();
    return total > 0 ? total - 1 : 0;
  }

  async getAllRows(): Promise<LedgerRow[]> {
    const count = await this.getRowCount();
    const rows: LedgerRow[] = [];
    for (let i = 0; i < count; i++) {
      const cells = await this.tableBody.locator('tr').nth(i).locator('td').allTextContents();
      rows.push({
        date:     cells[0]?.trim() ?? '',
        opening:  this.parseNum(cells[1] ?? ''),
        purchase: this.parseNum(cells[2] ?? ''),
        prodIn:   this.parseNum(cells[3] ?? ''),
        prodOut:  this.parseNum(cells[4] ?? ''),
        sales:    this.parseNum(cells[5] ?? ''),
        adj:      this.parseNum(cells[6] ?? ''),
        closing:  this.parseNum(cells[7] ?? ''),
      });
    }
    return rows;
  }

  async getTotalRow(): Promise<LedgerTotalRow> {
    const cells = await this.tableBody.locator('tr').last().locator('td').allTextContents();
    return {
      opening:  this.parseNum(cells[1] ?? ''),
      purchase: this.parseNum(cells[2] ?? ''),
      prodIn:   this.parseNum(cells[3] ?? ''),
      prodOut:  this.parseNum(cells[4] ?? ''),
      sales:    this.parseNum(cells[5] ?? ''),
      adj:      this.parseNum(cells[6] ?? ''),
      closing:  this.parseNum(cells[7] ?? ''),
    };
  }

  async getTotalRowLabel(): Promise<string> {
    const firstCell = await this.tableBody.locator('tr').last().locator('td').first().textContent();
    return (firstCell ?? '').trim();
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  parseNum(value: string): number {
    const cleaned = value.trim().replace(/,/g, '');
    if (cleaned === '—' || cleaned === '' || cleaned === '-') return 0;
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
}
