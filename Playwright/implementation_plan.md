Automation Implementation Plan: Class Recordings & Content Sanity

Objective
Verify the functional integrity and data accuracy of the "Class Recordings" section across multiple user batches and subjects.

Automation Workflow

1. Authentication & Navigation

* Login: Authenticates the user into the LMS platform
* Access: Navigates to the "Class Recordings & Content" module via primary navigation

2. Multi-Batch Processing
   The script iterates through configured user batches to ensure consistent behavior across enrollments:

* Batch Selection: Interacts with the batch switching modal to dynamically select and apply a batch
* Context Refresh: Validates that the UI updates correctly to reflect the selected batch's content

3. Subject-Level Verification
   For every subject within the selected batch:

* Subject Switching: Iterates through subject tabs to verify availability
* Empty State Validation: Detects subjects with no content and logs "scheduled but unavailable" status
* Content Discovery: Identifies content cards and triggers lazy-loading (scrolling) to determine total card count

Verification Strategy

A. Card Metadata Validation
For the first and last cards of each subject:

* Date Format: Validates using regex (e.g., Day, Date Month'Year format)
* Time Window: Ensures session duration is correctly displayed
* Resource Availability: Verifies presence of "Play Video" / "View Notes" vs "Content Available Soon"

B. Functional Interaction

* Navigation Flow: Opens video/notes and navigates back, ensuring session continuity
* Stability Checks: Uses network idle and DOM visibility checks for reliable interaction with dynamic UI

Reporting & Output
The script generates a consolidated Batch Summary Report within the Playwright run:

* Aggregated Statistics: Total card count per subject
* Summary Log: Snapshot of latest and oldest content with resource availability status
