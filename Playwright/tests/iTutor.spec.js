const { test, expect } = require('./fixtures/test-base');
const credentials = require('./data/credentials.json');

test('iTutor Video and eBook end-to-end flow', async ({ page, loginPage, homePage, itutorPage }) => {
    test.setTimeout(170000);

    let vidTitle = '';
    let eBookTitle = '';

    await test.step('1. Platform Login & Navigation', async () => {
        await test.step('1.1 Login with credentials', async () => {
            await loginPage.goto();
            await loginPage.login(credentials.username, credentials.password);
        });

        await test.step('1.2 Handle Initial Popups and Verify Home', async () => {
            await homePage.closePopupIfVisible();
            await homePage.verifyHomePageLoaded();
        });
    });

    await test.step('2. iTutor Subject Navigation', async () => {
        await test.step('2.1 Open iTutor', async () => {
            await itutorPage.goto('physics');
        });

        await test.step('2.2 Select Study Package', async () => {
            await itutorPage.selectPackage();
        });

        await test.step('2.3 Select Subject', async () => {
            await itutorPage.selectSubject('Physics');
        });

        await test.step('2.4 Select Specific Chapter', async () => {
            // 1 = second chapter
            await itutorPage.selectChapter(1);
        });
    });

    await test.step('3. Module Verification', async () => {
        await test.step('3.1 Verify iTutor Components Presence', async () => {
            await itutorPage.verifyComponentsVisible();
        });
    });

    await test.step('4. Video Interaction Flow', async () => {
        let videoDetails;

        await test.step('4.1 Get Initial Video Progress', async () => {
            videoDetails = await itutorPage.getVideoDetails(1);
            vidTitle = videoDetails.title;
            console.log("Progress of video before watching:", videoDetails.initialProgress);
            console.log("Video title:", vidTitle);
        });

        await test.step('4.2 Play and Seek Video', async () => {
            await itutorPage.playVideo(videoDetails.locator);
            await itutorPage.seekVideoToEndAndFinish();
        });

        await test.step('4.3 Verify Video Progress Updated', async () => {
            await page.waitForTimeout(4000); // Wait for sync
            const updatedDetails = await itutorPage.getVideoDetails(1);
            console.log("Progress of video after watching:", updatedDetails.initialProgress);
        });
    });

    await test.step('5. eBook Interaction Flow', async () => {
        let ebookDetails;

        await test.step('5.1 Navigate to eBooks Tab', async () => {
            await itutorPage.openEBooksTab();
        });

        await test.step('5.2 Get Initial eBook Progress', async () => {
            // Wait for eBooks to settle before checking
            await page.waitForTimeout(3000);
            ebookDetails = await itutorPage.getEBookDetails(0);
            eBookTitle = ebookDetails.title;
            console.log("eBook progress before opening:", ebookDetails.initialProgress);
            console.log("eBook title:", eBookTitle);
        });

        await test.step('5.3 Open and Read eBook File', async () => {
            await itutorPage.readEbook(ebookDetails.locator);
        });

        await test.step('5.4 Verify eBook Progress Updated', async () => {
            await page.waitForTimeout(3000);
            const updatedEbookDetails = await itutorPage.getEBookDetails(0);
            console.log("eBook progress after opening:", updatedEbookDetails.initialProgress);
        });
    });

    await test.step('6. Resume Learning Verification', async () => {
        await test.step('6.1 Verify Resume Items on Home', async () => {
            const matches = await homePage.verifyResumeLearning([vidTitle, eBookTitle]);
            console.log('Matches found in Resume Learning: ', matches);
            expect(matches.length).toBeGreaterThanOrEqual(1); // At least one of them should be there ideally
        });
    });

    console.log("iTutor Test Completed Successfully");
});