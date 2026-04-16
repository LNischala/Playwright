const { test, expect } = require('./fixtures/test-base');
const credentials = require('./data/credentials.json');

test('Bookmarks feature functional test', async ({ page, loginPage, homePage, itutorPage, bookmarksPage, testAnalysisPage }) => {
    test.setTimeout(200000);

    let vidTitle = '';
    let eBookTitle = '';
    let practiceTitle = '';
    let vyomTitle = '';

    await test.step('1. Platform Initial Access', async () => {
        await test.step('1.1 Login with user credentials', async () => {
            await loginPage.goto();
            await loginPage.login(credentials.username, credentials.password);
        });

        await test.step('1.2 Handle Overlays', async () => {
            await homePage.closePopupIfVisible();
            await homePage.verifyHomePageLoaded();
        });
    });

    await test.step('2. iTutor Content Access', async () => {
        await test.step('2.1 Open Physics Module', async () => {
            await itutorPage.goto('physics');
            await itutorPage.selectSubject('Physics');
            await itutorPage.selectChapter(1);
        });

        await test.step('2.2 Verify Module Resources', async () => {
            await itutorPage.verifyComponentsVisible();
        });
    });

    await test.step('3. Bookmarking iTutor Native Items', async () => {
        await test.step('3.1 Bookmark Video Content', async () => {
            const videoDetails = await itutorPage.getVideoDetails(1);
            vidTitle = videoDetails.title;
            console.log('Video title:', vidTitle);
            await itutorPage.checkBookmark(1, credentials.collectionsQa);
        });


        await test.step('3.2 Bookmark eBook Content', async () => {
            await itutorPage.openEBooksTab();
            const ebookDetails = await itutorPage.getEBookDetails(1);
            eBookTitle = ebookDetails.title;
            console.log("eBook title:", eBookTitle);
            await itutorPage.checkBookmark(1, credentials.collectionsQa); // ✅ no type param needed
        });

        await test.step('3.3 Bookmark Practice Question', async () => {
            await itutorPage.openPracticeTab();
            practiceTitle = await itutorPage.startPracticeAndBookmark(credentials.collectionsQa);
            console.log("Practice title:", practiceTitle);
        });
    });

    await test.step('4. Bookmarking Associated Tests (Vyom)', async () => {
        await test.step('4.1 Go to Scheduled Tests Analytics', async () => {
            await homePage.closePopupIfVisible();
            await testAnalysisPage.gotoScheduledPastTests();
        });

        await test.step('4.2 Access Answer Key and Solutions', async () => {
            const analysisPage = await testAnalysisPage.openTestAnalysis(1);
            vyomTitle = await testAnalysisPage.bookmarkVyomQuestion(analysisPage);
            console.log('Vyom question:', vyomTitle);
        });
    });

    await test.step('5. Global Bookmarks Verification', async () => {
        await test.step('5.1 Navigate to Bookmarks Space', async () => {
            await bookmarksPage.goto();
        });

        await test.step('5.2 Verify Qa Collection Items', async () => {
            await bookmarksPage.openCollection(credentials.collectionsQa);
            await bookmarksPage.verifyAndClickItem('Videos', vidTitle);

            // Re-navigating to maintain clean state
            await bookmarksPage.goto();
            await bookmarksPage.openCollection(credentials.collectionsQa);
            await bookmarksPage.verifyAndClickItem('eBooks', eBookTitle);

            await bookmarksPage.goto();
            await bookmarksPage.openCollection(credentials.collectionsQa);
            await bookmarksPage.verifyAndClickItem('Questions', practiceTitle);
        });

        await test.step('5.3 Verify Tests Questions Collection', async () => {
            await bookmarksPage.goto();
            await bookmarksPage.openCollection('Tests Questions');
            await bookmarksPage.verifyAndClickItem('Questions', vyomTitle);
        });
    });

    console.log("Bookmarks Test Completed Successfully");
});

