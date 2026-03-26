# Chapter 9: Control Flow

## Step 1 - The Problem

Control flow is where code either stays clear or becomes hard to reason about.

Rust's control-flow constructs are designed to:

- preserve exhaustiveness
- stay expression-friendly
- make iteration and branching explicit

## Step 2 - Rust's Design Decision

Rust uses:

- `if` for boolean branching
- `match` for exhaustive pattern matching
- `loop`, `while`, and `for` for iteration
- labels for nested-loop control

Rust accepted:

- stronger exhaustiveness checks
- a more explicit separation between boolean checks and pattern-based branching

Rust refused:

- "fall through" branching surprises
- non-exhaustive pattern handling by accident

## Step 3 - The Mental Model

Plain English rule: choose control flow based on what you know:

- `if` when the condition is boolean
- `match` when the shape of a value matters
- `for` when iterating known iterable values
- `loop` when you need indefinite repetition with explicit break logic

## Step 4 - Minimal Code Example

```rust
let label = if n > 0 { "positive" } else { "non-positive" };
```

## Step 5 - Walkthrough

This works because:

1. `n > 0` is boolean
2. both branches return `&str`
3. `if` is an expression

Now compare `match`:

```rust
match code {
    200 => "ok",
    404 => "not found",
    _ => "other",
}
```

The compiler checks every possible pattern path is handled.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Rust has the usual branching and loops, but `if` and `match` are often value-producing and `match` must cover every case.

### Level 2 - Engineer

Use:

- `if let` for simple single-pattern extraction
- `while let` for pattern-driven loops
- `match` when exhaustiveness matters or several shapes need handling
- labeled loops when nested-control exits need to be obvious

### Level 3 - Systems

Exhaustiveness is a correctness feature, not a convenience. It means enums and variant-rich APIs can evolve more safely because missing cases are caught during compilation instead of surfacing as forgotten runtime branches.

## Loops and Ranges

Use:

- `for item in iter` for ordinary iteration
- `while condition` when the loop is condition-driven
- `loop` when termination is internal and explicit

`loop` is especially interesting because `break` can return a value.

## Pattern Matching in Loop Contexts

Example:

```rust
while let Some(item) = queue.pop() {
    println!("{item}");
}
```

This is not just shorter syntax. It communicates that loop progress depends on a pattern success condition.

## Loop Labels

Useful when nested loops would otherwise have unclear break targets:

```rust
'outer: for row in 0..10 {
    for col in 0..10 {
        if row + col > 12 {
            break 'outer;
        }
    }
}
```

## Step 7 - Common Misconceptions

Wrong model 1: "`match` is only a prettier switch."

Correction: it is exhaustiveness-checked pattern matching, not just value equality branching.

Wrong model 2: "Use `if let` everywhere because it is shorter."

Correction: use it when one pattern matters. Use `match` when the full value space matters.

Wrong model 3: "`loop` is just while-true."

Correction: its value-returning `break` makes it a distinct and useful construct.

Wrong model 4: "Exhaustiveness is verbose bureaucracy."

Correction: it is one of the reasons Rust enums are so powerful and safe.

## Step 8 - Real-World Pattern

Strong Rust code uses `match` and `if let` not only for elegance but to encode correctness boundaries:

- parser states
- error branching
- request variants
- channel receive loops

These patterns show up everywhere from CLIs to async services.

## Step 9 - Practice Block

### Code Exercise

Write:

- one `if` expression
- one `match` over an enum
- one `while let` loop

and explain why each construct was the right one.

### Code Reading Drill

What does this loop return?

```rust
let result = loop {
    break 42;
};
```

### Spot the Bug

Why is this weak?

```rust
match maybe_value {
    Some(v) => use_value(v),
    _ => {}
}
```

Assume the `None` case actually matters for diagnostics.

### Refactoring Drill

Take a long chain of `if/else if` over an enum and rewrite it as `match`.

### Compiler Error Interpretation

If the compiler says a `match` is non-exhaustive, translate that as: "this branch structure is pretending some value shapes cannot happen when the type says they can."

## Step 10 - Contribution Connection

After this chapter, you can:

- read pattern-heavy Rust more fluently
- distinguish when exhaustive branching matters
- use loops more idiomatically

Good first PRs include:

- turning brittle `if` chains into `match`
- improving diagnostics in `None` or error branches
- clarifying nested loop exits with labels

## In Plain English

Control flow is how your code decides what happens next. Rust makes those decisions more explicit and more complete, which matters because a lot of bugs come from cases the program quietly forgot to handle.

## What Invariant Is Rust Protecting Here?

Branching and iteration should make all reachable cases and exit conditions explicit enough that value-shape handling remains complete and understandable.

## If You Remember Only 3 Things

- Use `if` for booleans, `match` for value shape.
- `match` exhaustiveness is a safety feature.
- `while let` and `loop` encode meaningful control-flow patterns, not just shorter syntax.

## Memory Hook

`if` asks yes/no. `match` asks what shape. `loop` asks when we stop. Confusing those questions confuses the code.

## Flashcard Deck

| Question | Answer |
|---|---|
| When is `if` the right tool? | When the condition is boolean. |
| What does `match` guarantee? | Exhaustive handling of the matched value space. |
| When is `if let` preferable? | When you care about one pattern and want concise extraction. |
| What is `while let` good for? | Pattern-driven loops, especially consuming optional or result-like streams. |
| Can `loop` return a value? | Yes, via `break value`. |
| Why use loop labels? | To make nested-loop control exits explicit. |
| Why is exhaustiveness important? | It prevents forgotten cases from slipping through silently. |
| What is a smell in control flow? | Using `_ => {}` to ignore cases that actually matter semantically. |

## Chapter Cheat Sheet

| Need | Construct | Why |
|---|---|---|
| boolean branch | `if` | direct condition |
| exhaustive value-shape branch | `match` | full coverage |
| one interesting pattern | `if let` | concise extract |
| repeated pattern-driven consumption | `while let` | loop until pattern fails |
| indefinite loop with explicit stop | `loop` | flexible control |

---
