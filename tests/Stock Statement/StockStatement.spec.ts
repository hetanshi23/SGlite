import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';
import type { StockRow, TotalRow } from '../../pages/StockStatementPage';

// ── Helper: round to 3 decimal places to avoid floating point drift ────────
const round = (n: number) => parseFloat(n.toFixed(3));

// ── Reusable tab validator ─────────────────────────────────────────────────
async function validateTab(
  tabName: string,
  stockStatementPage: InstanceType<typeof import('../../pages/StockStatementPage').StockStatementPage>,
  page: import('@playwright/test').Page
) {
  await test.step(`Validate tab: ${tabName}`, async () => {

    // ── 1) Table and column headers ────────────────────────────────────────
    await expect(stockStatementPage.table).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Item' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Unit' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Opening' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Purchase' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Prod. In' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Issued' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Sales' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Adj.' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Closing' })).toBeVisible();

    // ── 2) Fetch all data rows ─────────────────────────────────────────────
    const rows: StockRow[] = await stockStatementPage.getAllRows();
    expect(rows.length, `[${tabName}] must have at least 1 data row`).toBeGreaterThan(0);

    // ── 3) Per-row: data integrity + closing formula ───────────────────────
    let sumOpening = 0, sumPurchase = 0, sumProdIn = 0;
    let sumIssued  = 0, sumSales    = 0, sumAdj    = 0, sumClosing = 0;

    for (const row of rows) {

      // 3a) Item and unit must not be empty
      expect(row.item, `[${tabName}] item name must not be empty`).not.toBe('');
      expect(row.unit, `[${tabName}] [${row.item}] unit must not be empty`).not.toBe('');

      // 3b) No NaN values
      const fields: Array<[string, number]> = [
        ['opening',  row.opening],
        ['purchase', row.purchase],
        ['prodIn',   row.prodIn],
        ['issued',   row.issued],
        ['sales',    row.sales],
        ['adj',      row.adj],
        ['closing',  row.closing],
      ];
      for (const [field, value] of fields) {
        expect(
          isNaN(value),
          `[${tabName}] [${row.item}] ${field} is NaN — raw value may be unparseable`
        ).toBe(false);
      }

      // 3c) Business rules — these columns must be non-negative
      expect(row.purchase, `[${tabName}] [${row.item}] purchase must be >= 0`).toBeGreaterThanOrEqual(0);
      expect(row.prodIn,   `[${tabName}] [${row.item}] prodIn must be >= 0`).toBeGreaterThanOrEqual(0);
      expect(row.issued,   `[${tabName}] [${row.item}] issued must be >= 0`).toBeGreaterThanOrEqual(0);
      expect(row.sales,    `[${tabName}] [${row.item}] sales must be >= 0`).toBeGreaterThanOrEqual(0);

      // 3d) Closing formula: Closing = Opening + Purchase + ProdIn - Issued - Sales + Adj
      const expectedClosing = stockStatementPage.calcClosing(row);
      expect(
        row.closing,
        `[${tabName}] [${row.item}] Closing mismatch:\n` +
        `  Formula : Opening(${row.opening}) + Purchase(${row.purchase}) + ProdIn(${row.prodIn}) - Issued(${row.issued}) - Sales(${row.sales}) + Adj(${row.adj})\n` +
        `  Expected: ${expectedClosing}\n` +
        `  UI shows: ${row.closing}`
      ).toBeCloseTo(expectedClosing, 2);

      // Accumulate column sums for Total row check
      sumOpening  += row.opening;
      sumPurchase += row.purchase;
      sumProdIn   += row.prodIn;
      sumIssued   += row.issued;
      sumSales    += row.sales;
      sumAdj      += row.adj;
      sumClosing  += row.closing;
    }

    // ── 4) Total row: UI values must match calculated column sums ──────────
    const total: TotalRow = await stockStatementPage.getTotalRowData();

    expect(isNaN(total.closing), `[${tabName}] Total row closing is NaN`).toBe(false);

    const totalChecks: Array<[string, number, number]> = [
      ['Opening',  total.opening,  round(sumOpening)],
      ['Purchase', total.purchase, round(sumPurchase)],
      ['Prod. In', total.prodIn,   round(sumProdIn)],
      ['Issued',   total.issued,   round(sumIssued)],
      ['Sales',    total.sales,    round(sumSales)],
      ['Adj.',     total.adj,      round(sumAdj)],
      ['Closing',  total.closing,  round(sumClosing)],
    ];

    for (const [col, uiTotal, calcTotal] of totalChecks) {
      expect(
        uiTotal,
        `[${tabName}] Total row [${col}] mismatch:\n` +
        `  Calculated sum of rows: ${calcTotal}\n` +
        `  UI Total row shows    : ${uiTotal}`
      ).toBeCloseTo(calcTotal, 2);
    }
  });
}

// ──────────────────────────────────────────────────────────────────────────
test.describe('Stock Statement — Calculation & Data Integrity', () => {

  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(testData.validUser.email, testData.validUser.password);
    await page.waitForURL('**/');
  });

  test('Validate stock calculations tab by tab — Raw Materials → Intermediate → Finished Products → Waste/Byproducts → All Items', async ({
    stockStatementPage,
    page,
  }) => {

    // ── Step 1: Navigate ───────────────────────────────────────────────────
    await test.step('Step 1 — Navigate to Stock Statement via sidebar', async () => {
      await stockStatementPage.navigateFromSidebar();

      await expect(page).toHaveURL(/\/stock-statement/);
      await expect(stockStatementPage.pageHeading).toHaveText('Stock Statement');
      await expect(stockStatementPage.periodDescription).toContainText('Inventory movement summary for');
      await expect(stockStatementPage.periodHeading).toContainText('Period:');

      await expect(stockStatementPage.rawMaterialsTab).toBeVisible();
      await expect(stockStatementPage.intermediateTab).toBeVisible();
      await expect(stockStatementPage.finishedProductsTab).toBeVisible();
      await expect(stockStatementPage.wasteByproductsTab).toBeVisible();
      await expect(stockStatementPage.allItemsTab).toBeVisible();
    });

    // ── Step 2: Raw Materials ──────────────────────────────────────────────
    await test.step('Step 2 — Raw Materials tab', async () => {
      await expect(stockStatementPage.rawMaterialsTab).toHaveAttribute('aria-selected', 'true');
      await validateTab('Raw Materials', stockStatementPage, page);
    });

    // ── Step 3: Intermediate ──────────────────────────────────────────────
    await test.step('Step 3 — Intermediate tab', async () => {
      await stockStatementPage.intermediateTab.click();
      await expect(stockStatementPage.intermediateTab).toHaveAttribute('aria-selected', 'true');
      await validateTab('Intermediate', stockStatementPage, page);
    });

    // ── Step 4: Finished Products ─────────────────────────────────────────
    await test.step('Step 4 — Finished Products tab', async () => {
      await stockStatementPage.finishedProductsTab.click();
      await expect(stockStatementPage.finishedProductsTab).toHaveAttribute('aria-selected', 'true');
      await validateTab('Finished Products', stockStatementPage, page);
    });

    // ── Step 5: Waste / Byproducts ────────────────────────────────────────
    await test.step('Step 5 — Waste / Byproducts tab', async () => {
      await stockStatementPage.wasteByproductsTab.click();
      await expect(stockStatementPage.wasteByproductsTab).toHaveAttribute('aria-selected', 'true');
      await validateTab('Waste / Byproducts', stockStatementPage, page);
    });

    // ── Step 6: All Items ─────────────────────────────────────────────────
    await test.step('Step 6 — All Items tab — combined data + cross-tab count check', async () => {
      await stockStatementPage.allItemsTab.click();
      await expect(stockStatementPage.allItemsTab).toHaveAttribute('aria-selected', 'true');
      await validateTab('All Items', stockStatementPage, page);

      // Cross-tab: All Items row count must be >= Raw Materials row count
      const allRows = await stockStatementPage.getAllRows();
      await stockStatementPage.rawMaterialsTab.click();
      const rawRows = await stockStatementPage.getAllRows();
      await stockStatementPage.allItemsTab.click();

      expect(
        allRows.length,
        `All Items (${allRows.length}) must have >= rows than Raw Materials (${rawRows.length})`
      ).toBeGreaterThanOrEqual(rawRows.length);

      // All Items Total closing must be a valid number
      const allTotal = await stockStatementPage.getTotalRowData();
      expect(isNaN(allTotal.closing), 'All Items Total closing must not be NaN').toBe(false);
    });

  });

});
