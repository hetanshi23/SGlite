import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  // ── Dashboard ─────────────────────────────────────────────────────────────
  readonly heading: Locator;
  readonly sidebar: Locator;
  readonly header: Locator;
  readonly logoutButton: Locator;
  readonly totalItems: Locator;
  readonly lowStock: Locator;
  readonly purchasesMonth: Locator;
  readonly salesMonth: Locator;
  readonly dailyEntryTab: Locator;

  // ── Inventory page ────────────────────────────────────────────────────────
  readonly inventoryHeading: Locator;
  readonly searchInput: Locator;
  readonly categoryCombobox: Locator;
  readonly lowStockOnlyCheckbox: Locator;
  readonly stockAdjustmentButton: Locator;
  readonly inventoryTable: Locator;
  readonly inventoryTableBody: Locator;
  readonly noItemsMessage: Locator;

  // ── Stock Adjustment dialog ───────────────────────────────────────────────
  readonly adjDialog: Locator;
  readonly adjItemCombobox: Locator;
  readonly adjQuantityInput: Locator;
  readonly adjDateInput: Locator;
  readonly adjReasonInput: Locator;
  readonly adjSaveButton: Locator;
  readonly adjCloseButton: Locator;
  readonly adjSuccessToast: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dashboard
    this.heading       = page.getByRole('heading', { name: 'Dashboard' });
    this.sidebar       = page.locator('[data-sidebar="sidebar"]').first();
    this.header        = page.locator('header').first();
    this.logoutButton  = page.getByText('Sign Out');
    this.totalItems    = page.getByRole('heading', { name: 'Total Items' });
    this.lowStock      = page.getByRole('heading', { name: 'Low Stock' });
    this.purchasesMonth = page.getByRole('heading', { name: 'Purchases (Month)' });
    this.salesMonth    = page.getByRole('heading', { name: 'Sales (Month)' });
    this.dailyEntryTab = page.getByRole('link', { name: 'Daily Entry' });

    // Inventory page
    this.inventoryHeading      = page.getByRole('heading', { name: 'Inventory', level: 1 });
    this.searchInput           = page.locator('input[placeholder="Search items..."]');
    this.categoryCombobox      = page.getByRole('combobox');
    this.lowStockOnlyCheckbox  = page.locator('#low_stock');
    this.stockAdjustmentButton = page.getByRole('button', { name: 'Stock Adjustment' });
    this.inventoryTable        = page.locator('table');
    this.inventoryTableBody    = page.locator('tbody');
    this.noItemsMessage        = page.locator('td').filter({ hasText: 'No items found.' });

    // Stock Adjustment dialog
    this.adjDialog        = page.getByRole('dialog');
    this.adjItemCombobox  = page.getByRole('dialog').getByRole('combobox');
    this.adjQuantityInput = page.getByRole('dialog').locator('input[type="number"]');
    this.adjDateInput     = page.getByRole('dialog').locator('input[type="date"]');
    this.adjReasonInput   = page.getByRole('dialog').locator('input[placeholder*="Opening balance"]');
    this.adjSaveButton    = page.getByRole('dialog').getByRole('button', { name: 'Save Adjustment' });
    this.adjCloseButton   = page.getByRole('dialog').getByRole('button', { name: 'Close' });
    this.adjSuccessToast  = page.locator('li[role="status"]').filter({ hasText: 'Stock adjustment' });
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async logout() {
    await this.logoutButton.click();
  }

  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent()) ?? '';
  }

  // Click Total Items card → navigates to /inventory
  async clickTotalItems() {
    await this.totalItems.locator('..').locator('..').click();
    await this.page.waitForURL('**/inventory');
    await this.inventoryHeading.waitFor({ state: 'visible' });
  }

  // Click Low Stock card → navigates to /inventory?filter=low_stock
  async clickLowStock() {
    await this.lowStock.locator('..').locator('..').click();
    await this.page.waitForURL('**/inventory**');
    await this.inventoryHeading.waitFor({ state: 'visible' });
  }

  // Get first item name from inventory table
  async getFirstItemName(): Promise<string> {
    return ((await this.inventoryTableBody.locator('tr').first().locator('td').first().textContent()) ?? '').trim();
  }

  // Get row count
  async getInventoryRowCount(): Promise<number> {
    return await this.inventoryTableBody.locator('tr').count();
  }

  // Select category from dropdown
  async selectCategory(category: string) {
    await this.categoryCombobox.click();
    await this.page.getByRole('option', { name: category }).click();
  }

  // Select first item in Stock Adjustment dialog
  async selectFirstAdjItem(): Promise<string> {
    await this.adjItemCombobox.click();
    const first = this.page.getByRole('option').first();
    const name  = ((await first.textContent()) ?? '').trim();
    await first.click();
    return name;
  }
}
