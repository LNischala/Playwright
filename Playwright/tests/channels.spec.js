const { test } = require('./fixtures/test-base');
const credentials = require('./data/credentials.json');

test('Channels feature - validate posts, type and attachments', async ({ loginPage, homePage, channelsPage }) => {
  test.setTimeout(180000);

  let contentFound = false;

  await test.step('1. Login and navigate to Channels', async () => {
    await loginPage.goto();
    await loginPage.login(credentials.username, credentials.password);
    await homePage.closePopupIfVisible();
    await channelsPage.navigateToChannels();
  });

  await test.step('2. Iterate batches and find valid content', async () => {
    const batchCount = await channelsPage.getBatchCount();
    console.log(`Total batches visible in Channels: ${batchCount}`);

    const processVisibleContent = async () => {
      contentFound = true;
      await channelsPage.openFirstPost();

      const typeText = await channelsPage.getPostTypeText();
      console.log(`Channels content type found: ${typeText}`);

      const postContent = await channelsPage.inspectOpenedPostContent();
      if (postContent.hasImageFile) {
        console.log(`Image file(s) found in post: ${postContent.imageFiles.join(', ')}`);
      } else if (postContent.hasVisibleImage) {
        console.log(`Inline image(s) found in post. Image count: ${postContent.visibleImageCount}`);
      } else {
        console.log('No .png/.jpg image content found in opened post.');
      }
      if (postContent.attachmentTileCount > 0) {
        console.log(`Attachment tile(s) found in post: ${postContent.attachmentTileCount}`);
      }

      if (postContent.hasText) {
        console.log(`Post text found: ${postContent.textSnippet}`);
      } else {
        console.log('No meaningful text found inside opened post.');
      }

      const attachmentInfo = await channelsPage.openFirstAttachmentIfPresent();
      if (attachmentInfo.found) {
        console.log(`Attachment opened: ${attachmentInfo.name}`);
      } else {
        console.log('No attachment found in the selected post.');
      }
    };

    if (batchCount > 0) {
      for (let i = 0; i < batchCount; i++) {
        await channelsPage.openBatchByIndex(i);
        const postCount = await channelsPage.getVisiblePostCount();
        console.log(`Batch index ${i}: posts found = ${postCount}`);

        if (postCount > 0) {
          await processVisibleContent();
          break;
        }
      }
    } else {
      const visiblePostCount = await channelsPage.getVisiblePostCount();
      console.log(`Fallback check without batch iteration: posts found = ${visiblePostCount}`);
      if (visiblePostCount > 0) {
        await processVisibleContent();
      }
    }
  });

  await test.step('3. Validate empty state when no content exists', async () => {
    if (!contentFound) {
      await channelsPage.verifyEmptyStateVisible();
      console.log("No valid content found in any batch. Verified 'No posts found' text.");
    }
  });
});
