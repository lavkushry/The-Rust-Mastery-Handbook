# Chapter 45: Crate Architecture, Workspaces, and Semver
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-02/chapter-15-modules-crates-and-visibility.html">Ch 15: Modules</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Workspace layout for multi-crate projects</li><li>Semantic versioning and public API stability</li><li>Feature flags and conditional compilation</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">30<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 15 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--perf);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Workspace Topology</div><h2 class="visual-figure__title">One Repository, Several Deliberate Crate Boundaries</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Workspace diagram showing root manifest and several member crates with curated public surfaces">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(255,190,11,0.22)"></rect>
        <rect x="164" y="56" width="212" height="70" rx="18" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect>
        <text x="216" y="92" class="svg-small" style="fill:#8f5d00;">workspace Cargo.toml</text>
        <path d="M270 126 V 176" stroke="#ffbe0b" stroke-width="6"></path>
        <path d="M270 176 L 108 238 M270 176 L 270 238 M270 176 L 432 238" stroke="#ffbe0b" stroke-width="6" fill="none"></path>
        <rect x="42" y="238" width="132" height="96" rx="18" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect>
        <text x="78" y="274" class="svg-small" style="fill:#0b5e73;">core</text>
        <text x="62" y="300" class="svg-small" style="fill:#0b5e73;">public types</text>
        <rect x="204" y="238" width="132" height="96" rx="18" fill="#edf8f1" stroke="#52b788" stroke-width="3"></rect>
        <text x="244" y="274" class="svg-small" style="fill:#1f6f4d;">cli</text>
        <text x="222" y="300" class="svg-small" style="fill:#1f6f4d;">depends on core</text>
        <rect x="366" y="238" width="132" height="96" rx="18" fill="#f3f0ff" stroke="#8338ec" stroke-width="3"></rect>
        <text x="394" y="274" class="svg-small" style="fill:#5c2bb1;">derive</text>
        <text x="382" y="300" class="svg-small" style="fill:#5c2bb1;">proc-macro crate</text>
        <text x="118" y="366" class="svg-small" style="fill:#6b7280;">split when boundaries are real: reuse, release cadence, heavy optional deps</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--perf);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Semver Pressure</div><h2 class="visual-figure__title">Every Public Promise Radiates Downstream</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Semver diagram showing downstream crates affected by breaking public API changes and feature unification">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <circle cx="270" cy="146" r="58" fill="#ffbe0b"></circle>
        <text x="240" y="142" class="svg-small" style="fill:#111827;">your crate</text>
        <text x="220" y="168" class="svg-small" style="fill:#111827;">v1.4.0</text>
        <path d="M270 204 V 254" stroke="#ffbe0b" stroke-width="6"></path>
        <path d="M270 204 L 120 278 M270 204 L 420 278" stroke="#ffbe0b" stroke-width="6" fill="none"></path>
        <rect x="52" y="278" width="136" height="76" rx="18" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect>
        <rect x="202" y="278" width="136" height="76" rx="18" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect>
        <rect x="352" y="278" width="136" height="76" rx="18" fill="#3a1c17" stroke="#e76f51" stroke-width="3"></rect>
        <text x="98" y="320" class="svg-small" style="fill:#dbeafe;">web app</text>
        <text x="242" y="320" class="svg-small" style="fill:#d9fbe9;">plugin crate</text>
        <text x="392" y="320" class="svg-small" style="fill:#ffd8cc;">internal tool</text>
        <text x="70" y="92" class="svg-small" style="fill:#fff3c4;">breaking changes:</text>
        <text x="70" y="118" class="svg-small" style="fill:#fff3c4;">remove impl, narrow bounds, hide field, rename export</text>
        <text x="70" y="382" class="svg-small" style="fill:#fff3c4;">Cargo unifies features, so flags must add capability instead of changing meaning</text>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem

Writing good Rust inside one file is not the same as maintaining a crate other people depend on.

As soon as code becomes public, you inherit new failure modes:

- unstable module boundaries
- accidental public APIs
- breaking changes hidden inside innocent refactors
- feature flags that conflict across dependency graphs
- workspaces that split too early or too late

In less disciplined ecosystems, these problems are often handled by convention and hope. Rust's tooling nudges you toward stronger release hygiene because the ecosystem depends heavily on interoperable crates.

## Step 2 - Rust's Design Decision

Cargo and the crate system make package structure part of everyday development rather than an afterthought.

Rust also treats semver seriously because public APIs are encoded deeply in types, trait impls, and features. A "small" change can break many downstream crates if you do not reason carefully about what was part of the public contract.

Rust accepted:

- more deliberate package boundaries
- feature and visibility discipline
- explicit release hygiene

Rust refused:

- hand-wavy public API management
- feature flags that arbitrarily remove existing functionality
- pretending a type-level breaking change is minor because the README example still works

## Step 3 - The Mental Model

Plain English rule: your crate's public API is every promise downstream code can rely on, not just the functions you meant people to call.

That includes:

- public items
- visible fields
- trait impls
- feature behavior
- module paths you export
- error types and conversion behavior

Workspaces are about shared development and release structure. They are not automatically proof of better architecture.

## Step 4 - Minimal Code Example

```toml
[workspace]
members = ["crates/core", "crates/cli"]

[workspace.dependencies]
serde = { version = "1.0", features = ["derive"] }
```

```toml
[package]
name = "core"
version = "0.1.0"
edition = "2024"

[dependencies]
serde.workspace = true
```

## Step 5 - Line-by-Line Compiler and Tooling Walkthrough

Cargo reads the workspace manifest first:

1. it discovers member crates
2. it resolves shared dependencies and metadata
3. it builds a dependency graph across the workspace
4. it runs requested commands across members in graph-aware order

When you expose items from `lib.rs`, you are shaping the crate's stable face. Re-exporting an internal module path is not just convenience. It is a public commitment if downstream users adopt it.

That is why "just make it `pub` for now" is such a dangerous habit in library code.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

A crate is a package of Rust code. A workspace is a set of crates developed together. Public APIs need more care than internal code because other people may depend on them.

</div>
<div class="level-panel" data-level="Engineer">

Split crates when there is a real boundary:

- different release cadence
- independent reuse value
- heavy optional dependencies
- clear architectural separation

Do not split purely for aesthetics. Too many crates create coordination overhead, duplicated concepts, and harder refactors.

Feature flags should be additive. If enabling a feature removes a type, changes meaning, or breaks existing callers, you have created feature-driven semver chaos.

</div>
<div class="level-panel" data-level="Deep Dive">

Semver in Rust is subtle because the public contract includes more than function signatures. Changing trait bounds, removing an impl, altering auto trait behavior, narrowing visibility, or changing feature-controlled item availability can all be breaking changes.

This is why tools like `cargo-semver-checks` exist. The goal is not ceremony. The goal is to catch type-level breaking changes that humans easily miss.

</div>
</div>


## Anatomy of a Strong Crate

```text
my_crate/
├── Cargo.toml
├── src/
│   ├── lib.rs
│   ├── error.rs
│   ├── config.rs
│   ├── parser.rs
│   └── internal/
├── tests/
├── examples/
├── benches/
├── README.md
└── CHANGELOG.md
```

Common architectural roles:

- `lib.rs`: curate the public API, re-export intentionally
- `error.rs`: centralize public error surface
- `internal/` or private modules: implementation details
- `tests/`: integration tests that use only the public API
- `examples/`: runnable user-facing patterns

## Feature Flags

Feature flags must be additive because dependencies are unified across the graph. If two downstream crates enable different features on your crate, Cargo combines them.

That means features are not build profiles. They are capability additions.

Good feature use:

- optional dependency integration
- extra formats or transports
- heavier convenience layers

Bad feature use:

- mutually incompatible behavior changes
- removing items under a feature
- changing semantics of existing items in surprising ways

## What Counts as a Breaking Change?

Typical breaking changes include:

- removing or renaming public items
- changing public function signatures
- adding required trait bounds
- changing enum variants available to users
- making public fields private
- removing trait impls
- changing feature behavior so previously compiling code fails
- changing auto trait behavior such as `Send` or `Sync`

Even "harmless" changes like swapping a returned concrete type can be breaking if that type was public and relied on by downstream code.

## `cargo-semver-checks`, CHANGELOG, and Publishing

For libraries, run semver validation before release. `cargo-semver-checks` helps compare the current crate against a prior release and surfaces API changes with semver meaning.

`CHANGELOG.md` matters because:

- contributors see what changed
- reviewers can track release intent
- users can assess upgrade impact

Publishing checklist:

1. run tests, clippy, and docs
2. audit public API changes
3. verify feature combinations
4. update changelog
5. check README examples
6. publish from a clean, intentional state

## Workspaces in Real Projects

Multi-crate workspaces are common in serious Rust repositories:

- `tokio` splits runtime pieces and supporting crates
- `serde` separates core pieces and derive support
- observability stacks split core types, subscribers, and integrations

The pattern to learn is not "many crates is better." It is:

split when the boundary is real, and keep the public surface of each crate intentionally small.

## Step 7 - Common Misconceptions

Wrong model 1: "If a module path is public, I can change it later as an internal refactor."

Correction: once downstream code imports it, it is part of the public contract unless you re-export compatibly.

Wrong model 2: "Feature flags can represent mutually exclusive modes."

Correction: Cargo unifies features, so mutually exclusive flags are fragile unless designed very carefully.

Wrong model 3: "A workspace is just a monorepo."

Correction: it is a Cargo-level coordination mechanism with dependency, command, and release implications.

Wrong model 4: "Semver is just version-number etiquette."

Correction: semver is an operational promise about what downstream code may keep relying on.

## Step 8 - Real-World Pattern

Well-shaped Rust libraries tend to:

- curate public exports from `lib.rs`
- keep implementation modules private
- isolate proc-macro crates when needed
- treat feature flags as additive integration points
- use integration tests to exercise the public API

That shape appears in major ecosystem projects because it scales maintenance, review, and release hygiene.

## Step 9 - Practice Block

### Code Exercise

Sketch a workspace for a project with:

- a reusable parsing library
- a CLI
- an async server

Decide which crates should exist and which dependencies belong at the workspace level.

### Code Reading Drill

Open a real `Cargo.toml` and explain:

- what features it exposes
- whether they are additive
- which dependencies are optional
- where the public API likely lives

### Spot the Bug

Why is this risky?

```toml
[features]
default = ["sqlite"]
postgres = []
sqlite = []
```

Assume enabling both changes runtime behavior in incompatible ways.

### Refactoring Drill

Take a crate with many `pub mod` exports and redesign `lib.rs` to expose only the intended high-level API.

### Compiler Error Interpretation

If a downstream crate breaks after you "only" added a trait bound, translate that as: "I tightened the public contract, so this may be a semver-breaking change."

## Step 10 - Contribution Connection

After this chapter, you can review and improve:

- `Cargo.toml` feature design
- workspace dependency sharing
- public re-export strategy
- changelog and release hygiene
- semver-sensitive public API changes

Strong first PRs include:

- tightening accidental public visibility
- making feature flags additive
- adding integration tests that pin public API behavior
- documenting release-impacting changes clearly

## In Plain English

A crate is not just code. It is a promise to other code. Rust's tooling pushes you to treat that promise seriously because once people depend on your types and features, changing them carelessly creates real upgrade pain.

## What Invariant Is Rust Protecting Here?

Public APIs, features, and crate boundaries should evolve in ways that preserve downstream correctness and expectations unless a deliberate breaking release says otherwise.

## If You Remember Only 3 Things

- Every public item, trait impl, and feature behavior is part of your crate's contract.
- Workspaces help coordinate related crates, but they do not replace real architectural boundaries.
- Semver in Rust is type-level and behavioral, not just cosmetic version numbering.

## Memory Hook

Publishing a crate is pouring concrete, not drawing chalk. Public API lines are easy to widen later and expensive to erase cleanly.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is a workspace for? | Coordinating multiple related crates under one Cargo graph and command surface. |
| Why must features usually be additive? | Because Cargo unifies enabled features across the dependency graph. |
| Name one subtle breaking change besides removing a function. | Removing a trait impl or adding a required trait bound. |
| What is `lib.rs` often responsible for? | Curating and presenting the public API surface intentionally. |
| When should you split a project into multiple crates? | When there is a real architectural, dependency, reuse, or release boundary. |
| What does `cargo-semver-checks` help detect? | Public API changes with semver implications. |
| Why do integration tests matter for libraries? | They exercise the public API the way downstream users do. |
| Why is `pub` a stronger commitment than it feels? | Because downstream code may begin depending on anything you expose. |

## Chapter Cheat Sheet

| Problem | Tool or practice | Benefit |
|---|---|---|
| Shared dependency versions across crates | `[workspace.dependencies]` | less duplication and drift |
| Accidental public API sprawl | curated `lib.rs` re-exports | smaller stable surface |
| Optional ecosystem integration | additive feature flags | composable dependency graph |
| Detect release-breaking API drift | `cargo-semver-checks` | semver-aware verification |
| Communicate user-facing release impact | `CHANGELOG.md` | upgrade clarity |

---
