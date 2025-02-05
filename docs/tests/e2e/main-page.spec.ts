import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
});

test.describe('Main page navigation testing', () => {
    test.describe('Main buttons testing', () => {
        test('Should redirect to commands page', async ({ page }: { page: Page }) => {
            await page.getByRole('button', { name: 'Comandos' }).click();

            await page.waitForURL(/commands/);
        });
    });
});
