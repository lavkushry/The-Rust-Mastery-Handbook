# FAQ

## What is this repository?

The Rust Mastery Handbook is an mdBook-based long-form Rust learning handbook focused on systems-level understanding and open-source contribution readiness.

## Is this an official Rust project?

No. It is an independent educational project.

## Who should read it?

Developers who already program professionally and want deeper Rust reasoning skills beyond introductory syntax tutorials.

## How do I read it locally?

Install mdBook, then run:

```bash
mdbook serve --open
```

## How do I build static output?

```bash
mdbook build
```

## Can I export the book to PDF?

Yes. After building the book:

```bash
node scripts/export-pdf.mjs
```

For both A4 and US Letter:

```bash
node scripts/export-pdf.mjs --all-formats
```

## Where should I start as a contributor?

Read CONTRIBUTING.md, then pick a small scoped issue such as link fixes, clarity improvements, or glossary updates.

## Are discussions enabled for questions?

That depends on repository settings. If Discussions are not enabled, use issues with the question label.

## Why is there an archive/legacy-aggregates directory?

It preserves historical monolithic drafts after content was split into chapterized mdBook pages.

## Is there a stable versioning policy?

Yes. See docs/versioning-policy.md.

## Where do I report security problems?

See SECURITY.md. Avoid public issue disclosure for vulnerabilities.
