# Chapter 44: Type-Driven API Design

<div class="ferris-says" data-variant="insight">
<p>Type-driven API design: when the types say so much that the docs become a polite formality. Typestate, sealed traits, newtypes, builder phases. This is where Rust starts feeling like a design tool instead of a programming language.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-04/chapter-25-traits-rusts-core-abstraction.md">Ch 25: Traits</a><a href="../part-04/chapter-26-generics-and-associated-types.md">Ch 26: Generics</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Typestate pattern: compile-time state machines</li><li>Newtype pattern for semantic wrapper types</li><li>Making illegal states unrepresentable</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">35<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--ownership);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Illegal States</div><h2 class="visual-figure__title">Raw Inputs vs Meaningful Types</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Comparison between a loose API with raw strings and a typed API with validated newtypes and enum states">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(230,57,70,0.16)"></rect>
        <rect x="52" y="78" width="176" height="250" rx="18" fill="#fff1eb" stroke="#d62828" stroke-width="3"></rect>
        <text x="94" y="112" class="svg-small" style="fill:#a21d1d;">Loose API</text>
        <text x="80" y="150" class="svg-small" style="fill:#a21d1d;">create_user(id: String, role: String)</text>
        <text x="80" y="188" class="svg-small" style="fill:#a21d1d;">empty id?</text>
        <text x="80" y="216" class="svg-small" style="fill:#a21d1d;">typo in role?</text>
        <text x="80" y="244" class="svg-small" style="fill:#a21d1d;">validation repeated?</text>
        <text x="80" y="288" class="svg-small" style="fill:#a21d1d;">caller can construct nonsense</text>
        <path d="M248 204 H 300" stroke="#e63946" stroke-width="6"></path>
        <rect x="300" y="78" width="188" height="250" rx="18" fill="#edf8f1" stroke="#52b788" stroke-width="3"></rect>
        <text x="338" y="112" class="svg-small" style="fill:#1f6f4d;">Typed API</text>
        <text x="326" y="150" class="svg-small" style="fill:#1f6f4d;">UserId::parse(...)</text>
        <text x="326" y="178" class="svg-small" style="fill:#1f6f4d;">Role::{Admin, Member}</text>
        <text x="326" y="206" class="svg-small" style="fill:#1f6f4d;">Post&lt;Draft&gt; -&gt; Post&lt;Published&gt;</text>
        <text x="326" y="234" class="svg-small" style="fill:#1f6f4d;">methods exist only when valid</text>
        <text x="326" y="288" class="svg-small" style="fill:#1f6f4d;">invariants live in the type system</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--ownership);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Typestate Builder</div><h2 class="visual-figure__title">Construction as a Compile-Time State Machine</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="State machine showing builder states from missing host and port to buildable configuration">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="42" y="156" width="132" height="92" rx="18" fill="#3a1c17" stroke="#e76f51" stroke-width="3"></rect>
        <text x="68" y="192" class="svg-small" style="fill:#ffd8cc;">Missing host</text>
        <text x="68" y="218" class="svg-small" style="fill:#ffd8cc;">Missing port</text>
        <path d="M174 202 H 236" stroke="#fb8500" stroke-width="6"></path>
        <rect x="236" y="92" width="132" height="92" rx="18" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect>
        <text x="266" y="128" class="svg-small" style="fill:#dbeafe;">Present host</text>
        <text x="266" y="154" class="svg-small" style="fill:#dbeafe;">Missing port</text>
        <path d="M302 184 V 238" stroke="#fb8500" stroke-width="6"></path>
        <rect x="236" y="238" width="132" height="92" rx="18" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect>
        <text x="266" y="274" class="svg-small" style="fill:#d9fbe9;">Present host</text>
        <text x="266" y="300" class="svg-small" style="fill:#d9fbe9;">Present port</text>
        <path d="M368 284 H 430" stroke="#52b788" stroke-width="6"></path>
        <rect x="430" y="238" width="68" height="92" rx="18" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect>
        <text x="448" y="286" class="svg-small" style="fill:#8f5d00;">build</text>
        <text x="64" y="360" class="svg-small" style="fill:#fff3c4;">missing required data means the final method does not exist yet</text>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem

Many APIs are technically usable but semantically sloppy.

They accept raw strings where only validated identifiers make sense. They expose constructors that allow missing required fields. They let methods be called in illegal orders. They return large unstructured bags of state that callers must interpret correctly by convention.

Other languages often solve this with runtime validation alone. That is necessary, but it leaves misuse discoverable only after the program is already running.

Rust pushes you to ask a better question:

which invalid states can be made unrepresentable before runtime?

## Step 2 - Rust's Design Decision

Rust leans on the type system as an API design tool, not only a memory-safety tool.

That leads to patterns like:

- newtypes for semantic distinction
- typestate for state transitions
- builders for staged construction
- enums for closed sets of valid cases
- hidden fields and smart constructors for validated invariants

Rust accepted:

- more types
- more explicit conversion points
- a little more verbosity in exchange for much less semantic ambiguity

Rust refused:

- "just pass strings everywhere"
- constructors that allow impossible or half-formed values by default
- public APIs whose real rules live only in README prose

## Step 3 - The Mental Model

Plain English rule: if misuse is predictable, try to make it impossible or awkward at the type level instead of merely warning about it in docs.

The goal is not maximal type cleverness. The goal is to put the invariant where the compiler can help enforce it.

## Step 4 - Minimal Code Example

```rust
use std::marker::PhantomData;

struct Draft;
struct Published;

struct Post<State> {
    title: String,
    _state: PhantomData<State>,
}

impl Post<Draft> {
    fn new(title: String) -> Self {
        Self {
            title,
            _state: PhantomData,
        }
    }

    fn publish(self) -> Post<Published> {
        Post {
            title: self.title,
            _state: PhantomData,
        }
    }
}

impl Post<Published> {
    fn slug(&self) -> String {
        self.title.to_lowercase().replace(' ', "-")
    }
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `Post<State>` encodes state in the type parameter, not in a runtime enum field.
2. `Post<Draft>::new` constructs only draft posts.
3. `publish(self)` consumes the draft, preventing reuse of the old state.
4. The returned value is `Post<Published>`, which has a different method set.
5. `slug()` exists only on published posts, so calling it on a draft is a compile error.

The invariant is simple and powerful:

a draft cannot accidentally be used as if publication already happened.

This is the essential typestate move. State transitions become type transitions.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

The type of the value tells you what stage it is in. If an operation is only valid in one stage, put that method only on that stage's type.

</div>
<div class="level-panel" data-level="Engineer">

Type-driven APIs are most valuable when:

- bad inputs are common and costly
- operation order matters
- construction has required steps
- public libraries need clear contracts

But do not encode every business rule in the type system. Use types for durable, structural invariants. Use runtime validation for dynamic facts.

</div>
<div class="level-panel" data-level="Deep Dive">

Type-driven API design is about preserving invariants at module boundaries. Every public constructor, method, and trait impl either preserves or weakens those invariants.

Good libraries create narrow, explicit conversion points:

- parse and validate once
- represent the validated state distinctly
- make illegal transitions impossible through ownership and types

This reduces downstream branching, error handling, and misuse.

</div>
</div>


## Newtypes

Newtypes are the cheapest high-leverage move in API design.

```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct UserId(String);

impl UserId {
    pub fn parse(input: impl Into<String>) -> Result<Self, String> {
        let input = input.into();
        if input.is_empty() {
            return Err("user id cannot be empty".to_string());
        }
        Ok(Self(input))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

Why use a newtype instead of raw `String`?

- prevents argument confusion
- centralizes validation
- allows trait impls on your domain concept
- keeps future evolution space

## Builders and Typestate Builders

Ordinary builders improve ergonomics. Typestate builders improve ergonomics and validity.

```rust
use std::marker::PhantomData;

struct Missing;
struct Present;

struct ConfigBuilder<Host, Port> {
    host: Option<String>,
    port: Option<u16>,
    _host: PhantomData<Host>,
    _port: PhantomData<Port>,
}

impl ConfigBuilder<Missing, Missing> {
    fn new() -> Self {
        Self {
            host: None,
            port: None,
            _host: PhantomData,
            _port: PhantomData,
        }
    }
}

impl<Port> ConfigBuilder<Missing, Port> {
    fn host(self, host: String) -> ConfigBuilder<Present, Port> {
        ConfigBuilder {
            host: Some(host),
            port: self.port,
            _host: PhantomData,
            _port: PhantomData,
        }
    }
}

impl<Host> ConfigBuilder<Host, Missing> {
    fn port(self, port: u16) -> ConfigBuilder<Host, Present> {
        ConfigBuilder {
            host: self.host,
            port: Some(port),
            _host: PhantomData,
            _port: PhantomData,
        }
    }
}
```

The exact syntax can get heavy, so use this pattern where missing fields would be meaningfully dangerous or common. Not every config struct needs compile-time staged construction.

## API Surface and `impl Trait`

Strong APIs are also disciplined about what they expose.

Rules of thumb:

- accept flexible inputs: `impl AsRef<Path>`, `impl Into<String>`
- return specific or opaque outputs intentionally
- avoid exposing concrete iterator or future types unless callers benefit
- keep helper modules and extension traits private until you are ready to support them semantically

Return-position `impl Trait` is especially useful for hiding noisy concrete combinator types without paying for trait objects.

## Designing for Downstream Composability

A strong Rust library does not only enforce invariants. It composes.

That usually means:

- implementing standard traits where semantics fit
- borrowing where possible
- cloning only where justified
- exposing iterators instead of forcing collection allocation
- giving callers structured error types

The advanced insight is this:

an API is not "ergonomic" just because the call site is short. It is ergonomic when the downstream user can integrate it into real code without fighting ownership, typing, or semver surprises.

## Step 7 - Common Misconceptions

Wrong model 1: "More types always means better API design."

Correction: more types are good only when they represent real invariants or semantic distinctions.

Wrong model 2: "Builder pattern is always the ergonomic answer."

Correction: builders are great for many optional fields. For two required fields, a normal constructor may be clearer.

Wrong model 3: "Typestate is overkill in all application code."

Correction: sometimes yes, but when order and stage are central invariants, typestate is exactly the right tool.

Wrong model 4: "Returning `String` everywhere is flexible."

Correction: it is flexible for the API author and expensive for the API user, who now must remember meaning by convention.

## Step 8 - Real-World Pattern

You see type-driven API design all over the Rust ecosystem:

- `std::num::NonZeroUsize` encodes a numeric invariant
- HTTP crates distinguish methods, headers, and status codes with domain types
- builder APIs are common in clients and configuration-heavy libraries
- `clap` uses typed parsers and derive-driven declarations instead of raw argument maps

The pattern is consistent: strong libraries move recurring mistakes out of runtime branches and into types, constructors, and method availability.

## Step 9 - Practice Block

### Code Exercise

Wrap raw email strings in a validated `EmailAddress` newtype. Decide which traits to implement and why.

### Code Reading Drill

Explain what invariant this API is trying to encode:

```rust
enum Connection {
    Disconnected,
    Connected(SocketAddr),
}
```

Then explain when a typestate version would be better.

### Spot the Bug

Why is this API semantically weak?

```rust
fn create_user(id: String, role: String, active: bool) -> Result<(), String> {
    Ok(())
}
```

### Refactoring Drill

Take a config constructor with seven positional arguments and redesign it using either a builder or a validated input struct. Explain your choice.

### Compiler Error Interpretation

If a method is "not found" on `Post<Draft>`, translate it as: "this operation is intentionally not part of the draft state's API surface."

## Step 10 - Contribution Connection

After this chapter, you can read and shape:

- public constructors and builders
- domain newtypes and validation layers
- method sets that differ by state or capability
- ergonomic iterator- and error-returning APIs

Good first PRs include:

- replacing raw strings and booleans with domain types
- tightening constructors around required invariants
- reducing semantically vague public function signatures

## In Plain English

Good Rust APIs make the right thing natural and the wrong thing awkward or impossible. That matters to systems engineers because production bugs often come from valid-looking calls that should never have been valid in the first place.

## What Invariant Is Rust Protecting Here?

Public values and transitions should preserve domain meaning: invalid combinations, illegal orderings, and ambiguous raw representations should be blocked or isolated at construction boundaries.

## If You Remember Only 3 Things

- Newtypes are the cheapest way to add domain meaning and validation.
- Typestate is for APIs where stage and operation order are part of the invariant.
- Ergonomics is not only short syntax; it is downstream composability without ambiguity.

## Memory Hook

A good API is a hallway with the wrong doors bricked shut. Callers should not need a warning sign where a wall would do.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is the point of a newtype? | To add semantic distinction, validation boundaries, and trait control to an underlying representation. |
| What does typestate encode? | Valid states and transitions in the type system. |
| When is a builder preferable to a constructor? | When construction has many optional fields or named-step ergonomics matter. |
| What is a typestate builder for? | Enforcing required construction steps at compile time. |
| Why use `impl AsRef<Path>` or `impl Into<String>` in inputs? | To accept flexible caller inputs without forcing one concrete type. |
| Why might return-position `impl Trait` improve an API? | It hides a noisy concrete type while preserving static dispatch. |
| What is a sign that a public function signature is semantically weak? | It uses many raw primitives or booleans that rely on call-site convention. |
| What does "downstream composability" mean in API design? | Callers can integrate the API cleanly into real code without fighting ownership, allocation, or missing trait support. |

## Chapter Cheat Sheet

| Problem | Pattern | Benefit |
|---|---|---|
| Raw primitive has domain meaning | newtype | validation and semantic clarity |
| Method order matters | typestate | illegal transitions become compile errors |
| Many optional fields | builder | readable construction |
| Required steps in construction | typestate builder | compile-time completeness |
| Complex returned iterator/future type | return `impl Trait` | hide noise, keep performance |

---
