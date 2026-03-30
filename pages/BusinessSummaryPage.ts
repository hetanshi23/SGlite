import { Page, Locator } from '@playwright/test';

export class BusinessSummaryPage {
  readonly page: Page;

  // ── Page ──────────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly sidebarLink: Locator;
  readonly periodDescription: Locator;

  // ── Filters ───────────────────────────────────────────────────────────────
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly quickPeriodCombobox: Locator;

  // ── KPI Cards ─────────────────────────────────────────────────────────────
  readonly totalPurchasesCard: Locator;
  readonly totalPurchasesValue: Locator;
  readonly totalSalesCard: Locator;
  readonly totalSalesValue: Locator;
  readonly grossProfitCard: Locator;
  readonly grossProfitValue: Locator;
  readonly productionBatchesCard: Locator;
  readonly productionBatchesValue: Locator;

  // ── Purchases by Item Table ────────────────────────────────────────────────
  readonly purchasesTableHeading: Locator;
  readonly purchasesTable: Locator;
  readonly purchasesTableBody: Locator;
  readonly noPurchasesMessage: Locator;

  // ── Sales by Item Table ────────────────────────────────────────────────────
  readonly salesTableHeading: Locator;
  readonly salesTable: Locator;
  readonly salesTableBody: Locator;
  readonly noSalesMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading       = page.getByRole('heading', { name: 'Business Summary', level: 1 });
    this.sidebarLink       = page.getByRole('link', { name: 'Business Summary', exact: true });
    this.periodDescription = page.locator('p').filter({ hasText: 'Financial overview for' });

    this.startDateInput      = page.locator('input[type="date"]').nth(0);
    this.endDateInput        = page.locator('input[type="date"]').nth(1);
    this.quickPeriodCombobox = page.getByRole('combobox');

    // KPI Cards — scoped to their card containers
    this.totalPurchasesCard   = page.locator('.rounded-lg').filter({ hasText: 'Total Purchases' }).first();
    this.totalPurchasesValue  = this.totalPurchasesCard.locator('p.text-2xl');
    this.totalSalesCard       = page.locator('.rounded-lg').filter({ hasText: 'Total Sales' }).first();
    this.totalSalesValue      = this.totalSalesCard.locator('p.text-2xl');
    this.grossProfitCard      = page.locator('.rounded-lg').filter({ hasText: 'Gross Profit' }).first();
    this.grossProfitValue     = this.grossProfitCard.locator('p.text-2xl');
    this.productionBatchesCard  = page.locator('.rounded-lg').filter({ hasText: 'Production Batches' }).first();
    this.productionBatchesValue = this.productionBatchesCard.locator('p.text-2xl');

    // Purchases by Item table
    this.purchasesTableHeading = page.getByRole('heading', { name: /Purchases by Item/ });
    this.purchasesTable        = page.locator('.rounded-lg').filter({ hasText: 'Purchases by Item' }).locator('table');
    this.purchasesTableBody    = page.locator('.rounded-lg').filter({ hasText: 'Purchases by Item' }).locator('tbody');
    this.noPurchasesMessage    = page.locator('.rounded-lg').filter({ hasText: 'Purchases by Item' }).locator('p:has-text("No purchases recorded")');

    // Sales by Item table
    this.salesTableHeading = page.getByRole('heading', { name: /Sales by Item/ });
    this.salesTable        = page.locator('.rounded-lg').filter({ hasText: 'Sales by Item' }).locator('table');
    this.salesTableBody    = page.locator('.rounded-lg').filter({ hasText: 'Sales by Item' }).locator('tbody');
    this.noSalesMessage    = page.locator('.rounded-lg').filter({ hasText: 'Sales by Item' }).locator('p:has-text("No sales recorded")');
  }

  async goto() {
    await this.page.goto('/business-summary');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.sidebarLink.click();
    await this.page.waitForURL('**/business-summary');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async setDateRange(startDate: string, endDate: string) {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
    await this.page.waitForTimeout(800);
  }

  async hasPurchasesData(): Promise<boolean> {
    return await this.purchasesTable.isVisible();
  }

  async hasSalesData(): Promise<boolean> {
    return await this.salesTable.isVisible();
  }

  async getPurchasesRowData(rowIndex: number): Promise<{ item: string; qty: string; total: string }> {
    const cells = this.purchasesTableBody.locator('tr').nth(rowIndex).locator('td');
    return {
      item:  ((await cells.nth(0).textContent()) ?? '').trim(),
      qty:   ((await cells.nth(1).textContent()) ?? '').trim(),
      total: ((await cells.nth(2).textContent()) ?? '').trim(),
    };
  }

  async getSalesRowData(rowIndex: number): Promise<{ item: string; qty: string; total: string }> {
    const cells = this.salesTableBody.locator('tr').nth(rowIndex).locator('td');
    return {
      item:  ((await cells.nth(0).textContent()) ?? '').trim(),
      qty:   ((await cells.nth(1).textContent()) ?? '').trim(),
      total: ((await cells.nth(2).textContent()) ?? '').trim(),
    };
  }
}
