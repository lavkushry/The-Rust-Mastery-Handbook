## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2026-04-17 - Dynamic Text Announcements in Components
**Learning:** Screen readers won't naturally announce text updates (like a step counter "Step 2 of 5" changing) if the updates happen without a focus change. The user will click "Next" and hear nothing about the new step number.
**Action:** Always wrap dynamic counter text or progress text in `aria-live="polite"` and `aria-atomic="true"` regions so that screen readers announce the updated text content immediately when the user changes state.
