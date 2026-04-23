# Transformation Plan: From "Handbook for Systems Engineers" to "The Simplest AND Deepest Rust Book"

This document is the north star for the multi-session rewrite that started in April 2026. It exists so that contributors and subsequent editing passes stay aligned with the new direction, and so that the existing high-quality "systems engineer" material is preserved rather than discarded.

## The Mission

> The simplest Rust book in the world — and the deepest handbook when you are ready.

No one else on the internet has both in one place. That is the moat.

## The Reader (who we write for)

Our primary reader has written roughly a year of Python, JavaScript, or TypeScript. They have never written a systems language. They have heard Rust is hard. They want to feel, within the first thirty minutes, that Rust is obvious.

We also write for the experienced systems engineer, but we do that **through depth on the other side of the onramp**, not by gatekeeping the onramp itself.

## The Voice

- **Warm, not cute.** We never talk down. We never use baby talk. We respect the reader's intelligence and their time.
- **Analogy-first.** Every new concept is introduced with a concrete real-world parallel before any code appears.
- **Short sentences.** Average sentence length under 20 words. No subordinate clauses inside subordinate clauses.
- **Active voice.** "Rust moves the value" — not "the value is moved".
- **Pictures before prose.** Most pages open with an SVG figure. The prose explains what the figure shows, not the reverse.
- **Runnable everything.** Every code block ends with a link to the Rust Playground so the reader can press "play" in one click.
- **No throat-clearing.** We cut "let's dive in", "in this chapter we will explore", and "as you may already know". We start with the thing.

## The Structure (target state)

The book reads top-to-bottom as one gentle climb:

1. **Part 0 — Rust in One Hour** *(new, ships this session)*
   The simplest Rust book ever written. Eight short chapters. Picture-first. Analogy-first. A reader who stops here can still build small useful Rust programs.
2. **Part 1 — Why Rust Exists** *(rewrite in flagship voice)*
   The "why" — short and motivating, not a history essay.
3. **Part 2 — Core Rust Foundations** *(gentle rewrite)*
   Slows down and formalizes what Part 0 introduced informally.
4. **Part 3 — The Heart of Rust (Ownership)** *(gentle rewrite)*
   Depth on ownership, borrowing, lifetimes, moves.
5. **Part 4 — Idiomatic Rust Engineering**
6. **Part 5 — Concurrency and Async**
7. **Part 6 — Advanced Systems Rust**
8. **Part 7 — Rust in the Real World**
9. **Part 8 — Open Source Readiness**
10. **Part 9 — Understanding Rust More Deeply** *(rustc internals, RFCs)*
11. **Part 10 — Roadmap to Rust Mastery**
12. **Appendices + Retention Drills** *(unchanged for now)*

The existing "systems engineer" content survives inside Parts 3 through 10. Part 0 and a rewritten Part 1/2 become the beginner-friendly top of the funnel.

## The Phased Rollout

### Session 1 (this PR) — Foundations of the rewrite

- New `Part 0` — 8 chapters + index (the "Rust in One Hour" core).
- New voice pattern + template established via a rewritten flagship Chapter 1.
- Repositioned `README.md`: "simplest AND deepest".
- Updated `SUMMARY.md` with Part 0 at the top.
- New theme CSS for beginner-oriented components: `eli5`, `one-sentence`, `analogy-card`, `try-this`, `playground-run`.
- This document, so future sessions know the plan.
- CI passes: mdbook build, markdownlint, link-check, JS tests, Playwright visual regression.

### Session 2 — Part 1 and Part 2 rewrite

- Bring all Part 1 and Part 2 chapters to the new voice.
- Add `eli5` + `one-sentence` top blocks to every chapter.
- Add Playground-run links to every code block.

### Session 3 — Part 3 (Ownership) rewrite

- The crown jewel. Slow, patient, diagram-heavy rewrite.
- This is where most readers bounce off Rust. The rewrite is what earns the tagline.

### Session 4 — Concurrency and Async (Part 5)

- Async is the second biggest cliff. Same treatment as Part 3.

### Session 5 — "Every rustc error, explained in human"

- Expand `docs/compiler-error-playbook.md` into a searchable appendix of fifty-plus error codes with scary output → plain English → fix recipes.

### Session 6 — Project-based "Rust by Doing" track

- Ten small end-to-end projects as chapters. Each project links back into the relevant conceptual chapter.

### Session 7 — Polish

- Homepage hero, OG cards, SEO, new screenshots, release note.

## The Rules Contributors Must Follow During the Rewrite

1. Do not rewrite a chapter in old-voice and new-voice in the same PR. One voice per chapter at a time.
2. When rewriting a chapter, preserve every piece of factual content. Do not drop accuracy to gain simplicity. Either keep the depth in a "Going deeper" section at the bottom of the chapter, or move it into the appendices.
3. All new content must pass markdownlint, mdbook build, lychee link-check, and the Playwright visual regression.
4. Every new SVG figure must have a `role="img"` and a descriptive `aria-label`.
5. Every new code block in a learning chapter must either (a) be immediately runnable as-is in the Rust Playground, or (b) be explicitly marked as a sketch with `// pseudo-code, does not compile`.

## The Non-Goals

- We are not removing the systems-engineer depth. That is the deep side of the book.
- We are not chasing every Rust beginner book feature we have ever seen. We pick picture-first + analogy-first + playground-runnable, and we go all-in on those three.
- We are not auto-generating any chapter content with LLMs at publish time. The text is human-written and human-reviewed.

## How to Know We Are Done

A Python developer who has heard "Rust is hard" can open Part 0 on a phone, read for thirty to sixty minutes, and finish saying *"oh — that was actually fine, I can use this."* And the same book, three parts later, is still rigorous enough for an engineer writing a kernel module.

That is the book we are making.
