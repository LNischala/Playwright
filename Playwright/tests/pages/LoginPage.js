const { expect } = require('@playwright/test');

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator("#psid_or_mobile");
    this.passwordInput = page.locator("#password");
    this.submitBtn = page.locator("button[type='submit']");
  }

  async goto() {
    await this.page.goto('https://www.aakash.ac.in/lms/login/');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
    await expect(this.page).toHaveURL(/home/);
  }
}

module.exports = { LoginPage };
