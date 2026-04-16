const { expect } = require('@playwright/test');

class AskYourDoubtPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        // Selectors
        this.askYourDoubtMenu = page.getByText('Ask Your Doubt').first();
        this.addButton = page.getByRole('button', { name: '+' });
        this.modal = page.locator('[role="dialog"]');
        this.proceedButton = this.modal.getByRole('button', { name: 'Proceed' });
        this.doubtInput = this.modal.getByPlaceholder(/doubt/);
        this.submitButton = this.modal.getByRole('button', { name: 'Submit' });
        this.pendingSectionTab = page.getByText('Pending').first();
        this.suggestionHeader = page.getByText(/solutions of some similar questions/i).first();
        this.askExpertBtn = page.getByText(/Ask now/i).first();
    }

    async goBackToDoubtList() {
        // First try to return from the current doubt thread without leaving Ask Your Doubt.
        const backFromThread = this.page.locator('button[aria-label*="back" i], button:has-text("Back"), svg[aria-label*="back" i]').first();
        if (await backFromThread.isVisible().catch(() => false)) {
            await backFromThread.click({ force: true });
            await this.page.waitForTimeout(1200);
        }

        // If Pending is still not visible (or app redirected), re-open Ask Your Doubt and recover.
        if (!(await this.pendingSectionTab.isVisible().catch(() => false))) {
            await this.navigateTo();
            await this.page.waitForTimeout(1200);
        }

        if (!(await this.pendingSectionTab.isVisible().catch(() => false))) {
            const homeNav = this.page.getByText('Home', { exact: true }).first();
            if (await homeNav.isVisible().catch(() => false)) {
                await homeNav.click();
                await this.page.waitForLoadState('networkidle');
            }
            await this.navigateTo();
        }

        await this.pendingSectionTab.waitFor({ state: 'visible', timeout: 15000 });
        await this.openPendingSection();
    }

    async navigateTo() {
        await this.askYourDoubtMenu.click();
        await this.page.waitForLoadState('networkidle');
    }

    async raiseDoubt(subjectName, doubtText) {
        await this.addButton.click();
        await expect(this.modal).toBeVisible();

        const subject = this.modal.getByText(subjectName, { exact: true });
        await expect(subject).toBeVisible();
        await subject.click();

        await this.proceedButton.click();
        await this.page.waitForLoadState('networkidle');

        await this.doubtInput.fill(doubtText);
        await expect(this.submitButton).toBeVisible();
        await this.submitButton.click();

        await this.page.waitForLoadState('networkidle');
    }

    async openPendingSection() {
        await this.pendingSectionTab.click();
    }

    async isSuggestionVisible() {
        try {
            await this.suggestionHeader.waitFor({ state: 'visible', timeout: 15000 });
            return true;
        } catch (e) {
            console.log('isSuggestionVisible failed: ', e.message);
            return false;
        }
    }

    async solveFirstUsingSuggestion() {
        // The suggestions appear as siblings to the main message bubble, often containing "Question 1"
        const firstSuggestion = this.page.getByText('Question 1').first();
        await firstSuggestion.waitFor({ state: 'visible', timeout: 5000 });
        await firstSuggestion.scrollIntoViewIfNeeded();
        await firstSuggestion.click();
        
        // Wait for solution to load and click the green checkmark
        const greenCheckmark = this.page.locator('button:has(svg:has(circle[fill="#05945B"]))');
        await greenCheckmark.waitFor({ state: 'visible', timeout: 10000 });
        await greenCheckmark.click();
        console.log('Solved doubt using suggestion');
    }

    async isAskExpertVisible() {
        return await this._scrollUntilAskExpertVisible(15000);
    }

    async solveUsingAskExpert() {
        const visible = await this._scrollUntilAskExpertVisible(15000);
        expect(visible).toBeTruthy();
        await this.askExpertBtn.scrollIntoViewIfNeeded();
        await this.askExpertBtn.click();
        console.log('Solved doubt using Ask an Expert');
    }

    async _scrollUntilAskExpertVisible(timeoutMs = 15000) {
        const start = Date.now();
        while ((Date.now() - start) < timeoutMs) {
            if (await this.askExpertBtn.isVisible().catch(() => false)) {
                return true;
            }

            await this.page.mouse.wheel(0, 800);
            await this.page.waitForTimeout(400);
        }
        return false;
    }
}

module.exports = { AskYourDoubtPage };
