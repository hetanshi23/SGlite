import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

const uniqueEmail = () => `testuser_${Date.now()}@example.com`;

test.describe('Sign Up - Negative Tests', () => {

  test.beforeEach(async ({ signUpPage }) => {
    await signUpPage.goto();
    await expect(signUpPage.pageHeading).toBeVisible();
    await expect(signUpPage.signUpButton).toBeEnabled();
  });

  // Merged: 1,2,3 - Blank Field Validations
  test.describe('Blank Field Validations', () => {

    test('should not submit with both fields blank, blank email and blank password', async ({ signUpPage, page }) => {

      // 1) Both fields blank
      await signUpPage.signUpButton.click();
      expect(await signUpPage.isEmailInvalid()).toBe(true);
      expect(await signUpPage.isPasswordInvalid()).toBe(true);
      const bothBlankEmailMsg = await signUpPage.getEmailValidationMessage();
      const bothBlankPasswordMsg = await signUpPage.getPasswordValidationMessage();
      expect(bothBlankEmailMsg.length).toBeGreaterThan(0);
      expect(bothBlankPasswordMsg.length).toBeGreaterThan(0);
      await expect(page).toHaveURL(/auth/);
      await expect(signUpPage.pageHeading).toBeVisible();

      // 2) Blank email, valid password
      await signUpPage.passwordInput.fill(testData.newUser.password);
      await signUpPage.signUpButton.click();
      expect(await signUpPage.isEmailInvalid()).toBe(true);
      const blankEmailMsg = await signUpPage.getEmailValidationMessage();
      expect(blankEmailMsg.length).toBeGreaterThan(0);
      await expect(page).toHaveURL(/auth/);
      await expect(signUpPage.pageHeading).toBeVisible();

      // 3) Valid email, blank password
      await signUpPage.passwordInput.clear();
      await signUpPage.emailInput.fill(uniqueEmail());
      await signUpPage.signUpButton.click();
      expect(await signUpPage.isPasswordInvalid()).toBe(true);
      const blankPasswordMsg = await signUpPage.getPasswordValidationMessage();
      expect(blankPasswordMsg.length).toBeGreaterThan(0);
      await expect(page).toHaveURL(/auth/);
      await expect(signUpPage.pageHeading).toBeVisible();
    });

  });

  // Merged: 4,5,6 - Invalid Email Format Validations
  test.describe('Invalid Email Format Validations', () => {

    test('should not submit with invalid email format, email with spaces and email missing domain', async ({ signUpPage, page }) => {

      // 4) Invalid email format (missing @)
      await signUpPage.emailInput.fill('invalidemail.com');
      await signUpPage.passwordInput.fill(testData.newUser.password);
      await signUpPage.signUpButton.click();
      expect(await signUpPage.isEmailInvalid()).toBe(true);
      const missingAtMsg = await signUpPage.getEmailValidationMessage();
      expect(missingAtMsg).toContain('@');
      await expect(page).toHaveURL(/auth/);
      await expect(signUpPage.pageHeading).toBeVisible();

      // 5) Email containing spaces
      await signUpPage.emailInput.fill('test user@example.com');
      await signUpPage.signUpButton.click();
      expect(await signUpPage.isEmailInvalid()).toBe(true);
      const spacedEmailMsg = await signUpPage.getEmailValidationMessage();
      expect(spacedEmailMsg.length).toBeGreaterThan(0);
      await expect(page).toHaveURL(/auth/);
      await expect(signUpPage.pageHeading).toBeVisible();

      // 6) Email missing domain
      await signUpPage.emailInput.fill('user@');
      await signUpPage.signUpButton.click();
      expect(await signUpPage.isEmailInvalid()).toBe(true);
      const missingDomainMsg = await signUpPage.getEmailValidationMessage();
      expect(missingDomainMsg.length).toBeGreaterThan(0);
      await expect(page).toHaveURL(/auth/);
      await expect(signUpPage.pageHeading).toBeVisible();
    });

  });

  // Merged: 7,8 - Password Validations
  test.describe('Password Validations', () => {

    test('should not submit with password below minimum length and password containing only spaces', async ({ signUpPage, page }) => {

      // 7) Password below minimum length
      await signUpPage.emailInput.fill(uniqueEmail());
      await signUpPage.passwordInput.fill('abc');
      await signUpPage.signUpButton.click();
      expect(await signUpPage.isPasswordInvalid()).toBe(true);
      const shortPasswordMsg = await signUpPage.getPasswordValidationMessage();
      expect(shortPasswordMsg).toContain('6');
      await expect(page).toHaveURL(/auth/);
      await expect(signUpPage.pageHeading).toBeVisible();

      // 8) Password containing only spaces
      await signUpPage.emailInput.fill(uniqueEmail());
      await signUpPage.passwordInput.fill('     ');
      await signUpPage.signUpButton.click();
      await expect(page).toHaveURL(/auth/);
      await expect(signUpPage.pageHeading).toBeVisible();
    });

  });

  // 9) Already Registered Email
  test.describe('Already Registered Email', () => {

    test('should show message when registering with already existing email', async ({ signUpPage, page }) => {
      await signUpPage.emailInput.fill(testData.validUser.email);
      await signUpPage.passwordInput.fill(testData.validUser.password);
      await signUpPage.signUpButton.click();
      await expect(signUpPage.errorMessage).toBeVisible();
      await expect(signUpPage.errorMessage).toContainText('Account created');
      await expect(page).toHaveURL(/auth/);
      await expect(signUpPage.signUpButton).toBeVisible();
      await expect(signUpPage.signUpButton).toBeEnabled();
    });

  });

  // 10) API / Server Error Handling
  test.describe('API & Server Error Handling', () => {

    test('should handle API/server error gracefully during sign up', async ({ signUpPage, page }) => {
      await page.route('**/auth/**', route => route.abort());
      await signUpPage.signUp(uniqueEmail(), testData.newUser.password);
      await expect(page).toHaveURL(/auth/);
      await page.unroute('**/auth/**');
      await expect(signUpPage.pageHeading).toBeVisible();
      await expect(signUpPage.signUpButton).toBeVisible();
      await expect(signUpPage.signUpButton).toBeEnabled();
    });

  });

});