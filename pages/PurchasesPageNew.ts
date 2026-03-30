import { Page, Locator } from '@playwright/test';

export class PurchasesPageNew {
  readonly page: Page;

  // ── Page ──────────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly sidebarLink: Locator;
  readonly manageSuppliersButton: Locator;
  readonly newPurchaseButton: Locator;

  // ── Stats ─────────────────────────────────────────────────────────────────
  readonly totalPurchasesStat: Locator;
  readonly invoicesStat: Locator;

  // ── Filters ───────────────────────────────────────────────────────────────
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly quickPeriodCombobox: Locator;

  // ── Table ─────────────────────────────────────────────────────────────────
  readonly table: Locator;
  readonly tableBody: Locator;

  // ── Manage Suppliers dialog ───────────────────────────────────────────────
  readonly suppliersDialog: Locator;
  readonly supplierNameInput: Locator;
  readonly supplierGstinInput: Locator;
  readonly supplierAddressInput: Locator;
  readonly supplierPhoneInput: Locator;
  readonly addSupplierButton: Locator;
  readonly suppliersDialogCloseButton: Locator;
  readonly suppliersList: Locator;

  // ── New Purchase dialog ───────────────────────────────────────────────────
  readonly purchaseDialog: Locator;
  readonly purchaseDialogHeading: Locator;
  readonly purchaseDateInput: Locator;
  readonly supplierCombobox: Locator;
  readonly invoiceInput: Locator;
  readonly itemCombobox: Locator;
  readonly quantityInput: Locator;
  readonly rateInput: Locator;
  readonly savePurchaseButton: Locator;
  readonly purchaseDialogCloseButton: Locator;

  // ── Edit Purchase dialog ──────────────────────────────────────────────────
  readonly editDialogHeading: Locator;
  readonly editInvoiceInput: Locator;
  readonly editQuantityInput: Locator;
  readonly editRateInput: Locator;

  // ── Toasts ────────────────────────────────────────────────────────────────
  readonly saveSuccessToast: Locator;
  readonly supplierAddedToast: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading          = page.getByRole('heading', { name: 'Purchases', level: 1 });
    this.sidebarLink          = page.getByRole('link', { name: 'Purchases', exact: true });
    this.manageSuppliersButton = page.getByRole('button', { name: 'Manage Suppliers' });
    this.newPurchaseButton    = page.getByRole('button', { name: 'New Purchase' });

    this.totalPurchasesStat = page.getByRole('heading', { name: 'Total Purchases (This Month)' });
    this.invoicesStat       = page.getByRole('heading', { name: 'Invoices (This Month)' });

    this.fromDateInput       = page.locator('#date-from');
    this.toDateInput         = page.locator('#date-to');
    this.quickPeriodCombobox = page.getByRole('combobox');

    this.table     = page.locator('table');
    this.tableBody = page.locator('tbody');

    // Manage Suppliers dialog
    this.suppliersDialog            = page.getByRole('dialog');
    this.supplierNameInput          = page.locator('#party-name');
    this.supplierGstinInput         = page.locator('#party-gstin');
    this.supplierAddressInput       = page.locator('#party-address');
    this.supplierPhoneInput         = page.locator('#party-phone');
    this.addSupplierButton          = page.getByRole('button', { name: 'Add Supplier' });
    this.suppliersDialogCloseButton = page.getByRole('button', { name: 'Close' });
    this.suppliersList = page.getByRole('dialog').locator('ul li');

    // New / Edit Purchase dialog
    this.purchaseDialog        = page.getByRole('dialog');
    this.purchaseDialogHeading = page.getByRole('dialog').getByRole('heading', { name: 'New Purchase' });
    this.purchaseDateInput     = page.getByRole('dialog').locator('input[type="date"]');
    this.supplierCombobox      = page.getByRole('dialog').getByRole('combobox').first();
    this.invoiceInput          = page.getByRole('dialog').locator('input[placeholder="e.g. INV-001"]');
    this.itemCombobox          = page.getByRole('dialog').getByRole('combobox').nth(1);
    this.quantityInput         = page.getByRole('dialog').locator('input[type="number"]').nth(0);
    this.rateInput             = page.getByRole('dialog').locator('input[type="number"]').nth(1);
    this.savePurchaseButton    = page.getByRole('dialog').getByRole('button', { name: 'Save Purchase' });
    this.purchaseDialogCloseButton = page.getByRole('dialog').getByRole('button', { name: 'Close' });

    this.editDialogHeading  = page.getByRole('dialog').getByRole('heading', { name: 'Edit Purchase' });
    this.editInvoiceInput   = page.getByRole('dialog').locator('input[placeholder="e.g. INV-001"]');
    this.editQuantityInput  = page.getByRole('dialog').locator('input[type="number"]').nth(0);
    this.editRateInput      = page.getByRole('dialog').locator('input[type="number"]').nth(1);

    this.saveSuccessToast   = page.locator('li[role="status"]').filter({ hasText: 'Purchase' });
    this.supplierAddedToast = page.locator('li[role="status"]').filter({ hasText: 'Supplier' });
  }

  async goto() {
    await this.page.goto('/purchases');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.sidebarLink.click();
    await this.page.waitForURL('**/purchases');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  // ── Manage Suppliers ──────────────────────────────────────────────────────

  async openManageSuppliers() {
    await this.manageSuppliersButton.click();
    await this.suppliersDialog.waitFor({ state: 'visible' });
  }

  async addSupplier(name: string, gstin?: string, address?: string, phone?: string) {
    await this.supplierNameInput.fill(name);
    if (gstin)   await this.supplierGstinInput.fill(gstin);
    if (address) await this.supplierAddressInput.fill(address);
    if (phone)   await this.supplierPhoneInput.fill(phone);
    await this.addSupplierButton.click();
  }

  async closeManageSuppliers() {
    await this.suppliersDialogCloseButton.click();
    await this.suppliersDialog.waitFor({ state: 'hidden' });
  }

  // ── New Purchase ──────────────────────────────────────────────────────────

  async openNewPurchaseDialog() {
    await this.newPurchaseButton.click();
    await this.purchaseDialogHeading.waitFor({ state: 'visible' });
  }

  async selectSupplier(name: string) {
    await this.supplierCombobox.click();
    await this.page.getByRole('option', { name, exact: true }).click();
  }

  async selectItem(name: string) {
    await this.itemCombobox.click();
    await this.page.getByRole('option', { name, exact: true }).click();
  }

  async selectFirstSupplier(): Promise<string> {
    await this.supplierCombobox.click();
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

  async savePurchase() {
    await this.savePurchaseButton.click();
  }

  // ── Table ─────────────────────────────────────────────────────────────────

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

  async getFirstRowData(): Promise<{ date: string; supplier: string; invoice: string; item: string; qty: string; rate: string; total: string }> {
    const cells = this.tableBody.locator('tr').first().locator('td');
    return {
      date:     ((await cells.nth(0).textContent()) ?? '').trim(),
      supplier: ((await cells.nth(1).textContent()) ?? '').trim(),
      invoice:  ((await cells.nth(2).textContent()) ?? '').trim(),
      item:     ((await cells.nth(3).textContent()) ?? '').trim(),
      qty:      ((await cells.nth(4).textContent()) ?? '').trim(),
      rate:     ((await cells.nth(5).textContent()) ?? '').trim(),
      total:    ((await cells.nth(8).textContent()) ?? '').trim(),
    };
  }

  getEditButtonForRow(rowIndex: number): Locator {
    return this.tableBody.locator('tr').nth(rowIndex).getByRole('button');
  }

  async openEditDialog(rowIndex: number) {
    await this.getEditButtonForRow(rowIndex).click();
    await this.editDialogHeading.waitFor({ state: 'visible' });
  }
}
