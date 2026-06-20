## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Dynamic Counters and Screen Reader Announcements
**Learning:** When building custom interactive components like step indicators or flashcard counters, screen readers will not naturally announce text content updates if they happen without focus changes.
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` attributes to ensure updates are announced to screen reader users seamlessly as they interact with the component.

## 2024-05-20 - Unicode Symbols and Screen Readers
**Learning:** Unicode symbols like arrows (`←`, `→`) and checkmarks (`✓`) are read literally by screen readers (e.g. "Check mark" or "North East Arrow"), which can make UI controls confusing when they repeat visible text or add noise. Adding `aria-label` to interactive elements containing these symbols overrides the inner text and fixes the issue. If the symbols are purely decorative, they should be wrapped in an element with `aria-hidden="true"`.
**Action:** When adding or reviewing text containing Unicode symbols or emojis, always provide a clear `aria-label` for interactive elements containing them, and ensure purely decorative symbols have `aria-hidden="true"`.

## 2024-05-26 - Labels on Non-Semantic Elements & DOM Transformation Semantics
**Learning:** Applying `aria-label` to generic, non-interactive elements (like `<div>` or `<pre>`) without providing an appropriate ARIA role (e.g., `role="region"`) causes screen readers to ignore the label entirely. Furthermore, when taking semantic HTML (like a markdown `<ul>`) and dynamically transforming it into visual `<div>` cards for design purposes, the native list semantics are destroyed, making the content less comprehensible to assistive tech.
**Action:** Always add an appropriate role (e.g., `role="region"`) when applying an `aria-label` to non-interactive elements like `<div>`s or `<pre>`s. When transforming native semantic elements (like lists or tables) into generic `<div>`-based designs, explicitly restore the native semantics using ARIA roles (e.g., `role="list"` and `role="listitem"`) on the new container and children.
