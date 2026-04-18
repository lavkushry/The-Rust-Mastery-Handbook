## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-15 - Dynamic Content Accessibility
**Learning:** Screen readers won't automatically announce text updates within interactive components (like step indicators or flashcard counters) unless focus moves to them or they are marked as live regions.
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` regions so users using screen readers get context on status changes naturally.
