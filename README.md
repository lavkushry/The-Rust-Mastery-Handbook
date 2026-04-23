# The Rust Mastery Handbook

[![Build Book](https://github.com/lavkushry/The-Rust-Mastery-Handbook/actions/workflows/ci.yml/badge.svg)](https://github.com/lavkushry/The-Rust-Mastery-Handbook/actions/workflows/ci.yml)
[![Deploy Pages](https://github.com/lavkushry/The-Rust-Mastery-Handbook/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/lavkushry/The-Rust-Mastery-Handbook/actions/workflows/deploy-pages.yml)

**The simplest Rust book in the world — and the deepest handbook when you are ready.**

The Rust Mastery Handbook is a two-in-one book. Open it at Part 0 and you get *Rust in One Hour* — eight short, picture-first, analogy-first chapters that teach the eighty percent of Rust a working developer actually uses in a day. Keep reading and the same book becomes a long-form systems handbook covering ownership reasoning, compiler mental models, concurrency, unsafe, and open-source contribution readiness.

No one else on the internet has both in one book. That is the point.

Built with mdBook. Picture-heavy. Playground-linked. Printable as a PDF. Contributor-friendly.

> See [docs/transformation-plan.md](docs/transformation-plan.md) for the multi-session rewrite currently in progress to bring every chapter into the new beginner-first voice.

## Start Here

- Read online: <https://lavkushry.github.io/The-Rust-Mastery-Handbook/>
- Build locally: [Getting Started](docs/getting-started.md)
- Export PDF: [Installation](docs/installation.md) and [Troubleshooting](docs/troubleshooting.md)
- Contribute: [CONTRIBUTING.md](CONTRIBUTING.md), [Contribution Ladder](docs/contribution-ladder.md), [Good First Issues](docs/good-first-issues.md)

## Choose Your Path

- **You have never touched Rust** and you have heard it is hard:
  Go straight to [Part 0 — Rust in One Hour](src/part-00/index.md). Sixty minutes of reading. Picture-first. Every code sample runnable in the Rust Playground in one click. When you finish it, you will be able to read almost any Rust code in the wild.
- **You know some Rust syntax** and you want the real mental model:
  Skim [Part 0](src/part-00/index.md) to calibrate, then read [Part 2 — Core Rust Foundations](src/part-02/index.md) and [Part 3 — The Heart of Rust](src/part-03/index.md). Part 3 is the crown jewel on ownership.
- **You are a systems or backend engineer moving into Rust:**
  Start with [docs/use-cases.md](docs/use-cases.md), skim [Part 0](src/part-00/index.md) for shared vocabulary, then prioritize Parts 3, 5, 6, and 8 for ownership depth, concurrency, systems topics, and contribution readiness.
- **You want to contribute to this handbook:**
  Start with [CONTRIBUTING.md](CONTRIBUTING.md), [docs/transformation-plan.md](docs/transformation-plan.md), [docs/review-checklist.md](docs/review-checklist.md), and [docs/good-first-issues.md](docs/good-first-issues.md).

## Table of Contents

- [The Rust Mastery Handbook](#the-rust-mastery-handbook)
  - [Start Here](#start-here)
  - [Choose Your Path](#choose-your-path)
  - [Table of Contents](#table-of-contents)
  - [Why This Exists](#why-this-exists)
  - [Rust Handbook for Systems Engineers](#rust-handbook-for-systems-engineers)
  - [Who This Project Is For](#who-this-project-is-for)
  - [Key Features](#key-features)
  - [How It Works](#how-it-works)
  - [Why This Handbook Is Different](#why-this-handbook-is-different)
  - [Quick Start (Under 5 Minutes)](#quick-start-under-5-minutes)
  - [Installation](#installation)
    - [1) Install mdBook](#1-install-mdbook)
    - [2) Clone the repository](#2-clone-the-repository)
    - [3) Build the handbook](#3-build-the-handbook)
  - [Usage](#usage)
    - [Serve locally](#serve-locally)
    - [Build static output](#build-static-output)
    - [Export PDF (single format)](#export-pdf-single-format)
    - [Export publication bundle (A4 + Letter)](#export-publication-bundle-a4--letter)
  - [Project Structure](#project-structure)
  - [Configuration](#configuration)
  - [Development Workflow](#development-workflow)
  - [Testing and Validation](#testing-and-validation)
  - [Publishing and Deployment](#publishing-and-deployment)
  - [Docs and Support](#docs-and-support)
  - [Screenshots and Visual Assets](#screenshots-and-visual-assets)
  - [Contribution Paths](#contribution-paths)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [Security](#security)
  - [License](#license)
  - [Maintainers](#maintainers)

## Why This Exists

Most Rust books teach the syntax and assume you will absorb the mental model by osmosis. You don't. That is why "Rust is hard" became a reputation.

This book flips that. Part 0 teaches the mental model first — with pictures, analogies, and runnable code — before the syntax has to carry any real weight. By the time you need the syntax, you already know what it is saying. The rest of the book is depth, not difficulty.

The result: a book that is genuinely gentle for a Python or JavaScript developer who has heard Rust is scary, and still rigorous enough for an engineer writing a kernel module three hundred pages later.

## Rust Handbook for Systems Engineers

Search intent this repository serves well:

- Rust handbook for professional developers
- Rust systems programming learning path
- Rust ownership and lifetimes mental model guide
- Rust architecture and contributor-readiness resource

## Who This Project Is For

- Backend and systems engineers moving into Rust
- Developers who already know basic Rust syntax but want deeper mental models
- Readers preparing to contribute to serious Rust projects
- Teams using this handbook as internal upskilling material

## Key Features

- 10-part structured handbook from foundations to advanced systems topics
- 50+ chapters plus appendices and retention drills
- Visual diagrams embedded directly in chapter content
- Printable PDF export in A4 and US Letter formats
- mdBook-based publishing pipeline for GitHub Pages
- Legacy aggregate drafts preserved for editorial history

## How It Works

Source content is authored in Markdown under src, navigation is controlled by src/SUMMARY.md, mdBook builds the static site, and an optional Node-based script exports print-ready PDFs.

High-level flow:

1. Write or edit chapter content in src.
2. Build and preview with mdBook.
3. Optionally export PDFs for publication bundles.
4. Push to main to trigger Pages deployment.

## Why This Handbook Is Different

- Teaches problem framing and invariants before syntax memorization
- Connects language concepts to real repository navigation and contribution work
- Balances conceptual depth with buildable, maintainable docs workflows
- Treats contributors as long-term collaborators, not drive-by patch submitters

## Quick Start (Under 5 Minutes)

Prerequisites:

- Rust toolchain installed (for cargo)
- mdBook CLI

Commands:

```bash
cargo install mdbook --locked
git clone https://github.com/lavkushry/The-Rust-Mastery-Handbook.git
cd The-Rust-Mastery-Handbook
mdbook serve --open
```

## Installation

### 1) Install mdBook

```bash
cargo install mdbook --locked
```

### 2) Clone the repository

```bash
git clone https://github.com/lavkushry/The-Rust-Mastery-Handbook.git
cd The-Rust-Mastery-Handbook
```

### 3) Build the handbook

```bash
mdbook build
```

## Usage

### Serve locally

```bash
mdbook serve --open
```

### Build static output

```bash
mdbook build
```

### Export PDF (single format)

```bash
mdbook build
node scripts/export-pdf.mjs
```

Output:

- dist/the-rust-mastery-handbook.pdf

### Export publication bundle (A4 + Letter)

```bash
mdbook build
node scripts/export-pdf.mjs --all-formats
```

Outputs:

- dist/the-rust-mastery-handbook-a4.pdf
- dist/the-rust-mastery-handbook-letter.pdf

## Project Structure

```text
.
├── book.toml
├── src/
│   ├── SUMMARY.md
│   ├── 00_title_and_toc.md
│   ├── part-01 ... part-10/
│   ├── appendices/
│   └── 10_retention_and_mastery_drills.md
├── scripts/
│   └── export-pdf.mjs
├── styles/
├── theme/
└── archive/legacy-aggregates/
```

## Configuration

Main config lives in book.toml.

- Book metadata and description
- Build output location
- HTML theme and front-end custom assets
- Repository and edit-link metadata for discoverability

Additional styles and scripts:

- theme/visual-edition.css
- theme/visual-edition.js
- styles/pdf-export.css

## Development Workflow

Typical authoring loop:

1. Edit chapter Markdown in src.
2. Run mdbook build to validate structure.
3. Preview with mdbook serve.
4. Open a focused pull request.

For contribution standards and review flow, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Testing and Validation

This project is documentation-first. Validation is currently based on build correctness and rendered output checks.

```bash
npm ci
mdbook build
npm test
```

Recommended pre-PR checks:

- Ensure the book builds without errors
- Ensure Node-based script and structure tests pass
- Verify updated pages render correctly in local preview
- Verify links and headings in edited sections

Browser-backed regression tests:

```bash
npx playwright install --with-deps chromium
npx playwright test
```

Accessibility scan subset:

```bash
npx playwright test tests/e2e/handbook.spec.mjs --grep "axe scan"
```

For repeatable release checks, use [docs/jules-regression-playbook.md](docs/jules-regression-playbook.md).

## Publishing and Deployment

- GitHub Pages deployment is defined in .github/workflows/deploy-pages.yml.
- The site is published from successful main-branch workflow runs.
- Build verification for pull requests is defined in .github/workflows/ci.yml.

## Docs and Support

- Contributor guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Security policy: [SECURITY.md](SECURITY.md)
- FAQ: [docs/faq.md](docs/faq.md)
- Troubleshooting: [docs/troubleshooting.md](docs/troubleshooting.md)
- Support policy: [docs/support-policy.md](docs/support-policy.md)
- Versioning policy: [docs/versioning-policy.md](docs/versioning-policy.md)
- Editorial style guide: [docs/editorial-style-guide.md](docs/editorial-style-guide.md)
- Chapter assessment template: [docs/chapter-assessment-template.md](docs/chapter-assessment-template.md)
- Compiler error playbook: [docs/compiler-error-playbook.md](docs/compiler-error-playbook.md)
- Rust resource atlas: [docs/rust-resource-atlas.md](docs/rust-resource-atlas.md)
- Review checklist: [docs/review-checklist.md](docs/review-checklist.md)
- Release checklist: [docs/release-checklist.md](docs/release-checklist.md)
- World-class 90-day program: [docs/world-class-rust-learning-program.md](docs/world-class-rust-learning-program.md)

## Screenshots and Visual Assets

This project currently uses inline SVG chapter visuals and does not yet include dedicated repository-level screenshot assets or social preview artwork.

See [docs/social-preview-spec.md](docs/social-preview-spec.md) and [docs/oss-growth-roadmap.md](docs/oss-growth-roadmap.md) for concrete asset recommendations.

## Contribution Paths

- Typo, grammar, and clarity fixes in a single chapter
- Internal link and navigation quality improvements
- Diagram accessibility and alt-text improvements
- Build and publishing workflow reliability improvements
- Scoped content expansion proposals with acceptance criteria

Contribution entry points:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [docs/good-first-issues.md](docs/good-first-issues.md)
- [docs/contribution-ladder.md](docs/contribution-ladder.md)
- [docs/maintainer-playbook.md](docs/maintainer-playbook.md)

## Roadmap

Planned OSS-quality and content expansion tasks are tracked in:

- [docs/oss-growth-roadmap.md](docs/oss-growth-roadmap.md)
- [docs/world-class-rust-learning-program.md](docs/world-class-rust-learning-program.md)

## Contributing

Contributions are welcome for:

- Content clarity and accuracy improvements
- Typos, structure, and consistency fixes
- Additional examples and diagrams
- Build and publishing workflow improvements

Start here: [CONTRIBUTING.md](CONTRIBUTING.md)

## Security

Please report vulnerabilities according to [SECURITY.md](SECURITY.md).

## License

The Rust Mastery Handbook is dual-licensed:

- Handbook content, chapters, and inline diagrams in `src/` are licensed under CC BY 4.0.
- Code snippets, scripts, and build tooling are licensed under MIT.

See the [LICENSE](LICENSE) file for complete details.

## Maintainers

- @lavkushry

For maintainer operations and triage practices, see [docs/maintainer-playbook.md](docs/maintainer-playbook.md).
