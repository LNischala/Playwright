const { expect } = require('@playwright/test');

class TestAnalysisPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    async gotoScheduledPastTests() {
        await this.page.goto('https://www.aakash.ac.in/lms/student/test/');
        await this.page.getByText('Scheduled Tests').click();
        await this.page.getByText('Past').click();
    }

    async openTestAnalysis(index = 1) {
        // nth is 0-indexed, but in original script it used 1 (which means the second instance)
        await this.page.getByText('View Analysis').nth(index).click();

        const context = this.page.context();
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
        ]);
        await newPage.waitForLoadState();
        return newPage;
    }

    async bookmarkVyomQuestion(newPage) {
        await newPage.locator('div.cursor-pointer', {
            hasText: 'Answer Key and Solutions'
        }).click();

        await newPage.waitForTimeout(2000);

        const grid = newPage.locator('//*[@id="__next"]/div[1]/div[2]/div/div/div/div[2]/div/div/div[3]/div/div[3]');
        // clicking the second block
        await grid.locator('> div').nth(1).click();

        const headerRow = newPage.locator('span:has-text("Question")').first();
        const icon = headerRow
            .locator('xpath=ancestor::div[contains(@class,"justify-between")]')
            .locator('div.cursor-pointer')
            .last(); // Last one is bookmark

        await expect(icon).toBeVisible();

        const svg = icon.locator('svg');
        const isBookmarked = (await svg.getAttribute('class'))?.includes('fill-primary');

        if (isBookmarked) {
            await icon.click();
            await expect(svg).not.toHaveClass(/fill-primary/);
        }

        await icon.click();

        const quesDiv = newPage.locator('//*[@id="__next"]/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/div[1]/span');
        const vyomTitle = await quesDiv.locator('p').first().textContent();

        await newPage.close();

        return vyomTitle;
    }
}

module.exports = { TestAnalysisPage };

