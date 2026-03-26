# Chapter 12: Structs

## Step 1 - The Problem

Programs need named grouped data. Tuples are useful, but real domain data needs field names, methods, and sometimes associated constructors.

## Step 2 - Rust's Design Decision

Rust structs are plain data groupings with explicit methods added through `impl` blocks. There is no implicit OO inheritance story attached.

## Step 3 - The Mental Model

Plain English rule: a struct defines shape; an `impl` block defines behavior for that shape.

## Step 4 - Minimal Code Example

```rust
#[derive(Debug, Clone, PartialEq)]
struct User {
    name: String,
    active: bool,
}
```

## Step 5 - Walkthrough

`User` is a named product type:

- `name` and `active` are fields
- derive macros add common behavior
- methods or constructors belong in `impl User`

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Use structs for named grouped data.

### Level 2 - Engineer

Important conveniences:

- field init shorthand
- struct update syntax
- tuple structs for lightweight named wrappers
- unit structs for marker-like types

### Level 3 - Systems

Structs separate representation from behavior cleanly. Method receivers (`self`, `&self`, `&mut self`) are ownership decisions, not just syntax variants.

## `impl` Blocks and `self`

Receiver meanings:

- `self`: consume the instance
- `&self`: shared borrow
- `&mut self`: exclusive mutable borrow

This is another place where Rust method syntax keeps ownership visible.

## Step 7 - Common Misconceptions

Wrong model 1: "Methods are object-oriented magic."

Correction: they are ordinary functions with an explicit receiver convention.

Wrong model 2: "Struct update syntax clones everything."

Correction: it moves fields not explicitly replaced, unless those fields are `Copy`.

Wrong model 3: "Tuple structs are pointless."

Correction: they are useful for semantic newtypes and lightweight wrappers.

## Step 8 - Real-World Pattern

Structs are everywhere, but the most idiomatic ones usually have:

- clear ownership in fields
- derives where semantics fit
- methods with meaningful receiver choices

## Step 9 - Practice Block

### Code Exercise

Define a struct with one consuming method, one read-only method, and one mutating method. Explain each receiver choice.

### Code Reading Drill

Explain what moves here:

```rust
let user2 = User {
    name: String::from("b"),
    ..user1
};
```

### Spot the Bug

Why might this be surprising?

```rust
let a = user1;
println!("{:?}", user1);
```

### Refactoring Drill

Take a tuple with semantically meaningful positions and redesign it as a named struct or tuple struct wrapper.

### Compiler Error Interpretation

If the compiler rejects use after struct update, translate that as: "some fields moved into the new struct."

## Step 10 - Contribution Connection

After this chapter, you can:

- read data models more confidently
- interpret method receiver semantics
- use derives and struct update more intentionally

Good first PRs include:

- replacing ambiguous tuples with named structs
- tightening method receivers
- deriving common traits where semantics fit

## In Plain English

Structs are named bundles of data, and methods are just functions attached to them with explicit ownership rules. That matters because clear data shapes and clear access rules make code easier to trust.

## What Invariant Is Rust Protecting Here?

Grouped data should carry meaningful field names and method receivers that preserve the intended ownership and mutation semantics.

## If You Remember Only 3 Things

- Structs define data shape; `impl` defines behavior.
- `self`, `&self`, and `&mut self` are ownership choices.
- Struct update syntax can move fields.

## Memory Hook

A struct is a labeled toolbox. The `impl` block tells you what operations the toolbox itself supports and whether you borrow it, edit it, or hand it away entirely.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is a struct for? | Grouping named data fields into one type. |
| What does `impl` add? | Methods and associated functions for the type. |
| What does `self` receiver mean? | Consume the instance. |
| What does `&self` receiver mean? | Shared borrowed access. |
| What does `&mut self` receiver mean? | Exclusive mutable borrowed access. |
| What are tuple structs good for? | Lightweight wrappers and semantic newtypes. |
| What are unit structs good for? | Marker-like types with no fields. |
| What can struct update syntax do unexpectedly? | Move fields from the source value. |

## Chapter Cheat Sheet

| Need | Rust struct tool | Why |
|---|---|---|
| named data | struct | explicit fields |
| lightweight wrapper | tuple struct | semantic newtype |
| no-field marker | unit struct | type-level tag |
| constructor-like helper | associated function | `Type::new(...)` style |
| behavior with ownership choice | method receiver | `self` / `&self` / `&mut self` |

---
