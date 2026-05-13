## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Dynamic Counters and Screen Reader Announcements
**Learning:** When building custom interactive components like step indicators or flashcard counters, screen readers will not naturally announce text content updates if they happen without focus changes.
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` attributes to ensure updates are announced to screen reader users seamlessly as they interact with the component.

## 2025-02-23 - Decorative Symbols and Screen Readers
**Learning:** Unicode arrows (like `↗`, `←`, and `→`) and symbols like checkmarks (`✓`) within text content are read literally by screen readers (e.g., 'North East Arrow' or 'Check mark'). If these symbols are part of an interactive element's text (like a "← Prev" button), it can confuse users. If they are purely decorative, they add unnecessary noise.
**Action:** Always set an overriding `aria-label` with clear, human-readable text on interactive elements containing these symbols. For purely decorative symbols, use `aria-hidden="true"` to prevent screen readers from announcing them. For elements whose text dynamically changes to include a symbol (e.g. changing to "Exported! ✓"), dynamically update the `aria-label` and restore it when the text reverts.
