const { expect } = require('@playwright/test');

class ChannelsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.channelsNav = page.getByText('Channels', { exact: true });
    this.batchPillsPrimary = page.locator('div.cursor-pointer.rounded-lg');
    this.batchPillsFallback = page.locator('input[placeholder="Search"]')
      .locator('xpath=ancestor::div[contains(@class,"flex")][1]/following-sibling::div[1]//div[contains(@class,"cursor-pointer")]');
    this.postCards = page.locator('div.flex.gap-5.cursor-pointer.w-full');
    this.emptyStateText = page.getByText(/no\s+posts?\s+found/i);
    this.postHeader = page.locator('text=/^Announcement$|^Post$/i').first();
  }

  async navigateToChannels() {
    await this.channelsNav.click();
    await this.page.waitForLoadState('networkidle');
    // await this.page.getByPlaceholder('Search').waitFor({ state: 'visible', timeout: 10000 });
    // await this.page.waitForTimeout(1500);
  }

  async getBatchCount() {
    let primaryCount = await this.batchPillsPrimary.count();
    if (primaryCount === 0) {
      await this.page.waitForTimeout(1000);
      primaryCount = await this.batchPillsPrimary.count();
    }
    if (primaryCount > 0) {
      return primaryCount;
    }
    let fallbackCount = await this.batchPillsFallback.count();
    if (fallbackCount === 0) {
      await this.page.waitForTimeout(1000);
      fallbackCount = await this.batchPillsFallback.count();
    }
    return fallbackCount;
  }

  async openBatchByIndex(index) {
    const primaryCount = await this.batchPillsPrimary.count();
    const source = primaryCount > 0 ? this.batchPillsPrimary : this.batchPillsFallback;
    const batch = source.nth(index);
    await batch.scrollIntoViewIfNeeded();
    await batch.click();
    await this.page.waitForTimeout(1200);
  }

  async getVisiblePostCount() {
    const strictCount = await this.postCards.count();
    if (strictCount > 0) {
      return strictCount;
    }

    const typeMentions = this.page.getByText(/Announcement|Post/i);
    const fallbackCount = await typeMentions.count();
    if (fallbackCount > 0) {
      return fallbackCount;
    }

    const bodyText = await this.page.locator('body').innerText();
    if (/(announcement|post)/i.test(bodyText) && /general/i.test(bodyText)) {
      return 1;
    }

    return 0;
  }

  async verifyEmptyStateVisible() {
    await expect(this.emptyStateText).toBeVisible({ timeout: 10000 });
  }

  async openFirstPost() {
    const strictFirstPost = this.postCards.first();
    if (await strictFirstPost.isVisible({ timeout: 2000 }).catch(() => false)) {
      await strictFirstPost.scrollIntoViewIfNeeded();
      await strictFirstPost.click();
      await this.page.waitForTimeout(1000);
      return;
    }

    const typeMention = this.page.getByText(/Announcement|Post/i).first();
    const clickableCard = typeMention.locator('xpath=ancestor::div[contains(@class,"cursor-pointer")][1]');
    if (await clickableCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clickableCard.scrollIntoViewIfNeeded();
      await clickableCard.click();
    } else {
      await typeMention.click();
    }
    await this.page.waitForTimeout(1000);
  }

  async getPostTypeText() {
    const pageText = (await this.page.locator('body').innerText()).toLowerCase();
    const hasAnnouncement = /(^|\s)announcement(\s|$)/i.test(pageText);
    const hasPost = /(^|\s)post(\s|$)/i.test(pageText);
    const hasGeneral = /(^|\s)general(\s|$)/i.test(pageText);

    if (hasAnnouncement && hasGeneral) {
      return 'Announcement + General';
    }
    if (hasPost && hasGeneral) {
      return 'Post + General';
    }

    const fallbackType = this.page.locator('text=/Announcement|Post/i').first();
    if (await fallbackType.isVisible({ timeout: 2000 }).catch(() => false)) {
      return ((await fallbackType.innerText()).trim()) || 'Type partially found';
    }

    return 'Type not found';
  }

  async inspectOpenedPostContent() {
    const postContainer = await this.getOpenedPostContainer();
    const contentScope = await postContainer.innerText();

    const fileNameRegex = /\b[\w\s().-]+\.(png|jpg|jpeg|pdf|doc|docx)\b/gi;
    const fileMatches = [...contentScope.matchAll(fileNameRegex)].map((m) => m[0].trim());
    const uniqueFiles = [...new Set(fileMatches)];
    const imageFiles = uniqueFiles.filter((name) => /\.(png|jpg|jpeg)$/i.test(name));

    const attachmentTiles = postContainer.locator('div.cursor-pointer:has-text(".png"), div.cursor-pointer:has-text(".jpg"), div.cursor-pointer:has-text(".jpeg"), div.cursor-pointer:has-text(".pdf"), div.cursor-pointer:has-text(".doc"), div.cursor-pointer:has-text(".docx")');
    const visibleImageCount = await postContainer.locator('img').count();

    const textLines = contentScope
      .split('\n')
      .map((line) => line.trim())
      .filter((line) =>
        line.length > 3
        && !/\.(png|jpg|jpeg|pdf|doc|docx)$/i.test(line)
        && !/^(home|channels|search|support|announcement|post)$/i.test(line)
      );
    const textSnippet = textLines.slice(0, 3).join(' | ');

    return {
      hasImageFile: imageFiles.length > 0,
      imageFiles,
      hasVisibleImage: visibleImageCount > 0,
      visibleImageCount,
      hasText: textSnippet.length > 0,
      textSnippet: textSnippet || 'No meaningful text found',
      allFiles: uniqueFiles,
      attachmentTileCount: await attachmentTiles.count()
    };
  }

  async openFirstAttachmentIfPresent() {
    const postContainer = await this.getOpenedPostContainer();
    const attachmentCandidates = postContainer.locator(
      'div.cursor-pointer:has-text(".pdf"), div.cursor-pointer:has-text(".png"), div.cursor-pointer:has-text(".jpg"), div.cursor-pointer:has-text(".jpeg"), div.cursor-pointer:has-text(".doc"), div.cursor-pointer:has-text(".docx"), a:has-text(".pdf"), a:has-text(".png"), a:has-text(".jpg"), a:has-text(".jpeg"), button:has-text(".pdf"), button:has-text(".png"), button:has-text(".jpg"), button:has-text(".jpeg")'
    );

    const count = await attachmentCandidates.count();
    if (count === 0) {
      return { found: false, name: 'No attachment found' };
    }

    const firstAttachment = attachmentCandidates.first();
    const name = ((await firstAttachment.innerText().catch(() => 'Attachment')).trim()) || 'Attachment';
    await firstAttachment.scrollIntoViewIfNeeded();
    await firstAttachment.click();
    await this.page.waitForTimeout(1500);
    return { found: true, name };
  }

  async getOpenedPostContainer() {
    if (await this.postHeader.isVisible({ timeout: 2000 }).catch(() => false)) {
      const container = this.postHeader.locator('xpath=ancestor::div[contains(@class,"flex")][1]/following-sibling::div[1]');
      if (await container.isVisible({ timeout: 2000 }).catch(() => false)) {
        return container;
      }
    }
    return this.page.locator('body');
  }
}

module.exports = { ChannelsPage };
