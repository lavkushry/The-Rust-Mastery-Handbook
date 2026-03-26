# Release Checklist

Use this checklist before publishing a documentation release.

## Content QA

- Major chapter changes reviewed for technical accuracy.
- New sections follow editorial style guidance.
- FAQ and troubleshooting are updated when behavior changed.

## Link and Navigation QA

- Internal links are verified in changed areas.
- SUMMARY updates are intentional and consistent.
- New docs pages are discoverable from relevant entry points.

## Build Validation

- mdbook build succeeds locally or in CI.
- CI workflow status checks are green.

## PDF Validation (If Relevant)

- mdbook build generated print HTML.
- PDF export command executed successfully for intended formats.
- Output files render with expected headings and layout.

## Changelog and Release Notes

- CHANGELOG.md updated under Unreleased.
- Release notes grouped by reader/contributor/maintenance impact.
- Notable navigation or structure changes are explicitly called out.

## GitHub Release Packaging

- Release title is clear and versioned consistently.
- Summary paragraph explains why this release matters.
- Highlights list includes 3 to 5 meaningful improvements.

## Deployment Verification

- GitHub Pages workflow succeeded.
- Public site URL resolves and serves latest content.
- Obvious rendering regressions are not present on key pages.
