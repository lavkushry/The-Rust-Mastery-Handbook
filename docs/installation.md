# Installation

## Prerequisites

Required:

- Rust toolchain
- cargo command available in PATH

Install mdBook:

```bash
cargo install mdbook --locked
```

## Clone Repository

```bash
git clone https://github.com/lavkushry/The-Rust-Mastery-Handbook.git
cd The-Rust-Mastery-Handbook
```

## Build and Serve

```bash
mdbook build
mdbook serve --open
```

## Optional PDF Export Setup

PDF export uses scripts/export-pdf.mjs and local Node modules in .pdf-tools.

If you use PDF generation, ensure a compatible Node environment and required dependencies are installed in your local .pdf-tools workspace.

Then run:

```bash
mdbook build
node scripts/export-pdf.mjs
```
