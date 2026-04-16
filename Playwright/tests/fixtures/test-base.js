const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { HomePage } = require('../pages/HomePage');
const { ITutorPage } = require('../pages/ITutorPage');
const { BookmarksPage } = require('../pages/BookmarksPage');
const { TestAnalysisPage } = require('../pages/TestAnalysisPage');

const { ClassRecordingsPage } = require('../pages/ClassRecordingsPage');
const { AskYourDoubtPage } = require('../pages/AskYourDoubtPage');
const { ChannelsPage } = require('../pages/ChannelsPage');

exports.test = base.test.extend({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
    itutorPage: async ({ page }, use) => {
        await use(new ITutorPage(page));
    },
    bookmarksPage: async ({ page }, use) => {
        await use(new BookmarksPage(page));
    },
    testAnalysisPage: async ({ page }, use) => {
        await use(new TestAnalysisPage(page));
    },
    classRecordingsPage: async ({ page }, use) => {
        await use(new ClassRecordingsPage(page));
    },
    askYourDoubtPage: async ({ page }, use) => {
        await use(new AskYourDoubtPage(page));
    },
    channelsPage: async ({ page }, use) => {
        await use(new ChannelsPage(page));
    }
});

exports.expect = base.expect;
