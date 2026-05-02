## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Dynamic Counters and Screen Reader Announcements
**Learning:** When building custom interactive components like step indicators or flashcard counters, screen readers will not naturally announce text content updates if they happen without focus changes.
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` attributes to ensure updates are announced to screen reader users seamlessly as they interact with the component.

## 2024-05-18 - A11y: Avoid Unicode arrows and symbols without aria-labels
**Learning:** Screen readers announce Unicode arrows (like `←` and `→`) and symbols like checkmarks (`✓`) literally (e.g., 'North East Arrow' or 'Check mark'). When these symbols are placed inside interactive elements alongside text, it results in confusing screen reader output (e.g. 'Mark chapter complete Check mark'). For interactive elements that temporarily change their text and symbols to indicate a transient state (like an Anki 'Export for Anki' button changing to 'Exported! ✓'), the text is also read literally without context.
**Action:** Always set an overriding `aria-label` with clear, human-readable text on interactive elements containing these symbols to prevent confusing screen reader announcements. For elements that temporarily change state, dynamically update the `aria-label` to describe the new state, and revert or remove the `aria-label` when the element returns to its original state.
