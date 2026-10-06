import { test, expect } from '@playwright/test';

test('Code Mode reference is canonical, complete, and linked', async ({ page }) => {
  await page.goto('/standards/');
  const main = page.locator('main');

  await expect(page.getByRole('heading', { name: 'Standards and Boundaries', level: 1 })).toBeVisible();
  await expect(main).toContainText('Code Mode');
  await expect(main).not.toContainText('post-v0.4');
  await expect(main).not.toContainText('(unreleased)');

  const table = page.locator('table').filter({
    has: page.getByRole('columnheader', { name: 'Implementation example', exact: true }),
  });
  await expect(table).toHaveCount(1);
  await expect(table.locator('tbody tr')).toHaveCount(7);

  for (const name of [
    'Codex code-mode tool adaptation',
    'Pi MCP and Code Mode',
    'OpenAI API programmatic tool calling',
  ]) {
    await expect(table.getByRole('link', { name, exact: true })).toHaveCount(1);
  }

  await expect(main).toContainText('Source-backed harness integration, not a live compatibility test.');
  await expect(main).toContainText('complete: false');

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);

  const crossReference = main.getByRole('link', {
    name: 'model-informed decision inputs',
    exact: true,
  });
  await crossReference.click();
  await expect(page).toHaveURL(/\/apply\/patterns\/model-informed-decisions\/?$/);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Model-informed decisions, code-enforced consequences',
      exact: true,
    }),
  ).toBeVisible();
});

test('Comparison methodology preserves Code Mode exposure guidance', async ({ page }) => {
  await page.goto('/apply/comparison-methodology/');
  const main = page.locator('main');

  await expect(
    page.getByRole('heading', { name: 'Comparison methodology', level: 1 }),
  ).toBeVisible();
  await expect(main).toContainText(
    'The Harness Operations system comparison exists to make operational differences inspectable, not to rank products.',
  );
  await expect(main).not.toContainText('post-v0.4');
  await expect(main).not.toContainText('(unreleased)');
  await expect(main).toContainText('Exposure and reachability');
  await expect(main).toContainText('partial-outcome case');

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ),
  ).toBeLessThanOrEqual(1);

  await main.getByRole('link', { name: 'Code Mode prior art', exact: true }).click();
  await expect(page).toHaveURL(/\/standards\/#code-mode$/);
});
