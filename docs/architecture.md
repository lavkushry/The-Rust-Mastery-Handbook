# Architecture

This repository is a documentation product built with mdBook.

## System Overview

The project consists of three core layers:

1. Source layer:
- Chapter Markdown under src/
- Navigation definition in src/SUMMARY.md
- Front-matter style handbook entry point in src/00_title_and_toc.md

2. Build and presentation layer:
- mdBook configuration in book.toml
- Theme customizations in theme/visual-edition.css and theme/visual-edition.js
- Optional PDF print styling in styles/pdf-export.css

3. Delivery layer:
- Local build and preview via mdbook build and mdbook serve
- GitHub Actions workflows for CI validation and Pages deployment
- Optional PDF artifact export via scripts/export-pdf.mjs

## Content Topology

- part-01 to part-10 model the main learning path
- appendices provide reference material and reinforcement tools
- archive/legacy-aggregates preserves historical monolithic drafts for provenance

## Build Pipeline

Primary pipeline:

1. mdBook reads src/SUMMARY.md and source pages
2. Output is generated into book/
3. GitHub Pages workflow publishes generated site output

Optional PDF pipeline:

1. mdbook build generates book/print.html
2. scripts/export-pdf.mjs renders print HTML via Puppeteer
3. PDFs are written to dist/

## Architectural Constraints

- Source of truth is Markdown in src/
- Navigation changes must stay synchronized with src/SUMMARY.md
- Editorial quality matters as much as build correctness
- Build tooling should remain lightweight and contributor-friendly

## Non-Goals

- This repository is not a Rust crate or runtime service
- It does not provide executable library APIs
- It does not require complex application deployment infrastructure

## Change Safety Guidelines

Safe changes:

- scoped chapter edits
- appendix improvements
- documentation and triage automation updates

Higher-risk changes:

- large SUMMARY restructuring
- theme-level visual rewrites
- workflow permission changes

For major changes, open an issue first and align with maintainers.
