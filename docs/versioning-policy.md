# Versioning Policy

This repository is content-first and release-light.

## Current Versioning Model

- Main development happens on the main branch.
- Releases should represent stable editorial checkpoints.
- Changelog entries are tracked in CHANGELOG.md.

## Practical Semver Interpretation

Because this project is documentation rather than an API crate:

- MAJOR: structural changes that significantly alter navigation or reader workflows
- MINOR: substantial new chapters/sections or major handbook expansions
- PATCH: fixes, clarifications, typo corrections, and workflow maintenance

## Release Cadence

No strict release cadence is currently guaranteed.

Recommended cadence:

- publish a release after meaningful grouped improvements
- avoid tiny release spam for minor typo-only edits

## Release Notes

Use GitHub Releases with categorized notes based on .github/release.yml.

Suggested categories:

- Content and Handbook Updates
- Contributor Experience
- Build and Publishing
- Bug Fixes
- Security

## Backward Compatibility Expectations

- Existing deep links may occasionally change when chapters are reorganized.
- Navigation-impacting changes should be documented in release notes.
- Large structural changes should include migration notes when practical.
