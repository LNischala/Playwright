// const fs = require('fs');
// const path = require('path');
// const xlsx = require('xlsx');
// const { test } = require('./fixtures/test-base');

// const personaIndicators = {
//   aiats: {
//     mustSeeHomeCards: ['How my course works?', 'My Scheduled Classes'],
//     mustNotSeeLeftNav: [
//       'Time table and attendence',
//       'Class recordings and content',
//       'Assignments and solutions',
//       'Fee and payment',
//       'Faculty feedback',
//       'Service request',
//     ],
//     mustNotSeeInProfileDropdown: ['Switch to parent profile']
//   },
//   4080: {
//     mustSeeHomeCards: [],
//     mustNotSeeLeftNav: [],
//     mustNotSeeInProfileDropdown: []
//   },
//   its: {
//     mustSeeHomeCards: [],
//     mustNotSeeLeftNav: [
//       'Time table and attendence',
//       'Class recordings and content',
//       'Assignments and solutions',
//       'Fee and payment',
//       'Faculty feedback',
//       'Service request'
//     ],
//     mustNotSeeInProfileDropdown: ['Switch to parent profile']
//   },
//   regular: {
//     mustSeeHomeCards: ['What would you like to learn today?'],
//     mustNotSeeLeftNav: [
//       'Time table and attendence',
//       'Fee and payment',
//     ],
//     mustNotSeeInProfileDropdown: []
//   },
//   disc: {
//     mustSeeHomeCards: [],
//     mustNotSeeLeftNav: [
//       'Time table and attendence',
//       'Service request',
//       'Faculty feedback',
//       'Class recordings and content',
//       'Ask Your Doubt',
//       'Branch contact'
//     ],
//     mustNotSeeInProfileDropdown: []
//   }
// };

// const EXCEL_DATA_PATH = process.env.PERSONA_DATA_FILE
//   ? path.resolve(process.env.PERSONA_DATA_FILE)
//   : path.resolve(__dirname, 'data', 'persona-credentials.xlsx');

// function parseExpectedPersonas(value) {
//   return String(value || '')
//     .toLowerCase()
//     .split(',')
//     .map((persona) => persona.trim())
//     .filter(Boolean);
// }

// function loadPersonaRecordsFromExcel() {
//   if (!fs.existsSync(EXCEL_DATA_PATH)) {
//     throw new Error(
//       `Excel data file not found at "${EXCEL_DATA_PATH}". Create it with columns: psid, password, personas`
//     );
//   }

//   const workbook = xlsx.readFile(EXCEL_DATA_PATH);
//   const firstSheetName = workbook.SheetNames[0];
//   if (!firstSheetName) {
//     throw new Error(`Excel file "${EXCEL_DATA_PATH}" does not contain any sheet.`);
//   }

//   const rows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });
//   if (!rows.length) {
//     throw new Error(`Excel file "${EXCEL_DATA_PATH}" does not contain any data rows.`);
//   }

//   return rows
//     .map((row, index) => {
//       const psid = String(row.psid || row.PSID || row.username || row.Username || '').trim();
//       const password = String(row.password || row.Password || '').trim();
//       const personasRaw = String(row.personas || row.Personas || row.expected_persona || row.EXPECTED_PERSONA || '').trim();

//       if (!psid || !password || !personasRaw) {
//         return null;
//       }

//       return {
//         rowNumber: index + 2,
//         psid,
//         password,
//         expectedPersonas: parseExpectedPersonas(personasRaw)
//       };
//     })
//     .filter(Boolean);
// }

// const personaRecords = loadPersonaRecordsFromExcel(); //reads Excel file and converts each row into usable test data(JSON).

// test.describe.serial('Persona validation by PSID', () => {
//   test.setTimeout(120000);

//   for (const record of personaRecords) {
//     test(`Validate PSID ${record.psid} persona mapping via UI indicators @persona-validation`, async ({ page, loginPage, homePage, personaValidationPage }) => {
//       const psid = record.psid;
//       const password = record.password;
//       const expectedPersonas = record.expectedPersonas; // 1 or 2 personas

//       if (!expectedPersonas.length) {
//         throw new Error(`Row ${record.rowNumber} in Excel has empty personas for PSID ${psid}`);
//       }

//       for (const persona of expectedPersonas) {
//         if (!personaIndicators[persona]) {
//           throw new Error(
//             `Unsupported persona "${persona}" for PSID ${psid}. Supported personas: ${Object.keys(personaIndicators).join(', ')}`
//           );
//         }
//       }

//       //changed now
//       const userResponsePromise = page.waitForResponse(res =>
//         res.url().includes('/user') &&
//         res.status() === 200 &&
//         res.request().method() === 'GET'
//       );
//       //changed now

//       await test.step(`Login with PSID ${psid}`, async () => {
//         await loginPage.goto();
//         await loginPage.login(psid, password);
//         await homePage.closePopupIfVisible();
//         // await homePage.verifyHomePageLoaded();
//       });

//       //changed now
//       const userRes = await userResponsePromise;
//       const userData = await userRes.json();
//       console.log('Initial persona:', userData.data.persona);
//       //changed now

//       let orderedPersonas = [...expectedPersonas];
//       // >1 persona user
//       if (expectedPersonas.length > 1) {
//         const firstDetectedPersona = await test.step('Detect currently opened course/persona', async () => {
//           const detected = await personaValidationPage.getCurrentPersonaKey();
//           if (!expectedPersonas.includes(detected)) {
//             throw new Error(
//               `Detected persona "${detected}" is not in Excel personas for PSID ${psid}: ${expectedPersonas.join(',')}`
//             );
//           }
//           return detected;
//         });

//         orderedPersonas = [
//           firstDetectedPersona,
//           ...expectedPersonas.filter((persona) => persona !== firstDetectedPersona)
//         ];
//       } 
//       // single persona user
//       else if (expectedPersonas.length === 1) {
//         orderedPersonas = [...expectedPersonas];
//       }

//       for (let index = 0; index < orderedPersonas.length; index += 1) {
//         const persona = orderedPersonas[index];
//         const indicators = personaIndicators[persona];

//         if (index > 0 && orderedPersonas.length > 1) {
//           await test.step(`Switch to persona/course: ${persona}`, async () => {
//             await personaValidationPage.switchToPersona(persona);
//           });
//         }

//         await test.step(`Validate must-see home cards for ${persona}`, async () => {
//           console.log(`[${persona}] Must see cards:`, indicators.mustSeeHomeCards);
//           await personaValidationPage.verifyMustSeeHomeCards(persona,indicators.mustSeeHomeCards);
//         });

//         await test.step(`Validate left navbar must-not-see for ${persona}`, async () => {
//           console.log(`[${persona}] Must NOT see (left nav):`, indicators.mustNotSeeLeftNav);
//           await personaValidationPage.verifyMustNotSeeLeftNav(persona,indicators.mustNotSeeLeftNav);
//         });

//         await test.step(`Validate profile-dropdown must-not-see items for ${persona}`, async () => {
//           console.log(`[${persona}] Must NOT see (profile drop down):`, indicators.mustNotSeeLeftNav);
//           await personaValidationPage.verifyMustNotSeeInProfileDropdown(persona, indicators.mustNotSeeInProfileDropdown);
//         });
//          if (persona === 'its') {
//           await personaValidationPage.verifyITSUI(test);
//         }
//       }
//     });
//   }
// });
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { test, expect } = require('./fixtures/test-base');

const personaIndicators = {
  '4080ext': {
    mustSeeHomeCards: ['How my course works?', 'My Scheduled Classes'],
    mustNotSeeLeftNav: [
      'Time table and attendence',
      'Class recordings and content',
      'Assignments and solutions',
      'Fee and payment',
      'Faculty feedback',
      'Service request',
    ],
    mustNotSeeInProfileDropdown: ['Switch to parent profile']
  },
  4080: {
    mustSeeHomeCards: [],
    mustNotSeeLeftNav: [],
    mustNotSeeInProfileDropdown: []
  },
  its: {
    mustSeeHomeCards: [],
    mustNotSeeLeftNav: [
      'Time table and attendence',
      'Class recordings and content',
      'Assignments and solutions',
      'Fee and payment',
      'Faculty feedback',
      'Service request'
    ],
    mustNotSeeInProfileDropdown: ['Switch to parent profile']
  },
  regular: {
    mustSeeHomeCards: ['What would you like to learn today?'],
    mustNotSeeLeftNav: [
      'Time table and attendence',
      'Fee and payment',
    ],
    mustNotSeeInProfileDropdown: []
  },
  disc: {
    mustSeeHomeCards: [],
    mustNotSeeLeftNav: [
      'Time table and attendence',
      'Service request',
      'Faculty feedback',
      'Class recordings and content',
      'Ask Your Doubt',
      'Branch contact'
    ],
    mustNotSeeInProfileDropdown: []
  }
};

/**
 * Maps the raw persona string returned by the /user API
 * to the normalized key used in personaIndicators.
 * Extend this map as new API persona values are discovered.
 */
const API_PERSONA_TO_KEY = {
  aiats:   '4080ext',
  its:     'its',
  invictus: 'its',
  '4080':  '4080',
  '4080ext': '4080ext',
  regular: 'regular',
  disc:    'disc',
};

function normalizeApiPersona(rawApiPersona) {
  if (!rawApiPersona) return null;
  const lower = String(rawApiPersona).trim().toLowerCase();
  return API_PERSONA_TO_KEY[lower] ?? lower;
}

const EXCEL_DATA_PATH = process.env.PERSONA_DATA_FILE
  ? path.resolve(process.env.PERSONA_DATA_FILE)
  : path.resolve(__dirname, 'data', 'persona-credentials.xlsx');

function parseExpectedPersonas(value) {
  return String(value || '')
    .toLowerCase()
    .split(',')
    .map((persona) => persona.trim())
    .filter(Boolean);
}

function loadPersonaRecordsFromExcel() {
  if (!fs.existsSync(EXCEL_DATA_PATH)) {
    throw new Error(
      `Excel data file not found at "${EXCEL_DATA_PATH}". Create it with columns: psid, password, personas`
    );
  }

  const workbook = xlsx.readFile(EXCEL_DATA_PATH);
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error(`Excel file "${EXCEL_DATA_PATH}" does not contain any sheet.`);
  }

  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });
  if (!rows.length) {
    throw new Error(`Excel file "${EXCEL_DATA_PATH}" does not contain any data rows.`);
  }

  return rows
    .map((row, index) => {
      const psid = String(row.psid || row.PSID || row.username || row.Username || '').trim();
      const password = String(row.password || row.Password || '').trim();
      const personasRaw = String(row.personas || row.Personas || row.expected_persona || row.EXPECTED_PERSONA || '').trim();

      if (!psid || !password || !personasRaw) {
        return null;
      }

      return {
        rowNumber: index + 2,
        psid,
        password,
        expectedPersonas: parseExpectedPersonas(personasRaw)
      };
    })
    .filter(Boolean);
}

const personaRecords = loadPersonaRecordsFromExcel();

test.describe.serial('Persona validation by PSID', () => {
  test.setTimeout(120000);

  for (const record of personaRecords) {
    test(`Validate PSID ${record.psid} persona mapping via UI indicators @persona-validation`, async ({ page, loginPage, homePage, personaValidationPage }) => {
      const psid = record.psid;
      const password = record.password;
      const expectedPersonas = record.expectedPersonas; // 1 or more personas

      if (!expectedPersonas.length) {
        throw new Error(`Row ${record.rowNumber} in Excel has empty personas for PSID ${psid}`);
      }

      for (const persona of expectedPersonas) {
        if (!personaIndicators[persona]) {
          throw new Error(
            `Unsupported persona "${persona}" for PSID ${psid}. Supported personas: ${Object.keys(personaIndicators).join(', ')}`
          );
        }
      }

      // --- LOGIN and capture initial /user API response ---
      const userResponsePromise = page.waitForResponse(res =>
        res.url().includes('/user') &&
        res.status() === 200 &&
        res.request().method() === 'GET'
      );

      await test.step(`Login with PSID ${psid}`, async () => {
        await loginPage.goto();
        await loginPage.login(psid, password);
        await homePage.closePopupIfVisible();
      });

      const userRes = await userResponsePromise;
      const userData = await userRes.json();
      const rawApiPersonaAfterLogin = userData?.data?.persona;
      console.log(`Persona captured from API:`, rawApiPersonaAfterLogin);

      // --- Determine the order to validate personas ---
      let orderedPersonas = [...expectedPersonas];

      if (expectedPersonas.length > 1) {
        // Detect which persona is currently open in the UI
        const firstDetectedPersona = await test.step('Detect currently opened course/persona', async () => {
          const detected = await personaValidationPage.getCurrentPersonaKey();
          if (!expectedPersonas.includes(detected)) {
            throw new Error(
              `Detected persona "${detected}" is not in Excel personas for PSID ${psid}: ${expectedPersonas.join(',')}`
            );
          }
          return detected;
        });

        // Validate that the API persona also matches what the UI shows
        await test.step('Assert API persona matches currently active UI persona after login', async () => {
          const apiPersonaKey = normalizeApiPersona(rawApiPersonaAfterLogin);
          console.log(`API persona (normalized): ${apiPersonaKey} | UI detected: ${firstDetectedPersona}`);
          expect(
            apiPersonaKey,
            `After login, API returned persona "${apiPersonaKey}" but UI detected "${firstDetectedPersona}" for PSID ${psid}`
          ).toBe(firstDetectedPersona);
        });

        orderedPersonas = [
          firstDetectedPersona,
          ...expectedPersonas.filter((persona) => persona !== firstDetectedPersona)
        ];
      } else {
        // Single persona: validate API persona matches the only expected persona
        await test.step('Assert API persona matches expected persona after login', async () => {
          const apiPersonaKey = normalizeApiPersona(rawApiPersonaAfterLogin);
          const expectedPersona = expectedPersonas[0];
          console.log(`API persona (normalized): ${apiPersonaKey} | Expected: ${expectedPersona}`);
          expect(
            apiPersonaKey,
            `After login, API returned persona "${apiPersonaKey}" but expected "${expectedPersona}" for PSID ${psid}`
          ).toBe(expectedPersona);
        });

        orderedPersonas = [...expectedPersonas];
      }

      // --- Validate each persona in order ---
      for (let index = 0; index < orderedPersonas.length; index += 1) {
        const persona = orderedPersonas[index];
        const indicators = personaIndicators[persona];

        // For every persona after the first, switch to it and verify the API response
        if (index > 0 && orderedPersonas.length > 1) {
          await test.step(`Switch to persona/course: ${persona}`, async () => {
            // switchToPersona now returns the /user API data captured after reload
            const switchedUserData = await personaValidationPage.switchToPersona(persona);
            const rawApiPersonaAfterSwitch = switchedUserData?.data?.persona;
            const apiPersonaKey = normalizeApiPersona(rawApiPersonaAfterSwitch);
            console.log(`After switching to "${persona}" — API persona (raw): ${rawApiPersonaAfterSwitch} | normalized: ${apiPersonaKey}`);

            expect(
              apiPersonaKey,
              `After switching, API returned persona "${apiPersonaKey}" but expected "${persona}" for PSID ${psid}`
            ).toBe(persona);
          });
        }

        await test.step(`Validate must-see home cards for ${persona}`, async () => {
          console.log(`[${persona}] Must see cards:`, indicators.mustSeeHomeCards);
          await personaValidationPage.verifyMustSeeHomeCards(persona, indicators.mustSeeHomeCards);
        });

        await test.step(`Validate left navbar must-not-see for ${persona}`, async () => {
          console.log(`[${persona}] Must NOT see (left nav):`, indicators.mustNotSeeLeftNav);
          await personaValidationPage.verifyMustNotSeeLeftNav(persona, indicators.mustNotSeeLeftNav);
        });

        await test.step(`Validate profile-dropdown must-not-see items for ${persona}`, async () => {
          console.log(`[${persona}] Must NOT see (profile dropdown):`, indicators.mustNotSeeInProfileDropdown);
          await personaValidationPage.verifyMustNotSeeInProfileDropdown(persona, indicators.mustNotSeeInProfileDropdown);
        });

        if (persona === 'its') {
          await personaValidationPage.verifyITSUI(test);
        }
      }
    });
  }
});