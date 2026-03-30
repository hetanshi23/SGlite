import { Page, Locator } from '@playwright/test';

export class ItemsBomPage {
  readonly page: Page;

  // ── Page ──────────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly sidebarLink: Locator;
  readonly addItemButton: Locator;

  // ── Tabs ──────────────────────────────────────────────────────────────────
  readonly rawMaterialsTab: Locator;
  readonly intermediateTab: Locator;
  readonly finishedTab: Locator;
  readonly byproductTab: Locator;

  // ── Table ─────────────────────────────────────────────────────────────────
  readonly table: Locator;
  readonly tableBody: Locator;

  // ── BOM Section ───────────────────────────────────────────────────────────
  readonly bomHeading: Locator;
  readonly stage1Heading: Locator;
  readonly stage2Heading: Locator;
  readonly stage1Badge: Locator;
  readonly stage2Badge: Locator;
  readonly addBomEntryButton: Locator;

  // ── Add / Edit Item dialog ────────────────────────────────────────────────
  readonly dialog: Locator;
  readonly addDialogHeading: Locator;
  readonly editDialogHeading: Locator;
  readonly nameInput: Locator;
  readonly categoryCombobox: Locator;
  readonly unitInput: Locator;
  readonly hsnInput: Locator;
  readonly gstInput: Locator;
  readonly minThresholdInput: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading   = page.getByRole('heading', { name: 'Items & BOM', level: 1 });
    this.sidebarLink   = page.getByRole('link', { name: 'Items & BOM', exact: true });
    this.addItemButton = page.getByRole('button', { name: 'Add Item' });

    this.rawMaterialsTab = page.getByRole('tab', { name: /Raw Materials/ });
    this.intermediateTab = page.getByRole('tab', { name: /Intermediate/ });
    this.finishedTab     = page.getByRole('tab', { name: /Finished/ });
    this.byproductTab    = page.getByRole('tab', { name: /Byproduct/ });

    this.table     = page.locator('table').first();
    this.tableBody = page.locator('tbody').first();

    this.bomHeading       = page.getByRole('heading', { name: 'Process BOM' });
    this.stage1Heading    = page.getByRole('heading', { name: /Stage 1/ });
    this.stage2Heading    = page.getByRole('heading', { name: /Stage 2/ });
    this.stage1Badge      = page.locator('h3').filter({ hasText: 'Stage 1' }).locator('..').locator('..').locator('[class*="rounded-full"]');
    this.stage2Badge      = page.locator('h3').filter({ hasText: 'Stage 2' }).locator('..').locator('..').locator('[class*="rounded-full"]');
    this.addBomEntryButton = page.getByRole('button', { name: 'Add BOM Entry' });

    this.dialog            = page.getByRole('dialog');
    this.addDialogHeading  = page.getByRole('dialog').getByRole('heading', { name: 'Add Item' });
    this.editDialogHeading = page.getByRole('dialog').getByRole('heading', { name: 'Edit Item' });
    this.nameInput         = page.getByRole('dialog').locator('input').nth(0);
    this.categoryCombobox  = page.getByRole('dialog').getByRole('combobox');
    this.unitInput         = page.getByRole('dialog').locator('input').nth(1);
    this.hsnInput          = page.getByRole('dialog').locator('input').nth(2);
    this.gstInput          = page.getByRole('dialog').locator('input').nth(3);
    this.minThresholdInput = page.getByRole('dialog').locator('input').nth(4);
    this.saveButton        = page.getByRole('dialog').getByRole('button', { name: 'Save' });
    this.closeButton       = page.getByRole('dialog').getByRole('button', { name: 'Close' });
  }

  async goto() {
    await this.page.goto('/items');
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async navigateFromSidebar() {
    await this.sidebarLink.click();
    await this.page.waitForURL('**/items');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async openAddItemDialog() {
    await this.addItemButton.click();
    await this.addDialogHeading.waitFor({ state: 'visible' });
  }

  async expandStage(stageNumber: 1 | 2) {
    const heading = this.page.getByRole('heading', { name: new RegExp(`Stage ${stageNumber}`) });
    await heading.click();
    await this.page.waitForTimeout(500);
  }

  // Returns inputs table rows for the expanded stage
  getStageInputsTable(): Locator {
    return this.page.locator('h4').filter({ hasText: 'Inputs' }).locator('..').locator('table tbody tr');
  }

  // Returns outputs table rows for the expanded stage
  getStageOutputsTable(): Locator {
    return this.page.locator('h4').filter({ hasText: 'Outputs' }).locator('..').locator('table tbody tr');
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

  async getRowData(rowIndex: number): Promise<{ name: string; unit: string; hsn: string; gst: string; minThreshold: string }> {
    const cells = this.tableBody.locator('tr').nth(rowIndex).locator('td');
    return {
      name:         ((await cells.nth(0).textContent()) ?? '').trim(),
      unit:         ((await cells.nth(1).textContent()) ?? '').trim(),
      hsn:          ((await cells.nth(2).textContent()) ?? '').trim(),
      gst:          ((await cells.nth(3).textContent()) ?? '').trim(),
      minThreshold: ((await cells.nth(4).textContent()) ?? '').trim(),
    };
  }

  async findRowIndexByName(name: string): Promise<number> {
    const rows     = this.tableBody.locator('tr');
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const text = await rows.nth(i).locator('td').nth(0).textContent();
      if (text?.trim() === name) return i;
    }
    return -1;
  }

  getEditButtonForRow(rowIndex: number): Locator {
    return this.tableBody.locator('tr').nth(rowIndex).getByRole('button').first();
  }

  async openEditDialog(rowIndex: number) {
    await this.getEditButtonForRow(rowIndex).click();
    await this.editDialogHeading.waitFor({ state: 'visible' });
  }
}
