import { test, expect } from '@playwright/test';

const TEST_BUG_TITLE = `E2E Test Bug: ${new Date().getTime()}`;
const TEST_BUG_DESCRIPTION = 'This bug was created automatically via E2E Test suite.';
const TEST_COMMENT_CONTENT = 'This is an E2E test comment';

test.describe('BugReport + E2E workflow', () => {
    test('should allow creating a new bug, updating its status and comments', async({page}) => {

        // --- 1. Navigate to app and wait for the board to load
        await page.goto('/');
        await expect(page.locator('h1')).toHaveText(/BugReport\+/);

        // wait until the authentication and data loading is complete
        await expect(page.getByText('Open(', {exact: false})).toBeVisible({timeout: 10000});

        // --- 2. Create a new Bug report

        // Click the "report new bug"
        await page.getByTestId('report-new-bug-button').click();
        
        // Wait for the modal title to appear
        await expect(page.getByText('Create New Bug Report')).toBeVisible();

        // Fill out the form
        await page.getByTestId('bug-title-input').fill(TEST_BUG_TITLE);
        await page.getByTestId('bug-description-input').fill(TEST_BUG_DESCRIPTION);
        await page.getByTestId('bug-priority-select').selectOption('High');

        // submit form
        await page.getByTestId('submit-bug-button').click();

        // wait for the modal to close
        await expect(page.getByText('Create New Bug Report')).not.toBeVisible();

        // --- 3. Verify bug appears in the 'Open' column
        const openList = page.getByTestId('bug-list-open');
        const newBugItem = openList.locator(`:has-text("${TEST_BUG_TITLE}")`);

        await expect(newBugItem).toBeVisible();
        await expect(newBugItem).toContainText('High');
        await expect(page.getByTestId('bug-count-open')).toContainText(/\(\d+\)/); // Regex: check count within the ()

        // --- 4. Open bug details and update status to 'In Progress'

        // Click the bug item to open the details modal
        await newBugItem.click();
        await expect(page.getByText(`Bug: ${TEST_BUG_TITLE}`)).toBeVisible();
        
        // Click the 'Set to In Progress' button
        await page.getByTestId('status-button-in-progress').click();

        // Close the modal
        await page.locator('.modal-content button', {hasText: 'Close'}).first().click();

        // Wait for the details modal to disappear
        await expect(page.getByText(`Bug: ${TEST_BUG_TITLE}`)).not.toBeVisible();

        // --- 5. VERIFY BUG MOVED TO 'IN PROGRESS' COLUMN ---
        const inProgressList = page.getByTestId('bug-list-in-progress');
        const movedBugItem = inProgressList.locator(`:has-text("${TEST_BUG_TITLE}")`);       

        await expect(movedBugItem).toBeVisible();

        // --- 6. OPEN BUG AGAIN AND ADD A COMMENT ---
        await movedBugItem.click();

        // Fill out the comment form
        await page.getByTestId('comment-input').fill(TEST_COMMENT_CONTENT);

        // Submit the comment
        await page.getByTestId('submit-comment-button').click();

        // Wait for the comment to appear in the list
        const commentList = page.getByTestId('comment-list');
        await expect(commentList.locator(`:has-text("${TEST_COMMENT_CONTENT}")`)).toBeVisible();

         // --- 7. CLEANUP (Optional but good practice for persistent data) ---
        // For a full-featured app, we'd add a "Delete" button. Since we don't have one, 
        // we'll just confirm the successful end state.
        console.log(`E2E Test complete. Bug Title: "${TEST_BUG_TITLE}" remain on the board`);
    });
});