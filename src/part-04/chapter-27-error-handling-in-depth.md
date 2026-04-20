# Chapter 27: Error Handling in Depth
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href=\"../part-02/chapter-14-option-result-and-rusts-error-philosophy.md\">Ch 14: Option &amp; Result</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li><code>thiserror</code> for libraries vs <code>anyhow</code> for apps</li><li>Error propagation chains with <code>?</code> + <code>From</code></li><li>When to panic vs when to propagate</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">35<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>
<div class="concept-link builds-on"><div class="concept-link-icon">←</div><div class="concept-link-body"><strong>Builds on Chapter 14</strong>Ch 14 introduced <code>Option</code> and <code>Result</code>. This chapter goes deeper: library vs application error design, <code>thiserror</code> vs <code>anyhow</code>, and how <code>?</code> chains <code>From</code> conversions.<a href=\"../part-02/chapter-14-option-result-and-rusts-error-philosophy.md\">Revisit Ch 14 →</a></div></div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--error);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Audience Split</div><h2 class="visual-figure__title">Library Errors and Application Errors Serve Different Readers</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Split diagram comparing structured library error enums with anyhow-style application errors and context"><rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(214,40,40,0.16)"></rect><rect x="56" y="88" width="186" height="232" rx="18" fill="#fff1eb" stroke="#e63946" stroke-width="3"></rect><text x="106" y="122" class="svg-small" style="fill:#8f2430;">library</text><text x="78" y="156" class="svg-small" style="fill:#8f2430;">enum ConfigError { ... }</text><text x="78" y="186" class="svg-small" style="fill:#8f2430;">matchable variants</text><text x="78" y="216" class="svg-small" style="fill:#8f2430;">stable public contract</text><rect x="298" y="88" width="186" height="232" rx="18" fill="#eef2ff" stroke="#3a86ff" stroke-width="3"></rect><text x="342" y="122" class="svg-small" style="fill:#1e40af;">application</text><text x="324" y="156" class="svg-small" style="fill:#1e40af;">anyhow::Result&lt;T&gt;</text><text x="324" y="186" class="svg-small" style="fill:#1e40af;">.context(\"while ...\")</text><text x="324" y="216" class="svg-small" style="fill:#1e40af;">operator-facing story</text></svg></div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--error);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Propagation Chain</div><h2 class="visual-figure__title"><code>?</code> Plus <code>From</code> Plus Context</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Error propagation flow showing lower-level error converted upward and annotated with context"><rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect><rect x="170" y="56" width="200" height="46" rx="14" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect><text x="214" y="84" class="svg-small" style="fill:#dbeafe;">fs::read_to_string</text><path d="M270 102 V 146" stroke="#3a86ff" stroke-width="5"></path><rect x="152" y="146" width="236" height="48" rx="16" fill="#231942" stroke="#8338ec" stroke-width="3"></rect><text x="220" y="175" class="svg-small" style="fill:#efe8ff;">? operator</text><path d="M270 194 V 238" stroke="#8338ec" stroke-width="5"></path><path d="M270 238 L 148 302 M270 238 L 392 302" stroke="#8338ec" stroke-width="5" fill="none"></path><rect x="80" y="302" width="136" height="54" rx="16" fill="#123e2e" stroke="#52b788"></rect><text x="118" y="334" class="svg-small" style="fill:#d9fbe9;">Ok path</text><rect x="324" y="302" width="136" height="54" rx="16" fill="#3a1c17" stroke="#e63946"></rect><text x="358" y="334" class="svg-small" style="fill:#ffd8cc;">Err path</text><text x="316" y="382" class="svg-small" style="fill:#fff3c4;">Err path may use From conversion first, then bubble upward with added context</text></svg></div>
  </figure>
</div>

## Step 1 - The Problem

Systems programs fail constantly:

- files do not exist
- config is malformed
- networks timeout
- upstream services misbehave
- user input is invalid

The design problem is not "how do I avoid failure?" It is "how do I represent failure in a way that callers can reason about, recover from when possible, and diagnose when not?"

Exceptions hide control flow. Error codes are easy to ignore. Rust chose typed error values.

## Step 2 - Rust's Design Decision

Rust uses:

- `Option<T>` for absence that is not exceptional
- `Result<T, E>` for operations that can fail with meaningful error information
- `?` for ergonomic propagation

The ecosystem then layered:

- `thiserror` for library-quality error types
- `anyhow` for application-level ergonomic propagation and context

Rust accepted:

- visible error paths
- more types

Rust refused:

- invisible throws
- unchecked null as failure signaling

## Step 3 - The Mental Model

Plain English rule:

- libraries should usually expose structured errors
- applications should usually add context and propagate errors ergonomically

## Step 4 - Minimal Code Example

```rust
use std::fs;
use std::io;

fn load(path: &str) -> Result<String, io::Error> {
    let content = fs::read_to_string(path)?;
    Ok(content)
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `read_to_string` returns `Result<String, io::Error>`.
2. `?` matches on the result.
3. If `Ok(content)`, execution continues with the unwrapped `String`.
4. If `Err(e)`, the function returns early with `Err(e)`.

That is the core desugaring idea. `?` is not magical exception syntax. It is structured early return through the `Try`-style machinery around `Result` and related types.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Rust makes failure visible in the type system, so callers cannot pretend something never fails if it actually can.

</div>
<div class="level-panel" data-level="Engineer">

Use:

- custom `enum` error types in libraries
- `thiserror` to reduce boilerplate
- `anyhow::Result` in apps, binaries, and top-level orchestration code
- `.context(...)` to attach actionable operational detail

Avoid `unwrap` in production paths unless you are asserting an invariant so strong that a panic is truly the right failure mode.

</div>
<div class="level-panel" data-level="Deep Dive">

Typed errors are part of API design. They say what can go wrong, what can be matched on, and where recovery is possible. `From<E>` integration lets `?` convert lower-level errors into higher-level structured ones. Context chains matter in production because the original low-level error alone often does not explain which operation failed semantically.

</div>
</div>


## `thiserror` vs `anyhow`

Library-style:

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("failed to read config file: {0}")]
    Io(#[from] std::io::Error),
    #[error("invalid config format: {0}")]
    Parse(String),
}
```

Application-style:

```rust
use anyhow::{Context, Result};

fn start() -> Result<()> {
    let text = std::fs::read_to_string("config.toml")
        .context("while reading startup config")?;
    let _ = text;
    Ok(())
}
```

The split exists because libraries and applications have different audiences:

- libraries are consumed programmatically
- applications are operated by humans

## When to Panic

Panic is appropriate when:

- an internal invariant is broken
- test code expects a failure
- a prototype or one-off script prioritizes speed over resilience

Panic is a poor substitute for expected error handling. "File missing" and "user provided bad input" are not panics in serious software.

## Step 7 - Common Misconceptions

Wrong model 1: "`unwrap()` is okay because I know this cannot fail."

Correction: maybe. But if that claim matters, consider making the invariant explicit or using `expect` with a meaningful message.

Wrong model 2: "`anyhow` is the best error type everywhere."

Correction: great for apps, poor as the main public error surface of reusable libraries.

Wrong model 3: "Error enums are just boilerplate."

Correction: they are part of your API contract and recovery model.

Wrong model 4: "Context is redundant because the original error is already there."

Correction: the original error often lacks the operation-level story humans need.

## Step 8 - Real-World Pattern

Strong Rust libraries expose:

- precise error enums
- `From` conversions for lower-level failures
- stable `Display` text

Strong Rust binaries add context at operational boundaries:

- reading config
- starting listeners
- connecting to databases
- parsing input files

This split shows up clearly in `thiserror` and `anyhow` usage across the ecosystem.

## Step 9 - Practice Block

### Code Exercise

Design a `CliError` enum for a file-processing tool and decide which variants should wrap `std::io::Error`, parse errors, and user-input validation failures.

### Code Reading Drill

Explain what `?` does here and what type conversion it may trigger:

```rust
let cfg: Config = serde_json::from_str(&text)?;
```

### Spot the Bug

Why is this weak error handling for a library?

```rust
pub fn parse(data: &str) -> anyhow::Result<Model> {
    let model = serde_json::from_str(data)?;
    Ok(model)
}
```

### Refactoring Drill

Take code with repeated `map_err(|e| ...)` boilerplate and redesign the error type with `From` conversions or `thiserror`.

### Compiler Error Interpretation

If `?` fails because `From<LowerError>` is not implemented for your error type, translate that as: "the propagation path is missing a conversion contract."

## Step 10 - Contribution Connection

After this chapter, you can read and improve:

- error enums
- propagation chains
- operational context messages
- panic-versus-result decisions

Good first PRs include:

- replacing stringly-typed errors with enums
- adding `context` to top-level app failures
- removing `unwrap` from expected-failure paths

## In Plain English

Rust treats failure as data you must account for, not as invisible control flow. That matters because production software fails in many normal ways, and good software says clearly what failed, where, and whether the caller can do anything about it.

## What Invariant Is Rust Protecting Here?

Failure paths must remain explicit and type-checked so callers cannot silently ignore or misunderstand what can go wrong.

## If You Remember Only 3 Things

- Libraries usually want structured error types; applications usually want ergonomic propagation plus context.
- `?` is typed early return, not invisible exception handling.
- Panic is for broken invariants and truly unrecoverable conditions, not ordinary operational failures.

## Memory Hook

An error type is a shipping label on failure. If the label is vague, the package still arrives broken, but nobody knows where it came from or what to do next.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is `Result<T, E>` for? | Operations that can fail with structured error information. |
| What does `?` do? | Propagates `Err` early or unwraps `Ok` on the success path. |
| When is `thiserror` usually appropriate? | For library-facing structured error types. |
| When is `anyhow` usually appropriate? | For application-level orchestration and ergonomic propagation. |
| Why is context important? | It explains which higher-level operation failed, not just the low-level cause. |
| When is panic appropriate? | Broken invariants, tests, or truly unrecoverable states. |
| Why are string-only error types weak? | They are hard to match on, compose, and reason about programmatically. |
| What missing trait often breaks `?` propagation? | `From<LowerError>` for the target error type. |

## Chapter Cheat Sheet

| Need | Prefer | Why |
|---|---|---|
| Expected absence | `Option<T>` | not every miss is an error |
| Recoverable failure | `Result<T, E>` | explicit typed failure path |
| Library error surface | `thiserror` + enum | matchable public contract |
| App top-level error plumbing | `anyhow::Result` + context | ergonomic operations |
| Assertion of impossible state | `panic!` or `expect` | invariant failure |

---
