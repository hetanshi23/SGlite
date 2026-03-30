import { Page, Locator } from '@playwright/test';

export class PlannerPage {
  readonly page: Page;

  // ── Page ──────────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly sidebarLink: Locator;

  // ── Date filters ──────────────────────────────────────────────────────────
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;

  // ── MRP Section ───────────────────────────────────────────────────────────
  readonly mrpHeading: Locator;
  readonly mrpCard: Locator;
  readonly mrpEmptyMessage: Locator;

  // ── Production Suggestions Section ────────────────────────────────────────
  readonly suggestionsHeading: Locator;
  readonly suggestionsCard: Locator;
  readonly suggestionsEmptyMessage: Locator;

  // ── Production Plans Section ───────────────────────────────────────────────
  readonly plansHeading: Locator;
  readonly plansTable: Locator;
  readonly plansTableBody: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole('heading', { name: 'Production Planner', level: 1 });
    this.sidebarLink = page.getByRole('link', { name: 'Planner', exact: true });

    this.fromDateInput = page.locator('input[type="date"]').nth(0);
    this.toDateInput   = page.locator('input[type="date"]').nth(1);

    this.mrpHeading      = page.getByRole('heading', { name: /MRP.*Material Requirements/ });
    this.mrpCard         = page.locator('.rounded-lg').filter({ hasText: 'MRP' });
    this.mrpEmptyMessage = page.locator('p').filter({ hasText: 'No material requirements' });

    this.suggestionsHeading      = page.getByRole('heading', { name: 'Production Suggestions' });
    this.suggestionsCard         = page.locator('.rounded-lg').filter({ hasText: 'Production Suggestions' });
    this.suggestionsEmptyMessage = page.locator('p').filter({ hasText: 'No demand in selected period' });

    this.plansHeading    = page.getByRole('heading', { name: /Production Plans/ });
    this.plansTable      = page.locator('.rounded-lg').filter({ hasText: 'Production Plans' }).locator('table');
    this.plansTableBody  = page.locator('.rounded-lg').filter({ hasText: 'Production Plans' }).locator('tbody');
  }

  async goto() {
    await this.page.goto('/planner');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.sidebarLink.click();
    await this.page.waitForURL('**/planner');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async setDateRange(from: string, to: string) {
    await this.fromDateInput.fill(from);
    await this.toDateInput.fill(to);
    await this.page.waitForTimeout(500);
  }

  async getPlansRowCount(): Promise<number> {
    return await this.plansTableBody.locator('tr').count();
  }

  async getRowData(rowIndex: number): Promise<{ process: string; qty: string; date: string; status: string }> {
    const cells = this.plansTableBody.locator('tr').nth(rowIndex).locator('td');
    return {
      process: ((await cells.nth(0).textContent()) ?? '').trim(),
      qty:     ((await cells.nth(1).textContent()) ?? '').trim(),
      date:    ((await cells.nth(2).textContent()) ?? '').trim(),
      status:  ((await cells.nth(3).textContent()) ?? '').trim(),
    };
  }

  getStatusComboboxForRow(rowIndex: number): Locator {
    return this.page.locator('.rounded-lg').filter({ hasText: 'Production Plans' })
      .locator('tbody tr').nth(rowIndex).locator('td').last().getByRole('combobox');
  }

  async changeStatus(rowIndex: number, status: string) {
    await this.getStatusComboboxForRow(rowIndex).click();
    await this.page.getByRole('option', { name: status, exact: true }).click();
    await this.page.waitForTimeout(800);
  }
}
