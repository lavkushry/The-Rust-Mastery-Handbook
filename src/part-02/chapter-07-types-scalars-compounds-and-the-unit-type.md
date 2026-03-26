# Chapter 7: Types, Scalars, Compounds, and the Unit Type

## Step 1 - The Problem

Rust is a systems language. That means type details matter more than in many application-first languages:

- integer width
- overflow behavior
- floating-point precision
- array size
- unit versus absence

If you treat types casually, performance and correctness both become vague.

## Step 2 - Rust's Design Decision

Rust made many type choices explicit:

- integer sizes are in the type names
- array length is part of the type
- `char` means a Unicode scalar value, not a byte
- `()` is a real type

Rust accepted:

- more explicit type spelling
- less "do what I mean" coercion

Rust refused:

- ambiguous integer width defaults like C's historical `int`
- null as the universal "nothing"

## Step 3 - The Mental Model

Plain English rule: Rust types carry real semantic and representation information, not just broad categories.

## Step 4 - Minimal Code Example

```rust
let x: i32 = 42;
let arr: [u8; 4] = [1, 2, 3, 4];
let nothing: () = ();
```

## Step 5 - Walkthrough

These types say:

- `i32`: signed 32-bit integer
- `[u8; 4]`: exactly four bytes
- `()`: unit, the type of "no meaningful value"

That explicitness matters because Rust wants both humans and compiler to know what operations and layouts are involved.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Rust has basic types like integers, floats, booleans, chars, tuples, and arrays. Their sizes and meanings are usually precise.

### Level 2 - Engineer

Important practical distinctions:

- `usize` is for indexing and sizes
- `f64` is usually the default float choice unless `f32` is enough or required
- arrays are fixed-size and usually stack-friendly
- tuples group heterogeneous values without naming a new struct
- unit `()` is not null; it is a real zero-information value

### Level 3 - Systems

Rust's type precision supports:

- portable representation reasoning
- better compiler checks
- better optimization
- fewer implicit lossy conversions

That is why explicit casting exists and why integer overflow behavior differs between debug and release defaults in straightforward arithmetic.

## Integer and Float Notes

Be especially aware of:

- signed versus unsigned meaning
- narrowing conversions
- overflow semantics
- IEEE 754 behavior for floats

Floating-point values are not "broken," but they do obey a real machine arithmetic model, so equality and rounding require engineering judgment.

## `bool`, `char`, tuples, arrays, unit

Key points:

- `bool` is only `true` or `false`
- `char` is a Unicode scalar value, not a C-style one-byte character
- tuples are anonymous fixed-size heterogeneous groups
- arrays are fixed-size homogeneous groups
- `()` is the type produced by expressions or statements with no interesting value

## Type Inference

Rust infers aggressively when information is sufficient, but not recklessly.

This is good. It avoids both:

- verbose boilerplate everywhere
- hidden inference that obscures important representation decisions

## Step 7 - Common Misconceptions

Wrong model 1: "`usize` is just another integer type."

Correction: it carries indexing and pointer-width meaning and is often the right type for lengths.

Wrong model 2: "`char` is one byte."

Correction: in Rust, `char` is a Unicode scalar value.

Wrong model 3: "`()` is basically null."

Correction: it is a real type representing no interesting payload, not a nullable pointer.

Wrong model 4: "If Rust can infer it, the type choice probably does not matter."

Correction: sometimes it matters a lot even when inference succeeds.

## Step 8 - Real-World Pattern

Strong Rust code is explicit where representation matters and relaxed where meaning is obvious. That balance is part of idiomatic taste.

## Step 9 - Practice Block

### Code Exercise

Write one example each of:

- a signed integer
- an unsigned size/index
- a tuple
- an array
- the unit type

Then explain why each type was the right choice.

### Code Reading Drill

Explain what information is encoded in this type:

```rust
let point: (i32, f64) = (10, 3.5);
```

### Spot the Bug

Why is this assumption wrong?

```text
"char indexing into a String should be O(1) because chars are characters."
```

### Refactoring Drill

Take code using `i32` for indexes and lengths and refactor the boundary types where `usize` is more semantically appropriate.

### Compiler Error Interpretation

If the compiler says mismatched types between `usize` and `i32`, translate that as: "I blurred the distinction between machine-sized indexing and general integer arithmetic."

## Step 10 - Contribution Connection

After this chapter, you can:

- read type signatures more accurately
- choose semantically stronger primitive types
- reason better about indexing and shape

Good first PRs include:

- replacing ambiguous integer choices at boundaries
- clarifying arrays versus vectors where fixed size matters
- improving docs around string and `char` assumptions

## In Plain English

Rust types are more exact than many languages because systems code needs that precision. That matters because a program that knows exactly what kind of number, character, or container it is using is easier to keep correct.

## What Invariant Is Rust Protecting Here?

Primitive and compound values should carry enough explicit shape and representation information to prevent ambiguous arithmetic, layout, and indexing assumptions.

## If You Remember Only 3 Things

- Integer width and sign matter in Rust and are often explicit for a reason.
- `char` is Unicode scalar value, not "one byte."
- `()` is a real type, not a null substitute.

## Memory Hook

Rust primitive types are labeled storage bins, not generic baskets. The label tells you what fits and how it should be handled.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is `usize` mainly for? | Sizes and indexing, matching pointer width. |
| What does `char` represent in Rust? | A Unicode scalar value. |
| What does `[T; N]` mean? | A fixed-size array of exactly `N` elements. |
| What is `()`? | The unit type, representing no interesting value. |
| Why is integer width explicit in Rust? | To avoid ambiguity and improve portability and reasoning. |
| When is `f64` usually a good default? | When you need floating point and do not have a specific `f32` constraint. |
| Are tuples named types? | No. They are anonymous fixed-size heterogeneous groupings. |
| What does good type inference depend on? | The compiler having enough surrounding information to choose safely. |

## Chapter Cheat Sheet

| Need | Type | Why |
|---|---|---|
| signed arithmetic | `i32`, `i64`, etc. | explicit width and sign |
| indexing/length | `usize` | pointer-width semantics |
| heterogeneous fixed group | tuple | no named struct needed |
| homogeneous fixed group | array | length part of type |
| no meaningful result | `()` | unit value |

---
