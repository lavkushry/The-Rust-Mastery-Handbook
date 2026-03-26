# Chapter 46: Entering an Unfamiliar Rust Repo

## Step 1 - The Problem

The worst way to enter a new codebase is to start reading random files until something feels familiar.

That fails because real Rust repositories are often:

- modular
- generic
- async
- feature-flagged
- workspace-based

If you do not build a map first, you will confuse:

- public surface with internal plumbing
- entry points with helpers
- dependency shape with implementation detail

## Step 2 - Rust's Design Decision

Rust repositories usually encode architecture explicitly:

- `Cargo.toml` declares package and dependency story
- module structure mirrors boundaries
- tests often reveal intended usage more clearly than implementation files
- features and workspaces change what the effective build graph is

This is a gift if you read the repository in the right order.

Rust accepted:

- more up-front structure
- more files and manifests in serious projects

Rust refused:

- burying the build and dependency story in opaque tooling
- making public API boundaries hard to discover

## Step 3 - The Mental Model

Plain English rule: enter a Rust repo from the outside in.

Start with:

- what the package claims to be
- how it builds
- what it exports
- what tests prove

Only then dive into implementation internals.

## Step 4 - Minimal Code Example

The "code example" for repo reading is really a shell protocol:

```bash
rg --files .
sed -n '1,220p' Cargo.toml
sed -n '1,220p' src/lib.rs
sed -n '1,220p' src/main.rs
rg -n "pub (struct|enum|trait|fn)" src
rg -n "#\\[cfg\\(test\\)\\]|#\\[test\\]" src tests
```

## Step 5 - Line-by-Line Walkthrough

This protocol works because each command reveals a different layer of the repo:

1. `rg --files .` shows top-level shape quickly.
2. `Cargo.toml` tells you if this is a CLI, library, workspace member, async service, proc-macro crate, or hybrid.
3. `src/lib.rs` or `src/main.rs` shows whether the repo is primarily library-first or executable-first.
4. `pub` item searches show the intentional surface area.
5. test searches show how the authors expect the code to be used.

The invariant is simple:

you must understand the repo's declared contract before you trust your interpretation of its internals.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Do not start with the biggest file. Start with the files that explain what the project is and how it is organized.

### Level 2 - Engineer

Your first job in an unfamiliar Rust repo is to build three maps:

- build map: crates, features, dependencies
- execution map: entry points, handlers, commands, tasks
- invariant map: what correctness property the repo seems obsessed with

The invariant map matters most. Great Rust repos are usually organized around one or two strong rules:

- no invalid parse states
- no hidden allocations in hot paths
- no unstructured errors
- no cross-thread mutation without explicit synchronization
- no silent feature interactions

### Level 3 - Systems

Rust repositories are especially legible when you respect the distinction between:

- crate boundary
- module boundary
- feature boundary
- trait boundary
- async boundary

If you skip those, generic code and trait-based dispatch make the repo feel more abstract than it is.

## The 12-Step Entry Protocol

Use this order on a real repo:

1. Read `README.md` to learn the project's promise and user-facing shape.
2. Read root `Cargo.toml` to learn crate kind, features, dependencies, editions, and workspace role.
3. If it is a workspace, read the workspace `Cargo.toml` and list members.
4. Read `CONTRIBUTING.md`, `DEVELOPMENT.md`, or equivalent contributor docs.
5. Read `src/lib.rs` or `src/main.rs` to find the curated top-level flow.
6. Read one public error type, often in `error.rs` or adjacent modules.
7. Read one integration test or example before reading deep internals.
8. Search for `async fn`, `tokio::spawn`, `thread::spawn`, and channel usage if concurrency exists.
9. Search for `pub trait`, `impl`, and extension traits to locate abstraction boundaries.
10. Search for feature gates: `#[cfg(feature = ...)]`, `cfg!`, and feature lists in `Cargo.toml`.
11. Run `cargo check`, then `cargo test`, then `cargo clippy` if the project supports it cleanly.
12. Only after that, trace one real request, command, or data flow end to end.

This order matters because each step reduces the chance of misreading the next one.

## Reading `Cargo.toml` as a Technology Map

`Cargo.toml` tells you more than dependency names. It answers:

- binary or library?
- workspace member or root?
- proc macro or ordinary crate?
- heavy async footprint?
- serialization?
- CLI?
- observability?
- FFI?

Examples of signals:

- `tokio`, `futures`, `tower`, `hyper`, `axum`: async/network/service architecture
- `clap`: CLI surface
- `serde`: serialization/config/data interchange
- `tracing`: structured observability
- `syn`, `quote`, `proc-macro2`: proc-macro work
- `thiserror`, `anyhow`: explicit error strategy

Also inspect:

- `[features]`
- `[workspace]`
- `[workspace.dependencies]`
- `default-features = false`
- target-specific sections

Those are often where the real build story lives.

## Module Mapping and Execution Tracing

Useful commands:

```bash
rg --files src crates tests examples
rg -n "fn main|#\\[tokio::main\\]|pub fn new|Router::new|Command::new" src crates
rg -n "pub (struct|enum|trait|fn)" src crates
rg -n "mod |pub mod " src crates
rg -n "async fn|tokio::spawn|select!|thread::spawn|channel\\(" src crates
rg -n "#\\[cfg\\(feature =|cfg\\(feature =" src crates
```

For trait-heavy code:

- find the trait
- find its impls
- find where the trait object or generic bound enters the execution path

For async code:

- find the runtime boundary
- find the task-spawn boundaries
- find where shutdown, cancellation, or backpressure is handled

## Understanding Tests First

Tests are usage documentation with teeth.

Why read tests early?

- they show intended public behavior
- they expose edge cases maintainers care about
- they reveal fixture and config patterns
- they often show how the API should feel from the outside

For a CLI, integration tests often tell you more than main code on day one.
For a library, doctests and unit tests often reveal intended invariants.
For a service, request-level tests show routing and error expectations.

## Grep Patterns Every Rust Contributor Uses

These are high-yield searches:

```bash
rg -n "todo!\\(|unimplemented!\\(|FIXME|TODO|HACK" .
rg -n "unwrap\\(|expect\\(" src crates
rg -n "Error|thiserror|anyhow|context\\(" src crates
rg -n "Serialize|Deserialize" src crates
rg -n "unsafe|extern \"C\"|raw pointer|MaybeUninit|ManuallyDrop" src crates
rg -n "pub trait|impl .* for " src crates
rg -n "#\\[test\\]|#\\[cfg\\(test\\)\\]" src tests crates
```

These searches help you find:

- unfinished work
- panic-heavy paths
- error architecture
- serialization boundaries
- unsafe boundaries
- trait architecture
- test entry points

## Step 7 - Common Misconceptions

Wrong model 1: "Start at the largest core module because that is where the real logic is."

Correction: without the package and public-surface map, "core logic" is easy to misread.

Wrong model 2: "README is marketing, not engineering."

Correction: in good repositories, README tells you the user-facing shape the code is trying to preserve.

Wrong model 3: "Tests are for later, after I understand implementation."

Correction: tests are often the fastest route to understanding intended behavior.

Wrong model 4: "Feature flags are optional details."

Correction: in many Rust repos, features materially change reachable code and API surface.

## Step 8 - Real-World Pattern

This protocol works well across:

- `ripgrep`-style CLIs
- `axum` and `tower`-style service stacks
- `tokio` and `serde` workspaces
- `rust-lang/rust`, where UI tests and crate boundaries are essential orientation tools

The pattern is stable even though repo shapes differ: build map first, execution map second, implementation details third.

## Step 9 - Practice Block

### Code Exercise

Pick one Rust repo and produce:

- a build map
- an execution map
- an invariant map

in one page of notes.

### Code Reading Drill

Read a `Cargo.toml` and explain what these dependencies imply:

```toml
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
tracing = "0.1"
serde = { version = "1", features = ["derive"] }
clap = { version = "4", features = ["derive"] }
```

### Spot the Bug

Why is this an inefficient repo-reading strategy?

```text
Open random file -> skim for 20 minutes -> search unclear names -> guess architecture
```

### Refactoring Drill

Take a repo note that says "I got lost in module X" and rewrite it into a proper orientation note with entry points, dependencies, and invariant guesses.

### Compiler Error Interpretation

If `cargo check` fails in a fresh repo and the errors are feature-related, translate that as: "I do not yet understand the repo's build surface, not necessarily that the repo is broken."

## Step 10 - Contribution Connection

After this chapter, you can:

- enter unfamiliar Rust repos with less thrashing
- identify public API versus implementation detail
- find likely contribution-safe entry points
- explain repo structure in review or onboarding notes

Good first PRs include:

- improving contributor docs around entry points or features
- adding missing examples or usage tests
- clarifying module docs where the architecture is hard to infer

## In Plain English

The smartest way to learn a new Rust repo is to understand its shape before its details. That matters because real codebases are too large to understand by wandering, and Rust projects often hide their logic behind clear structure rather than obvious framework conventions.

## What Invariant Is Rust Protecting Here?

Repository-level understanding must begin from declared contracts and boundaries so later code reading is anchored in what the project actually promises to users and contributors.

## If You Remember Only 3 Things

- Read `Cargo.toml` and tests before you trust your intuition about the repo.
- Build a map of crate boundaries, async boundaries, and invariant boundaries.
- Search strategically; do not wander randomly through implementation files.

## Memory Hook

Entering a Rust repo without reading `Cargo.toml` first is like entering a city without looking at the map, train lines, or street names and then complaining the buildings are confusing.

## Flashcard Deck

| Question | Answer |
|---|---|
| What are the first two files you should usually read in a Rust repo? | `README.md` and `Cargo.toml`. |
| Why is `Cargo.toml` a technology map? | It reveals crate kind, dependencies, features, workspace role, and architecture signals. |
| Why read tests early? | They often show intended behavior more clearly than implementation internals. |
| What are the three maps you should build for a repo? | Build map, execution map, and invariant map. |
| Why do feature flags matter for code reading? | They can materially change reachable code and API surface. |
| What should you search for in async repos? | Runtime boundaries, spawn points, channels, shutdown paths, and `select!`. |
| Why is `rg` so useful in Rust repos? | It makes module, trait, error, and test surfaces searchable quickly. |
| What does a good invariant map answer? | What correctness property the repo seems most organized around. |

## Chapter Cheat Sheet

| Goal | First move | Why |
|---|---|---|
| understand project type | read `Cargo.toml` | architecture signal |
| understand public surface | read `src/lib.rs` or `src/main.rs` | curated entry point |
| understand intended behavior | read tests/examples | usage truth |
| understand abstraction boundaries | search `pub trait` and impls | trait architecture |
| understand optional code paths | inspect features and `cfg` usage | real build graph |

---
