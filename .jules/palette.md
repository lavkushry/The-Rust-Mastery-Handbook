## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-25 - Dynamic Counters and Screen Reader Announcements
**Learning:** When building custom interactive components like step indicators or flashcard counters, screen readers will not naturally announce text content updates if they happen without focus changes.
**Action:** Always wrap dynamic counter text in `aria-live="polite"` and `aria-atomic="true"` attributes to ensure updates are announced to screen reader users seamlessly as they interact with the component.

## 2024-05-19 - Interactive Elements with Unicode Symbols
**Learning:** Unicode symbols like checkmarks (`✓`) and arrows (`←`, `→`) in text content are read literally by screen readers (e.g., 'Check mark' or 'Rightwards arrow'), which can be confusing in interactive contexts like buttons where they represent abstract actions (e.g., 'Complete' or 'Next').
**Action:** When adding Unicode symbols to interactive elements for visual delight, always override the element's accessible name using an `aria-label` that clearly describes the action, avoiding reading the literal symbol names. For buttons with transient states (like a success state with a `✓`), ensure the `aria-label` updates dynamically to reflect the current state (e.g., from 'Export' to 'Exported successfully') and reverts appropriately.
