## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Dynamic Counters in Interactive Components Need ARIA Live Regions
**Learning:** Screen readers will not naturally announce text content updates in dynamic counters (e.g. "Step 1 of 5" changing to "Step 2 of 5" or "0 / 10 reviewed" changing to "1 / 10 reviewed") if the focus doesn't change to the counter itself.
**Action:** Always wrap dynamic text counters that update without focus changes in `aria-live="polite"` and `aria-atomic="true"` regions so screen reader users are notified of the state change.
