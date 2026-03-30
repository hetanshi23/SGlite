import { Page, Locator } from '@playwright/test';

export class DailyEntryPage {
  readonly page: Page;

  // Page heading & date
  readonly pageHeading: Locator;
  readonly dateInput: Locator;

  // Summary badges
  readonly productionBadge: Locator;
  readonly purchasesBadge: Locator;
  readonly salesBadge: Locator;
  readonly adjustmentsBadge: Locator;

  // Tabs
  readonly productionTab: Locator;
  readonly purchasesTab: Locator;
  readonly salesTab: Locator;
  readonly stockAdjTab: Locator;

  // Production form
  readonly productionFormHeading: Locator;
  readonly processCombobox: Locator;
  readonly notesTextarea: Locator;
  readonly saveProductionButton: Locator;

  // Entries table
  readonly entriesHeading: Locator;
  readonly entriesTable: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole('heading', { name: 'Daily Entry' });
    this.dateInput = page.locator('input[type="date"]');

    this.productionBadge = page.locator('[class*="rounded-full"]').filter({ hasText: 'Production' });
    this.purchasesBadge = page.locator('[class*="rounded-full"]').filter({ hasText: 'Purchases' });
    this.salesBadge = page.locator('[class*="rounded-full"]').filter({ hasText: 'Sales' });
    this.adjustmentsBadge = page.locator('[class*="rounded-full"]').filter({ hasText: 'Adjustments' });

    this.productionTab = page.getByRole('tab', { name: 'Production' });
    this.purchasesTab = page.getByRole('tab', { name: 'Purchases' });
    this.salesTab = page.getByRole('tab', { name: 'Sales' });
    this.stockAdjTab = page.getByRole('tab', { name: 'Stock Adj.' });

    this.productionFormHeading = page.getByRole('heading', { name: 'Log Production Batch' });
    this.processCombobox = page.getByRole('combobox', { name: /process/i }).or(
      page.locator('button[role="combobox"]').filter({ hasText: 'Select process' })
    );
    this.notesTextarea = page.locator('textarea[placeholder="Any remarks about this batch..."]');
    this.saveProductionButton = page.getByRole('button', { name: 'Save Production Entry' });

    this.entriesHeading = page.locator('h3').filter({ hasText: /Entries for/ });
    this.entriesTable = page.locator('table');
    this.tableRows = page.locator('tbody tr');
  }

  async goto() {
    await this.page.goto('/daily-entry');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async selectProcess(processName: string) {
    await this.processCombobox.click();
    await this.page.getByRole('option', { name: processName }).click();
  }

  async fillNotes(notes: string) {
    await this.notesTextarea.fill(notes);
  }

  async saveProduction() {
    await this.saveProductionButton.click();
  }

  async logProductionEntry(processName: string, notes?: string) {
    await this.selectProcess(processName);
    if (notes) await this.fillNotes(notes);
    await this.saveProduction();
  }

  async getEntriesCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async setDate(date: string) {
    await this.dateInput.fill(date);
  }
}
