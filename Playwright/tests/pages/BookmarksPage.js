const { expect } = require('@playwright/test');

class BookmarksPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto('https://www.aakash.ac.in/lms/student/bookmarks/');
        await expect(this.page.locator('div.flex.items-center.justify-between').filter({ hasText: 'Collections' })).toBeVisible({ timeout: 10000 });
    }

    async openCollection(collectionName) {
        const collectionsHeader = this.page.locator('div.flex.items-center.justify-between').filter({ hasText: 'Collections' });
        const collectionCards = collectionsHeader.locator('xpath=following-sibling::div//div[contains(@class,"grid")]');
        const card = collectionCards.locator('div.w-\\[158px\\]').filter({ has: this.page.getByText(collectionName, { exact: true }) });

        await expect(card).toBeVisible();
        await card.click();
        await this.page.waitForTimeout(2000); // wait for items to populate
    }

    async verifyAndClickItem(tabName, itemTitle) {
        await this.page.getByText(tabName, { exact: true }).click();

        if (itemTitle) {
            await expect(this.page.getByText(itemTitle, { exact: true }).first()).toBeVisible();
            await this.page.getByText(itemTitle).first().click();
            await this.page.waitForTimeout(4000); // Arbitrary wait for item to open

            if (tabName === 'Questions' || tabName === 'Tests Questions') {
                // Wait a bit to verify question UI, then we'll navigate back later or from caller
            }
        }
    }
}

module.exports = { BookmarksPage };
