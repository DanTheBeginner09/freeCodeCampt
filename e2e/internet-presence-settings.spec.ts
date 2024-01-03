import { test, expect } from '@playwright/test';
import translations from '../client/i18n/locales/english/translations.json';

const settingsPageElement = {
  yourInternetPresenceSectionHeader: 'your-internet-presence-header',
  githubInput: 'internet-github-input',
  githubCheckmark: 'internet-github-check',
  linkedinCheckmark: 'internet-linkedin-check',
  twitterCheckmark: 'internet-twitter-check',
  personalWebsiteCheckmark: 'internet-website-check',
  saveButton: 'internet-save-button',
  flashMessageAlert: 'flash-message'
} as const;

test.use({ storageState: 'playwright/.auth/certified-user.json' });

test.beforeEach(async ({ page }) => {
  await page.goto('/settings');
});

test.describe('Your Internet Presence', () => {
  test('should display section header on settings page', async ({ page }) => {
    await expect(
      page.getByTestId(settingsPageElement.yourInternetPresenceSectionHeader)
    ).toHaveText('Your Internet Presence');
  });

  test('should disable save button by default', async ({ page }) => {
    await expect(
      page.getByTestId(settingsPageElement.saveButton)
    ).toBeDisabled();
  });

  const socials = [
    {
      name: 'github',
      url: 'https://github.com/certified-user',
      label: 'GitHub',
      checkTestId: settingsPageElement.githubCheckmark
    },
    {
      name: 'linkedin',
      url: 'https://www.linkedin.com/in/certified-user',
      label: 'LinkedIn',
      checkTestId: settingsPageElement.linkedinCheckmark
    },
    {
      name: 'twitter',
      url: 'https://twitter.com/certified-user',
      label: 'Twitter',
      checkTestId: settingsPageElement.twitterCheckmark
    },
    {
      name: 'website',
      url: 'https://certified-user.com',
      label: translations.settings.labels.personal,
      checkTestId: settingsPageElement.personalWebsiteCheckmark
    }
  ];

  socials.forEach(social => {
    test(`should hide ${social.name} checkmark by default`, async ({
      page
    }) => {
      await expect(page.getByTestId(social.checkTestId)).toBeHidden();
    });

    test(`should update ${social.name} URL`, async ({ browserName, page }) => {
      test.skip(browserName === 'webkit', 'csrf_token cookie is being deleted');

      await page.getByLabel(social.label).fill(social.url);
      await expect(page.getByTestId(social.checkTestId)).toBeVisible();

      await page.getByTestId(settingsPageElement.saveButton).click();
      await expect(
        page.getByTestId(settingsPageElement.flashMessageAlert)
      ).toContainText('We have updated your social links');

      // clear value before next test
      await page.getByLabel(social.label).clear();
      await Promise.all([
        page.waitForResponse(
          response =>
            response.url().includes('update-my-socials') &&
            response.status() === 200
        ),
        page.getByTestId(settingsPageElement.saveButton).click()
      ]);
      await expect(page.getByTestId(social.checkTestId)).toBeHidden();
    });
  });
});
