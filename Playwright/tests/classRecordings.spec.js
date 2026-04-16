const { test, expect } = require('./fixtures/test-base');
const credentials = require('./data/credentials.json');

test.describe('Class Recordings and Content Sanity Checks', () => {

    test('Verify class recordings and content functionality with optimized flow', async ({ page, loginPage, homePage, classRecordingsPage }) => {
        test.setTimeout(240000);

        let playVideoLocation = null;
        let viewNotesLocation = null;

        await test.step('Login and Navigate to Class Recordings', async () => {
            await loginPage.goto();
            await loginPage.login(credentials.username, credentials.password);
            await homePage.closePopupIfVisible();
            await page.getByText('Class Recordings & Content').click();
            await page.waitForLoadState('networkidle');
        });

        const batches = credentials.ad.batches;
        const subjectsList = credentials.ad.subjects;
        
        let foundPlayVideo = false;
        let foundViewNotes = false;
        let verifiedSoon = false;
        let verifiedEmpty = false;

        for (const batchName of batches) {
            if (foundPlayVideo && foundViewNotes) break;

            await test.step(`Batch: ${batchName}`, async () => {
                await classRecordingsPage.selectBatch(batchName);
                await classRecordingsPage.sortByDate();

                for (const subject of subjectsList) {
                    if (foundPlayVideo && foundViewNotes) break;

                    await test.step(`Subject: ${subject}`, async () => {
                        const isSelected = await classRecordingsPage.selectSubject(subject);
                        if (!isSelected) {
                            console.log(`Skipping subject ${subject} as tab not selectable.`);
                            return;
                        }

                        await page.waitForTimeout(2000);

                        // Empty state check
                        if (await classRecordingsPage.isEmpty()) {
                            console.log(`Subject ${subject} is empty.`);
                            if (!verifiedEmpty) {
                                await expect(page.getByText('You will be able to access your class content for this subject as soon as it is available')).toBeVisible();
                                verifiedEmpty = true;
                            }
                            return;
                        }

                        const monthLocators = page.locator(classRecordingsPage.monthContainerSelector).filter({
                            has: page.locator('h6')
                        });

                        const monthCount = await monthLocators.count();
                        console.log(`Found ${monthCount} month containers in ${subject}.`);

                        for (let i = 0; i < monthCount; i++) {
                            if (foundPlayVideo && foundViewNotes) break;

                            const month = monthLocators.nth(i);
                            const monthTitle = await month.locator('h6').first().innerText();

                            // Scroll inside month to load all cards
                            await month.scrollIntoViewIfNeeded();

                            let prevHeight = 0;
                            while (true) {
                                const currHeight = await month.evaluate(el => el.scrollHeight);
                                if (currHeight === prevHeight) break;

                                prevHeight = currHeight;
                                await month.evaluate(el => el.scrollBy(0, el.scrollHeight));
                                await page.waitForTimeout(800);
                            }

                            const hasPlay = await month.getByText('Play Video').first().isVisible().catch(() => false);
                            const hasNotes = await month.getByText('View Notes').first().isVisible().catch(() => false);

                            if (hasPlay || hasNotes) {
                                console.log(`Month "${monthTitle}" has actionable content.`);

                                const cards = await classRecordingsPage.getCards(month);

                                for (const card of cards) {
                                    if (foundPlayVideo && foundViewNotes) break;

                                    if (!verifiedSoon && await classRecordingsPage.hasSoonMessage(card)) {
                                        verifiedSoon = true;
                                        console.log('Verified "Content available soon".');
                                    }

                                    // Play Video
                                    const canPlay = await card.getByText('Play Video').isVisible().catch(() => false);
                                    if (canPlay && !foundPlayVideo) {
                                        await test.step(`Verify Play Video [${batchName} > ${subject} > ${monthTitle}]`, async () => {
                                            await classRecordingsPage.playVideo(card);
                                            foundPlayVideo = true;

                                            playVideoLocation = `${batchName} > ${subject} > ${monthTitle}`;
                                            console.log(`Play Video found at: ${playVideoLocation}`);
                                        });
                                    }

                                    // View Notes
                                    const canViewNotes = await card.getByText('View Notes').isVisible().catch(() => false);
                                    if (canViewNotes && !foundViewNotes) {
                                        await test.step(`Verify View Notes [${batchName} > ${subject} > ${monthTitle}]`, async () => {
                                            await classRecordingsPage.viewNotes(card);
                                            foundViewNotes = true;

                                            viewNotesLocation = `${batchName} > ${subject} > ${monthTitle}`;
                                            console.log(`View Notes found at: ${viewNotesLocation}`);
                                        });
                                    }
                                }
                            } else {
                                console.log(`Skipping month "${monthTitle}" (no actionable content).`);
                            }
                        }
                    });
                }
            });
        }

        // Final Assertions
        expect(foundPlayVideo, 'Should have found at least one Play Video').toBeTruthy();
        expect(foundViewNotes, 'Should have found at least one View Notes').toBeTruthy();

        // Attach summary to report
        await test.info().attach('Execution Summary', {
            body: `
                Play Video found at: ${playVideoLocation || 'Not Found'}
                View Notes found at: ${viewNotesLocation || 'Not Found'}
                            `,
                contentType: 'text/plain'
        });

        console.log('Execution complete.');
    });
});