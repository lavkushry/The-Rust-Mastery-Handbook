# Rust Resource Atlas

This atlas curates high-signal Rust resources for expanding handbook quality, depth, and practical relevance.

## How To Use This Atlas

- Prefer official resources first for correctness and long-term stability.
- Pull external material as concepts and examples, not copied prose.
- Add chapter references whenever a resource influences a section.

## Tier 1: Official Core (Must Reference)

- Rust Learn hub: https://www.rust-lang.org/learn
- The Rust Programming Language: https://doc.rust-lang.org/book/
- Rust By Example: https://doc.rust-lang.org/rust-by-example/
- The Rust Reference: https://doc.rust-lang.org/reference/
- Cargo Book: https://doc.rust-lang.org/cargo/
- Rustonomicon (unsafe): https://doc.rust-lang.org/nomicon/
- Standard library docs: https://doc.rust-lang.org/std/
- Compiler error index: https://doc.rust-lang.org/error-index.html

## Tier 2: Tooling and Quality (Must Integrate In Workflows)

- Clippy lint docs: https://rust-lang.github.io/rust-clippy/
- Rustfmt docs: https://rust-lang.github.io/rustfmt/
- crates.io registry: https://crates.io/
- docs.rs crate docs: https://docs.rs/

## Tier 3: Async and Systems Depth

- Tokio tutorial and topics: https://tokio.rs/tokio/tutorial
- Async Rust book: https://rust-lang.github.io/async-book/
- Rust performance book: https://nnethercote.github.io/perf-book/

## Tier 4: Design and Architecture

- Rust API Guidelines: https://rust-lang.github.io/api-guidelines/
- Rust Design Patterns: https://rust-unofficial.github.io/patterns/

## Tier 5: Practice and Community

- Rustlings exercises: https://rustlings.rust-lang.org/
- Rust users forum: https://users.rust-lang.org/

## Optional Domain Tracks

- Rust and WebAssembly: https://rustwasm.github.io/docs/book/

## Integration Map For This Handbook

- Part 1-2 (foundations): Book + Rust By Example + Error Index
- Part 3-4 (ownership/borrowing/lifetimes): Book + Reference + Nomicon sections where relevant
- Part 5-6 (concurrency/systems): Tokio + Async Book + Performance Book
- Part 7-8 (architecture/ecosystem): API Guidelines + Design Patterns + crates.io/docs.rs workflow
- Part 9-10 (mastery/contribution): Rustlings + forum Q&A patterns + clippy/rustfmt quality gates

## Resource Ingestion Rules

- Keep chapter tone original and project-specific.
- Avoid copy-paste from external texts.
- Cross-link to official docs for source-of-truth semantics.
- Record source links in chapter notes for maintainers.

## Suggested Monthly Update Loop

- Revalidate top-level links.
- Refresh one section in each tier.
- Add a short changelog entry for newly adopted resources.
