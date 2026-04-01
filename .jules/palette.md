## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2024-05-24 - Decorative SVG Redundant Announcements
**Learning:** Adding an aria-label to a decorative SVG icon that is paired with visible text causes screen readers to redundantly announce the text twice (e.g. "Expert Tip, image. Expert Tip").
**Action:** Always omit aria-label for decorative icons adjacent to text that conveys the same meaning, allowing the icon to default to aria-hidden="true".
