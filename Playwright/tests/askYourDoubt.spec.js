const { test, expect } = require('./fixtures/test-base');
const credentials = require('./data/credentials.json');
const { scrollToLoadAllInContainer, handleCard } = require('./helpers/ui-helpers');

test.describe('Ask Your Doubt Sanity Checks', () => {

    test('Verify ask your doubt and content functionality', async ({ page, loginPage, homePage, askYourDoubtPage }) => {
        test.setTimeout(120000);

        await test.step('Login and Navigate to Ask Your Doubt', async () => {
            await loginPage.goto();
            await loginPage.login(credentials.username, credentials.password);

            await homePage.closePopupIfVisible();

            await askYourDoubtPage.navigateTo();
        });

        await test.step('Verify Pending section', async () => {
            await askYourDoubtPage.openPendingSection();
            
            // STEP 1: Raise doubt (first time)
            await test.step('Raise doubt - Attempt 1', async () => {
                await askYourDoubtPage.raiseDoubt('Botany', 'What is Botany?');
            });

            // STEP 2: Handle Suggestions
            if (await askYourDoubtPage.isSuggestionVisible()) {
                await test.step('Solve using Suggestions', async () => {
                    await askYourDoubtPage.solveFirstUsingSuggestion();
                });
            } else {
                console.log('Suggestions not visible in first attempt');
            }

            // Return to doubt list safely
            await test.step('Return to Pending List', async () => {
                await askYourDoubtPage.goBackToDoubtList();
            });

            // STEP 3: Raise doubt AGAIN (fresh flow)
            await test.step('Raise doubt - Attempt 2', async () => {
                await askYourDoubtPage.raiseDoubt('Botany', 'What is Botany?');
            });

            // STEP 4: Handle Ask Expert (only if visible)
            if (await askYourDoubtPage.isAskExpertVisible()) {
                await test.step('Solve using Ask an Expert', async () => {
                    await askYourDoubtPage.solveUsingAskExpert();
                });
            } else {
                console.log('Ask an Expert not visible in second attempt');
            }
        });
    });
});