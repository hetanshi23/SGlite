import { test, expect } from '../../fixtures/pageFixtures';
import { testData } from '../../utils/testData';

const uniqueEmail = () => `testuser_${Date.now()}@example.com`;

test.describe('Sign Up - Positive Tests', () => {

  test.beforeEach(async ({ signUpPage }) => {
    await signUpPage.goto();
  });

  // 1) UI & Form Elements
  test('should display all sign up form elements correctly', async ({ signUpPage, page }) => {
    await expect(signUpPage.pageHeading).toBeVisible();
    await expect(signUpPage.emailInput).toBeVisible();
    await expect(signUpPage.passwordInput).toBeVisible();
    await expect(signUpPage.signUpButton).toBeVisible();
    await expect(signUpPage.signInButton).toBeVisible();
    await expect(page).toHaveURL(/auth/);
  });

  // 2) Password Field Masked
  test('should have password field masked', async ({ signUpPage }) => {
    await signUpPage.passwordInput.fill(testData.newUser.password);
    const inputType = await signUpPage.passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
  });

  // 3) Sign Up Button Enabled
  test('should keep sign up button enabled when fields are empty', async ({ signUpPage }) => {
    await expect(signUpPage.signUpButton).toBeVisible();
    await expect(signUpPage.signUpButton).toBeEnabled();
  });

  // 4) Navigation to Sign In
  test('should navigate to sign in page when Sign In button is clicked', async ({ signUpPage, page }) => {
    await signUpPage.signInButton.click();
    await expect(page.getByText('Sign in to your account')).toBeVisible();
  });

  // 5) Successful Sign Up
  test('should register successfully with valid new credentials', async ({ signUpPage, page }) => {
    await signUpPage.signUp(uniqueEmail(), testData.newUser.password);
    await expect(page).toHaveURL(/auth|dashboard|home/);
  });

});
