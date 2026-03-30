import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SignUpPage } from '../pages/SignUpPage';
import { DailyEntryPage } from '../pages/dailyEntry.page';
import { PurchasesPage } from '../pages/purchases.page';
import { SalesPage } from '../pages/sales.page';
import { StockAdjPage } from '../pages/stockAdj.page';
import { ProductionPage } from '../pages/ProductionPage';
import { PurchasesPageNew } from '../pages/PurchasesPageNew';
import { SalesPageNew } from '../pages/SalesPageNew';
import { DemandPage } from '../pages/DemandPage';
import { ItemsBomPage } from '../pages/ItemsBomPage';
import { PlannerPage } from '../pages/PlannerPage';
import { BusinessSummaryPage } from '../pages/BusinessSummaryPage';
import { StockStatementPage } from '../pages/StockStatementPage';
import { ProductionReportPage } from '../pages/ProductionReportPage';
import { MaterialLedgersPage } from '../pages/MaterialLedgersPage';

// Define custom fixture types
type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  signUpPage: SignUpPage;
  dailyEntryPage: DailyEntryPage;
  purchasesPage: PurchasesPage;
  salesPage: SalesPage;
  stockAdjPage: StockAdjPage;
  productionPage: ProductionPage;
  purchasesPageNew: PurchasesPageNew;
  salesPageNew: SalesPageNew;
  demandPage: DemandPage;
  itemsBomPage: ItemsBomPage;
  plannerPage: PlannerPage;
  businessSummaryPage: BusinessSummaryPage;
  stockStatementPage: StockStatementPage;
  productionReportPage: ProductionReportPage;
  materialLedgersPage: MaterialLedgersPage;
};

// Extend base test with custom page object fixtures
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  signUpPage: async ({ page }, use) => {
    await use(new SignUpPage(page));
  },
  dailyEntryPage: async ({ page }, use) => {
    await use(new DailyEntryPage(page));
  },
  purchasesPage: async ({ page }, use) => {
    await use(new PurchasesPage(page));
  },
  salesPage: async ({ page }, use) => {
    await use(new SalesPage(page));
  },
  stockAdjPage: async ({ page }, use) => {
    await use(new StockAdjPage(page));
  },
  productionPage: async ({ page }, use) => {
    await use(new ProductionPage(page));
  },
  purchasesPageNew: async ({ page }, use) => {
    await use(new PurchasesPageNew(page));
  },
  salesPageNew: async ({ page }, use) => {
    await use(new SalesPageNew(page));
  },
  demandPage: async ({ page }, use) => {
    await use(new DemandPage(page));
  },
  itemsBomPage: async ({ page }, use) => {
    await use(new ItemsBomPage(page));
  },
  plannerPage: async ({ page }, use) => {
    await use(new PlannerPage(page));
  },
  businessSummaryPage: async ({ page }, use) => {
    await use(new BusinessSummaryPage(page));
  },
  stockStatementPage: async ({ page }, use) => {
    await use(new StockStatementPage(page));
  },
  productionReportPage: async ({ page }, use) => {
    await use(new ProductionReportPage(page));
  },
  materialLedgersPage: async ({ page }, use) => {
    await use(new MaterialLedgersPage(page));
  },
});

export { expect } from '@playwright/test';