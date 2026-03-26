# OSS Growth Roadmap

This roadmap tracks completed improvements and next-step actions for discoverability, contributor conversion, and maintainership quality.

## Completed in Repository

- README conversion flow improved with Start Here actions and audience-specific entry paths.
- Metadata and discoverability docs added:
 	- docs/repo-metadata.md
 	- docs/github-topics.md
 	- docs/social-preview-spec.md
- Search-intent docs added:
 	- docs/seo-keyword-map.md
 	- docs/content-cluster-plan.md
- Contributor UX refined in CONTRIBUTING.md, PR template, support docs, contribution ladder, and good-first-issue catalog.
- Maintainer workflow docs strengthened:
 	- docs/maintainer-playbook.md
 	- docs/review-checklist.md
 	- docs/release-checklist.md
 	- docs/release-strategy.md
 	- docs/changelog-guidelines.md
- Editorial governance docs added:
 	- docs/editorial-style-guide.md
- Licensing readiness docs expanded:
 	- docs/license-decision-note.md
 	- docs/license-readiness-checklist.md
- Manual settings execution plan added:
 	- docs/manual-github-settings-checklist.md

## TODO: Human Input Required

### 1) Choose and commit a license

Status: completed. Dual license established (MIT for code/tooling, CC BY 4.0 for content). `LICENSE` file committed.

### 2) Configure repository topics in GitHub UI

Status: pending manual setup.

Reference:

- docs/github-topics.md
- docs/repo-metadata.md

### 3) Upload a social preview image

Status: pending manual asset creation and upload in GitHub UI.

Reference:

- docs/social-preview-spec.md

### 4) Enable and configure GitHub Discussions

Status: pending manual setup.

Reference:

- docs/discussions-seed.md

### 5) Enable private vulnerability reporting

Status: pending manual setup in Security settings.

Reference:

- SECURITY.md

### 6) Configure branch protection and required reviews

Status: pending manual setup.

Reference:

- docs/maintainer-playbook.md

### 7) Seed default label taxonomy

Status: pending manual label creation.

Reference:

- docs/labels-guide.md

### 7a) Confirm pinned issue strategy

Status: pending maintainer setup.

Reference:

- docs/repo-metadata.md
- docs/maintainer-playbook.md

### 8) Add sponsor links if applicable

Status: pending maintainer decision.

Reference:

- .github/FUNDING.yml

### 9) Add repository-level screenshots/social assets

Status: pending design assets.

Needed:

- social preview image
- optional README screenshot thumbnails

### 10) Confirm public support channels

Status: pending maintainer preference.

Needed:

- canonical support channel policy (Discussions vs Issues for questions)

## Maintainer Decision Dependencies

These items cannot be finalized without maintainer decisions:

- discussions enabled vs issue-only support routing
- sponsor program activation
- branch protection strictness and review thresholds

## What Can Be Measured Later

Use GitHub Insights and traffic analytics to evaluate progress:

- profile of repository traffic (views and unique visitors)
- clone count trend
- star conversion trend after README and metadata changes
- issue-to-PR conversion for good first issue tasks
- first-time contributor retention over 30 to 90 days
- release engagement (views/downloads/click-through)

## 30-Day Plan

1. Apply manual GitHub settings from docs/manual-github-settings-checklist.md.
2. Publish first structured release using docs/release-checklist.md.
3. Seed one pinned contributor issue and one roadmap issue.
4. Enable Discussions and post starter threads from docs/discussions-seed.md.

## 60-Day Plan

1. Run one contributor onboarding cycle using docs/good-first-issues.md.
2. Publish one release with clear highlights and changelog discipline.
3. Refresh FAQ and troubleshooting based on incoming issues/discussions.
4. Validate topic fit and adjust top 10 GitHub topics.

## 90-Day Plan

1. Review traffic and conversion signals against baseline.
2. Refine README first-screen copy based on observed entry behavior.
3. Expand content cluster execution with 2 to 3 high-intent docs pages.
4. Revisit release cadence and maintainer workload balance.
