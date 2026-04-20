# Chapter 12: Structs
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href=\"../part-02/chapter-07-types-scalars-compounds-and-the-unit-type.md\">Ch 7: Types</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Named fields, tuple structs, unit structs</li><li><code>impl</code> blocks: methods and associated functions</li><li>Struct update syntax and field-level ownership</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">25<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 15 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--trait);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Product Type</div><h2 class="visual-figure__title">A Struct Is Named Data With All Fields Present</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Struct diagram showing named fields grouped into one product type"><rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(33,158,188,0.16)"></rect><rect x="126" y="82" width="288" height="236" rx="20" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect><text x="242" y="116" class="svg-small" style="fill:#0b5e73;">User</text><rect x="156" y="140" width="228" height="42" rx="12" fill="#ffffff"></rect><text x="184" y="166" class="svg-small" style="fill:#0b5e73;">name: String</text><rect x="156" y="194" width="228" height="42" rx="12" fill="#ffffff"></rect><text x="184" y="220" class="svg-small" style="fill:#0b5e73;">active: bool</text><rect x="156" y="248" width="228" height="42" rx="12" fill="#ffffff"></rect><text x="184" y="274" class="svg-small" style="fill:#0b5e73;">role: Role</text><text x="154" y="334" class="svg-small" style="fill:#6b7280;">product type means the whole value contains every field together</text></svg></div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--trait);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Method Receivers</div><h2 class="visual-figure__title"><code>self</code>, <code>&amp;self</code>, and <code>&amp;mut self</code> Mean Different Access Contracts</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Three receiver cards explaining self, shared self, and mutable self"><rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect><rect x="42" y="116" width="136" height="176" rx="18" fill="#3a1c17" stroke="#e63946" stroke-width="3"></rect><text x="86" y="150" class="svg-small" style="fill:#ffd8cc;">self</text><text x="72" y="184" class="svg-small" style="fill:#ffd8cc;">takes ownership</text><text x="78" y="210" class="svg-small" style="fill:#ffd8cc;">may consume value</text><rect x="202" y="116" width="136" height="176" rx="18" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect><text x="238" y="150" class="svg-small" style="fill:#dbeafe;">&amp;self</text><text x="226" y="184" class="svg-small" style="fill:#dbeafe;">shared borrow</text><text x="226" y="210" class="svg-small" style="fill:#dbeafe;">read-only view</text><rect x="362" y="116" width="136" height="176" rx="18" fill="#3a2a14" stroke="#f4a261" stroke-width="3"></rect><text x="392" y="150" class="svg-small" style="fill:#ffe0bf;">&amp;mut self</text><text x="380" y="184" class="svg-small" style="fill:#ffe0bf;">exclusive borrow</text><text x="390" y="210" class="svg-small" style="fill:#ffe0bf;">may mutate</text></svg></div>
  </figure>
</div>

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


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Use structs for named grouped data.

</div>
<div class="level-panel" data-level="Engineer">

Important conveniences:

- field init shorthand
- struct update syntax
- tuple structs for lightweight named wrappers
- unit structs for marker-like types

</div>
<div class="level-panel" data-level="Deep Dive">

Structs separate representation from behavior cleanly. Method receivers (`self`, `&self`, `&mut self`) are ownership decisions, not just syntax variants.

</div>
</div>


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
