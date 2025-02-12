import { expect, test, type Page } from '@playwright/test';
import { db } from '../../src/lib/db';
import { command, family } from '../../src/lib/db/schema';

test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/commands/add-exp');
});

test.describe('Sidebar testing', () => {
    test('Is sidebar visible?', async ({ page }: { page: Page }) => {
        await expect(page.locator('aside')).toBeVisible();
    });
    test('Sidebar rendering', async ({ page }: { page: Page }) => {
        const pages = await db.select({ name: command.name, slug: command.slug }).from(command);
        const families = await db.select({ name: family.description }).from(family);

        for (const family of families) {
            const familyPart = page.locator('aside').locator(`h3`, { hasText: family.name });

            await expect(familyPart).toBeVisible();
        }

        for (const commandPage of pages) {
            const commandLink = page.getByRole('link', { name: commandPage.name });

            await expect(commandLink).toBeVisible();
        }
    });
    test('Sidebar navigation testing', async ({ page }: { page: Page }) => {
        const pages = await db.select({ name: command.name, slug: command.slug }).from(command);

        for (const commandPage of pages) {
            const commandLink = page.getByRole('link', { name: commandPage.name });

            await expect(commandLink).toHaveAttribute('href');

            await commandLink.click();

            await page.waitForURL(`commands/${commandPage.slug}`);
        }
    });
});
