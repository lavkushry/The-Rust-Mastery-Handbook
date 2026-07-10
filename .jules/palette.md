## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Dynamic Counters and Screen Reader Announcements
**Learning:** When building custom interactive components like step indicators or flashcard counters, screen readers will not naturally announce text content updates if they happen without focus changes.
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` attributes to ensure updates are announced to screen reader users seamlessly as they interact with the component.

## 2024-05-20 - Unicode Symbols and Screen Readers
**Learning:** Unicode symbols like arrows (`←`, `→`) and checkmarks (`✓`) are read literally by screen readers (e.g. "Check mark" or "North East Arrow"), which can make UI controls confusing when they repeat visible text or add noise. Adding `aria-label` to interactive elements containing these symbols overrides the inner text and fixes the issue. If the symbols are purely decorative, they should be wrapped in an element with `aria-hidden="true"`.
**Action:** When adding or reviewing text containing Unicode symbols or emojis, always provide a clear `aria-label` for interactive elements containing them, and ensure purely decorative symbols have `aria-hidden="true"`.
## 2024-07-10 - Accessible Link-Based Overlay Buttons
**Learning:** Custom link-based overlay buttons (like 'Run' buttons floating on code blocks) do not naturally inherit keyboard focus styles, rendering them invisible to keyboard navigators when focused. Furthermore, when they open in a new tab and contain minimal text (e.g., "Run"), screen reader users lack context on what the button does or where it leads.
**Action:** Always define explicit `:focus-visible` styles matching the element's custom design (e.g., using `outline` with `outline-offset` to avoid clipping) and ensure they have a descriptive `aria-label` (e.g., indicating the action and that it opens in a new tab) to supplement brief visual text.
