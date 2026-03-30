import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

const longPassword = 'x'.repeat(1024);

async function verifyDashboardPostLogin(
  page: import('@playwright/test').Page,
  dashboardPage: import('../../pages/DashboardPage').DashboardPage,
  loginPage: import('../../pages/LoginPage').LoginPage
) {
  await test.step('TC-LOGIN-POS-001 - Verify dashboard page and session token', async () => {
    await expect(page).toHaveURL('https://sglite.lovable.app/', { timeout: 15000 });
    await expect(dashboardPage.heading).toBeVisible({ timeout: 10000 });
    await expect(dashboardPage.sidebar).toBeVisible();
    const token = await loginPage.getAuthToken();
    expect(token).not.toBeNull();
    expect(token?.length || 0).toBeGreaterThan(0);
  });
}

// Reset to login state with auth cleared
async function resetToLogin(page: import('@playwright/test').Page) {
  await page.evaluate(() => localStorage.clear());
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');
}

test.describe('Login Module Combined Test Suite', () => {
  test.beforeEach(async ({ loginPage, page }) => {
    await loginPage.goto();
  });

  test.describe('Positive Scenarios', () => {
    test('TC-LOGIN-POS-001 - Valid credentials log in via button click', async ({ loginPage, dashboardPage, page }) => {
      await test.step('Enter credentials and click Sign In', async () => {
        await loginPage.login(testData.validUser.email, testData.validUser.password);
      });

      await verifyDashboardPostLogin(page, dashboardPage, loginPage);
    });

    test('TC-LOGIN-POS-002 - Valid credentials log in via Enter key', async ({ loginPage, dashboardPage, page }) => {
      await test.step('Enter credentials and submit by Enter key', async () => {
        await loginPage.loginWithEnter(testData.validUser.email, testData.validUser.password);
      });

      await verifyDashboardPostLogin(page, dashboardPage, loginPage);
    });

    test('TC-LOGIN-POS-003 - Login with leading/trailing email spaces', async ({ loginPage, dashboardPage, page }) => {
      await test.step('Submit trimmed email login', async () => {
        await loginPage.loginWithTrimmedEmail(testData.validUser.email, testData.validUser.password);
      });

      await verifyDashboardPostLogin(page, dashboardPage, loginPage);
    });

    test('TC-LOGIN-POS-006 - Session persistence across tabs after login', async ({ loginPage, page, dashboardPage }) => {
      await loginPage.login(testData.validUser.email, testData.validUser.password);
      await verifyDashboardPostLogin(page, dashboardPage, loginPage);

      await test.step('Open second tab and verify authenticated dashboard', async () => {
        const secondPage = await page.context().newPage();
        await secondPage.goto('/');
        await expect(secondPage).toHaveURL('https://sglite.lovable.app/');
        await expect(secondPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        await secondPage.close();
      });
    });
  });

  test.describe('Negative Scenarios', () => {
    test('TC-LOGIN-NEG-001 - Invalid email format should block login', async ({ loginPage, page }) => {
      await test.step('Fill invalid email and valid password', async () => {
        await loginPage.emailInput.fill('invalid-email-format');
        await loginPage.passwordInput.fill(testData.validUser.password);
        await loginPage.loginButton.click();
      });

      await test.step('Validate HTML5 invalid email state and no redirect', async () => {
        expect(await loginPage.isEmailInvalid()).toBe(true);
        await expect(page).toHaveURL(/auth/);
      });
    });

    test('TC-LOGIN-NEG-002 - Wrong password shows invalid credentials message', async ({ loginPage, page }) => {
      await test.step('Submit invalid password', async () => {
        await loginPage.login(testData.validUser.email, 'WrongPass123!');
      });

      await test.step('Validate error message and no login', async () => {
        await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
        await expect(loginPage.errorMessage).toContainText(/invalid login credentials/i);
        await expect(page).toHaveURL(/auth/);
      });
    });

    test('TC-LOGIN-NEG-005 - Empty fields should not submit', async ({ loginPage, page }) => {
      await test.step('Clear email and password and click login', async () => {
        await loginPage.emailInput.fill('');
        await loginPage.passwordInput.fill('');
        await loginPage.loginButton.click();
      });

      await test.step('Validate both fields invalid and no redirect', async () => {
        expect(await loginPage.isEmailInvalid()).toBe(true);
        expect(await loginPage.isPasswordInvalid()).toBe(true);
        await expect(page).toHaveURL(/auth/);
      });
    });
  });

  test.describe('Validation Scenarios', () => {
    test('TC-VALIDATION-EMAIL-002 - Email with spaces is invalid', async ({ loginPage, page }) => {
      await loginPage.emailInput.fill('user @example.com');
      await loginPage.passwordInput.fill(testData.validUser.password);
      await loginPage.loginButton.click();
      expect(await loginPage.isEmailInvalid()).toBe(true);
      await expect(page).toHaveURL(/auth/);
    });

    test('TC-VALIDATION-PWD-001 - Short password is invalid', async ({ loginPage, page }) => {
      await loginPage.emailInput.fill(testData.validUser.email);
      await loginPage.passwordInput.fill('123');
      await loginPage.loginButton.click();
      expect(await loginPage.isPasswordInvalid()).toBe(true);
      await expect(page).toHaveURL(/auth/);
    });

    test('TC-VALIDATION-ERR-001 - Invalid credentials message is displayed', async ({ loginPage, page }) => {
      await loginPage.login('wrong@example.com', 'wrongPassword1!');
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
      await expect(loginPage.errorMessage).toContainText(/invalid login credentials/i);
    });
  });

  test.describe('UI Scenarios', () => {
    test('TC-UI-ELEMENTS-001 - Login form elements are visible and enabled', async ({ loginPage, page }) => {
      await test.step('Validate UI elements on login page', async () => {
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.signUpButton).toBeVisible();

        await expect(loginPage.emailInput).toBeEnabled();
        await expect(loginPage.passwordInput).toBeEnabled();
        await expect(loginPage.loginButton).toBeEnabled();
      });

      await test.step('Validate page URL', async () => {
        await expect(page).toHaveURL(/auth/);
      });
    });

    test('TC-UI-BUTTONS-002 - Sign Up link transitions to sign-up flow', async ({ loginPage, page }) => {
      await loginPage.signUpButton.click();
      await expect(page).toHaveURL(/auth/);
      await expect(page.getByText(/Sign up/i)).toBeVisible();
    });
  });

  test.describe('Edge Case Scenarios', () => {
    test('TC-EDGE-INPUT-001 - Extremely long password should be handled gracefully', async ({ loginPage, page }) => {
      await loginPage.emailInput.fill(testData.validUser.email);
      await loginPage.passwordInput.fill(longPassword);
      await loginPage.loginButton.click();
      await expect(page).toHaveURL(/auth/);
      await expect(loginPage.errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('TC-EDGE-INPUT-003 - SQL injection input should not bypass login', async ({ loginPage, page }) => {
      await loginPage.emailInput.fill("'; DROP TABLE users; --@example.com");
      await loginPage.passwordInput.fill('Password123!');
      await loginPage.loginButton.click();
      await expect(page).toHaveURL(/auth/);
      // It may show a generic error or just fail to log in
      const isErrorVisible = await loginPage.errorMessage.isVisible();
      const isStillOnAuth = page.url().includes('/auth');
      expect(isErrorVisible || isStillOnAuth).toBeTruthy();
    });
  });

  test.describe('Security Scenarios', () => {
    test('TC-SECURITY-AUTH-001 - Unauthorized access to dashboard redirects to auth', async ({ page }) => {
      await resetToLogin(page);
      await page.goto('/');
      await expect(page).toHaveURL(/auth/);
    });

    test('TC-SECURITY-SESSION-001 - Auth token is set on successful login', async ({ loginPage, page }) => {
      await loginPage.login(testData.validUser.email, testData.validUser.password);
      await expect(page).toHaveURL('https://sglite.lovable.app/');
      const authToken = await loginPage.getAuthToken();
      expect(authToken).not.toBeNull();
      expect(authToken?.length || 0).toBeGreaterThan(0);
    });
  });

  test.describe('Performance Scenarios', () => {
    test('TC-PERF-RESPONSE-001 - Login API should respond within 3 seconds', async ({ loginPage, page }) => {
      const start = Date.now();
      const responsePromise = page.waitForResponse((response) =>
        response.url().includes('/auth') && response.request().method() === 'POST'
      );

      await loginPage.login(testData.validUser.email, testData.validUser.password);
      const response = await responsePromise;
      const elapsed = Date.now() - start;

      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(400);
      expect(elapsed).toBeLessThanOrEqual(3000);
    });
  });
});