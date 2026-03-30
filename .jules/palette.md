## 2024-05-24 - Screen Reader Silencing on Flashcards
**Learning:** Setting an `aria-label` on an interactive element (like `role="button"`) completely overrides its inner text for screen readers. In the flashcard implementation, `aria-label="Flashcard — press Enter to flip"` prevented screen readers from actually reading the question and answer content!
**Action:** Always omit `aria-label` when the element's text content is what the user needs to hear. For state-based interactions like flipping or expanding, use state attributes like `aria-expanded` instead of baking the interaction hint into a label that obscures the content.

## 2026-03-30 - Decorative SVGs and Duplicate Screen Reader Announcements
**Learning:** Passing `aria-label` to decorative SVGs alongside visible text causes annoying double-reading for screen readers. For example, a "Beginner level" icon next to the "Beginner" tab was being read as "Beginner level, image, Beginner, tab".
**Action:** When creating inline SVG icons that are immediately accompanied by visible text conveying the same meaning, always omit `aria-label` to avoid redundant announcements.
