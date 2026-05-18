## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Dynamic Counters and Screen Reader Announcements
**Learning:** When building custom interactive components like step indicators or flashcard counters, screen readers will not naturally announce text content updates if they happen without focus changes.
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` attributes to ensure updates are announced to screen reader users seamlessly as they interact with the component.
## 2024-05-18 - Accessibility of Unicode Symbols
**Learning:** Screen readers often announce Unicode symbols verbatim (e.g., "Check mark" for `✓`, "Leftwards arrow" for `←`). This results in redundant or confusing announcements when these symbols are used purely for visual decoration or within interactive elements.
**Action:** Always add `aria-hidden="true"` to purely decorative Unicode symbols. For interactive elements (like buttons) containing these symbols, provide clear human-readable overriding text via `aria-label`, and ensure the label dynamically updates if the element indicates transient states.
