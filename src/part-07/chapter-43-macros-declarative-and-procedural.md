# Chapter 43: Macros, Declarative and Procedural
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-04/chapter-25-traits-rusts-core-abstraction.md">Ch 25: Traits</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li><code>macro_rules!</code> for pattern-based code generation</li><li>Procedural macros: derive, attribute, function-like</li><li>When macros help vs when they obscure</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">45<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--compiler);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Expansion Pipeline</div><h2 class="visual-figure__title">Where Macros Sit in the Compiler</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Compiler pipeline showing source tokens through macro expansion into type checking and MIR">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="60" y="74" width="420" height="54" rx="16" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect>
        <text x="178" y="108" class="svg-small" style="fill:#dbeafe;">source tokens and macro invocations</text>
        <path d="M270 128 V 170" stroke="#3a86ff" stroke-width="6"></path>
        <rect x="108" y="170" width="324" height="62" rx="18" fill="#231942" stroke="#8338ec" stroke-width="3"></rect>
        <text x="180" y="204" class="svg-small" style="fill:#efe8ff;">macro_rules! match or proc-macro parse</text>
        <path d="M270 232 V 274" stroke="#8338ec" stroke-width="6"></path>
        <rect x="120" y="274" width="300" height="56" rx="18" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect>
        <text x="194" y="308" class="svg-small" style="fill:#d9fbe9;">expanded Rust code</text>
        <path d="M270 330 V 356" stroke="#52b788" stroke-width="6"></path>
        <text x="140" y="382" class="svg-small" style="fill:#fff3c4;">type checking, borrow checking, and MIR happen after expansion</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure" style="--chapter-accent: var(--compiler);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Proc-Macro Families</div><h2 class="visual-figure__title">Derive, Attribute, and Function-Like Macros</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Three procedural macro families feeding through syn and quote back into generated tokens">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(2,62,138,0.16)"></rect>
        <rect x="48" y="82" width="126" height="64" rx="16" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect>
        <text x="82" y="118" class="svg-small" style="fill:#023e8a;">#[derive]</text>
        <rect x="208" y="82" width="126" height="64" rx="16" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect>
        <text x="238" y="118" class="svg-small" style="fill:#023e8a;">#[instrument]</text>
        <rect x="368" y="82" width="126" height="64" rx="16" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect>
        <text x="392" y="118" class="svg-small" style="fill:#023e8a;">sql!(...)</text>
        <path d="M112 146 V 194 M272 146 V 194 M432 146 V 194" stroke="#023e8a" stroke-width="5"></path>
        <rect x="152" y="194" width="236" height="72" rx="18" fill="#f3f0ff" stroke="#8338ec" stroke-width="3"></rect>
        <text x="238" y="224" class="svg-small" style="fill:#5c2bb1;">syn</text>
        <text x="214" y="248" class="svg-small" style="fill:#5c2bb1;">parse tokens into syntax</text>
        <path d="M270 266 V 304" stroke="#8338ec" stroke-width="5"></path>
        <rect x="164" y="304" width="212" height="58" rx="16" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect>
        <text x="242" y="338" class="svg-small" style="fill:#8f5d00;">quote!</text>
        <text x="112" y="388" class="svg-small" style="fill:#6b7280;">good proc macros create clear generated code and readable errors</text>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem

Some code duplication is accidental. Some is structural. Functions and generics remove a lot of repetition, but not all of it.

You need macros when the repeated thing is not just "do the same work for many types" but:

- accept variable syntax
- generate items or impls
- manipulate tokens before type checking
- remove boilerplate that the language cannot abstract with ordinary functions

Without macros, crates like `serde`, `clap`, `thiserror`, and `tracing` would be dramatically more verbose or much less ergonomic.

The danger is obvious too. Macros can make APIs delightful for users and miserable for maintainers if used without discipline.

## Step 2 - Rust's Design Decision

Rust has two macro systems because there are two different abstraction problems.

- `macro_rules!` for pattern-based token rewriting
- procedural macros for arbitrary token-stream transformations in Rust code

Rust accepted:

- a separate metaprogramming surface
- compile-time cost
- more complicated debugging when macros are overused

Rust refused:

- unrestricted textual substitution like the C preprocessor
- unhygienic macro systems by default
- giving up type-driven APIs just because some code generation is convenient

## Step 3 - The Mental Model

Plain English rule:

- use functions when ordinary values are the abstraction
- use generics when types are the abstraction
- use macros when syntax itself is the abstraction

For procedural macros:

they are compile-time programs that receive tokens and emit tokens.

## Step 4 - Minimal Code Example

```rust
macro_rules! hashmap_lite {
    ($( $key:expr => $value:expr ),* $(,)?) => {{
        let mut map = std::collections::HashMap::new();
        $( map.insert($key, $value); )*
        map
    }};
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

The compiler processes a `macro_rules!` invocation before normal type checking of the expanded code.

For:

```rust
let ports = hashmap_lite! {
    "http" => 80,
    "https" => 443,
};
```

the compiler roughly does this:

1. match the invocation tokens against the macro pattern
2. bind `$key` and `$value` for each repeated pair
3. emit the corresponding `HashMap` construction code
4. type-check the expanded Rust normally

This explains an important fact: macros do not replace the type system. They generate input for it.

Hygiene matters here too. Identifiers introduced by the macro are tracked so they do not accidentally capture or get captured by names in the caller's scope in surprising ways.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Macros write code for you at compile time. They are useful when normal functions cannot express the shape of what you want.

</div>
<div class="level-panel" data-level="Engineer">

Prefer ordinary code first. Reach for `macro_rules!` when you need:

- repetition over syntax patterns
- a mini-DSL
- generated items
- ergonomics like `vec![]` or `format!()`

Reach for procedural macros when you need to inspect or generate Rust syntax trees, especially for derive-style APIs.

</div>
<div class="level-panel" data-level="Deep Dive">

Macros sit before or alongside later compiler phases. Declarative macros operate on token trees, not typed AST nodes. Procedural macros also operate before type checking, though they can parse tokens into richer syntax structures using crates like `syn`.

That placement explains both their power and their weakness:

- power: they can generate impls and syntax the language cannot abstract directly
- weakness: they know nothing about types unless they encode conventions themselves

</div>
</div>


## `macro_rules!`, Hygiene, and Repetition

Useful fragment specifiers include:

| Fragment | Meaning |
|---|---|
| `expr` | expression |
| `ident` | identifier |
| `ty` | type |
| `path` | path |
| `item` | item |
| `tt` | token tree |

And repetition patterns like:

```rust
$( ... ),*
$( ... );+
```

let you build flexible syntax surfaces without writing a parser.

Hygiene is why a temporary variable inside a macro usually does not collide with a variable of the same textual name at the call site. Rust chose this because predictable macro expansion matters more than preprocessor-like freedom.

## Procedural Macros

There are three families:

1. derive macros
2. attribute macros
3. function-like procedural macros

The typical implementation stack is:

- `proc_macro` for the compiler-facing token interface
- `syn` to parse tokens into syntax structures
- `quote` to emit Rust tokens back out

### A Derive Macro, Conceptually

Suppose you want `#[derive(CommandName)]` that generates a `command_name()` method.

The conceptual flow is:

1. the compiler passes the annotated item tokens to your derive macro
2. the macro parses the item, usually as a `syn::DeriveInput`
3. it extracts the type name and relevant fields or attributes
4. it emits an `impl CommandName for MyType { ... }`

This is why crates like `serde`, `clap`, and `thiserror` feel magical without being magical. They are compile-time code generators with carefully designed conventions.

## The Cost of Macros

Macros are not free. The costs are different from runtime costs:

- longer compile times
- harder expansion debugging
- more IDE work
- more opaque errors if the macro surface is poorly designed

The question is not "are macros good?" The question is "is this syntax-level abstraction paying for itself?"

## Step 7 - Common Misconceptions

Wrong model 1: "Macros are just fancy functions."

Correction: functions operate on values after parsing and type checking. Macros operate on syntax before those phases are complete.

Wrong model 2: "If code is repetitive, use a macro."

Correction: use a function or generic first unless syntax itself needs abstraction.

Wrong model 3: "Procedural macros understand types."

Correction: they see token streams. They can parse syntax, but full type information belongs to later compiler stages.

Wrong model 4: "Hygiene means macros cannot be confusing."

Correction: hygiene prevents one class of name bugs. Bad macro APIs can still be extremely confusing.

## Step 8 - Real-World Pattern

The ecosystem's most important ergonomic crates rely on macros:

- `serde` derives serialization and deserialization impls
- `clap` derives argument parsing from struct definitions
- `thiserror` derives `Error` impls
- `tracing` attribute macros instrument functions

Notice the pattern: the best macros turn repetitive structural code into readable declarations while keeping the generated behavior close to what a human would have written by hand.

## Step 9 - Practice Block

### Code Exercise

Write a `macro_rules!` macro that builds a `Vec<String>` from string-like inputs and accepts an optional trailing comma.

### Code Reading Drill

Explain what gets repeated here:

```rust
macro_rules! pairs {
    ($( $k:expr => $v:expr ),* $(,)?) => {{
        vec![$(($k, $v)),*]
    }};
}
```

### Spot the Bug

Why is a macro a poor choice for this?

```rust
macro_rules! add_one {
    ($x:expr) => {
        $x + 1
    };
}
```

Assume the only goal is to add one to a number.

### Refactoring Drill

Take a procedural macro idea and redesign it as a trait plus derive macro, rather than a large attribute macro doing too much hidden work.

### Compiler Error Interpretation

If macro expansion points to generated code you never wrote, translate that as: "the macro emitted invalid Rust, so I need to inspect the expansion or simplify the macro surface."

## Step 10 - Contribution Connection

After this chapter, you can read:

- derive macro crates
- DSL-style helper macros
- generated impl layers in ecosystem crates
- proc-macro support code using `syn` and `quote`

Good first PRs include:

- improving macro error messages
- replacing over-engineered macros with functions or traits
- documenting macro expansion behavior and constraints

## In Plain English

Macros are for the cases where the repeated thing is not just logic but code shape. Rust gives you strong macro tools, but it also expects you to use them carefully because metaprogramming can make code easier to use and harder to maintain at the same time.

## What Invariant Is Rust Protecting Here?

Generated code must still enter the normal compiler pipeline as valid, hygienic Rust, and macro abstractions must not bypass the type system's role in checking correctness.

## If You Remember Only 3 Things

- Use macros when syntax is the abstraction; use functions and generics otherwise.
- `macro_rules!` rewrites token patterns, while procedural macros run compile-time Rust code over token streams.
- The best macros remove boilerplate without hiding too much behavior from users and maintainers.

## Memory Hook

Functions are factory machines. Macros are molds for making new machines. Use a mold only when you truly need a new shape.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is the main difference between `macro_rules!` and procedural macros? | `macro_rules!` does pattern-based token rewriting; procedural macros run compile-time Rust code over token streams. |
| Why are macros not a substitute for the type system? | They generate Rust code, which is still type-checked afterward. |
| What does macro hygiene protect against? | Unintended name capture between macro-generated identifiers and caller scope identifiers. |
| What crates are commonly used for procedural macro implementation? | `syn` and `quote`. |
| Name the three families of procedural macros. | Derive, attribute, and function-like. |
| When is a function better than a macro? | When ordinary value-level abstraction is enough. |
| What common ergonomic crates depend heavily on macros? | `serde`, `clap`, `thiserror`, and `tracing`. |
| What is a common non-runtime cost of macros? | Higher compile-time and more opaque errors. |

## Chapter Cheat Sheet

| Need | Prefer | Why |
|---|---|---|
| Reuse runtime logic | function | simplest abstraction |
| Type-based specialization | generics/traits | type-checked and explicit |
| Syntax repetition or mini-DSL | `macro_rules!` | pattern-based expansion |
| Generate impls from declarations | derive proc macro | ergonomic compile-time codegen |
| Add cross-cutting code from attributes | attribute proc macro | syntax-level transformation |

---
