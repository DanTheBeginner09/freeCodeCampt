import { test, expect, FrameLocator } from '@playwright/test';

test.describe('Sass Challenge', () => {
  let frame: FrameLocator;

  test.beforeEach(async ({ page }) => {
    await page.goto(
      '/learn/front-end-development-libraries/sass/use-for-to-create-a-sass-loop'
    );

    frame = page.frameLocator('.challenge-preview iframe');
    expect(frame).not.toBeNull();
  });

  test('should render the sass preview', async () => {
    await expect(frame.locator('.text-1')).toBeVisible();
    await expect(frame.locator('.text-2')).toBeVisible();
    await expect(frame.locator('.text-3')).toBeVisible();
    await expect(frame.locator('.text-4')).toBeVisible();
    await expect(frame.locator('.text-5')).toBeVisible();
  });
});
