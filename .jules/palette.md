## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Screen Reader Awareness of Dynamic Counters
**Learning:** Screen readers will not naturally announce text content updates if they happen without a focus change. When building custom interactive components like step indicators or flashcard review counts, the dynamic counter text is updated visually but ignored by screen readers, leaving users blind to their progress.
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` regions. This ensures screen readers announce the updated count automatically whenever it changes.
