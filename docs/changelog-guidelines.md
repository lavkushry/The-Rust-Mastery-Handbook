# Changelog Guidelines

This document defines how to write high-signal entries in CHANGELOG.md.

## Scope

Document notable repository changes that affect:

- readers
- contributors
- maintainers
- publishing reliability

Do not log every typo-level change unless part of a larger grouped update.

## Entry Quality Rules

Each changelog bullet should answer:

- what changed
- why it matters
- where it applies (chapter, docs page, workflow)

Good:

- Added contributor review checklist and release checklist docs to standardize PR
  quality and release QA.

Weak:

- Updated docs.

## Section Usage

Use standard sections when relevant:

- Added
- Changed
- Fixed
- Deprecated
- Removed
- Security

## Documentation-Project Release Notes

Prioritize this order:

1. Reader-facing content improvements
2. Contributor experience improvements
3. Maintainer and workflow reliability improvements

## Granularity

- Bundle related small edits into one meaningful bullet.
- Mention chapter groups instead of listing many tiny file edits.
- Include links to major docs pages for discoverability.

## Consistency

- Use past tense verbs.
- Keep bullets concise and concrete.
- Avoid marketing phrasing.

## Before Cutting a Release

- ensure CHANGELOG Unreleased entries are curated
- verify release note categories align with .github/release.yml
- cross-check with docs/release-checklist.md
