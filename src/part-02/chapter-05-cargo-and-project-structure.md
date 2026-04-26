# Chapter 5: Cargo and Project Structure

<div class="ferris-says" data-variant="insight">
<p>Cargo is not just a build tool — it is the single interface you will use for compiling, testing, documenting, publishing, and depending on other people's code. Learning Cargo well pays off for the rest of your Rust career. This chapter is the unabridged tour.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-02/chapter-04-environment-and-toolchain.md">Ch 4: Toolchain</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Cargo.toml anatomy and project layout</li><li>Dependencies, features, and workspaces</li><li><code>cargo build</code>, <code>test</code>, <code>run</code>, <code>check</code></li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">20<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 15 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--compiler);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Manifest Anatomy</div><h2 class="visual-figure__title"><code>Cargo.toml</code> as Build Contract</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Manifest anatomy diagram labeling package metadata, dependencies, features, targets, and build script sections"><rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(2,62,138,0.16)"></rect><rect x="84" y="60" width="372" height="280" rx="18" fill="#f8fbff" stroke="#023e8a" stroke-width="3"></rect><rect x="108" y="90" width="144" height="42" rx="12" fill="#eef2ff" stroke="#023e8a"></rect><text x="142" y="116" class="svg-small" style="fill:#023e8a;">[package]</text><rect x="286" y="90" width="144" height="42" rx="12" fill="#eef6fb" stroke="#219ebc"></rect><text x="310" y="116" class="svg-small" style="fill:#0b5e73;">[dependencies]</text><rect x="108" y="156" width="144" height="42" rx="12" fill="#f3f0ff" stroke="#8338ec"></rect><text x="142" y="182" class="svg-small" style="fill:#5c2bb1;">[features]</text><rect x="286" y="156" width="144" height="42" rx="12" fill="#fff8df" stroke="#ffbe0b"></rect><text x="324" y="182" class="svg-small" style="fill:#8f5d00;">[[bin]]</text><rect x="108" y="222" width="144" height="42" rx="12" fill="#edf8f1" stroke="#52b788"></rect><text x="136" y="248" class="svg-small" style="fill:#1f6f4d;">[workspace]</text><rect x="286" y="222" width="144" height="42" rx="12" fill="#fff1eb" stroke="#e76f51"></rect><text x="316" y="248" class="svg-small" style="fill:#8f3d22;">build.rs</text><text x="118" y="308" class="svg-small" style="fill:#6b7280;">the manifest tells Cargo what exists, what depends on what, and which knobs affect the build</text></svg></div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--compiler);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Workspace Graph</div><h2 class="visual-figure__title">One Repository, Several Crates, One Resolver</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Workspace graph with root manifest and member crates sharing dependencies and a lockfile"><rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect><rect x="160" y="54" width="220" height="54" rx="16" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect><text x="214" y="86" class="svg-small" style="fill:#dbeafe;">workspace root</text><path d="M270 108 V 156" stroke="#3a86ff" stroke-width="5"></path><path d="M270 156 L 118 228 M270 156 L 270 228 M270 156 L 422 228" stroke="#3a86ff" stroke-width="5" fill="none"></path><rect x="52" y="228" width="132" height="72" rx="18" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect><text x="90" y="268" class="svg-small" style="fill:#d9fbe9;">core crate</text><rect x="204" y="228" width="132" height="72" rx="18" fill="#231942" stroke="#8338ec" stroke-width="3"></rect><text x="244" y="268" class="svg-small" style="fill:#efe8ff;">cli crate</text><rect x="356" y="228" width="132" height="72" rx="18" fill="#3a1c17" stroke="#e76f51" stroke-width="3"></rect><text x="384" y="268" class="svg-small" style="fill:#ffd8cc;">derive crate</text><rect x="156" y="328" width="228" height="40" rx="14" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect><text x="212" y="353" class="svg-small" style="fill:#8f5d00;">shared lockfile and dependency resolution</text></svg></div>
  </figure>
</div>

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


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

`Cargo.toml` describes what the project is and what it depends on.

</div>
<div class="level-panel" data-level="Engineer">

The most important parts to read or write well are:

- `[package]`
- `[dependencies]`
- `[dev-dependencies]`
- `[features]`
- `[workspace]`

Dependency entries are not just install instructions. They are compatibility and capability declarations.

</div>
<div class="level-panel" data-level="Deep Dive">

Cargo manifests are architecture signals. Feature flags shape compilation surface. Workspaces shape crate boundaries. Lockfiles shape reproducibility. `build.rs` can extend the build graph into generated code or foreign compilation. All of that changes how a repo should be read and maintained.

</div>
</div>


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

## wordc, step 8 — `cargo test` and the first unit test

<div class="ferris-says" data-variant="insight">
<p>The Part 0 version of <code>wordc</code> had one function doing everything: read args, read file, count words, print. That's fine for a first draft, but it leaves nothing you can <em>test</em>. In this step we extract a pure function, <code>count_words(text: &amp;str) -&gt; usize</code>, and add a unit test right next to it. Then we run the whole thing with <code>cargo test</code> — Cargo's built-in test runner, no framework to install.</p>
</div>

Open `src/main.rs` in the `wordc` project and refactor so the counting logic is a separate function:

```rust
use std::env;
use std::fs;
use std::process;

fn count_words(text: &str) -> usize {
    text.split_whitespace().count()
}

fn main() {
    let args: Vec<String> = env::args().collect();

    let path = match args.get(1) {
        Some(p) => p,
        None => {
            eprintln!("usage: wordc <path>");
            process::exit(1);
        }
    };

    let text = fs::read_to_string(path).unwrap_or_else(|e| {
        eprintln!("could not read {path}: {e}");
        process::exit(1);
    });

    println!("{path} has {} words.", count_words(&text));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_string_has_zero_words() {
        assert_eq!(count_words(""), 0);
    }

    #[test]
    fn whitespace_only_has_zero_words() {
        assert_eq!(count_words("   \t\n  "), 0);
    }

    #[test]
    fn counts_words_separated_by_any_whitespace() {
        assert_eq!(count_words("rust is fast"), 3);
        assert_eq!(count_words("rust\tis\nfast"), 3);
        assert_eq!(count_words("  leading and trailing  "), 3);
    }
}
```

Now run:

```bash
cargo test
```

You will see:

```text
running 3 tests
test tests::empty_string_has_zero_words ... ok
test tests::whitespace_only_has_zero_words ... ok
test tests::counts_words_separated_by_any_whitespace ... ok

test result: ok. 3 passed; 0 failed; 0 ignored
```

Three things just happened that deserve noting:

- **`#[cfg(test)]`** compiles the inner module <em>only</em> when `cargo test` runs. In a normal `cargo build` the tests add zero bytes to your binary.
- **`use super::*;`** pulls the function under test into the test module. The module is a sibling, not a parent, so this imports up and over.
- **The assertion macros** (`assert_eq!`, `assert_ne!`, `assert!`) print the actual and expected values on failure — far more useful than a bare boolean.

<div class="ferris-says" data-variant="warning">
<p>If you find yourself writing "a test that spins up a real HTTP server to verify one line of logic", step back. The pattern above — extract a pure function and unit-test it next to its definition — covers 80% of real-world testing needs and keeps the feedback loop sub-second.</p>
</div>

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
