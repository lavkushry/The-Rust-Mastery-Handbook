# Label Taxonomy Guide

A clear label system improves triage speed and contributor onboarding.

## Core Labels

- bug: reproducible defect
- enhancement: new capability or meaningful improvement
- documentation: docs/content quality issue
- question: support or usage question
- maintenance: housekeeping, refactor, repo hygiene
- dependencies: dependency/workflow update
- security: security-sensitive issue
- performance: build/render performance concern
- good first issue: newcomer-friendly and low risk
- help wanted: open for community contribution

## Optional Supporting Labels

- onboarding: contributor process or first-time setup topic
- ci: GitHub Actions or automation issue
- content: chapter-level editorial change
- blocked: waiting for external dependency or maintainer input
- needs-repro: cannot act until reproducible

## Suggested Usage Rules

- Apply at least one type label (bug/enhancement/documentation/question).
- Use good first issue only when scope and acceptance criteria are clear.
- Pair help wanted with enough context for independent contribution.
- Reserve security for sensitive cases and route disclosure through SECURITY.md.

## Labeling Flow

1. Determine issue type.
2. Add priority/area context labels if needed.
3. Mark contributor-readiness labels.
4. Add blocked or needs-repro when appropriate.
