# Jules Regression Playbook

Use this playbook to run release-grade regression testing for the handbook site and authoring pipeline.

## Scope

This regression pass covers:

- Static book build correctness
- UI enhancement script behavior
- PDF export script validation behavior
- Local preview sanity checks

## One-command Checklist

Run from repository root:

```bash
npm ci
mdbook build
node --test scripts/*.test.mjs
```

## Expected Result

- `mdbook build` succeeds and writes output to `book/`
- `node --test scripts/*.test.mjs` reports all tests passing
- No runtime errors in `theme/visual-edition.js`
- No syntax or argument handling regressions in `scripts/export-pdf.mjs`

## Visual Regression Spot-Check

After build, run local preview:

```bash
mdbook serve --open
```

Check at least these pages:

- One chapter with a hero block and intro hook
- One chapter with callout blocks
- One chapter with flashcard or cheat-sheet tables

## PDF Regression Spot-Check

```bash
node scripts/export-pdf.mjs --all-formats
```

Expect outputs:

- `dist/the-rust-mastery-handbook-a4.pdf`
- `dist/the-rust-mastery-handbook-letter.pdf`

Check that cover page renders and that chapter headings break correctly in the PDF.

## Failure Triage

- Build fails: validate Markdown and `src/SUMMARY.md` structure
- Visual tests fail: inspect `theme/visual-edition.js` for DOM query assumptions
- PDF tests fail: inspect `scripts/export-pdf.mjs` argument parsing and page-evaluate block

## Release Gate

Do not merge UI/readability changes unless all commands in this playbook pass.
