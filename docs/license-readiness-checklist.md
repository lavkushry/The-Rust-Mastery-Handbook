# License Readiness Checklist

Use this checklist before committing a final LICENSE file.

## Asset Inventory

- Handbook prose and chapter text
- Inline diagrams and visual assets
- CSS/JS theme assets
- Build and workflow scripts
- GitHub workflow and configuration files

## Decision Questions

1. Should content and code use the same license?
2. Is attribution required for handbook prose and diagrams?
3. Is commercial reuse allowed?
4. Is patent language desired for code assets?
5. Are any third-party assets included that require special notice?

## Candidate License Patterns

Pattern A:

- Code and tooling: MIT or Apache-2.0
- Content and visuals: CC BY 4.0

Pattern B:

- Single permissive license across all assets

Choose one pattern and document rationale.

## Pre-Commit Checks

- Confirm maintainers agree on selected model.
- Confirm compatibility with any third-party material.
- Prepare LICENSE and optional NOTICE files.
- Update README and docs/license-decision-note.md.

## Post-Commit Checks

- Ensure GitHub shows license detection correctly.
- Confirm contribution and reuse expectations are unambiguous.
- Add changelog entry documenting license adoption.
