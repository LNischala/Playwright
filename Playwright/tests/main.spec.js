const { test } = require('./fixtures/test-base');

/**
 * Main Orchestration Spec
 * This file links all existing sanity and functional tests into a single "Smooth Flow".
 * The tests are executed serially to ensure a logical progression through the platform.
 */

test.describe.serial('Aakash Digital - Comprehensive Smooth Flow', { tag: '@sanity' }, () => {

    // 1. iTutor Video & eBook Flow
    require('./iTutor.spec.js');

    // 2. Bookmarks & Test Analysis
    require('./bookmarks.spec.js');

    // 3. Content and Class Recordings Sanity
    require('./Ad.spec.js');

});
