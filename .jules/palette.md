## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Dynamic Counters and Screen Reader Announcements
**Learning:** When building custom interactive components like step indicators or flashcard counters, screen readers will not naturally announce text content updates if they happen without focus changes.
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` attributes to ensure updates are announced to screen reader users seamlessly as they interact with the component.

## 2024-05-20 - Unicode Symbols and Screen Readers
**Learning:** Unicode symbols like arrows (`←`, `→`) and checkmarks (`✓`) are read literally by screen readers (e.g. "Check mark" or "North East Arrow"), which can make UI controls confusing when they repeat visible text or add noise. Adding `aria-label` to interactive elements containing these symbols overrides the inner text and fixes the issue. If the symbols are purely decorative, they should be wrapped in an element with `aria-hidden="true"`.
**Action:** When adding or reviewing text containing Unicode symbols or emojis, always provide a clear `aria-label` for interactive elements containing them, and ensure purely decorative symbols have `aria-hidden="true"`.

## 2024-05-31 - CSS Pseudo-Elements and Interactive Content
**Learning:** Avoid using CSS pseudo-elements (like `::after` or `::before`) to inject textual hints or state indicators into interactive UI components (like flashcards). Pseudo-elements cannot be individually hidden from screen readers using `aria-hidden="true"`, causing redundant and confusing announcements alongside the component's main text.
**Action:** Always inject actual DOM elements for textual hints and UI state markers. This allows applying `aria-hidden="true"` specifically to the visual decorations while keeping the surrounding interactive element clean for screen readers.
