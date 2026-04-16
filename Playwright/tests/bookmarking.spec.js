import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

    test.setTimeout(100000);

    await page.goto('https://www.aakash.ac.in/lms/login/');
    await page.locator("#psid_or_mobile").fill("00007844150");
    await page.locator("#password").fill("test@123");
    await page.locator("button[type='submit']").click();

    await expect(page).toHaveURL(/home/);
    // await page.locator('svg.cursor-pointer').first().click(); //close popup
    await expect(page.getByText("Today is")).toBeVisible()


    // ---------------- OPEN ITUTOR ----------------
    await page.goto('https://www.aakash.ac.in/lms/student/itutor/subject/physics/');

    // ---------------- SELECT SUBJECT ----------------
    const subjectCard = page.locator('div[role="button"], div').filter({ has: page.locator('img[alt="Subject Icon"]'), hasText: 'Physics' }).first();
    await subjectCard.click();

    const allChapters = page.locator('div.flex.flex-col.sm\\:w-full > div');
    const chapNum = 1; //starts from 1,2,3...

    await allChapters.nth(chapNum).click();
    await page.waitForTimeout(1000);

    // ---------------- VERIFY COMPONENTS ----------------
    await expect(page.getByText('Videos', { exact: true })).toBeVisible();
    await expect(page.getByText('eBooks', { exact: true })).toBeVisible();
    const practice = page.getByText('Practice');
    if (await practice.isVisible()) {
        await expect(practice).toBeVisible();
    }

    // ---------------- VIDEO AND EBOOK LIST ----------------
    const idx = 1; //video num, starts from 0,1,2...
    const collectionName = 'Qa'

    const allVids = page.locator('div.mb-6.mt-8.sm\\:mb-5.sm\\:mt-4.sm\\:mx-5 > div');
    await expect(allVids.first()).toBeVisible();
    await expect(allVids.last()).toBeVisible();
    const vidText = await allVids.nth(idx).innerText();
    const vidTitle = vidText.split('\n')[0];
    console.log('video title : ', vidTitle)

    await checkBookmark(page, idx)

    await page.getByText('eBooks').click()
    const alleBooks = page.locator('div.mb-6.mt-8.sm\\:mb-5.sm\\:mt-4.sm\\:mx-5 > div')
    await expect(alleBooks.first()).toBeVisible();
    await expect(alleBooks.last()).toBeVisible();
    const eBookText = await alleBooks.nth(idx).innerText();
    const eBookTitle = eBookText.split('\n')[0];
    console.log("eBook title : ", eBookTitle)

    await checkBookmark(page, idx)

    await page.getByText('Practice').click()
    const btn = page.getByRole('button', { name: /Resume|Start|Retake/ });
    await btn.first().click();
    const quesTitle = await bookmarkPracItem(page, collectionName);

    async function bookmarkPracItem(page, collectionName) {
        const frame = page.frameLocator('#appRoot iframe');

        // remove popup if present
        frame.locator('button:has-text("Not Now")').click()

        const icon = frame.locator('button.ml-1');
        const svg = icon.locator('svg');

        const isBookmarked = (await svg.getAttribute('class'))?.includes('fill-primary');

        const quesTitle = (await frame
            .locator('#exam-mathjax p')
            .first()
            .innerText()).trim();

        console.log('quesTitle:', quesTitle);

        if (isBookmarked) {
            await icon.click();
            await page.getByRole('button', { name: 'Remove' }).click();
            await expect(svg).not.toHaveClass(/fill-primary/);
        }

        await icon.click();
        const collectionDiv = page.getByText(collectionName, { exact: true });
        await expect(collectionDiv).toBeVisible();

        await collectionDiv.click();
        await page.getByRole('button', { name: 'Save' }).click();

        return quesTitle;
    }

    // --------------------VYOM---------------------
    await page.locator('svg.cursor-pointer').first().click();
    await expect(page).toHaveURL(/chapter/);
    await page.goto('https://www.aakash.ac.in/lms/student/test/')
    await page.getByText('Scheduled Tests').click()
    await page.getByText('Past').click()
    await page.getByText('View Analysis').nth(1).click()
    const context = page.context();
    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
    ]);
    await newPage.waitForLoadState();
    await newPage.locator('div.cursor-pointer', {
        hasText: 'Answer Key and Solutions'
    }).click();
    await newPage.waitForTimeout(2000)
    const grid = newPage.locator('//*[@id="__next"]/div[1]/div[2]/div/div/div/div[2]/div/div/div[3]/div/div[3]')
    await grid.locator('> div').nth(1).click()

    const headerRow = newPage.locator('span:has-text("Question")').first();

    const icon = headerRow
        .locator('xpath=ancestor::div[contains(@class,"justify-between")]')
        .locator('div.cursor-pointer')
        .last();   // important: last one is bookmark
    await expect(icon).toBeVisible();

    const svg = icon.locator('svg');
    const isBookmarked = (await svg.getAttribute('class'))?.includes('fill-primary');

    if (isBookmarked) {
        await icon.click();
        await expect(svg).not.toHaveClass(/fill-primary/);
    }

    await icon.click();

    // const icon = newPage.locator('div.cursor-pointer:has(svg):visible').first();
    // await page.waitForTimeout(1000)
    // await icon.click();
    const quesDiv = newPage.locator('//*[@id="__next"]/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/div[1]/span')
    const vyomTitle = await quesDiv.locator('p').first().textContent();
    console.log('vyom question : ', vyomTitle)

    await newPage.close()


    // ---------------- BOOK MARK ----------------
    async function checkBookmark(page, idx) {
        const cards = page.locator('div.mb-6.mt-8.sm\\:mb-5.sm\\:mt-4.sm\\:mx-5 > div');

        const card = cards.nth(idx);
        const icon = card.locator('div:has(svg)').last();

        const svg = icon.locator('svg');
        const isBookmarked = (await svg.getAttribute('class'))?.includes('fill-primary');

        await bookmarkItem(page, collectionName, icon, isBookmarked);
    }

    async function bookmarkItem(page, collectionName, icon, isBookmarked) {
        if (isBookmarked) {
            console.log('Remarking')
            await icon.click();
            await page.waitForTimeout(2000);
            await page.getByRole('button', { name: 'Remove' }).click();
            await expect(icon.locator('svg')).not.toHaveClass(/fill-primary/);
        }
        await icon.click()
        // await page.waitForTimeout(2000)
        const collectionDiv = await page.getByText(collectionName, { exact: true })
        const prevItemCount = await collectionDiv.locator('xpath=following-sibling::div').innerText()
        console.log('prev item count : ', prevItemCount)
        await collectionDiv.click()
        await page.getByRole('button', { name: 'Save' }).click()
    }


    // ---------------- VERIFY IN BOOKMARK SECTION ----------------
    await page.goto('https://www.aakash.ac.in/lms/student/bookmarks/')

    const collectionsHeader = page.locator('div.flex.items-center.justify-between').filter({ hasText: 'Collections' });

    // go to the grid (next sibling section)
    const collectionCards = collectionsHeader.locator('xpath=following-sibling::div//div[contains(@class,"grid")]');
    const qaCard = collectionCards.locator('div.w-\\[158px\\]').filter({ has: page.getByText('Qa', { exact: true }) });
    await expect(qaCard).toBeVisible();
    await qaCard.click();
    await page.waitForTimeout(2000)
    // video
    await page.getByText('Videos').click()
    await expect(page.getByText(vidTitle, { exact: true })).toBeVisible()
    await page.getByText(vidTitle).click()
    await page.waitForTimeout(8000)
    // await page.locator('svg.cursor-pointer').first().click();
    await page.goBack()
    //eBook
    await page.getByText('eBooks').click()
    await expect(page.getByText(eBookTitle, { exact: true })).toBeVisible()
    await page.getByText(eBookTitle).click()
    await page.waitForTimeout(5000)
    await page.goBack()
    //practice question
    await page.getByText('Questions').click()
    if ((quesTitle != '')) {
        await page.getByText(quesTitle).click()
    }
    else {
        console.log("not found practice question in bookmarks")
    }
    await page.waitForTimeout(2000)
    // await page.goBack();
    await page.goto('https://www.aakash.ac.in/lms/student/bookmarks/');
    await page.waitForTimeout(2000)
    // vyom section
    const collectionCards1 = collectionsHeader.locator('xpath=following-sibling::div//div[contains(@class,"grid")]');
    const testsCard = collectionCards1.locator('div.w-\\[158px\\]').filter({ has: page.getByText('Tests Questions', { exact: true }) });
    await expect(testsCard).toBeVisible();
    await testsCard.click();
    await page.waitForTimeout(2000)
    if ((vyomTitle != '')) {
        await page.getByText(vyomTitle).click()
    }
    else {
        console.log("not found vyom question in bookmarks")
    }
    await page.waitForTimeout(3000)

    console.log("Test completed")

});




//*[@id="appRoot"]/div[2]/div/div[2]/div[2]/div/div[5]/div/div[1]/section/div[1]
//*[@id="appRoot"]/div[2]/div/div[2]/div[2]/div/div[5]/div/div[1]/section/div[2]
//*[@id="appRoot"]/div[2]/div/div[2]/div[2]/div/div[5]/div/div[1]/section/div[3]

//*[@id="appRoot"]/div[2]/div/div[2]/div[2]/div/div[5]/div/div[2]/section/div[1]