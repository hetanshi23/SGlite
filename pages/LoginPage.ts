import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly signUpButton: Locator;
  readonly errorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.getByRole('button', { name: 'Sign In' });
    this.signUpButton = page.getByRole('button', { name: 'Sign Up' });
    this.errorMessage = page.locator('li[role="status"]').filter({ hasText: 'Invalid login credentials' });
    this.emailError = page.locator('p:has-text("Email is required"), p:has-text("Invalid email address")');
    this.passwordError = page.locator('p:has-text("Password is required"), p:has-text("Password must be at least 8 characters long")');
    this.pageHeading = page.getByText('Sign in to your account');
  }

  async goto() {
    await this.page.goto('/auth', { timeout: 60000 });
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible', timeout: 60000 });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginWithEnter(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.passwordInput.press('Enter');
  }

  async loginWithTrimmedEmail(email: string, password: string) {
    await this.emailInput.fill(`  ${email}  `);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isEmailInvalid(): Promise<boolean> {
    const isNativeInvalid = await this.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    const isCustomInvalid = await this.emailError.isVisible();
    return isNativeInvalid || isCustomInvalid;
  }

  async isPasswordInvalid(): Promise<boolean> {
    const isNativeInvalid = await this.passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    const isCustomInvalid = await this.passwordError.isVisible();
    return isNativeInvalid || isCustomInvalid;
  }

  async getAuthToken(): Promise<string | null> {
    return await this.page.evaluate(() => localStorage.getItem('sglite-auth-token'));
  }
}
