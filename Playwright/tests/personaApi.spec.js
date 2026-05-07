const { test } = require('./fixtures/test-base');
const credentials = require('./data/credentials.json');


test('fetch persona correctly', async ({ page, loginPage }) => {

    page.on('response', async (res) => {
        if (res.url().includes('persona')) {
            console.log('Persona API HIT:', res.url());
        }
    });

    const userResponsePromise = page.waitForResponse(res =>
        res.url().includes('/user') &&
        res.status() === 200 &&
        res.request().method() === 'GET'
    );

    await loginPage.goto();
    await loginPage.login('00015922683', 'Vi@070802');

    const userRes = await userResponsePromise;
    const userData = await userRes.json();

    console.log('Initial persona:', userData.data.persona);

    const courseSwitcher = page.locator(
        '//*[@id="appRoot"]/div[2]/div/div[2]/div[1]/div/div[3]/div[2]/div[2]'
    );

    await courseSwitcher.click();

    const switchCourseItem = page
        .getByRole('button', { name: 'Switch Course' })
        .first();
    await switchCourseItem.click();

    const selectBtn = page
        .locator('div')
        .filter({ hasText: 'AIATS' })
        .locator('button', { name: 'Select', exact: true })
        .first();

        await selectBtn.click();

        const reloadUserPromise = page.waitForResponse(res =>
            res.url().includes('/user') &&
            res.status() === 200
        );

        await page.reload();

        const reloadRes = await reloadUserPromise;
        const reloadData = await reloadRes.json();

        console.log('Persona after reload:', reloadData.data.persona);
});