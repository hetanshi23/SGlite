import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkSignupPage() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
  console.log(`Navigating to ${baseUrl}/auth`);
  await page.goto(`${baseUrl}/auth`);
  
  // Click "Sign Up" button to switch to signup view if needed
  const signUpBtn = page.getByRole('button', { name: 'Sign Up' });
  if (await signUpBtn.isVisible()) {
    console.log('Clicking Sign Up button to switch view...');
    await signUpBtn.click();
  }
  
  await page.waitForTimeout(1000);
  
  const emailInput = page.locator('#email');
  const passwordInput = page.locator('#password');
  
  const emailAttrs = await emailInput.evaluate((el: HTMLInputElement) => {
    return {
      type: el.type,
      required: el.required,
      tagName: el.tagName,
      id: el.id,
      name: el.name,
      placeholder: el.placeholder
    };
  });
  
  const passwordAttrs = await passwordInput.evaluate((el: HTMLInputElement) => {
    return {
      type: el.type,
      required: el.required,
      tagName: el.tagName,
      id: el.id,
      name: el.name,
      placeholder: el.placeholder
    };
  });
  
  console.log('Email attributes:', emailAttrs);
  console.log('Password attributes:', passwordAttrs);
  
  const signUpSubmitBtn = page.getByRole('button', { name: 'Sign Up' });
  const btnType = await signUpSubmitBtn.getAttribute('type');
  console.log('Sign Up button type:', btnType);
  
  const form = page.locator('form');
  const formCount = await form.count();
  console.log('Number of forms on page:', formCount);
  
  await browser.close();
}

checkSignupPage().catch(console.error);
