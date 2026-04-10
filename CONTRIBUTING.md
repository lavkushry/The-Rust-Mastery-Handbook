# Contributing to The Rust Mastery Handbook

Thanks for your interest in improving this project.

This repository is a documentation-first mdBook project. High-quality
contributions are usually:

- focused on one specific improvement
- easy to review and easy to validate
- accompanied by clear rationale
- aligned with the book's first-principles teaching style

## Contribution Paths

Choose one path and keep scope tight:

- Typo and grammar fixes
- Chapter clarity improvements
- Diagram and accessibility improvements
- Broken links and structure fixes
- Build/docs tooling improvements
- Content expansion proposals

## Quick Start for Contributors

1. Fork and clone the repository.
2. Install mdBook:

```bash
cargo install mdbook --locked
```

1. Build and preview locally:

```bash
mdbook build
mdbook serve --open
```

1. Create a branch and make your change.
2. Open a pull request with a clear summary.

## Local Development Setup

Required tools:

- Rust toolchain (for cargo and mdBook installation)
- mdBook CLI

Optional tools (PDF export):

- Node.js 20+
- Local packages under .pdf-tools/node_modules used by scripts/export-pdf.mjs

Build commands:

```bash
mdbook build
mdbook serve --open
```

Optional PDF commands:

```bash
mdbook build
node scripts/export-pdf.mjs
node scripts/export-pdf.mjs --all-formats
```

## Branch Naming

Use descriptive prefixes:

- docs/\<short-topic\>
- fix/\<short-topic\>
- chore/\<short-topic\>
- ci/\<short-topic\>

Examples:

- docs/chapter-31-clarity
- fix/broken-part-08-links
- ci/mdbook-build-cache

## Code Style and Content Style

This repository primarily contains Markdown and mdBook assets.

Please follow these rules:

- Keep edits scoped to the target topic.
- Preserve existing chapter voice and structure.
- Prefer concrete explanations over slogans.
- Avoid adding claims that are not verifiable.
- Keep headings and link text descriptive.

## What a High-Quality PR Looks Like

A strong PR in this repository usually has:

- one clear objective
- a small file footprint unless intentionally large
- reader-facing rationale (what got clearer, safer, or easier)
- verification notes for build and rendering
- no unrelated cleanup mixed into the change

## Validation Before Opening a PR

Run:

```bash
mdbook build
```

If you changed PDF-related behavior, also run:

```bash
node scripts/export-pdf.mjs --all-formats
```

Manual checks:

- changed pages render as expected in local preview
- internal links work
- no accidental structural edits in SUMMARY unless intentional

If you changed contributor or maintainer policy docs, also sanity-check:

- docs/review-checklist.md
- docs/release-checklist.md

## Commit Guidance

Use small, descriptive commits.

Recommended format:

- docs: improve chapter 46 repo-entry checklist
- fix: correct broken appendix link
- chore: add issue templates
- ci: add mdbook build workflow

## Pull Request Checklist

Before submitting:

- I ran mdbook build successfully.
- My change is scoped and reviewable.
- I documented behavior/content changes clearly.
- I linked relevant issue(s), if any.
- I avoided unrelated refactors.

Recommended extras for content changes:

- I linked affected chapters or docs pages.
- I explained how the change improves reader understanding.

## How to Propose Large Changes

For significant edits (major restructuring, pedagogical approach changes, navigation
changes):

1. Open an issue first.
2. Explain the problem, proposed approach, and tradeoffs.
3. Wait for maintainer alignment before implementation.

## How to Claim Issues

- Comment on the issue that you want to work on it.
- If you are no longer available, leave a short update.
- Maintainers may reassign stale claimed issues so work can continue.

Suggested convention:

- If no progress update is posted after 7 days, maintainers may reopen issue ownership.

## Good First Contributions

Good first contributions for this repository include:

- typo and grammar fixes in a single chapter
- broken internal link fixes
- glossary or appendix clarity improvements
- diagram alt-text and accessibility improvements
- FAQ and troubleshooting improvements

See docs/good-first-issues.md for curated ideas.

If unsure where to begin, start with link integrity, glossary clarity, or diagram
accessibility.

## Documentation Contribution Path

If you are new to the project, start with:

1. docs/faq.md
2. docs/troubleshooting.md
3. chapter wording clarity in one section
4. cross-link improvements between related chapters

## Maintainer and Reviewer Expectations

Maintainers and reviewers are expected to:

- be respectful and constructive
- explain requested changes clearly
- prefer iterative improvements over perfect-first-pass demands
- keep feedback focused on correctness, clarity, and reader value

Reviewer baseline for content PRs:

- technical accuracy
- handbook voice consistency
- clear progression from problem to explanation
- links and structure integrity

## Response-Time Guidance

Target expectations (best effort, not guaranteed):

- First maintainer response: within 7 days
- PR review after first response: within 14 days

If no response arrives in that window, politely comment for follow-up.

## Release and Change Process

- Significant repository changes should be recorded in CHANGELOG.md.
- Release note categories are defined in .github/release.yml.
- Versioning and support expectations are documented in docs/versioning-policy.md
  and docs/support-policy.md.
