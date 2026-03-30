import { Page, Locator } from '@playwright/test';

export class SalesPageNew {
  readonly page: Page;

  // ── Page ──────────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly sidebarLink: Locator;
  readonly manageBuyersButton: Locator;
  readonly newSaleButton: Locator;

  // ── Stats ─────────────────────────────────────────────────────────────────
  readonly totalSalesStat: Locator;
  readonly invoicesStat: Locator;

  // ── Filters ───────────────────────────────────────────────────────────────
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly quickPeriodCombobox: Locator;

  // ── Table ─────────────────────────────────────────────────────────────────
  readonly table: Locator;
  readonly tableBody: Locator;

  // ── Manage Buyers dialog ──────────────────────────────────────────────────
  readonly buyersDialog: Locator;
  readonly buyerNameInput: Locator;
  readonly buyerGstinInput: Locator;
  readonly buyerAddressInput: Locator;
  readonly buyerPhoneInput: Locator;
  readonly addBuyerButton: Locator;
  readonly buyersDialogCloseButton: Locator;
  readonly buyersList: Locator;

  // ── New Sale dialog ───────────────────────────────────────────────────────
  readonly saleDialog: Locator;
  readonly saleDialogHeading: Locator;
  readonly saleDateInput: Locator;
  readonly buyerCombobox: Locator;
  readonly invoiceInput: Locator;
  readonly itemCombobox: Locator;
  readonly quantityInput: Locator;
  readonly rateInput: Locator;
  readonly saveSaleButton: Locator;
  readonly saleDialogCloseButton: Locator;

  // ── Edit Sale dialog ──────────────────────────────────────────────────────
  readonly editDialogHeading: Locator;
  readonly editInvoiceInput: Locator;
  readonly editQuantityInput: Locator;
  readonly editRateInput: Locator;

  // ── Toasts ────────────────────────────────────────────────────────────────
  readonly saveSuccessToast: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading      = page.getByRole('heading', { name: 'Sales', level: 1 });
    this.sidebarLink      = page.getByRole('link', { name: 'Sales', exact: true });
    this.manageBuyersButton = page.getByRole('button', { name: 'Manage Buyers' });
    this.newSaleButton    = page.getByRole('button', { name: 'New Sale' });

    this.totalSalesStat = page.getByRole('heading', { name: 'Total Sales (This Month)' });
    this.invoicesStat   = page.getByRole('heading', { name: 'Invoices (This Month)' });

    this.fromDateInput       = page.locator('#date-from');
    this.toDateInput         = page.locator('#date-to');
    this.quickPeriodCombobox = page.getByRole('combobox');

    this.table     = page.locator('table');
    this.tableBody = page.locator('tbody');

    // Manage Buyers dialog
    this.buyersDialog            = page.getByRole('dialog');
    this.buyerNameInput          = page.locator('#party-name');
    this.buyerGstinInput         = page.locator('#party-gstin');
    this.buyerAddressInput       = page.locator('#party-address');
    this.buyerPhoneInput         = page.locator('#party-phone');
    this.addBuyerButton          = page.getByRole('button', { name: 'Add Buyer' });
    this.buyersDialogCloseButton = page.getByRole('button', { name: 'Close' });
    this.buyersList              = page.getByRole('dialog').locator('ul li');

    // New / Edit Sale dialog
    this.saleDialog          = page.locator('[role="dialog"][data-state="open"]');
    this.saleDialogHeading   = page.getByRole('dialog').getByRole('heading', { name: 'New Sale' });
    this.saleDateInput       = page.getByRole('dialog').locator('input[type="date"]');
    this.buyerCombobox       = page.getByRole('dialog').getByRole('combobox').first();
    this.invoiceInput        = page.getByRole('dialog').locator('input[placeholder="e.g. INV-001"]');
    this.itemCombobox        = page.getByRole('dialog').getByRole('combobox').nth(1);
    this.quantityInput       = page.getByRole('dialog').locator('input[type="number"]').nth(0);
    this.rateInput           = page.getByRole('dialog').locator('input[type="number"]').nth(1);
    this.saveSaleButton      = page.getByRole('dialog').getByRole('button', { name: 'Save Sale' });
    this.saleDialogCloseButton = page.getByRole('dialog').getByRole('button', { name: 'Close' });

    this.editDialogHeading = page.getByRole('dialog').getByRole('heading', { name: 'Edit Sale' });
    this.editInvoiceInput  = page.getByRole('dialog').locator('input[placeholder="e.g. INV-001"]');
    this.editQuantityInput = page.getByRole('dialog').locator('input[type="number"]').nth(0);
    this.editRateInput     = page.getByRole('dialog').locator('input[type="number"]').nth(1);

    this.saveSuccessToast = page.locator('[data-sonner-toast]').first();
  }

  async goto() {
    await this.page.goto('/sales');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.sidebarLink.click();
    await this.page.waitForURL('**/sales');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  // ── Manage Buyers ─────────────────────────────────────────────────────────

  async openManageBuyers() {
    await this.manageBuyersButton.click();
    await this.buyersDialog.waitFor({ state: 'visible' });
  }

  async addBuyer(name: string, gstin?: string, address?: string, phone?: string) {
    await this.buyerNameInput.fill(name);
    if (gstin)   await this.buyerGstinInput.fill(gstin);
    if (address) await this.buyerAddressInput.fill(address);
    if (phone)   await this.buyerPhoneInput.fill(phone);
    await this.addBuyerButton.click();
  }

  async closeManageBuyers() {
    await this.buyersDialogCloseButton.click();
    await this.buyersDialog.waitFor({ state: 'hidden' });
  }

  // ── New Sale ──────────────────────────────────────────────────────────────

  async openNewSaleDialog() {
    await this.newSaleButton.click();
    await this.saleDialogHeading.waitFor({ state: 'visible' });
  }

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

  async saveSale() {
    // Blur any focused input before clicking Save to avoid form submission being blocked
    await this.page.keyboard.press('Tab');
    await this.saveSaleButton.click();
  }

  // ── Table ─────────────────────────────────────────────────────────────────

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

  getEditButtonForRow(rowIndex: number): Locator {
    return this.tableBody.locator('tr').nth(rowIndex).getByRole('button');
  }

  async openEditDialog(rowIndex: number) {
    await this.getEditButtonForRow(rowIndex).click();
    await this.editDialogHeading.waitFor({ state: 'visible' });
  }
}
