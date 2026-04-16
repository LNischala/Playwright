/**
 * Extracts the progress width from an element's style attribute.
 * @param {import('@playwright/test').Locator} progressBar
 * @returns {Promise<number>}
 */
import { test, expect } from '@playwright/test';
async function getProgressWidth(progressBar) {
    try {
        const style = await progressBar.getAttribute('style');
        if (!style) return 0;
        const match = style.match(/width:\s*(\d+(\.\d+)?)%/);
        return match ? parseFloat(match[1]) : 0;
    } catch (e) {
        return 0;
    }
}

/**
 * Handle bookmarking logic for a given icon
 * @param {import('@playwright/test').Page} page
 * @param {string} collectionName
 * @param {import('@playwright/test').Locator} icon
 * @param {boolean} isBookmarked
 */
async function toggleBookmark(page, collectionName, icon, isBookmarked) {
    if (isBookmarked) {
        console.log('Remarking...');
        await icon.click();
        await page.waitForTimeout(2000);
        await page.getByRole('button', { name: 'Remove' }).click();
        // The SVG is inside the icon
        const svg = icon.locator('svg');
        const expect = require('@playwright/test').expect;
        await expect(svg).not.toHaveClass(/fill-primary/);
    }

    console.log('Bookmarking...');
    await icon.click();

    // Wait for the collection modal
    const collectionDiv = page.getByText(collectionName, { exact: true });
    await expect(collectionDiv).toBeVisible({ timeout: 5000 });

    // Extraction of prev item count as seen in working script
    const prevItemCount = await collectionDiv.locator('xpath=following-sibling::div').innerText();
    console.log('prev item count : ', prevItemCount);

    await collectionDiv.click();
    await page.getByRole('button', { name: 'Save' }).click();
}

async function scrollToLoadAllInContainer(container) {
    await container.evaluate(async (el) => {
        let previousHeight = 0;

        while (true) {
            el.scrollTo(0, el.scrollHeight);
            await new Promise(res => setTimeout(res, 800));

            if (el.scrollHeight === previousHeight) break;
            previousHeight = el.scrollHeight;
        }
    });
}

async function handleCard(page, card) {

    const playVideoBtn = card.getByText('Play Video');
    const viewNotesBtn = card.getByText('View Notes');
    const contentSoonMsg = card.getByText('Content will be available soon');

    const isPlayVisible = await playVideoBtn.isVisible();
    const isNotesVisible = await viewNotesBtn.isVisible();
    const isSoonVisible = await contentSoonMsg.isVisible();

    if (isPlayVisible) {
        await playVideoBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // Added for visibility in headed mode
        await page.goBack();
        await page.waitForLoadState('networkidle');
    } if (isNotesVisible) {
        await viewNotesBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // Added for visibility in headed mode
        await page.goBack();
        await page.waitForLoadState('networkidle');
    } else {
        // Logged in the spec file for better formatting
    }
}


module.exports = {
    getProgressWidth,
    toggleBookmark,
    scrollToLoadAllInContainer,
    handleCard
};
