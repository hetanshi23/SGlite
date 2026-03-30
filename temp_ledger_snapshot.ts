import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://sglite.lovable.app/auth');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('');
});