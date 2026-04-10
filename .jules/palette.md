## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.
## 2024-05-24 - Dynamic Counter Accessibility
**Learning:** Screen readers won't announce updates to dynamic text counters (like "1 of 5 reviewed") if they occur without a focus change.
**Action:** Always add `aria-live="polite"` and `aria-atomic="true"` to text containers that update dynamically to ensure screen readers naturally announce the new state to visually impaired users.
