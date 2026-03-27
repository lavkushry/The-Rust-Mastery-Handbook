# Chapter 7: Types, Scalars, Compounds, and the Unit Type
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-02/chapter-06-variables-mutability-and-shadowing.html">Ch 6: Variables</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Scalar types: integers, floats, bool, char</li><li>Compound types: tuples, arrays, and <code>()</code></li><li>Type inference and explicit annotations</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">25<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 15 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--stack);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Type Landscape</div><h2 class="visual-figure__title">Scalars, Compounds, and the Meaning of <code>()</code></h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Type map showing integers, floats, bool, char, tuples, arrays, and unit"><rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(45,106,79,0.16)"></rect><circle cx="270" cy="196" r="54" fill="#2d6a4f"></circle><text x="248" y="202" class="svg-small" style="fill:#ffffff;">types</text><g fill="none" stroke-width="4"><path d="M270 142 V 88" stroke="#2d6a4f"></path><path d="M324 196 H 400" stroke="#219ebc"></path><path d="M270 250 V 304" stroke="#8338ec"></path><path d="M216 196 H 140" stroke="#e76f51"></path></g><rect x="206" y="52" width="128" height="38" rx="12" fill="#edf8f1" stroke="#2d6a4f"></rect><text x="236" y="75" class="svg-small" style="fill:#1f6f4d;">ints / floats</text><rect x="400" y="178" width="96" height="38" rx="12" fill="#eef6fb" stroke="#219ebc"></rect><text x="430" y="201" class="svg-small" style="fill:#0b5e73;">bool / char</text><rect x="198" y="304" width="144" height="38" rx="12" fill="#f3f0ff" stroke="#8338ec"></rect><text x="228" y="327" class="svg-small" style="fill:#5c2bb1;">tuple / array</text><rect x="48" y="178" width="92" height="38" rx="12" fill="#fff1eb" stroke="#e76f51"></rect><text x="82" y="201" class="svg-small" style="fill:#8f3d22;">()</text><text x="68" y="246" class="svg-small" style="fill:#6b7280;">unit is a real type, not null</text></svg></div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--stack);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Representation</div><h2 class="visual-figure__title">Size and Shape Are Part of the Story</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Representation diagram comparing array fixed size, tuple grouped fields, and unit zero size"><rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect><rect x="54" y="94" width="132" height="54" rx="14" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect><text x="92" y="126" class="svg-small" style="fill:#d9fbe9;">[u8; 4]</text><rect x="54" y="154" width="28" height="28" fill="#52b788"></rect><rect x="86" y="154" width="28" height="28" fill="#74c69d"></rect><rect x="118" y="154" width="28" height="28" fill="#95d5b2"></rect><rect x="150" y="154" width="28" height="28" fill="#b7e4c7"></rect><rect x="216" y="94" width="140" height="88" rx="14" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect><text x="252" y="126" class="svg-small" style="fill:#dbeafe;">(i32, bool)</text><rect x="242" y="144" width="52" height="24" fill="#3a86ff"></rect><rect x="298" y="144" width="28" height="24" fill="#8ecae6"></rect><rect x="388" y="108" width="98" height="60" rx="14" fill="#231942" stroke="#8338ec" stroke-width="3"></rect><text x="426" y="142" class="svg-small" style="fill:#efe8ff;">()</text><text x="384" y="212" class="svg-small" style="fill:#fff3c4;">unit carries meaning but no payload</text></svg></div>
  </figure>
</div>

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


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Rust has basic types like integers, floats, booleans, chars, tuples, and arrays. Their sizes and meanings are usually precise.

</div>
<div class="level-panel" data-level="Engineer">

Important practical distinctions:

- `usize` is for indexing and sizes
- `f64` is usually the default float choice unless `f32` is enough or required
- arrays are fixed-size and usually stack-friendly
- tuples group heterogeneous values without naming a new struct
- unit `()` is not null; it is a real zero-information value

</div>
<div class="level-panel" data-level="Deep Dive">

Rust's type precision supports:

- portable representation reasoning
- better compiler checks
- better optimization
- fewer implicit lossy conversions

That is why explicit casting exists and why integer overflow behavior differs between debug and release defaults in straightforward arithmetic.

</div>
</div>


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
