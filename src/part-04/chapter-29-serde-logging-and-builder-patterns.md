# Chapter 29: Serde, Logging, and Builder Patterns

## Step 1 - The Problem

Real applications spend huge amounts of time doing three practical things:

- moving data across serialization boundaries
- explaining what the system is doing
- constructing configuration-rich objects safely

The naive versions are easy to write and hard to maintain:

- hand-written serialization glue
- unstructured log strings
- constructors with seven positional arguments

## Step 2 - Rust's Design Decision

The ecosystem standardized around:

- `serde` for serialization and deserialization
- `tracing` for structured diagnostics
- builders for readable staged construction

Rust accepted:

- derive macros and supporting crate conventions
- a little extra ceremony for observability and configuration

Rust refused:

- stringly-typed logging as the main observability story
- giant constructor signatures as the default interface for complex types

## Step 3 - The Mental Model

Plain English rule:

- `serde` turns Rust types into data formats and back
- `tracing` records structured events and spans, not just strings
- builders make complex construction readable and safer

## Step 4 - Minimal Code Example

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    host: String,
    port: u16,
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

`#[derive(Serialize, Deserialize)]` runs procedural macros that generate impls of the `serde` traits for `Config`.

The field names and types become part of the serialization contract unless further customized with serde attributes.

That means this derive is not just convenience. It is a statement about how data crosses process or persistence boundaries.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Serde saves you from manually turning structs into JSON, TOML, YAML, and other formats.

### Level 2 - Engineer

Serde is at its best when your Rust types already reflect the domain shape well. Attributes like `default`, `rename`, and `skip_serializing_if` let you keep the external wire format stable while evolving internal types carefully.

Structured logging with `tracing` is similarly powerful because fields become queryable and filterable instead of getting trapped inside free-form messages.

Builders are valuable when object construction needs defaults, optional fields, or validation at the final step.

### Level 3 - Systems

Serialization is an ABI of sorts for data. Once a type is persisted, sent over the network, or documented as config, its serde behavior becomes part of the operational contract.

Structured logs are also data contracts. If you log `user_id`, `request_id`, and latency as fields, downstream tooling can filter and aggregate them. If you hide all of that in one formatted string, you gave up machine usefulness for convenience.

## Serde Attributes and Customization

```rust
use serde::{Deserialize, Serialize};

fn default_port() -> u16 {
    8080
}

#[derive(Debug, Serialize, Deserialize)]
struct Settings {
    host: String,
    #[serde(default = "default_port")]
    port: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    tls_cert: Option<String>,
}
```

Custom impls are worth the effort when:

- validation and decoding must happen together
- external formats are irregular
- backwards compatibility requires translation logic

## `tracing` vs `log`

`log` is a thin facade for textual levels.
`tracing` models events and spans with fields.

That difference matters in distributed and async systems:

- spans can represent request lifetimes
- events can attach typed structured fields
- subscribers can export to observability backends

Example:

```rust
use tracing::{info, instrument};

#[instrument(skip(secret))]
fn login(user: &str, secret: &str) {
    info!(user, "login attempt");
}
```

The skip list itself is a design statement: observability should not leak secrets.

## Builders and Typestate Builders

Ordinary builder:

```rust
struct ServerConfig {
    host: String,
    port: u16,
    tls: bool,
}

struct ServerConfigBuilder {
    host: String,
    port: u16,
    tls: bool,
}

impl ServerConfigBuilder {
    fn new(host: impl Into<String>) -> Self {
        Self { host: host.into(), port: 8080, tls: false }
    }

    fn port(mut self, port: u16) -> Self {
        self.port = port;
        self
    }

    fn tls(mut self, tls: bool) -> Self {
        self.tls = tls;
        self
    }

    fn build(self) -> ServerConfig {
        ServerConfig { host: self.host, port: self.port, tls: self.tls }
    }
}
```

Use a typestate builder when required steps matter strongly enough to justify the extra generic machinery. Otherwise, ordinary builders usually hit the sweet spot.

## Step 7 - Common Misconceptions

Wrong model 1: "Serde derive is just boilerplate reduction."

Correction: it defines real data-boundary behavior and becomes part of your contract.

Wrong model 2: "Logging is just printf with levels."

Correction: in modern systems, observability depends on structured fields and spans.

Wrong model 3: "Builders are always overkill."

Correction: not when constructors become unreadable or configuration defaults matter.

Wrong model 4: "More builder methods automatically mean better API design."

Correction: builders should still preserve invariants and avoid meaningless combinations.

## Step 8 - Real-World Pattern

Across the Rust ecosystem:

- `serde` powers config, wire formats, and persistence layers
- `tracing` powers async and service observability
- builder APIs appear in clients, configs, and request construction

The common thread is contract clarity: data shape, diagnostic shape, and construction shape all become explicit.

## Step 9 - Practice Block

### Code Exercise

Design a config type with:

- defaults
- one optional field
- one renamed serialized field

Then explain what became part of the external data contract.

### Code Reading Drill

What will and will not be logged here?

```rust
#[instrument(skip(password))]
fn login(user: &str, password: &str) {}
```

### Spot the Bug

Why is this constructor a maintenance hazard?

```rust
fn new(host: String, port: u16, tls: bool, retries: usize, timeout_ms: u64, log_json: bool) -> Self
```

### Refactoring Drill

Take a struct with many optional settings and redesign it with a builder. Explain whether a typestate builder is justified.

### Compiler Error Interpretation

If serde derive fails because one field type does not implement `Serialize` or `Deserialize`, translate that as: "my outer data contract depends on a field whose own contract is missing."

## Step 10 - Contribution Connection

After this chapter, you can read and improve:

- config loading layers
- API request and response models
- structured instrumentation
- builder-style client configuration

Good first PRs include:

- adding serde defaults and skip rules thoughtfully
- converting free-form logs to structured tracing fields
- replacing huge constructors with builders

## In Plain English

Applications need to move data around, explain what they are doing, and construct complex objects without confusion. Rust's ecosystem gives strong tools for all three, but they work well only when you treat them as contracts rather than shortcuts.

## What Invariant Is Rust Protecting Here?

Serialized data, diagnostic fields, and staged construction should preserve clear, machine-usable structure rather than relying on ad hoc string conventions or fragile positional arguments.

## If You Remember Only 3 Things

- Serde derives are part of your external data contract.
- `tracing` is about structured events and spans, not prettier `println!`.
- Builders are for readability and invariant-preserving construction, not only for style.

## Memory Hook

Serde is the shipping crate label. Tracing is the flight recorder. A builder is the assembly jig. Each exists because structure beats improvisation when systems get large.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does serde derive generate? | Implementations of `Serialize` and/or `Deserialize` for the type. |
| Why can serde attributes matter operationally? | They shape the external config or wire-format contract. |
| What does `tracing` add beyond plain logging? | Structured fields and spans for machine-usable observability. |
| Why use `#[instrument(skip(...))]`? | To record useful context while avoiding sensitive or noisy fields. |
| When is a builder better than a constructor? | When there are many options, defaults, or readability concerns. |
| What is a typestate builder for? | Enforcing required construction steps at compile time. |
| Why are positional mega-constructors risky? | They are easy to misuse and hard to read or evolve safely. |
| What does it mean for logs to be structured? | Important fields are recorded separately, not buried in one string. |

## Chapter Cheat Sheet

| Need | Tool | Why |
|---|---|---|
| Serialize config or payload | `serde` derive | standard data contract |
| Add defaults or field control | serde attributes | external-format customization |
| Structured diagnostics | `tracing` | fields and spans |
| Complex object construction | builder | readable staged config |
| Compile-time required builder steps | typestate builder | stronger construction invariant |

---
