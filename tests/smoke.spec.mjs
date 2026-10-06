import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';

const release = JSON.parse(readFileSync(new URL('../SPEC_RELEASE.json', import.meta.url), 'utf8'));
const displayVersion = release.version.replace(/^v/, '');

test('homepage leads with Systems and the pinned release without horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Harness Operations', level: 1 })).toBeVisible();
  await expect(page.getByText(`Harness Operations ${displayVersion}`, { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore Systems', exact: true })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('Systems navigation and canonical entries are reachable', async ({ page }) => {
  await page.goto('/systems/');
  await expect(page.getByRole('heading', { name: 'Systems', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /Claude Projects/i }).first()).toBeVisible();

  await page.goto('/systems/claude-projects/');
  await expect(page.getByRole('heading', { name: /Claude Projects/i, level: 1 })).toBeVisible();
});

test('Standards and Boundaries uses the canonical route', async ({ page }) => {
  await page.goto('/standards/');
  await expect(page.getByRole('heading', { name: 'Standards and Boundaries', level: 1 })).toBeVisible();
});

test('search opens and accepts a query', async ({ page }) => {
  await page.goto('/');
  const searchButton = page.getByRole('button', { name: /search/i }).first();
  await expect(searchButton).toBeVisible();
  await searchButton.click();

  const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
  await expect(searchInput).toBeVisible();
  await searchInput.fill('Claude Projects');
  await expect(searchInput).toHaveValue('Claude Projects');
});

test('comparison landing page is reachable', async ({ page }) => {
  await page.goto('/apply/');
  await expect(page.getByRole('heading', { name: 'Compare and validate', level: 1 })).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: 'System Comparisons', exact: true })).toBeVisible();
});

test('System Comparisons renders canonical data and filters live evidence', async ({ page }) => {
  await page.goto('/apply/matrix/');
  await expect(page.getByRole('heading', { name: 'System Comparisons', level: 1 })).toBeVisible();
  await expect(page.locator('.ho-matrix-intro')).toContainText('systems');
  await expect(page.locator('.ho-matrix-intro')).toContainText('capabilities');

  await page.locator('[data-filter-role]').selectOption('harness');
  await page.locator('[data-filter-evidence]').selectOption('live_test');
  await expect(page.locator('[data-result-count]')).not.toHaveText('0 scoped rows shown');

  await expect(page.getByRole('rowheader', { name: /OpenAI Codex/ })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: /Anthropic Claude Code/ })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('comparison unknown filter remains distinct from not applicable', async ({ page }) => {
  await page.goto('/apply/matrix/');
  await page.locator('[data-filter-capability]').selectOption('credentials.mediation');
  await page.locator('[data-filter-evidence]').selectOption('unknown');

  await expect(page.locator('[data-result-count]')).not.toHaveText('0 scoped rows shown');
  await expect(page.getByText('Unknown', { exact: true }).first()).toBeVisible();
});
