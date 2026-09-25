import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const release = JSON.parse(readFileSync(new URL('../SPEC_RELEASE.json', import.meta.url), 'utf8'));
const displayVersion = release.version.replace(/^v/, '');

test('homepage renders the pinned release without horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Harness Operations', level: 1 })).toBeVisible();
  await expect(page.getByText(`Reference Model ${displayVersion}`, { exact: false }).first()).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('reference navigation works', async ({ page }) => {
  await page.goto('/');
  const overview = page.getByRole('link', { name: 'Overview', exact: true }).first();
  await expect(overview).toBeVisible();
  await overview.click();
  await expect(page).toHaveURL(/\/overview\/?$/);
  await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
});

test('search opens and accepts a query', async ({ page }) => {
  await page.goto('/');
  const searchButton = page.getByRole('button', { name: /search/i }).first();
  await expect(searchButton).toBeVisible();
  await searchButton.click();

  const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
  await expect(searchInput).toBeVisible();
  await searchInput.fill('Governance');
  await expect(searchInput).toHaveValue('Governance');
});
