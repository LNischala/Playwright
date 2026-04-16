const { expect } = require('@playwright/test');
const { getProgressWidth } = require('../helpers/ui-helpers');

class ITutorPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.packagesLocator = page.locator('.packages-container'); // generic
    }

    async goto(subject = 'physics') {
        await this.page.goto(`https://www.aakash.ac.in/lms/student/itutor/subject/${subject}/`);
    }

    async selectPackage() {
        const pkg = this.page.getByText('Class 11 & 12 for JEE').or(this.page.getByText('Class 11 & 12 for Olympiad - Engg')).first();
        if (await pkg.isVisible()) {
            await pkg.click();
            await this.page.waitForTimeout(800); // UI animation
            const dialog = this.page.getByRole("dialog", { hasText: 'Select package/language' });
            if (await dialog.isVisible()) {
                await this.page.getByRole('button', { name: 'Done' }).click();
            }
        }
    }

    async selectSubject(subjectName) {
        const subjectCard = this.page.locator('div[role="button"], div').filter({
            has: this.page.locator('img[alt="Subject Icon"]'),
            hasText: subjectName
        }).first();
        await subjectCard.click();
    }

    async selectChapter(chapIndex) {
        const allChapters = this.page.locator('div.flex.flex-col.sm\\:w-full > div');
        await allChapters.nth(chapIndex).click();

        // Wait for components to load
        await expect(this.page.getByText('Videos', { exact: true })).toBeVisible({ timeout: 10000 });
        await expect(this.page.getByText('eBooks', { exact: true })).toBeVisible();
    }

    async verifyComponentsVisible() {
        await expect(this.page.getByText('Videos', { exact: true })).toBeVisible();
        await expect(this.page.getByText('eBooks', { exact: true })).toBeVisible();
        const practice = this.page.getByText('Practice');
        if (await practice.isVisible()) {
            await expect(practice).toBeVisible();
        }
    }

    /**
     * @param {number} idx Index of the video
     * @returns {Promise<string>} Video title
     */
    async getVideoDetails(idx) {
        const allVids = this.page.locator('div.mb-6.mt-8.sm\\:mb-5.sm\\:mt-4.sm\\:mx-5 > div');
        await expect(allVids.first()).toBeVisible();

        const vidText = await allVids.nth(idx).innerText();
        const title = vidText.split('\n')[0];

        const progressBar = this.page.locator(`//*[@id="appRoot"]/div[2]/div/div[2]/div[2]/div/div[2]/div[${idx + 1}]/div/div/div/div/div[2]/div[4]/div[2]/div`);
        const width = await getProgressWidth(progressBar);

        return { title, initialProgress: width, locator: allVids.nth(idx), progressBar };
    }

    async playVideo(videoLocator) {
        await videoLocator.click();
        const playBtn = this.page.getByRole('button', { name: 'play_arrow' });
        const replayBtn = this.page.getByRole('button', { name: 'Replay' });

        if (await playBtn.isVisible()) await playBtn.click();
        else if (await replayBtn.isVisible()) await replayBtn.click();

        await this.page.waitForTimeout(3000); // Wait for buffer
    }

    async seekVideoToEndAndFinish() {
        const seekBar = this.page.locator('input[aria-label="Seek"]');
        await seekBar.waitFor({ state: 'attached' });
        await seekBar.click();
        await seekBar.press('End');
        await this.page.waitForTimeout(2000); // Wait for buffer

        for (let i = 0; i < 2; i++) {
            await seekBar.press('ArrowLeft');
            await this.page.waitForTimeout(300);
        }

        // Just in case video paused
        const htmlPlayBtn = this.page.getByRole('button', { name: /play/i });
        if (await htmlPlayBtn.isVisible()) {
            await htmlPlayBtn.click();
        }

        await this.page.waitForTimeout(6000); // Wait to update progress

        // click close (top left usually)
        await this.page.locator('svg.cursor-pointer').first().click();
        await expect(this.page).toHaveURL(/chapter/);
    }

    // -- Books -- //

    async openEBooksTab() {
        await this.page.getByText('eBooks').click();
        await this.page.waitForTimeout(3000); // ✅ match working script — DOM settles after tab switch

        const alleBooks = this.page.locator('div.mb-6.mt-8.sm\\:mb-5.sm\\:mt-4.sm\\:mx-5 > div');
        await expect(alleBooks.first()).toBeVisible({ timeout: 10000 });
        await expect(alleBooks.last()).toBeVisible();
    }

    async getEBookDetails(idx) {
        const alleBooks = this.page.locator('div.mb-6.mt-8.sm\\:mb-5.sm\\:mt-4.sm\\:mx-5 > div');
        await expect(alleBooks.first()).toBeVisible();

        const eBookText = await alleBooks.nth(idx).innerText();
        const title = eBookText.split('\n')[0];

        // ✅ eBooks use div[3] for progress, not div[4] like videos
        const progressBar = this.page.locator(
            `//*[@id="appRoot"]/div[2]/div/div[2]/div[2]/div/div[2]/div[${idx + 1}]/div/div/div/div/div[2]/div[3]/div[2]/div`
        );
        const width = await getProgressWidth(progressBar);

        return { title, initialProgress: width, locator: alleBooks.nth(idx), progressBar };
    }

    async readEbook(ebookLocator) {
        await ebookLocator.click();
        await this.page.waitForTimeout(9000); // takes time to load pdf

        // Read 2 pages by clicking next
        for (let i = 0; i < 2; i++) {
            const nextBtn = this.page.locator('div.ml-\\[3vw\\]');
            if (await nextBtn.isVisible()) {
                await nextBtn.click();
                await this.page.waitForTimeout(5000);
            }
        }

        await this.page.goBack();
        await expect(this.page).toHaveURL(/Ebook/);
    }

    // -- Bookmark Functions -- //
    async checkBookmark(idx, collectionName) {
        // ✅ Same container selector works for BOTH Videos and eBooks tabs
        const cards = this.page.locator('div.mb-6.mt-8.sm\\:mb-5.sm\\:mt-4.sm\\:mx-5 > div');
        await expect(cards.first()).toBeVisible({ timeout: 10000 });

        const card = cards.nth(idx);
        // ✅ Working script uses div:has(svg).last() — avoids class mismatch between tabs
        const icon = card.locator('div:has(svg)').last();
        const svg = icon.locator('svg');

        await expect(icon).toBeVisible({ timeout: 10000 });

        const isBookmarked = (await svg.getAttribute('class'))?.includes('fill-primary');

        const saveBtn = this.page.getByRole('button', { name: 'Save' });
        const removeBtn = this.page.getByRole('button', { name: 'Remove' });
        const collectionDiv = this.page.getByText(collectionName, { exact: true });

        if (isBookmarked) {
            console.log('Already bookmarked — removing first');
            await icon.click();
            await this.page.waitForTimeout(800);
            await removeBtn.click();
            await expect(svg).not.toHaveClass(/fill-primary/);
        }

        await icon.click();
        await this.page.waitForTimeout(800);

        await expect(collectionDiv).toBeVisible({ timeout: 5000 });
        await collectionDiv.click();
        await saveBtn.click();
    }

    async openPracticeTab() {
        await this.page.getByText('Practice').click();
    }

    async startPracticeAndBookmark(collectionName) {
        const btn = this.page.getByRole('button', { name: /Resume|Start|Retake/ });
        await btn.first().click();

        return await this._handlePracticeFrameBookmark(collectionName);
    }

    async _handlePracticeFrameBookmark(collectionName) {
        // Wait for frame
        const frame = this.page.frameLocator('#appRoot iframe');

        // Handle popup
        const notNowBtn = frame.locator('button:has-text("Not Now")');
        if (await notNowBtn.isVisible()) {
            await notNowBtn.click();
        }

        const icon = frame.locator('button.ml-1');
        const svg = icon.locator('svg');
        await expect(svg).toBeAttached({ timeout: 10000 });
        const isBookmarked = (await svg.getAttribute('class'))?.includes('fill-primary');

        const quesTitle = (await frame.locator('#exam-mathjax p').first().innerText()).trim();

        if (isBookmarked) {
            await icon.click();
            await this.page.getByRole('button', { name: 'Remove' }).click();
            await expect(svg).not.toHaveClass(/fill-primary/);
        }

        await icon.click();
        const collectionDiv = this.page.getByText(collectionName, { exact: true });
        await expect(collectionDiv).toBeVisible();
        await collectionDiv.click();
        await this.page.getByRole('button', { name: 'Save' }).click();

        return quesTitle;
    }
}
module.exports = { ITutorPage };


