# Chapter 8: Functions and Expressions

## Step 1 - The Problem

Many mainstream languages draw a sharp line between "statements that do things" and "expressions that produce values." Rust pushes more constructs into the expression world.

That design changes how you write:

- return values
- local blocks
- conditional computations
- control flow without temporary variables

## Step 2 - Rust's Design Decision

Rust chose an expression-oriented style:

- blocks evaluate to values
- `if` can evaluate to values
- the last expression in a block can be the return value
- the semicolon discards a value and turns it into `()`

Rust accepted:

- one very important punctuation rule
- a style that feels functional to programmers from statement-heavy languages

Rust refused:

- making every local computation require a named temporary

## Step 3 - The Mental Model

Plain English rule: most things in Rust can produce a value, and the semicolon is what usually turns a value-producing expression into a statement with unit result.

## Step 4 - Minimal Code Example

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

## Step 5 - Walkthrough

The body expression `a + b` is returned because it is the final expression without a semicolon.

Compare:

```rust
fn broken() -> i32 {
    5;
}
```

The semicolon discards `5` and produces `()`, so the function body has the wrong type.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

If the last line of a block has no semicolon, Rust often treats it as the value of that block.

### Level 2 - Engineer

This makes local computation concise:

- compute with blocks
- return from `if` expressions directly
- avoid temporary variables when the structure is clear

Function signatures are also contracts: parameter types and return types tell the caller what the function needs and what it promises to hand back.

### Level 3 - Systems

Expression orientation is not only syntactic taste. It helps the language compose control flow and value construction cleanly. It also makes unit `()` important: once discarded, a value does not vanish into "nothingness"; it becomes a real unit result the type system can still reason about.

## Diverging Functions: `!`

Some functions never return normally:

- `panic!`
- infinite loops
- process termination

These have type `!`, the never type, which can coerce into other expected result types because control never reaches a returned value.

## Statements vs Expressions

Key rule:

- expression produces a value
- statement performs an action and usually produces `()`

Many beginner errors come from accidentally changing one into the other with a semicolon.

## Step 7 - Common Misconceptions

Wrong model 1: "Rust returns the last line magically."

Correction: it returns the final expression when the surrounding type context expects a value and no semicolon discards it.

Wrong model 2: "Semicolons are mostly style."

Correction: in Rust, they often change the type of a block.

Wrong model 3: "`if` is basically only control flow."

Correction: it is also a value-producing expression when both branches align in type.

Wrong model 4: "`!` is niche trivia."

Correction: understanding diverging control flow helps explain panics, loops, and some coercion behavior.

## Step 8 - Real-World Pattern

Expression style is everywhere in idiomatic Rust:

- block-based initialization
- `if`-driven value choice
- small helper functions with implicit tail returns
- `match`-driven computation

The style rewards clarity, not cleverness.

## Step 9 - Practice Block

### Code Exercise

Write one function that returns via final expression and one that uses explicit `return`. Explain which feels clearer and why.

### Code Reading Drill

Explain the type of this block:

```rust
let value = {
    let x = 10;
    x + 1
};
```

### Spot the Bug

Why does this fail?

```rust
fn answer() -> i32 {
    let x = 42;
    x;
}
```

### Refactoring Drill

Take a function with several unnecessary temporary variables and simplify one part using block or `if` expressions.

### Compiler Error Interpretation

If the compiler says a block returned `()` when another type was expected, translate that as: "I discarded the intended value, usually with a semicolon."

## Step 10 - Contribution Connection

After this chapter, you can:

- read Rust control-flow blocks more fluently
- spot semicolon-induced type mistakes
- write clearer small helper functions

Good first PRs include:

- simplifying noisy expression structure
- fixing semicolon-related return mistakes
- clarifying function signatures that poorly express contracts

## In Plain English

Rust likes code where computation produces values directly instead of forcing everything through temporary variables. That matters because the more naturally your control flow and your data flow line up, the easier the code is to follow.

## What Invariant Is Rust Protecting Here?

Blocks and control-flow constructs should preserve type consistency by making value production explicit and mechanically checkable rather than implicit or ad hoc.

## If You Remember Only 3 Things

- Final expressions without semicolons often determine block result.
- Semicolons frequently change values into unit `()`.
- Function signatures are capability and result contracts, not decoration.

## Memory Hook

In Rust, a semicolon is not a period. It is a shredder. It can turn a useful value into discarded paper.

## Flashcard Deck

| Question | Answer |
|---|---|
| What usually determines a block's value? | Its final expression without a semicolon. |
| What does a semicolon often do in Rust? | Discards the expression value and yields `()`. |
| Can `if` produce a value in Rust? | Yes, when branches have compatible types. |
| What does the type `!` mean? | The expression or function never returns normally. |
| Why are function signatures important in Rust? | They explicitly state input and output contracts. |
| Why do semicolon mistakes often cause type errors? | They change expected value-producing expressions into unit. |
| Are blocks expressions? | Yes, Rust blocks can evaluate to values. |
| Why is Rust called expression-oriented? | Many constructs that are statement-only in other languages can yield values in Rust. |

## Chapter Cheat Sheet

| Need | Rust pattern | Why |
|---|---|---|
| return computed value | final expression | concise and idiomatic |
| choose between values | `if` expression | no extra temp needed |
| local multi-step computation | block expression | scoped value creation |
| explicit early exit | `return` | clarity when needed |
| never-returning path | `!` | diverging control flow |

---
