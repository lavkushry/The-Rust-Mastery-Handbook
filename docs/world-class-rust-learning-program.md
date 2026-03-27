# World-Class Rust Learning Program (90 Days)

This program turns the handbook into a measurable learning system with clear releases, curriculum outcomes, and contributor growth.

## Program Goal

By Day 90, the handbook should be:

- trusted by systems engineers as a practical Rust learning path
- operationally reliable (builds, links, tests, and release process)
- contributor-friendly with repeatable onboarding and retention loops

## Success KPIs

Track weekly and review at Day 30, 60, and 90.

| KPI | Baseline Method | Day 90 Target | Cadence |
| --- | --- | --- | --- |
| mdBook build success | CI pass ratio for default branch | 100% successful builds | Per PR + weekly rollup |
| Broken internal links | Link check output | 0 broken links in release branch | Per release candidate |
| Chapter completion flow | Part 1 -> Part 3 reader progression (analytics/proxy signals) | >= 40% progression | Weekly |
| Content freshness | % of core chapters reviewed in last 60 days | >= 85% | Biweekly |
| PR cycle time | Median open-to-merge for docs PRs | <= 72 hours | Weekly |
| First-time contributor conversion | New contributors who submit first merged PR | >= 12 in 90 days | Biweekly |
| Contributor retention | First-time contributors with second PR in 30 days | >= 35% | Monthly |
| Release consistency | Planned vs actual release events | >= 90% on-time | Monthly |

## Release Cadence

- Weekly: one documentation quality release candidate (Friday)
- Monthly: one milestone release (end of Day 30, 60, 90 windows)
- Hotfix: same-day patch only for broken builds, severe navigation regressions, or critical security/process corrections

Each milestone release must include:

- reader-facing learning improvements
- contributor workflow improvements
- maintainer workflow reliability updates

## 90-Day Curriculum Milestones

## Day 1-30: Foundation Quality Sprint

Outcomes:

- standardize chapter learning objectives for Parts 1-4
- add end-of-chapter checks for core ownership and borrowing chapters
- align navigation and cross-linking for beginner-to-systems path

Deliverables:

- objective blocks and expected outcomes added to core chapters
- chapter-level review checklist integrated into contributor workflow
- first milestone release with before/after quality notes

## Day 31-60: Depth and Systems Readiness

Outcomes:

- strengthen advanced tracks (concurrency, systems architecture, contribution readiness)
- close top FAQ/troubleshooting gaps from issue patterns
- improve examples where readers commonly stall

Deliverables:

- revised content in Parts 5-8 with explicit prerequisites
- targeted drills for async, error handling, and architecture tradeoffs
- second milestone release with learning path updates and contributor call to action

## Day 61-90: Excellence and Scale

Outcomes:

- stabilize world-class review gates for all new content
- expand contributor throughput without quality regressions
- publish evidence-backed roadmap update from KPI results

Deliverables:

- full handbook audit pass against quality gates
- maintainership handoff notes for sustainable release rhythm
- Day 90 milestone release with KPI report and next-quarter plan

## Quality Gates

Every merged content PR should pass all gates:

1. Learning Clarity Gate
- explicit objective, prerequisites, and expected outcomes present
- at least one concrete example tied to systems use

2. Technical Accuracy Gate
- commands/snippets validated where feasible
- terminology consistent with handbook glossary and existing chapter language

3. Navigation Gate
- links resolve and next-step pointers are present
- chapter connects to related FAQ/troubleshooting or adjacent chapters

4. Contributor UX Gate
- PR includes reviewer checklist completion
- change is scoped and labeled for discoverability and follow-up

5. Release Gate
- mdBook build succeeds on release candidate
- release notes include: what changed, why it matters, where to start

## Contributor Growth Loops

Use a repeatable growth loop every two weeks:

1. Seed
- publish 3-5 scoped issues (good first issue + medium depth)

2. Activate
- point contributors to one clear starting doc and one review checklist

3. Convert
- complete first PR review within 72 hours with actionable feedback

4. Retain
- invite second contribution within 7 days of merge using a tailored follow-up issue

5. Graduate
- promote reliable contributors to review support paths using maintainer playbook guidance

Loop KPIs:

- seeded issues closed rate >= 60%
- first-review SLA <= 72 hours
- second-PR rate >= 35% within 30 days

## Operating Rhythm

- Monday: KPI review + issue seeding
- Wednesday: content and review checkpoint
- Friday: release candidate validation + publish decision
- End of each 30-day window: milestone release and roadmap refresh

## Exit Criteria at Day 90

The program is successful when:

- all milestone releases shipped on schedule
- KPI targets are met or have documented corrective plans
- contributor loop runs without maintainer bottlenecks
- roadmap is updated with next 90-day priorities backed by measured outcomes