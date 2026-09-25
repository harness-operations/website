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


test('Applied Harness Operations landing page is reachable', async ({ page }) => {
  await page.goto('/apply/');
  await expect(page.getByRole('heading', { name: 'Apply the model', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Landscape matrix', exact: true })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('landscape matrix renders canonical v0.3 data and filters tested evidence', async ({ page }) => {
  await page.goto('/apply/matrix/');
  await expect(page.getByRole('heading', { name: 'Landscape Matrix', level: 1 })).toBeVisible();
  await expect(page.getByText('7 systems', { exact: false })).toBeVisible();
  await expect(page.getByText('15 capabilities', { exact: false })).toBeVisible();
  await expect(page.getByText('4 directed integration observations', { exact: false })).toBeVisible();

  await page.locator('[data-filter-role]').selectOption('harness');
  await page.locator('[data-filter-evidence]').selectOption('live_test');
  await expect(page.locator('[data-result-count]')).toHaveText('2 scoped rows shown');

  await expect(page.getByRole('rowheader', { name: /OpenAI Codex/ })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: /Anthropic Claude Code/ })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: /Cursor/ })).toBeHidden();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const scrollContainer = page.locator('.ho-matrix-scroll').first();
  await expect(scrollContainer).toBeVisible();
  const scrollable = await scrollContainer.evaluate(
    (element) => element.scrollWidth >= element.clientWidth,
  );
  expect(scrollable).toBeTruthy();
});

test('matrix capability filter preserves explicit unknown semantics', async ({ page }) => {
  await page.goto('/apply/matrix/');
  await page.locator('[data-filter-capability]').selectOption('credentials.mediation');
  await page.locator('[data-filter-evidence]').selectOption('uncertain');

  const count = page.locator('[data-result-count]');
  await expect(count).not.toHaveText('0 scoped rows shown');
  await expect(page.getByText('Unknown', { exact: true }).first()).toBeVisible();
});
