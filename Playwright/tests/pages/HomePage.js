const { expect } = require('@playwright/test');

class HomePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.closePopupBtn = page.locator('svg.cursor-pointer').first();
    this.todayText = page.getByText("Today is");
    this.resumeSection = page.getByText('Resume learning').locator('..');
  }

  async closePopupIfVisible() {
    // Some minor wait might be necessary simply to wait for stable state,
    // but a targeted wait for the visibility of the popup button is better.
    try {
      await this.closePopupBtn.waitFor({ state: 'visible', timeout: 5000 });
      await this.closePopupBtn.click();
    } catch (e) {
      console.log("Popup not visible or failed to close");
    }
  }

  async verifyHomePageLoaded() {
    await expect(this.todayText).toBeVisible();
  }

  async verifyResumeLearning(expectedTitles) {
    await this.page.goto('https://www.aakash.ac.in/lms/student/home/');
    await expect(this.resumeSection).toBeVisible({ timeout: 10000 });
    
    // Allow section to populate
    await this.page.waitForTimeout(3000); 

    const sectionText = await this.resumeSection.innerText();
    const lines = sectionText.split('\n').map(t => t.trim()).filter(Boolean);

    let matchingTitles = [];
    for (let i = 0; i < lines.length; i++) {
      for (const title of expectedTitles) {
         if (title && lines[i].includes(title)) {
           console.log(`Found match in Resume learning: ${lines[i]}`);
           matchingTitles.push(title);
         }
      }
    }
    return matchingTitles;
  }
}

module.exports = { HomePage };
