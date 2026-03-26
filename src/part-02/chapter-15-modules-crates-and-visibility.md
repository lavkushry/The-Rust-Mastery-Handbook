# Chapter 15: Modules, Crates, and Visibility

## Step 1 - The Problem

As code grows, names and boundaries matter.

Without a module system, everything becomes:

- globally reachable
- hard to organize
- hard to protect from accidental dependency

Rust uses modules and crates to express architecture directly.

## Step 2 - Rust's Design Decision

Rust separates:

- crate: compilation unit and package-facing unit
- module: namespace and visibility boundary inside a crate

Visibility is explicit:

- private by default
- `pub` when exposed
- finer controls like `pub(crate)` and `pub(super)` when needed

Rust accepted:

- more explicit imports and re-exports
- more thought around public surface

Rust refused:

- ambient visibility everywhere
- accidental public APIs

## Step 3 - The Mental Model

Plain English rule:

- crates are top-level build units
- modules organize and hide code within crates
- visibility controls who may use what

## Step 4 - Minimal Code Example

```rust
mod parser {
    pub fn parse() {}
    fn helper() {}
}

fn main() {
    parser::parse();
}
```

## Step 5 - Walkthrough

Here:

- `parser` is a module
- `parse` is public to the parent scope and beyond according to the path
- `helper` stays private inside the module

This default-private rule is one of the main ways Rust nudges code toward intentional APIs.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Modules group related code. `pub` makes an item visible outside its private scope.

### Level 2 - Engineer

Useful visibility levels:

- private by default
- `pub` for public API
- `pub(crate)` for crate-internal APIs
- `pub(super)` for parent-module sharing

`use` brings names into scope. Re-exports let a crate shape a cleaner public surface than its raw file layout.

### Level 3 - Systems

Module design is architecture. Public API is not the same thing as file structure. Strong libraries often keep many modules private and re-export only the intended stable surface from `lib.rs`. That preserves internal refactor freedom and makes semver easier to manage.

## `mod`, `use`, `pub`

Roles:

- `mod` declares or exposes a module in the tree
- `use` imports a path into local scope
- `pub` opens visibility outward

These three keywords are small, but they define most of Rust's everyday module mechanics.

## Re-exports

Example:

```rust
pub use crate::parser::Parser;
```

This lets the crate present `Parser` from a cleaner public path than its internal module layout might suggest.

That is one reason you should read `lib.rs` early in unfamiliar libraries: it often tells you what the crate really considers public.

## Step 7 - Common Misconceptions

Wrong model 1: "If a file exists, its contents are basically public inside the project."

Correction: visibility is explicit and private by default.

Wrong model 2: "`pub` is harmless convenience."

Correction: it widens API surface and future maintenance burden.

Wrong model 3: "`use` moves code or changes ownership."

Correction: it is a name-binding convenience, not a value transfer.

Wrong model 4: "Module tree equals public API."

Correction: re-exports often define the real public API.

## Step 8 - Real-World Pattern

Strong Rust crates typically:

- keep many helpers private
- expose stable surface through `lib.rs`
- use `pub(crate)` for internal cross-module sharing
- avoid spraying `pub` everywhere

This is a major part of what makes Rust crates maintainable.

## Step 9 - Practice Block

### Code Exercise

Create a small module tree with one private helper, one `pub(crate)` item, and one fully public item. Explain who can use each.

### Code Reading Drill

Explain what this does:

```rust
pub use crate::config::Settings;
```

### Spot the Bug

Why is this often a maintenance smell?

```rust
pub mod internal_helpers;
```

Assume the crate is a library and the module was only meant for internal reuse.

### Refactoring Drill

Take a crate exposing too many raw modules and redesign the public surface with selective re-exports from `lib.rs`.

### Compiler Error Interpretation

If the compiler says an item is private, translate that as: "this module boundary intentionally did not promise external access to that symbol."

## Step 10 - Contribution Connection

After this chapter, you can:

- read crate structure more accurately
- avoid accidental public-surface changes
- understand re-export-based API shaping

Good first PRs include:

- tightening visibility from `pub` to `pub(crate)` where appropriate
- improving `lib.rs` re-export clarity
- documenting module boundaries better

## In Plain English

Modules and visibility are how Rust code decides what is private, what is shared internally, and what is promised to the outside world. That matters because big codebases stay sane only when boundaries are intentional.

## What Invariant Is Rust Protecting Here?

Code visibility and namespace structure should expose only the intended API surface while preserving encapsulation and internal refactor freedom.

## If You Remember Only 3 Things

- Crates are build units; modules are internal namespace and visibility structure.
- Items are private by default.
- Re-exports often define the real public API better than raw file layout does.

## Memory Hook

Modules are rooms, visibility is the door policy, and `lib.rs` is the front lobby telling visitors which doors they are actually allowed to use.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is a crate? | A compilation unit and package-facing unit of Rust code. |
| What is a module? | A namespace and visibility boundary inside a crate. |
| What does `pub(crate)` mean? | Visible anywhere inside the current crate, but not outside it. |
| What does `pub(super)` mean? | Visible to the parent module. |
| What does `use` do? | Brings a path into local scope for naming convenience. |
| What does `pub use` do? | Re-exports a symbol to shape a public API. |
| Why is default privacy useful? | It prevents accidental API exposure. |
| Why should you read `lib.rs` early in a library crate? | It often curates the real public surface through re-exports. |

## Chapter Cheat Sheet

| Need | Keyword or pattern | Why |
|---|---|---|
| define module | `mod` | module tree |
| import symbol locally | `use` | name convenience |
| export publicly | `pub` | public API surface |
| crate-internal shared API | `pub(crate)` | internal boundary |
| parent-only visibility | `pub(super)` | local hierarchy control |
| cleaner public path | `pub use` | curated re-export |

---
