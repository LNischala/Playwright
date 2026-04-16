const { expect } = require('@playwright/test');

class ClassRecordingsPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        // Selectors
        this.batchDropdown = page.locator('div.cursor-pointer').filter({ hasText: 'Selected Batch' });
        this.batchModal = page.locator('[role="dialog"]');
        this.doneBtn = this.batchModal.getByRole('button', { name: 'Done' });
        this.sortLabel = page.getByText('Sort By');
        // The month containers - specifically the ones containing month names in h6
        this.monthContainerSelector = 'div.w-full.h-auto'; 
        this.cardSelector = 'div[class*="w-[270px]"]';
        this.playVideoBtnText = 'Play Video';
        this.viewNotesBtnText = 'View Notes';
        this.emptyMsgText = 'You will be able to access your class content for this subject as soon as it is available';
        this.soonMsgText = 'Content will be available soon';
    }

    async selectBatch(batchName) {
        await expect(this.batchDropdown.first()).toBeVisible();
        await this.batchDropdown.first().click();
        await expect(this.batchModal).toBeVisible();

        const batchOption = this.batchModal.getByText(batchName, { exact: true });
        await expect(batchOption).toBeVisible();
        await batchOption.click();

        await expect(this.doneBtn).toBeVisible();
        await this.doneBtn.click();
        await this.page.waitForLoadState('networkidle');
    }

    async selectSubject(subjectName) {
        const subjectTab = this.page.getByText(subjectName, { exact: true }).first();
        try {
            await subjectTab.waitFor({ state: 'visible', timeout: 2000 });
            await subjectTab.scrollIntoViewIfNeeded();
            await subjectTab.click();
            await this.page.waitForLoadState('networkidle');
            return true;
        } catch (e) {
            console.log(`Subject tab ${subjectName} not visible or not clickable`);
            return false;
        }
    }

    async sortByDate() {
        // Find the specific dropdown for Sort By
        const sortDropdown = this.sortLabel.locator('xpath=..').locator('div').first();
        await expect(sortDropdown).toBeVisible();
        await sortDropdown.click();

        const dateOption = this.page.getByRole('button', { name: 'Date' });
        await dateOption.click();
        await this.page.waitForLoadState('networkidle');
    }

    async isEmpty() {
        return await this.page.getByText(this.emptyMsgText).isVisible();
    }

    async getMonthContainers() {
        // Use filter to find containers that have a month heading (h6) and a section holding the cards
        return await this.page.locator(this.monthContainerSelector).filter({ 
            has: this.page.locator('h6')}).filter({
            has: this.page.locator('section')
        }).all();
    }

    async hasActionableContent(monthContainer) {
        const hasPlay = await monthContainer.getByText(this.playVideoBtnText).isVisible();
        const hasNotes = await monthContainer.getByText(this.viewNotesBtnText).isVisible();
        return hasPlay || hasNotes;
    }

    async getCards(monthContainer) {
        return await monthContainer.locator(this.cardSelector).all();
    }

    async playVideo(card) {
        const btn = card.getByText(this.playVideoBtnText).first();
        await btn.waitFor({ state: 'visible', timeout: 5000 });
        await btn.click({ force: true });
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000); 
        await this.page.goBack();
        await this.page.waitForLoadState('networkidle');
        return true;
    }

    async viewNotes(card) {
        const btn = card.getByText(this.viewNotesBtnText).first();
        await btn.waitFor({ state: 'visible', timeout: 3000 });
        await btn.click({ force: true });
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000); 
        await this.page.goBack();
        await this.page.waitForLoadState('networkidle');
        return true;
    }

    async hasSoonMessage(element) {
        return await element.getByText(this.soonMsgText).isVisible();
    }
}

module.exports = { ClassRecordingsPage };
