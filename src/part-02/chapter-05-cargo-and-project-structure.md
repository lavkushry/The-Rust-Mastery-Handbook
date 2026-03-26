# Chapter 5: Cargo and Project Structure

## Step 1 - The Problem

Once a Rust project exists, you need to answer:

- how are crates and targets organized?
- how are dependencies declared?
- which versions are compatible?
- what belongs in the lockfile?
- when should multiple crates live in one workspace?

Without discipline here, project shape degrades quickly.

## Step 2 - Rust's Design Decision

Cargo manifests are explicit, structured, and central. They describe:

- package metadata
- targets
- dependencies
- features
- build scripts
- workspace relationships

Rust accepted:

- writing manifests directly
- exposing version and feature constraints explicitly

Rust refused:

- implicit dependency resolution stories hidden in editor state or build hacks

## Step 3 - The Mental Model

Plain English rule: `Cargo.toml` is the build, dependency, and public-shape declaration for the package.

## Step 4 - Minimal Code Example

```toml
[package]
name = "demo"
version = "0.1.0"
edition = "2024"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
```

## Step 5 - Walkthrough

This manifest says:

1. the package is named `demo`
2. it uses the 2024 edition syntax and semantics
3. it depends on `serde` version-compatible with `1.0`
4. it enables the `derive` feature for that dependency

That is enough for Cargo to build a dependency graph and fetch compatible crate versions.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

`Cargo.toml` describes what the project is and what it depends on.

### Level 2 - Engineer

The most important parts to read or write well are:

- `[package]`
- `[dependencies]`
- `[dev-dependencies]`
- `[features]`
- `[workspace]`

Dependency entries are not just install instructions. They are compatibility and capability declarations.

### Level 3 - Systems

Cargo manifests are architecture signals. Feature flags shape compilation surface. Workspaces shape crate boundaries. Lockfiles shape reproducibility. `build.rs` can extend the build graph into generated code or foreign compilation. All of that changes how a repo should be read and maintained.

## Dependency Versioning

Common version forms:

- `"1.2.3"` or `"1.2"`: caret-compatible semver range by default
- `"~1.2.3"`: patch-level compatibility
- `"=1.2.3"`: exact version

You do not need to memorize every semver operator on day one, but you do need to know that dependency version strings are constraints, not simple installation requests.

## `Cargo.lock`

The practical rule:

- commit `Cargo.lock` for binaries and applications
- do not usually commit it for reusable libraries

Why?

- applications want reproducible deployments and CI
- libraries want downstream consumers to resolve against compatible versions in their own graph

The underlying invariant is reproducibility for shipped artifacts versus flexibility for reusable dependency crates.

## Workspaces

Workspaces group related crates:

```toml
[workspace]
members = ["crates/core", "crates/cli"]

[workspace.dependencies]
serde = { version = "1.0", features = ["derive"] }
```

Use a workspace when:

- crates evolve together
- you want shared dependency declarations
- there is a real architectural split, not just aesthetic file organization

## `cargo add`, `cargo tree`, `cargo audit`

Useful commands:

```bash
cargo add tracing
cargo tree
cargo audit
```

These help you:

- add dependencies consistently
- inspect the dependency graph
- check for known vulnerability advisories

## `build.rs`

`build.rs` is a build script executed before the main crate compiles.

Use it when the build needs:

- generated bindings
- bundled C compilation
- target probing
- code generation based on environment or external inputs

If you see `build.rs`, treat it as part of the compilation contract, not as an afterthought.

## Step 7 - Common Misconceptions

Wrong model 1: "`Cargo.toml` is mostly package metadata."

Correction: it is also architecture, dependency, and feature contract.

Wrong model 2: "Feature flags are runtime toggles."

Correction: Cargo features are compile-time graph and code-shape controls.

Wrong model 3: "Workspaces are just for very large projects."

Correction: workspaces are useful whenever crate boundaries are real and shared management helps.

Wrong model 4: "`Cargo.lock` should always be committed or never be committed."

Correction: the right choice depends on whether the package is an application or a library.

## Step 8 - Real-World Pattern

Serious Rust repos are often legible from the manifest alone:

- async/network stack
- CLI surface
- proc-macro support
- serialization strategy
- workspace organization

That is why experienced contributors read `Cargo.toml` so early.

## Step 9 - Practice Block

### Code Exercise

Create a tiny workspace with one library crate and one CLI crate. Use `[workspace.dependencies]` for one shared dependency.

### Code Reading Drill

Explain what this dependency line means:

```toml
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
```

### Spot the Bug

Why is this misleading contributor guidance?

```text
"Delete Cargo.lock whenever you have a dependency problem."
```

### Refactoring Drill

Take a monolithic package with a growing CLI and reusable library logic and sketch when splitting into a workspace starts making sense.

### Compiler Error Interpretation

If a crate compiles only with one feature combination and breaks badly with another, translate that as: "the manifest's feature design may be failing to preserve additive compatibility."

## Step 10 - Contribution Connection

After this chapter, you can:

- read manifests as repo architecture
- reason about feature flags and lockfiles
- navigate workspaces with less confusion

Good first PRs include:

- clarifying manifest comments or docs
- simplifying feature organization
- improving workspace dependency sharing

## In Plain English

`Cargo.toml` tells Rust what the project is, what it depends on, and how its pieces fit together. That matters because project structure is not separate from engineering; it shapes how the code is built, shared, and changed.

## What Invariant Is Rust Protecting Here?

The build graph, version constraints, feature surface, and package boundaries should remain explicit and reproducible enough for both humans and tools to reason about safely.

## If You Remember Only 3 Things

- `Cargo.toml` is architecture, not just metadata.
- `Cargo.lock` exists for reproducibility, but libraries and binaries use it differently.
- Workspaces are about real crate boundaries, not decorative complexity.

## Memory Hook

If source files are the rooms of a house, `Cargo.toml` is the blueprint and permit packet that says which rooms exist and how utilities reach them.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does `Cargo.toml` primarily describe? | Package metadata, dependencies, features, targets, and workspace/build structure. |
| What does a dependency feature entry do? | Opts into compile-time capabilities of that dependency. |
| When is `Cargo.lock` usually committed? | For applications and binaries, not usually for reusable libraries. |
| What is a Cargo workspace for? | Managing related crates that evolve together under one root. |
| What does `cargo tree` show? | The resolved dependency graph. |
| What does `cargo add` help with? | Adding dependencies consistently to the manifest. |
| When do you need `build.rs`? | When compilation requires code generation, probing, or foreign build steps. |
| Are Cargo features runtime flags? | No. They are compile-time configuration of code and dependency graph. |

## Chapter Cheat Sheet

| Need | Cargo feature | Why |
|---|---|---|
| declare package | `[package]` | metadata and edition |
| declare dependencies | `[dependencies]` | graph inputs |
| test-only deps | `[dev-dependencies]` | keep main graph cleaner |
| compile-time options | `[features]` | optional capabilities |
| multi-crate repo | `[workspace]` | grouped crate management |
| generated build step | `build.rs` | pre-compilation logic |

---
