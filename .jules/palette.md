## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Screen Reader Dynamic Text Updates
**Learning:** Screen readers will not naturally announce dynamic text updates (like a counter incrementing from "0 / 10" to "1 / 10") if the update happens without a focus change.
**Action:** Always wrap dynamic counter text or progress indicators in `aria-live="polite"` and `aria-atomic="true"` regions to ensure the update is announced gracefully.
