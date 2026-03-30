import { Page, Locator } from '@playwright/test';

export class ProductionReportPage {
  readonly page: Page;

  // ── Page ──────────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly sidebarLink: Locator;
  readonly pageDescription: Locator;
  readonly exportExcelButton: Locator;

  // ── Filters ───────────────────────────────────────────────────────────────
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly quickPeriodCombobox: Locator;

  // ── KPI Cards ─────────────────────────────────────────────────────────────
  readonly totalBatchesCard: Locator;
  readonly totalBatchesValue: Locator;
  readonly totalInputCard: Locator;
  readonly totalInputValue: Locator;
  readonly totalOutputCard: Locator;
  readonly totalOutputValue: Locator;
  readonly totalWasteCard: Locator;
  readonly totalWasteValue: Locator;

  // ── Stage Cards ───────────────────────────────────────────────────────────
  readonly stage1Heading: Locator;
  readonly stage2Heading: Locator;

  // ── Waste Summary Section ─────────────────────────────────────────────────
  readonly wasteSummaryHeading: Locator;
  readonly wasteSummaryTable: Locator;
  readonly wasteSummaryBody: Locator;

  // ── Daily Production Log Section ──────────────────────────────────────────
  readonly dailyLogHeading: Locator;
  readonly dailyLogTable: Locator;
  readonly dailyLogBody: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading       = page.getByRole('heading', { name: 'Production Report', level: 1 });
    this.sidebarLink       = page.getByRole('link', { name: 'Production Report', exact: true });
    this.pageDescription   = page.locator('p').filter({ hasText: 'Detailed manufacturing analysis' });
    this.exportExcelButton = page.getByRole('button', { name: 'Export Excel' });

    this.startDateInput      = page.locator('input[type="date"]').nth(0);
    this.endDateInput        = page.locator('input[type="date"]').nth(1);
    this.quickPeriodCombobox = page.getByRole('combobox');

    // KPI Cards
    this.totalBatchesCard  = page.locator('.rounded-lg').filter({ hasText: 'Total Batches' }).first();
    this.totalBatchesValue = this.totalBatchesCard.locator('p').last();
    this.totalInputCard    = page.locator('.rounded-lg').filter({ hasText: 'Total Input' }).first();
    this.totalInputValue   = this.totalInputCard.locator('p').last();
    this.totalOutputCard   = page.locator('.rounded-lg').filter({ hasText: 'Total Output' }).first();
    this.totalOutputValue  = this.totalOutputCard.locator('p').last();
    this.totalWasteCard    = page.locator('.rounded-lg').filter({ hasText: 'Total Waste' }).first();
    this.totalWasteValue   = this.totalWasteCard.locator('p').last();

    // Stage cards
    this.stage1Heading = page.getByRole('heading', { name: /Stage 1/ });
    this.stage2Heading = page.getByRole('heading', { name: /Stage 2/ });

    // Waste Summary
    this.wasteSummaryHeading = page.getByRole('heading', { name: /Waste Summary/ });
    this.wasteSummaryTable   = page.locator('.rounded-lg').filter({ hasText: 'Waste Summary' }).locator('table');
    this.wasteSummaryBody    = page.locator('.rounded-lg').filter({ hasText: 'Waste Summary' }).locator('tbody');

    // Daily Production Log
    this.dailyLogHeading = page.getByRole('heading', { name: /Daily Production Log/ });
    this.dailyLogTable   = page.locator('.rounded-lg').filter({ hasText: 'Daily Production Log' }).locator('table');
    this.dailyLogBody    = page.locator('.rounded-lg').filter({ hasText: 'Daily Production Log' }).locator('tbody');
  }

  async goto() {
    await this.page.goto('/production-report');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.sidebarLink.click();
    await this.page.waitForURL('**/production-report');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async setDateRange(startDate: string, endDate: string) {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
  }

  async getStageText(stageNumber: 1 | 2): Promise<string> {
    return ((await this.page.getByRole('heading', { name: new RegExp(`Stage ${stageNumber}`) })
      .locator('..').locator('..').textContent()) ?? '').trim();
  }

  async getDailyLogRowCount(): Promise<number> {
    return await this.dailyLogBody.locator('tr').count();
  }

  async getDailyLogRow(rowIndex: number): Promise<{ date: string; process: string; input: string; output: string; waste: string; notes: string }> {
    const cells = this.dailyLogBody.locator('tr').nth(rowIndex).locator('td');
    return {
      date:    ((await cells.nth(0).textContent()) ?? '').trim(),
      process: ((await cells.nth(1).textContent()) ?? '').trim(),
      input:   ((await cells.nth(2).textContent()) ?? '').trim(),
      output:  ((await cells.nth(3).textContent()) ?? '').trim(),
      waste:   ((await cells.nth(4).textContent()) ?? '').trim(),
      notes:   ((await cells.nth(5).textContent()) ?? '').trim(),
    };
  }

  async getWasteSummaryRowCount(): Promise<number> {
    const total = await this.wasteSummaryBody.locator('tr').count();
    return total > 0 ? total - 1 : 0;
  }

  async getWasteSummaryRows(): Promise<{ item: string; qty: string; unit: string }[]> {
    const rows = this.wasteSummaryBody.locator('tr');
    const count = await rows.count();
    const result: { item: string; qty: string; unit: string }[] = [];
    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      const item = ((await cells.nth(0).textContent()) ?? '').trim();
      if (item === 'Total Waste') continue;
      result.push({
        item,
        qty:  ((await cells.nth(1).textContent()) ?? '').trim(),
        unit: ((await cells.nth(2).textContent()) ?? '').trim(),
      });
    }
    return result;
  }

  async getWasteSummaryTotalRow(): Promise<{ qty: string; unit: string }> {
    const rows = this.wasteSummaryBody.locator('tr');
    const count = await rows.count();
    const last = rows.nth(count - 1).locator('td');
    return {
      qty:  ((await last.nth(1).textContent()) ?? '').trim(),
      unit: ((await last.nth(2).textContent()) ?? '').trim(),
    };
  }

  async getKpiValues(): Promise<{ batches: number; input: number; output: number; waste: number }> {
    const batchText  = ((await this.totalBatchesValue.textContent()) ?? '').trim();
    const inputText  = ((await this.totalInputValue.textContent()) ?? '').trim();
    const outputText = ((await this.totalOutputValue.textContent()) ?? '').trim();
    const wasteText  = ((await this.totalWasteValue.textContent()) ?? '').trim();
    return {
      batches: this.parseNum(batchText),
      input:   this.parseNum(inputText),
      output:  this.parseNum(outputText),
      waste:   this.parseNum(wasteText),
    };
  }

  async getStageData(stageNumber: 1 | 2): Promise<{ totalIn: number; totalOut: number; waste: number; efficiency: number; batches: number }> {
    const container = this.page.getByRole('heading', { name: new RegExp(`Stage ${stageNumber}`) })
      .locator('..').locator('..');
    const text = ((await container.textContent()) ?? '').trim();

    const extract = (label: string): number => {
      const match = text.match(new RegExp(`${label}[^\\d]*([\\d,\\.]+)`));
      return match ? this.parseNum(match[1]) : 0;
    };
    const effMatch   = text.match(/Efficiency[^\d]*([\d\.]+)%/);
    const batchMatch = text.match(/(\d+)\s*batches/);
    return {
      totalIn:    extract('Total In'),
      totalOut:   extract('Total Out'),
      waste:      extract('Waste'),
      efficiency: effMatch   ? parseFloat(effMatch[1])   : 0,
      batches:    batchMatch ? parseInt(batchMatch[1])   : 0,
    };
  }

  async getAllDailyLogRows(): Promise<{ date: string; process: string; input: string; output: string; waste: string; notes: string }[]> {
    const count = await this.dailyLogBody.locator('tr').count();
    const rows = [];
    for (let i = 0; i < count; i++) {
      rows.push(await this.getDailyLogRow(i));
    }
    return rows;
  }

  parseNum(value: string): number {
    const cleaned = value.replace(/[^0-9.\-]/g, '').trim();
    if (!cleaned || cleaned === '-') return 0;
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
}
