import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
});

test.describe('Header structure testing', () => {
    test('Header has loaded?', async ({ page }: { page: Page }) => {
        const header = page.locator('header');

        await expect(header).toBeVisible();
    });
    test.describe('Image loading test', () => {
        test('Bot image has loaded?', async ({ page }: { page: Page }) => {
            const image = page.locator('img[alt="Neon Bot Logo"]');

            await expect(image).toBeVisible();
        });
        test('GitHub icon has loaded?', async ({ page }: { page: Page }) => {
            const image = page.locator('img[alt="Github Icon"]');

            await expect(image).toBeVisible();
        });
    });
    test.describe('Header structure', () => {
        test('GitHub stars have been retrieved?', async ({ page }: { page: Page }) => {
            const starsContainer = page.locator('#github-link').locator('div').locator('p');

            const response = await page.request.get(
                'https://api.github.com/repos/Matheus-Merlos/neon-bot',
            );
            const data = await response.json();
            const stars = data.stargazers_count.toString();

            await expect(starsContainer).toBeVisible();
            await expect(starsContainer).not.toHaveText('Error');
            await expect(starsContainer).toHaveText(`${stars}☆`);
        });
        test('Main title and nav have loaded?', async ({ page }: { page: Page }) => {
            const title = page.locator('#logo');
            await expect(title).toBeVisible();
            await expect(title).toHaveText('NEON');

            await expect(page.locator('nav')).toBeVisible();
        });
    });
});

test.describe('Header navigation testing', () => {
    test('Should redirect to commands page', async ({ page }: { page: Page }) => {
        await page.getByRole('link', { name: 'Comandos' }).click();

        await page.waitForURL(/commands/);
    });
    test('Should redirect to the main page', async ({ page }: { page: Page }) => {
        await page.getByRole('link', { name: 'Sobre' }).click();

        await page.waitForURL('/');
    });
    test('Should redirect to the invite page', async ({ page }: { page: Page }) => {
        await page.getByRole('link', { name: 'Adicionar' }).click();

        await page.waitForURL('/invite');
    });
    test('Should redirect to GitHub Project Repository', async ({ page }: { page: Page }) => {
        await page.locator('#github-link').click();

        await page.waitForURL('https://github.com/Matheus-Merlos/neon-bot');
    });
});
