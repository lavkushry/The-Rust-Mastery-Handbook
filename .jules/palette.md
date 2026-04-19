## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2026-04-19 - Screen Readers and Dynamic Counter Text
**Learning:** When building custom interactive components like step indicators, screen readers will not naturally announce text content updates if they happen without focus changes (e.g., clicking "Next" updates a text element without moving focus to it).
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` regions to ensure users hear the updated progress.
