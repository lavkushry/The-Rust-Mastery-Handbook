# Chapter 27: Error Handling in Depth

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

### Level 1 - Beginner

Rust makes failure visible in the type system, so callers cannot pretend something never fails if it actually can.

### Level 2 - Engineer

Use:

- custom `enum` error types in libraries
- `thiserror` to reduce boilerplate
- `anyhow::Result` in apps, binaries, and top-level orchestration code
- `.context(...)` to attach actionable operational detail

Avoid `unwrap` in production paths unless you are asserting an invariant so strong that a panic is truly the right failure mode.

### Level 3 - Systems

Typed errors are part of API design. They say what can go wrong, what can be matched on, and where recovery is possible. `From<E>` integration lets `?` convert lower-level errors into higher-level structured ones. Context chains matter in production because the original low-level error alone often does not explain which operation failed semantically.

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
    Ok(todo!())
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
