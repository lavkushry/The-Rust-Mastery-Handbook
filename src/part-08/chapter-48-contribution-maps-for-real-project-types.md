# Chapter 48: Contribution Maps for Real Project Types

## Step 1 - The Problem

"Open source Rust" is not one repo shape.

A CLI tool, an async service, an observability stack, a large workspace, and `rust-lang/rust` itself all organize code differently. If you use one reading strategy everywhere, you will waste time.

## Step 2 - Rust's Design Decision

The ecosystem does not enforce one universal project layout. Instead, patterns emerge around problem domains:

- CLI tools optimize command flow and output behavior
- services optimize request flow, state, and async boundaries
- observability projects optimize event pipelines and subscriber layers
- workspaces optimize crate boundaries
- compiler code optimizes phase boundaries and test infrastructure

The trick is recognizing which pattern you are inside.

## Step 3 - The Mental Model

Plain English rule: before making a contribution, identify the project type, then look for the usual entry points and the usual safe first changes in that type of project.

## Step 4 - Minimal Code Example

This chapter is less about code and more about project maps. The "minimal example" is a map template:

```text
Project type:
Entry points:
Core modules:
Test location:
Good first PR:
Invariants that dominate:
```

## Step 5 - Walkthrough

If you fill in those six lines for a repo before editing code, you usually avoid the worst beginner mistakes:

- editing the wrong abstraction layer
- missing tests
- changing public surface accidentally
- misunderstanding which modules own behavior

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Different kinds of Rust projects put important logic in different places.

### Level 2 - Engineer

Learn the project family first. The usual file paths, tests, and first PR opportunities differ by family.

### Level 3 - Systems

Project type determines invariant distribution:

- CLI tools care about parsing, streaming, exit behavior, and output stability
- network services care about cancellation, state ownership, request routing, and observability
- observability systems care about backpressure, event shape, and subscriber/export boundaries
- compiler repos care about phase isolation, test harnesses, and diagnostics stability

## CLI Tools: `ripgrep`, `bat`, `fd`, `starship`

Typical entry points:

- `src/main.rs`
- command parsing modules
- dispatch or app runner modules

Typical module pattern:

- CLI argument definition
- config resolution
- domain logic
- output formatting

Where tests live:

- integration tests for full command behavior
- snapshot or golden-output tests
- unit tests for parsing and formatting helpers

Good first PRs:

- edge-case output fix
- clearer error message
- missing flag docs or examples
- regression test around path, Unicode, or formatting behavior

Repos to study:

- `BurntSushi/ripgrep`
- `sharkdp/bat`
- `sharkdp/fd`
- `starship/starship`

What to look for:

- command dispatch flow
- stable output expectations
- feature flags and platform handling

## Async Network Services: `axum`, `hyper`, `tower`, real apps

Typical entry points:

- `main.rs` runtime startup
- router construction
- handlers or services
- state/config initialization

Typical module pattern:

- request types and extractors
- handlers or service impls
- error mapping
- shared app state
- background tasks

Where tests live:

- handler tests
- router/integration tests
- service-level tests
- async end-to-end tests

Good first PRs:

- improve error mapping
- add request validation
- strengthen timeout or shutdown behavior
- add tracing fields or tests around cancellation paths

Repos to study:

- `tokio-rs/axum`
- `hyperium/hyper`
- `tower-rs/tower`
- a real service repo once you know the pattern

What to look for:

- runtime boundaries
- spawn points
- cancellation and shutdown
- shared state shape

## Observability and Data Pipelines: `tracing`, `metrics`, `vector`

Typical entry points:

- event or span types
- subscriber/layer/export plumbing
- pipeline stages

Typical module pattern:

- core event model
- filtering and transformation
- subscriber or sink abstractions
- output/export integrations

Where tests live:

- unit tests for field/event formatting
- integration tests for pipelines and export behavior
- snapshot tests for emitted structures

Good first PRs:

- improve field propagation
- fix backpressure edge cases
- document subscriber/layer interactions
- tighten tests around structured output

Repos to study:

- `tokio-rs/tracing`
- `metrics-rs/metrics`
- `vectordotdev/vector`

What to look for:

- event model
- structured-field propagation
- buffering and shutdown boundaries

## Multi-Crate Workspaces: `tokio`, `serde`, `cargo`

Typical entry points:

- root workspace manifest
- primary crate `lib.rs` or `main.rs`
- supporting crates for macros, helpers, adapters, or specialized layers

Typical module pattern:

- one or more public-facing crates
- derive/proc-macro crate if needed
- internal utility crates
- cross-crate test or example infrastructure

Where tests live:

- per-crate unit and integration tests
- workspace-level examples or special test harnesses

Good first PRs:

- bug fix inside one crate with localized tests
- docs clarifying cross-crate relationships
- semver-safe internal cleanup

Repos to study:

- `tokio-rs/tokio`
- `serde-rs/serde`
- `rust-lang/cargo`

What to look for:

- which crate is the real public surface
- which crates are internal support
- how features and shared dependencies are coordinated

## `rust-lang/rust`

Typical entry points:

- contributor docs first
- `x.py` workflow and UI test harness
- compiler crates by pipeline stage
- standard library crates under `library/`

Typical high-level structure:

- `compiler/` for compiler crates such as parsing, HIR, MIR, and codegen-related layers
- `library/` for `core`, `alloc`, `std`, and siblings
- `tests/` for UI, run-pass, and other compiler/stdlib testing layers
- `src/tools/` for tools like `clippy`, `miri`, and `rustfmt`

Where tests live:

- UI tests for diagnostics and compile-fail behavior
- crate-local tests
- standard library and tool-specific tests

Good first PRs:

- diagnostic wording improvements
- UI test additions
- docs fixes
- small lint or tool behavior improvements

Repos to study:

- `rust-lang/rust`
- `rust-lang/rustc-dev-guide`
- `rust-lang/rfcs`

What to look for:

- phase ownership
- diagnostic test patterns
- how compiler crates communicate without collapsing into one monolith

## Step 7 - Common Misconceptions

Wrong model 1: "All Rust repos basically look the same after a while."

Correction: the ecosystem shares tools and taste, not one universal layout.

Wrong model 2: "A good first PR type is the same across domains."

Correction: a CLI output fix and a compiler diagnostic fix are both good, but the paths to them are different.

Wrong model 3: "Workspaces are just bigger crates."

Correction: workspaces are coordination surfaces with real crate-boundary meaning.

Wrong model 4: "`rust-lang/rust` is just too big to approach."

Correction: it is too big to approach randomly, not too big to approach systematically.

## Step 8 - Real-World Pattern

Project-family thinking is one of the fastest ways to become effective. It lets you reuse repo-entry instincts across the ecosystem instead of treating every new repository as a fresh mystery.

## Step 9 - Practice Block

### Code Exercise

Pick one repo from each family and fill out the six-line project map template.

### Code Reading Drill

For a chosen repo, answer:

- where does user input first enter?
- where does error shaping happen?
- where do tests encode the intended invariant?

### Spot the Bug

Why is this a bad first contribution plan for `rust-lang/rust`?

```text
Start by redesigning a compiler phase boundary after skimming one crate.
```

### Refactoring Drill

Take a generic "I want to contribute to repo X" plan and rewrite it into a project-family-specific plan with likely entry points and low-risk changes.

### Compiler Error Interpretation

If a fix in a workspace suddenly breaks unrelated crates, translate that as: "I changed a cross-crate contract, not just a local implementation."

## Step 10 - Contribution Connection

After this chapter, you can:

- classify Rust repos faster
- choose repo-appropriate first changes
- map tests and entry points with less guesswork
- avoid bringing the wrong assumptions from one project family into another

Good first PRs include:

- family-appropriate docs/tests/error improvements
- small bug fixes inside one clear ownership area
- contributor notes clarifying repo-specific entry patterns

## In Plain English

Different Rust projects are built around different jobs, so they hide their important logic in different places. That matters because a good contributor does not only know Rust the language; they also know where to look first in each kind of Rust codebase.

## What Invariant Is Rust Protecting Here?

Contribution strategy should fit the repository's architectural shape so changes happen in the right layer and preserve the dominant invariants of that project family.

## If You Remember Only 3 Things

- Classify the repo family before planning your first change.
- Entry points, test locations, and safe first PRs differ meaningfully across project types.
- `rust-lang/rust` is approachable when you respect phase and test boundaries.

## Memory Hook

Do not use a subway map to navigate a hiking trail. A CLI repo, async service, observability stack, and compiler repo each need a different map.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is usually the first entry point in a CLI repo? | `main.rs` plus argument parsing and dispatch. |
| What should you hunt for first in an async service? | Runtime setup, router/service entry points, spawn boundaries, and shutdown flow. |
| What do observability repos often revolve around? | Event/spans, subscriber/layer structure, and export pipelines. |
| What is the first thing to inspect in a workspace repo? | The root `Cargo.toml` and member crates. |
| What makes `rust-lang/rust` manageable? | Understanding phase boundaries and the test infrastructure first. |
| What is a good first PR in `rust-lang/rust`? | Diagnostic improvements, UI tests, doc fixes, or small tool/lint fixes. |
| Why do CLI repos often have strong integration tests? | Output and user-facing behavior are part of the contract. |
| Why can workspace changes have surprising blast radius? | Shared features, dependencies, and public contracts span multiple crates. |

## Chapter Cheat Sheet

| Project type | First look | Good first PR |
|---|---|---|
| CLI/TUI | `main.rs`, args, output tests | edge-case output or docs fix |
| async service | runtime/router/handlers | validation/error/shutdown fix |
| observability | event model, subscriber/export path | structured output or docs/test fix |
| workspace | root manifest, primary crate | one-crate local bug fix |
| compiler | contributor docs, tests, phase crate | diagnostic/UI test/doc fix |

---
