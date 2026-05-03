## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Dynamic Counters and Screen Reader Announcements
**Learning:** When building custom interactive components like step indicators or flashcard counters, screen readers will not naturally announce text content updates if they happen without focus changes.
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` attributes to ensure updates are announced to screen reader users seamlessly as they interact with the component.

## 2024-05-26 - Unicode Symbol Overrides and Transient Text States
**Learning:** Unicode symbols like arrows (`←`, `→`) or checkmarks (`✓`) are read literally by screen readers (e.g., "leftwards arrow", "check mark"), which can confuse users. Furthermore, transient success states (like "Exported! ✓") that use these symbols benefit from temporary, clear ARIA labels.
**Action:** Always set an overriding `aria-label` with clear, human-readable text on interactive elements containing these symbols. For transient states, dynamically apply the `aria-label` (e.g., "Exported successfully") and remove it when the element returns to its original state.
