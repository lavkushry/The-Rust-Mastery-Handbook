# Rust Mastery Handbook

This is now an `mdBook` project.

Core files:

- [book.toml](/home/ems/rust_handbook/book.toml)
- [src/SUMMARY.md](/home/ems/rust_handbook/src/SUMMARY.md)
- [src/00_title_and_toc.md](/home/ems/rust_handbook/src/00_title_and_toc.md)
- [src/part-01](/home/ems/rust_handbook/src/part-01)
- [src/part-02](/home/ems/rust_handbook/src/part-02)
- [src/part-03](/home/ems/rust_handbook/src/part-03)
- [src/part-04](/home/ems/rust_handbook/src/part-04)
- [src/part-05](/home/ems/rust_handbook/src/part-05)
- [src/part-06](/home/ems/rust_handbook/src/part-06)
- [src/part-07](/home/ems/rust_handbook/src/part-07)
- [src/part-08](/home/ems/rust_handbook/src/part-08)
- [src/part-09](/home/ems/rust_handbook/src/part-09)
- [src/part-10](/home/ems/rust_handbook/src/part-10)
- [src/appendices](/home/ems/rust_handbook/src/appendices)
- [src/10_retention_and_mastery_drills.md](/home/ems/rust_handbook/src/10_retention_and_mastery_drills.md)
- [archive/legacy-aggregates](/home/ems/rust_handbook/archive/legacy-aggregates)

Purpose:

- explain Rust from first principles
- make ownership and lifetimes memorable
- prepare the reader to read real codebases
- build contribution readiness for serious open-source Rust work

Local workflow:

```bash
mdbook build
mdbook serve --open
```

PDF export:

```bash
mdbook build
node scripts/export-pdf.mjs
```

Default output:

- `dist/the-rust-mastery-handbook.pdf`

Publication bundle:

```bash
mdbook build
node scripts/export-pdf.mjs --all-formats
```

Bundle outputs:

- `dist/the-rust-mastery-handbook-a4.pdf`
- `dist/the-rust-mastery-handbook-letter.pdf`

Project layout:

- `src/part-XX/` contains the chapterized book content, one page per chapter plus a part landing page
- `src/appendices/` contains appendix landing and appendix pages
- `src/SUMMARY.md` controls navigation
- `src/00_title_and_toc.md` is the reader-facing front door and manual TOC
- `book.toml` configures the book
- `book/` is generated output and ignored by git
- `archive/legacy-aggregates/` holds the old monolithic source files that were split into chapter pages

Legacy note:

- the old aggregate part files were moved to `archive/legacy-aggregates/` so `src/` has a single active source layout

Recommended study loop:

1. Read one chapter in order.
2. Type the examples and break them on purpose.
3. Do the matching drill deck in `src/10_retention_and_mastery_drills.md`.
4. Read one real Rust module that uses the same idea.
5. Write down one invariant the compiler was protecting.
