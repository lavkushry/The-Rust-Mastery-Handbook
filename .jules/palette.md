## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-10-25 - Dynamic Text Announcements in Interactive Components
**Learning:** Screen readers will not naturally announce text content updates if they happen without focus changes. For custom interactive components like step indicators or flashcard progress counters, dynamically updating the text content (e.g., changing "1 / 5 reviewed" to "2 / 5 reviewed") is completely invisible to screen reader users unless the text container explicitly tells the screen reader to listen for changes.
**Action:** Always wrap dynamic counter or status text in an `aria-live="polite"` and `aria-atomic="true"` region. This ensures screen readers announce the updated text without interrupting the user's current flow.
