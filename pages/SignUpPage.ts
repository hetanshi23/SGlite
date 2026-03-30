import { Page, Locator } from '@playwright/test';

export class SignUpPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.signUpButton = page.getByRole('button', { name: 'Sign Up' });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.locator('li[role="status"]');
    this.pageHeading = page.getByText('Sign up');
  }

  async goto() {
    await this.page.goto('/auth');
    await this.page.waitForLoadState('networkidle');
    await this.signUpButton.click();
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async signUp(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signUpButton.click();
  }

  async isEmailInvalid(): Promise<boolean> {
    return await this.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
  }

  async isPasswordInvalid(): Promise<boolean> {
    return await this.passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
  }

  async getEmailValidationMessage(): Promise<string> {
    return await this.emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
  }

  async getPasswordValidationMessage(): Promise<string> {
    return await this.passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
  }
}
