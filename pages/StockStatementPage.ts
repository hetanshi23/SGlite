import { Page, Locator } from '@playwright/test';

export interface StockRow {
  item:     string;
  unit:     string;
  opening:  number;
  purchase: number;
  prodIn:   number;
  issued:   number;
  sales:    number;
  adj:      number;
  closing:  number;
}

export interface TotalRow {
  opening:  number;
  purchase: number;
  prodIn:   number;
  issued:   number;
  sales:    number;
  adj:      number;
  closing:  number;
}

export class StockStatementPage {
  readonly page: Page;

  // ── Page ──────────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly sidebarLink: Locator;
  readonly periodDescription: Locator;
  readonly periodHeading: Locator;

  // ── Filters ───────────────────────────────────────────────────────────────
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly quickPeriodCombobox: Locator;

  // ── Tabs ──────────────────────────────────────────────────────────────────
  readonly rawMaterialsTab: Locator;
  readonly intermediateTab: Locator;
  readonly finishedProductsTab: Locator;
  readonly wasteByproductsTab: Locator;
  readonly allItemsTab: Locator;

  // ── Table ─────────────────────────────────────────────────────────────────
  readonly table: Locator;
  readonly tableBody: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading       = page.getByRole('heading', { name: 'Stock Statement', level: 1 });
    this.sidebarLink       = page.getByRole('link', { name: 'Stock Statement', exact: true });
    this.periodDescription = page.locator('p').filter({ hasText: 'Inventory movement summary for' });
    this.periodHeading     = page.getByRole('heading', { name: /Period:/ });

    this.startDateInput      = page.locator('input[type="date"]').nth(0);
    this.endDateInput        = page.locator('input[type="date"]').nth(1);
    this.quickPeriodCombobox = page.getByRole('combobox');

    this.rawMaterialsTab     = page.getByRole('tab', { name: 'Raw Materials' });
    this.intermediateTab     = page.getByRole('tab', { name: 'Intermediate' });
    this.finishedProductsTab = page.getByRole('tab', { name: 'Finished Products' });
    this.wasteByproductsTab  = page.getByRole('tab', { name: 'Waste / Byproducts' });
    this.allItemsTab         = page.getByRole('tab', { name: 'All Items' });

    // Scoped to active tab panel only
    this.table     = page.locator('[role="tabpanel"][data-state="active"] table');
    this.tableBody = page.locator('[role="tabpanel"][data-state="active"] tbody');
  }

  async goto() {
    await this.page.goto('/stock-statement');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.sidebarLink.click();
    await this.page.waitForURL('**/stock-statement');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Converts cell text to number: '—' → 0, '1,260' → 1260, '-10' → -10
  parseNum(value: string): number {
    const cleaned = value.trim().replace(/,/g, '');
    if (cleaned === '—' || cleaned === '' || cleaned === '-') return 0;
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  // Calculates expected closing: Opening + Purchase + ProdIn - Issued - Sales + Adj
  calcClosing(row: Omit<StockRow, 'item' | 'unit' | 'closing'>): number {
    return parseFloat(
      (row.opening + row.purchase + row.prodIn - row.issued - row.sales + row.adj).toFixed(3)
    );
  }

  // ── Data Fetchers ─────────────────────────────────────────────────────────

  // Returns count of data rows (excludes Total row)
  async getRowCount(): Promise<number> {
    const total = await this.tableBody.locator('tr').count();
    return total > 0 ? total - 1 : 0;
  }

  // Returns all data rows as typed StockRow objects
  async getAllRows(): Promise<StockRow[]> {
    const count = await this.getRowCount();
    const rows: StockRow[] = [];
    for (let i = 0; i < count; i++) {
      const cells = await this.tableBody.locator('tr').nth(i).locator('td').allTextContents();
      rows.push({
        item:     cells[0]?.trim() ?? '',
        unit:     cells[1]?.trim() ?? '',
        opening:  this.parseNum(cells[2] ?? ''),
        purchase: this.parseNum(cells[3] ?? ''),
        prodIn:   this.parseNum(cells[4] ?? ''),
        issued:   this.parseNum(cells[5] ?? ''),
        sales:    this.parseNum(cells[6] ?? ''),
        adj:      this.parseNum(cells[7] ?? ''),
        closing:  this.parseNum(cells[8] ?? ''),
      });
    }
    return rows;
  }

  // Returns Total row — 8 cells: Total, Opening, Purchase, ProdIn, Issued, Sales, Adj, Closing
  async getTotalRowData(): Promise<TotalRow> {
    const cells = await this.tableBody.locator('tr').last().locator('td').allTextContents();
    return {
      opening:  this.parseNum(cells[1] ?? ''),
      purchase: this.parseNum(cells[2] ?? ''),
      prodIn:   this.parseNum(cells[3] ?? ''),
      issued:   this.parseNum(cells[4] ?? ''),
      sales:    this.parseNum(cells[5] ?? ''),
      adj:      this.parseNum(cells[6] ?? ''),
      closing:  this.parseNum(cells[7] ?? ''),
    };
  }
}
