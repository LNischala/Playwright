// const { expect } = require('@playwright/test');

// class PersonaValidationPage {
//   /**
//    * @param {import('@playwright/test').Page} page
//    */
//   constructor(page) {
//     this.page = page;
//     this.courseSwitcher = page.locator('//*[@id="appRoot"]/div[2]/div/div[2]/div[1]/div/div[3]/div[2]/div[2]');
//     this.activeCourse = page.locator('//*[@id="appRoot"]/div[2]/div/div[2]/div[1]/div/div[3]/div[2]/div[2]/div[1]/div[2]');
//     this.dropdownPanel = page.locator('div[role="menu"], div[role="listbox"], div.dropdown-menu, ul[role="menu"]').first();
//     this.homeSection = page.locator('//*[@id="appRoot"]/div[2]/div/div[2]/div[2]/div[3]');
//     this.leftNav = page.locator('div.flex.flex-col.justify-start.items-start');
//     this.profileDropdownTriggerCandidates = [
//       page.getByText(/AIATS Plus/i).first(),
//       page.getByText(/Invictus/i).first(),
//       page.getByText(/Profile/i).first(),
//       this.courseSwitcher
//     ];
//   }

//   static normalizePersonaLabel(value) {
//     return String(value || '').trim().toLowerCase();
//   }

//   static mapCourseTextToPersona(courseText) {
//     const normalized = this.normalizePersonaLabel(courseText);
//     if (/aiats/.test(normalized)) return 'aiats';
//     if (/\bits\b|i[\s-]?tutor/.test(normalized)) return 'its';
//     if (/4080EXT/.test(normalized)) return '4080ext';
//     if (/4080/.test(normalized)) return '4080';
//     if (/regular/.test(normalized)) return 'regular';
//     if (/disc/.test(normalized)) return 'disc'; 
//     return normalized;
//   }

//   async getCurrentCourseText() {
//     const activeCourseVisible = await this.activeCourse.isVisible().catch(() => false);
//     if (activeCourseVisible) {
//       const text = await this.activeCourse.innerText();
//       if (text && text.trim()) return text.trim();
//     }

//     const switcherVisible = await this.courseSwitcher.isVisible().catch(() => false);
//     if (!switcherVisible) {
//       throw new Error('Unable to detect current course/persona. Course switcher is not visible.');
//     }

//     const fallbackText = await this.courseSwitcher.innerText();
//     if (!fallbackText || !fallbackText.trim()) {
//       throw new Error('Unable to detect current course/persona text from course switcher.');
//     }
//     return fallbackText.trim();
//   }

//   // async getCurrentPersonaKey(singlePersonaFallback) {
//   //   try {
//   //     const currentCourseText = await this.getCurrentCourseText();
//   //     return PersonaValidationPage.mapCourseTextToPersona(currentCourseText);
//   //   } catch (error) {
//   //     if (singlePersonaFallback) {
//   //       return PersonaValidationPage.normalizePersonaLabel(singlePersonaFallback);
//   //     }
//   //     throw error;
//   //   }
//   // }
//       async getCurrentPersonaKey(singlePersonaFallback) {
//       try {
//         const currentCourseText = await this.getCurrentCourseText();
//         const mapped = PersonaValidationPage.mapCourseTextToPersona(currentCourseText);

//         console.log('Detected course text:', currentCourseText);
//         console.log('Mapped persona:', mapped);

//         const supportedPersonas = ['aiats', 'its', '4080', 'regular','4080ext','disc'];

//         // If mapping is garbage or not supported → fallback
//         if (!supportedPersonas.includes(mapped)) {
//           if (singlePersonaFallback) {
//             return PersonaValidationPage.normalizePersonaLabel(singlePersonaFallback);
//           }
//           throw new Error(`Unrecognized persona from UI: "${mapped}"`);
//         }

//         return mapped;
//       } catch (error) {
//         if (singlePersonaFallback) {
//           return PersonaValidationPage.normalizePersonaLabel(singlePersonaFallback);
//         }
//         throw error;
//       }
//     }

//   async openCourseSwitcherMenu() {
//     await this.courseSwitcher.click();
//     await this.page.waitForTimeout(300);
//   }

//   async switchToPersona(targetPersona) {
//     let normalizedTarget = ''
//     if(targetPersona=='its'){
//       normalizedTarget = 'Invictus'
//     }
//     else{
//       normalizedTarget = targetPersona.toUpperCase();
//     }

//     // STEP 1: open course switcher (icon / dropdown trigger)
//     await this.courseSwitcher.click();
//     console.log('clicked course switcher');
    
//     await this.courseSwitcher.click();
//     console.log('clicked course switcher');
//     // STEP 2: click "Switch Course"
//     const switchCourseItem = await this.page.getByRole('button',{name:'Switch Course'}).first();
//     await switchCourseItem.click();
//     console.log('clicked course item');

//     const selectBtn = await this.page.locator('div').filter({ hasText: normalizedTarget}).locator('button', { name: 'Select',exact: true}).first();
//     await selectBtn.click();
//     //changed now
//     const [reloadRes] = await Promise.all([
//       this.page.waitForResponse(res =>
//         res.url().includes('/user') &&
//         res.status() === 200 &&
//         res.request().method() === 'GET'
//       ),
//       this.page.reload()
//     ]);
//     const reloadData = await reloadRes.json(); 
//     console.log('Persona after reload:', reloadData.data.persona)
//     //changed now
//   }

//   async verifyPersonaContext(persona) {
//     await expect(
//       this.activeCourse,
//       `Expected active persona to be ${persona}`
//     ).toContainText(new RegExp(persona, 'i'));
//   }

//   async verifyMustSeeHomeCards(persona, cardTexts) {
//     for (const cardText of cardTexts) {
//       await expect(
//         this.homeSection.getByText(cardText, { exact: true }),
//         `Card "${cardText}" should be visible for ${persona}`
//       ).toBeVisible();
//     }
//   }

//   async verifyMustNotSeeLeftNav(persona, navTexts) {
//     for (const navText of navTexts) {
//       await expect(
//         this.leftNav.getByText(navText, { exact: true }),
//         `"${navText}" should NOT be visible for ${persona}`
//       ).toHaveCount(0);
//     }
//   }

//   async verifyMustNotSeeInProfileDropdown(persona, optionTexts) {
//     await this.openProfileDropdown();
//     for (const optionText of optionTexts) {
//       await expect(
//         this.page.getByText(optionText, { exact: true }),
//         `"${optionText}" should NOT be visible in profile dropdown for ${persona}`
//       ).toHaveCount(0);
//     }
//   }

//   async openProfileDropdown() {
//     for (const trigger of this.profileDropdownTriggerCandidates) {
//       if (await trigger.isVisible().catch(() => false)) {
//         await trigger.click();
//         await this.page.waitForTimeout(300);
//         return;
//       }
//     }
//     // throw new Error('Unable to open profile dropdown. Update trigger selectors in PersonaValidationPage.');
//   }

//   async verifyITSUI(test) {

//     await test.step('ITS → Verify Theme Color', async () => {
//       const sidebar = this.page.locator('div[class*="bg-"]').first();

//       const bg = await sidebar.evaluate(el =>
//         window.getComputedStyle(el).backgroundImage
//       );
//       expect(bg).toContain('rgb(39, 170, 227)');

//       await test.info().attach('ITS Theme Background', {
//         body: bg,
//         contentType: 'text/plain'
//       });

//       await test.info().attach('ITS UI Screenshot', {
//         body: await this.page.screenshot(),
//         contentType: 'image/png'
//       });
//     });

//     await test.step('ITS → Verify Logo', async () => {
//       const logo = await this.page.locator('img[alt*="logo" i]')
//       await expect(logo).toBeVisible();

//       const src = await logo.getAttribute('src');
//       expect(src).toContain('invictus');

//       await test.info().attach('ITS Logo src', {
//         body: src || 'No src found',
//         contentType: 'text/plain'
//       });
//     });
//   }
// }

// module.exports = { PersonaValidationPage };


const { expect } = require('@playwright/test');

class PersonaValidationPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.courseSwitcher = page.locator('//*[@id="appRoot"]/div[2]/div/div[2]/div[1]/div/div[3]/div[2]/div[2]');
    this.activeCourse = page.locator('//*[@id="appRoot"]/div[2]/div/div[2]/div[1]/div/div[3]/div[2]/div[2]/div[1]/div[2]');
    this.dropdownPanel = page.locator('div[role="menu"], div[role="listbox"], div.dropdown-menu, ul[role="menu"]').first();
    this.homeSection = page.locator('//*[@id="appRoot"]/div[2]/div/div[2]/div[2]/div[3]');
    this.leftNav = page.locator('div.flex.flex-col.justify-start.items-start');
    this.profileDropdownTriggerCandidates = [
      page.getByText(/AIATS Plus/i).first(),
      page.getByText(/Invictus/i).first(),
      page.getByText(/Profile/i).first(),
      this.courseSwitcher
    ];
  }

  static normalizePersonaLabel(value) {
    return String(value || '').trim().toLowerCase();
  }

  static mapCourseTextToPersona(courseText) {
    const normalized = this.normalizePersonaLabel(courseText);
    if (/aiats/.test(normalized)) return '4080ext';
    if (/\bits\b|i[\s-]?tutor/.test(normalized)) return 'its';
    if (/4080EXT/.test(normalized)) return '4080ext';
    if (/4080/.test(normalized)) return '4080';
    if (/regular/.test(normalized)) return 'regular';
    if (/disc/.test(normalized)) return 'disc';
    return normalized;
  }

  async getCurrentCourseText() {
    const activeCourseVisible = await this.activeCourse.isVisible().catch(() => false);
    if (activeCourseVisible) {
      const text = await this.activeCourse.innerText();
      if (text && text.trim()) return text.trim();
    }

    const switcherVisible = await this.courseSwitcher.isVisible().catch(() => false);
    if (!switcherVisible) {
      throw new Error('Unable to detect current course/persona. Course switcher is not visible.');
    }

    const fallbackText = await this.courseSwitcher.innerText();
    if (!fallbackText || !fallbackText.trim()) {
      throw new Error('Unable to detect current course/persona text from course switcher.');
    }
    return fallbackText.trim();
  }

  async getCurrentPersonaKey(singlePersonaFallback) {
    try {
      const currentCourseText = await this.getCurrentCourseText();
      const mapped = PersonaValidationPage.mapCourseTextToPersona(currentCourseText);

      console.log('Detected course text:', currentCourseText);
      console.log('Mapped persona:', mapped);

      const supportedPersonas = ['its', '4080', 'regular', '4080ext', 'disc'];

      if (!supportedPersonas.includes(mapped)) {
        if (singlePersonaFallback) {
          return PersonaValidationPage.normalizePersonaLabel(singlePersonaFallback);
        }
        throw new Error(`Unrecognized persona from UI: "${mapped}"`);
      }

      return mapped;
    } catch (error) {
      if (singlePersonaFallback) {
        return PersonaValidationPage.normalizePersonaLabel(singlePersonaFallback);
      }
      throw error;
    }
  }

  async openCourseSwitcherMenu() {
    await this.courseSwitcher.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Switches the active course/persona and waits for the /user API response after reload.
   * @param {string} targetPersona - The normalized persona key to switch to (e.g. 'its', 'aiats').
   * @returns {Promise<object>} The parsed JSON body of the /user API response captured after reload.
   */
  async switchToPersona(targetPersona) {
    let normalizedTarget = '';
    if (targetPersona === 'its') {
      normalizedTarget = 'Invictus';
    }
    else if (targetPersona === '4080ext' || targetPersona === '4080') {
      normalizedTarget = 'AIATS '; // ← UI shows AIATS
    } 
    else {
      normalizedTarget = targetPersona.toUpperCase();
    }

    // STEP 1: open course switcher
    await this.courseSwitcher.click();
    console.log('clicked course switcher');

    await this.courseSwitcher.click();
    console.log('clicked course switcher');

    // STEP 2: click "Switch Course"
    const switchCourseItem = await this.page.getByRole('button', { name: 'Switch Course' }).first();
    await switchCourseItem.click();
    console.log('clicked course item');

    const selectBtn = await this.page
      .locator('div')
      .filter({ hasText: normalizedTarget })
      .locator('button', { name: 'Select', exact: true })
      .first();
    await selectBtn.click();

    // STEP 3: Reload and capture the /user API response
    const [reloadRes] = await Promise.all([
      this.page.waitForResponse(res =>
        res.url().includes('/user') &&
        res.status() === 200 &&
        res.request().method() === 'GET'
      ),
      this.page.reload()
    ]);

    const reloadData = await reloadRes.json();
    console.log('Persona after reload:', reloadData?.data?.persona);

    // Return the full parsed response so the caller (test) can assert the actual persona
    return reloadData;
  }

  async verifyPersonaContext(persona) {
    await expect(
      this.activeCourse,
      `Expected active persona to be ${persona}`
    ).toContainText(new RegExp(persona, 'i'));
  }

  async verifyMustSeeHomeCards(persona, cardTexts) {
    for (const cardText of cardTexts) {
      await expect(
        this.homeSection.getByText(cardText, { exact: true }),
        `Card "${cardText}" should be visible for ${persona}`
      ).toBeVisible();
    }
  }

  async verifyMustNotSeeLeftNav(persona, navTexts) {
    for (const navText of navTexts) {
      await expect(
        this.leftNav.getByText(navText, { exact: true }),
        `"${navText}" should NOT be visible for ${persona}`
      ).toHaveCount(0);
    }
  }

  async verifyMustNotSeeInProfileDropdown(persona, optionTexts) {
    await this.openProfileDropdown();
    for (const optionText of optionTexts) {
      await expect(
        this.page.getByText(optionText, { exact: true }),
        `"${optionText}" should NOT be visible in profile dropdown for ${persona}`
      ).toHaveCount(0);
    }
  }

  async openProfileDropdown() {
    for (const trigger of this.profileDropdownTriggerCandidates) {
      if (await trigger.isVisible().catch(() => false)) {
        await trigger.click();
        await this.page.waitForTimeout(300);
        return;
      }
    }
    // throw new Error('Unable to open profile dropdown. Update trigger selectors in PersonaValidationPage.');
  }

  async verifyITSUI(test) {
    await test.step('ITS → Verify Theme Color', async () => {
      const sidebar = this.page.locator('div[class*="bg-"]').first();

      const bg = await sidebar.evaluate(el =>
        window.getComputedStyle(el).backgroundImage
      );
      expect(bg).toContain('rgb(39, 170, 227)');

      await test.info().attach('ITS Theme Background', {
        body: bg,
        contentType: 'text/plain'
      });

      await test.info().attach('ITS UI Screenshot', {
        body: await this.page.screenshot(),
        contentType: 'image/png'
      });
    });

    await test.step('ITS → Verify Logo', async () => {
      const logo = await this.page.locator('img[alt*="logo" i]');
      await expect(logo).toBeVisible();

      const src = await logo.getAttribute('src');
      expect(src).toContain('invictus');

      await test.info().attach('ITS Logo src', {
        body: src || 'No src found',
        contentType: 'text/plain'
      });
    });
  }
}

module.exports = { PersonaValidationPage };