# Aakash Digital - Sanity Automation Scenarios

This document outlines all the features and test scenarios covered in the Playwright sanity automation suite present in the `tests` directory. The test suite is designed as an end-to-end sanity verification to ensure the core functional modules are operational.

---

## 1. Class Recordings & Content (`Ad.spec.js`)
**Feature:** Validates the presence, categorisation, and playability of recorded class modules and notes per batch and subject.

### Test Scenarios:
*   **Navigation & Setup:** Navigate securely to "Class Recordings & Content".
*   **Batch & Subject Selection:** Verify that configured batches and subjects can safely be clicked and selected.
*   **Empty State Handling:** Validate the messaging system if content is absent (e.g., "Content available soon" or "You will be able to access your class content...").
*   **Class Content Playability:** Scroll through month-wise content lists and verify the capability to:
    *   Find and click **Play Video** and ensure it loads without breaking.
    *   Find and click **View Notes** and verify the PDF/notes viewer loads successfully.

---

## 2. Bookmarks Feature (`bookmarks.spec.js`)
**Feature:** Verifies the process of saving learning collateral from varied locations and accessing it within the centralised Bookmarks workspace.

### Test Scenarios:
*   **Navigating iTutor & Saving:**
    *   Bookmark a Video from the target module.
    *   Bookmark an eBook explicitly from the eBooks tab.
    *   Open and Bookmark a Practice Question directly from the test popup frame.
*   **Cross-Domain Bookmarking (Scheduled Tests):**
    *   Navigate into Past Scheduled Tests Analytics.
    *   Access the Answer Key and Solutions (Vyom).
    *   Bookmark a specific test evaluation question.
*   **Global Bookmarks Verification:**
    *   Navigate globally to the "Bookmarks" page.
    *   Open the `Qa` Collection and verify that the exact Video, eBook, and Practice Question are present and can be clicked.
    *   Open the `Tests Questions` Collection and verify the presence of the bookmarked Scheduled Test question.

---

## 3. Channels Feed (`channels.spec.js`)
**Feature:** Ensures the community / broadcast feed displays valid post formats correctly, capturing images, texts, and file attachments natively.

### Test Scenarios:
*   **Channels Component Initialisation:** Navigate to Channels feed securely from the UI.
*   **Batch Iteration & Post Discovery:** Iterate flexibly through all student-assigned channels/batches to locate a stream.
*   **Validating Post Content Delivery:** Evaluate an opened post to automatically verify it has meaningful content:
    *   Identify the presence of **in-line images** or **attached image files**.
    *   Identify **document attachments** (and open the first attachment to verify its viewer capabilities).
    *   Validate the presence of a **meaningful text snippet** body.
*   **Empty State Resilience:** If a student currently has zero channels or zero posts, verify the display of the proper empty fallback message (e.g. "No posts found").

---

## 4. iTutor Video & eBook Flow (`iTutor.spec.js`)
**Feature:** A dedicated End-to-End tracking test ensuring progress updates natively when watching videos and reading eBooks.

### Test Scenarios:
*   **Video Interaction & Progress Registration:**
    *   Capture initial video watch progress (e.g., 0%).
    *   Play the video and trigger seek-to-end functionality to complete the session.
    *   Wait for backend sync and visually assert the progress has updated.
*   **eBook Interaction & Progress Registration:**
    *   Capture the initial eBook consumption progress.
    *   Launch the eBook viewer securely natively.
    *   Verify the progress data reflects updated reading time after interaction.
*   **Resume Learning Verification:**
    *   Navigate back to the Home Dashboard.
    *   Verify that the "Resume Learning" element actually contains the interacted items from this exact session (eBook / Video).

---

## 5. Ask Your Doubt Checks (`askYourDoubt.spec.js`)
**Feature:** Validates the automated doubt resolution engine, bot chat logic, and connection fallbacks.

### Test Scenarios:
*   **Creating a Doubt:** Use the floating action menu (+) to select a subject, provide doubt text, and successfully submit.
*   **Pending Doubt Listing:** Assert the 'Pending' doubts tab displays successfully within the tool.
*   **Bot Suggestions Resolution (Attempt 1):**
    *   Submit a doubt to trigger the automated resolution engine.
    *   Verify the bot correctly displays "Similar questions" inline.
    *   Navigate into 'Question 1', click the green checkmark ("Does this solution answer your doubt?"), and verify successful context resolution.
*   **Ask an Expert Fallback (Attempt 2):**
    *   Safely trigger a subsequent query to bypass similar suggestions and verify the display logic.
    *   Verify the "Ask now" (Ask an Expert) widget appears and can be interacted with.

---

## 6. Main Smooth Flow Orchestrator (`main.spec.js`)
**Feature:** The driver configuration defining the master execution plan for the platform automation.

### Test Scenarios:
*   Execute tests linearly (`iTutor.spec.js` -> `bookmarks.spec.js` -> `Ad.spec.js`) to mimic a typical long-lasting user session simulating prolonged end-to-end sanity behaviours across navigation jumps smoothly without context crashing.
