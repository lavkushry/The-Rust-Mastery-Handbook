# SEO and Site Plan

This repository already has a docs site architecture through mdBook.

The plan below strengthens search discoverability without changing core content semantics.

## Current State

- Site generator: mdBook
- Source: src/
- Primary metadata: book.toml
- Publishing: GitHub Pages workflow

## Completed Improvements in Repository

- Book metadata now includes repository URL and edit URL template.
- README copy now includes clear search intent terms:
  - Rust handbook
  - systems programming
  - ownership and lifetimes
  - open-source contribution
- Added contributor and support docs to improve trust and crawlable context.

## Recommended Information Architecture

Primary crawlable entry pages to keep maintained:

- README.md (repository landing page)
- docs/getting-started.md
- docs/installation.md
- docs/configuration.md
- docs/architecture.md
- docs/faq.md
- docs/troubleshooting.md
- docs/contributing.md
- docs/use-cases.md

## Keyword Clusters

1. Rust learning depth
- rust mastery handbook
- rust ownership mental model
- rust lifetimes explained

2. Systems engineering context
- rust systems programming handbook
- rust async systems guide
- rust architecture learning

3. OSS contribution intent
- contribute to rust open source
- rust repository onboarding
- first rust contribution guide

## Metadata Recommendations

For mdBook pages where custom metadata support is available in your rendering setup:

- clear page titles with topic-first wording
- concise meta descriptions around user intent
- canonical URLs aligned to the GitHub Pages host
- social image configured in repository settings

## Internal Linking Strategy

- Add intentional links from chapter intros to appendices and troubleshooting entries.
- Cross-link contributor-focused chapters to CONTRIBUTING.md and docs/contribution-ladder.md.
- Keep anchor text descriptive rather than generic click here wording.

## Sitemap and robots.txt

mdBook does not provide full SEO framework controls by default.

TODO for maintainers (if deeper SEO controls are needed):

- evaluate custom deployment step to generate sitemap.xml
- add robots.txt through static asset handling in publishing pipeline

## Structured Data

If a dedicated marketing page is added later, include structured data for:

- LearningResource
- TechArticle

For current repository-first setup, prioritize clean headings, internal links, and strong intro copy.
