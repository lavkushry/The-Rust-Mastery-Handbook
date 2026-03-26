# Good First Issue Candidates

These issue ideas are derived from the current repository structure and are intended to be safe for first-time contributors.

## Candidate Areas

1. Internal link integrity sweep
- Scope: one part directory at a time
- Why it is beginner-friendly: clear pass/fail outcomes with mdbook build and click-through checks

2. Chapter consistency edits
- Scope: harmonize heading patterns or section naming in one chapter
- Why it is beginner-friendly: editorial, low blast radius

3. Diagram accessibility pass
- Scope: verify role/aria-label quality for inline SVG blocks in selected chapters
- Why it is beginner-friendly: contained to content files

4. Appendix cross-link improvements
- Scope: add links from chapters to relevant appendices where missing
- Why it is beginner-friendly: small and reviewable

5. FAQ expansion from recurring questions
- Scope: add 2 to 4 FAQ entries based on issue/discussion history
- Why it is beginner-friendly: docs-only changes

6. Troubleshooting command examples
- Scope: improve command-level troubleshooting in docs/troubleshooting.md
- Why it is beginner-friendly: no architectural refactor

7. Changelog hygiene
- Scope: improve changelog entry quality for recent merged PRs
- Why it is beginner-friendly: straightforward process update

## Ready-to-Open Issue Cards

### Card 1: Link integrity sweep for one part

- Scope: one directory such as src/part-04/
- Files: selected chapter files and possibly src/SUMMARY.md if needed
- Acceptance criteria:
	- broken links fixed in scoped part
	- mdbook build passes
	- no unrelated chapter rewrites
- Validation:
	- mdbook build

### Card 2: Improve FAQ with real contributor questions

- Scope: add 2 to 4 high-value entries to docs/faq.md
- Files: docs/faq.md
- Acceptance criteria:
	- entries are specific to this repository
	- each answer links to canonical docs where relevant
- Validation:
	- mdbook build

### Card 3: Troubleshooting improvement for common build failures

- Scope: add one reproducible troubleshooting path
- Files: docs/troubleshooting.md
- Acceptance criteria:
	- includes symptom, cause, and fix
	- includes a validation command
- Validation:
	- mdbook build

### Card 4: Diagram accessibility sweep for one chapter

- Scope: one chapter with inline SVGs
- Files: one src/part-XX/chapter-YY file
- Acceptance criteria:
	- role and aria-label quality improved
	- no visual regressions introduced intentionally
- Validation:
	- mdbook build
	- local visual preview

### Card 5: Contributor docs cross-link cleanup

- Scope: improve link consistency among CONTRIBUTING.md and docs contributor pages
- Files: CONTRIBUTING.md, docs/contributing.md, docs/contribution-ladder.md
- Acceptance criteria:
	- no dangling references
	- clearer entry paths for newcomers
- Validation:
	- mdbook build

## Good First Issue Definition for This Repo

An issue should be marked good first issue only when it:

- can be completed in one small PR
- has clear acceptance criteria
- does not require deep structural knowledge
- has obvious validation steps

## Suggested Template for New good first issue Tickets

- Problem summary
- File(s) to edit
- Acceptance checklist
- Validation command(s)
- Estimated scope and effort

Optional add-ons:

- Suggested first files to inspect
- Common pitfalls to avoid
