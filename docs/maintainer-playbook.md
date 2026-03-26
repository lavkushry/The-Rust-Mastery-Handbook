# Maintainer Playbook

This playbook defines consistent repository operations for issue triage, PR review, and release communication.

## Issue Triage

Daily or weekly triage routine:

1. Confirm issue type and add labels.
2. Request reproduction details when needed.
3. Route support questions to Discussions when appropriate.
4. Mark actionable newcomer work as good first issue.

## Labeling Strategy

Use docs/labels-guide.md as the source of truth.

Minimum label set per issue:

- one type label (bug, enhancement, documentation, question)
- one contributor-readiness label when applicable (good first issue/help wanted)

## Converting Issues into Good First Issues

Checklist:

- clear scope and acceptance criteria
- low architectural risk
- straightforward validation command
- no hidden domain knowledge dependencies

## Welcoming New Contributors

When a first-time contributor comments:

- acknowledge quickly
- confirm ownership expectations
- point to CONTRIBUTING.md
- provide one concrete first step

## PR Review Consistency

Review dimensions:

1. Correctness and factual accuracy
2. Scope and maintainability
3. Reader clarity and information architecture
4. Build impact and workflow safety

Suggested review sequence:

1. Confirm problem statement and scope
2. Validate technical correctness and handbook voice
3. Verify links/navigation/build impact
4. Provide actionable feedback with acceptance hints

Reviewer behavior:

- be specific and kind
- request changes with rationale
- prefer iterative mergeable improvements

## Writing Release Notes

For each release:

- summarize reader-visible improvements first
- include contributor and workflow improvements
- mention any migration notes for navigation changes
- link to full changelog section

Use docs/release-checklist.md and docs/changelog-guidelines.md as release prep references.

## Pinned Issues Strategy

Recommended pinned issues:

1. contributor onboarding issue with active starter tasks
2. roadmap/meta issue for upcoming milestones

Maintain pinned issues by updating status monthly.

Suggested pinned issue names:

- Start here: newcomer contribution board
- Quarterly roadmap and release objectives

## Release Highlights Strategy

For each release post:

- one paragraph: what improved for readers
- one paragraph: what improved for contributors/maintainers
- 3 to 5 bullets: notable changes
- one call-to-action: where new contributors can start

## Discussions vs Issues

Use Discussions for:

- broad questions
- idea exploration
- community feedback

Use Issues for:

- actionable defects
- scoped feature requests
- tasks tied to concrete PR outcomes

## Handling Stale Issues Respectfully

When an issue becomes inactive:

- post a gentle follow-up asking for required details
- provide a clear window for response
- close with a note that reopening is welcome with new context

Avoid dismissive or punitive stale messaging.

## Keeping the Repository Healthy

Monthly maintainer checklist:

- triage old open issues
- refresh good first issues
- review and merge dependency updates
- publish a small progress summary in Discussions or Releases
- keep roadmap and support docs current

Quarterly hygiene pass:

- refresh repo metadata recommendations in docs/repo-metadata.md
- review topic ranking in docs/github-topics.md
- update SEO intent mapping in docs/seo-keyword-map.md
