# Chapter 26: Generics and Associated Types

## Step 1 - The Problem

Once you start using traits seriously, you hit a second abstraction problem: how do you parameterize over families of types without losing either clarity or performance?

Generics solve the "same algorithm over many types" problem. Associated types solve the "this trait naturally produces one related type per implementor" problem.

Confusing these two leads to noisy, weak APIs.

## Step 2 - Rust's Design Decision

Rust uses:

- generic parameters when many concrete instantiations are meaningful
- associated types when a trait implementation has one natural related output type
- const generics when a compile-time value is part of the type identity

Rust accepted:

- more syntax at definition sites
- monomorphization code size tradeoffs

Rust refused:

- forcing type-erased generics everywhere
- pretending every relationship is best expressed with another type parameter

## Step 3 - The Mental Model

Plain English rule:

- generics say "this algorithm works for many types"
- associated types say "this trait defines one related type family per implementor"

## Step 4 - Minimal Code Example

```rust
trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

`type Item;` says each iterator implementation picks one item type. Once chosen for a given iterator type, that is the item type.

If `Iterator` instead used a trait parameter like `Iterator<Item>`, then one type could in principle implement the trait multiple times with different items. That is usually not what iteration means. The associated type expresses the natural one-to-one relationship more clearly.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Generics let code work with many types. Associated types are for traits where an implementation naturally comes with one specific related type.

### Level 2 - Engineer

Generics are ideal for:

- collections
- algorithms
- wrappers
- builders

Associated types are ideal for:

- iterators
- futures
- services
- parser outputs

They keep signatures smaller and more meaningful.

### Level 3 - Systems

Monomorphization is why generics are usually zero-cost at runtime. Each concrete use site gets specialized code. The tradeoff is compile time and binary size. Associated types improve trait ergonomics and help avoid impl ambiguity by encoding the natural type family relationship inside the trait itself.

## Generics vs Trait Objects

Use generics when:

- performance matters
- the caller benefits from concrete typing
- one static composition shape is enough

Use trait objects when:

- heterogeneity matters
- compile-time surface would explode otherwise
- runtime dispatch is acceptable

## Const Generics and Phantom Types

Const generics let compile-time values participate in type identity:

```rust
struct Buffer<const N: usize> {
    bytes: [u8; N],
}
```

This matters when sizes are invariants, not just runtime data.

Phantom types matter when type identity encodes semantics without stored runtime fields, which Part 6 explored more deeply with `PhantomData`.

## Step 7 - Common Misconceptions

Wrong model 1: "Associated types are just shorter generic syntax."

Correction: they express a different relationship and constrain implementation shape.

Wrong model 2: "Generics are always the right abstraction in Rust."

Correction: sometimes dynamic dispatch or opaque return types are better engineering tradeoffs.

Wrong model 3: "Const generics are only for math libraries."

Correction: they matter anywhere fixed sizes or protocol widths are real invariants.

Wrong model 4: "Monomorphization means generics are free in every dimension."

Correction: runtime speed is often excellent, but compile time and binary size can grow.

## Step 8 - Real-World Pattern

Associated types show up constantly in `Iterator`, `Future`, `tower::Service`, serialization traits, and async traits. Generic wrappers and builders appear everywhere else. Once you can tell when a relationship is "many possible instantiations" versus "one natural related output," many advanced signatures stop looking arbitrary.

## Step 9 - Practice Block

### Code Exercise

Write a generic `Pair<T>` type, then write a trait with an associated `Output` type and explain why the associated-type version is clearer for that trait.

### Code Reading Drill

Explain why `Iterator::Item` is an associated type instead of a trait parameter.

### Spot the Bug

Why might this be the wrong abstraction?

```rust
trait Reader<T> {
    fn read(&mut self) -> T;
}
```

Assume each reader type naturally yields one item type.

### Refactoring Drill

Take a trait with a generic parameter that really has one natural output type and rewrite it with an associated type.

### Compiler Error Interpretation

If the compiler says it cannot infer a generic parameter, translate that as: "my API surface did not give it enough information to pick one concrete instantiation."

## Step 10 - Contribution Connection

After this chapter, you can read:

- iterator and future trait signatures
- generic wrappers and helper structs
- service abstractions with associated response types
- const-generic fixed-size APIs

Good first PRs include:

- replacing awkward trait parameters with associated types
- simplifying over-generic APIs
- documenting monomorphization-sensitive hot paths

## In Plain English

Generics let Rust reuse logic across many types. Associated types let a trait say, "for this kind of thing, there is one natural output type." That matters because strong APIs say exactly what relationship exists instead of making callers guess.

## What Invariant Is Rust Protecting Here?

Type relationships in generic code should be explicit enough that implementations remain unambiguous and callers retain predictable, optimizable type information.

## If You Remember Only 3 Things

- Use generics for many valid type instantiations.
- Use associated types when each implementor naturally chooses one related output type.
- Zero-cost generics still trade compile time and binary size for runtime speed.

## Memory Hook

Generics are adjustable wrenches. Associated types are sockets machined for one specific bolt per tool.

## Flashcard Deck

| Question | Answer |
|---|---|
| What are generics for? | Reusing logic across many concrete types. |
| What are associated types for? | Expressing one natural related type per trait implementation. |
| Why is `Iterator::Item` an associated type? | Each iterator type naturally yields one item type. |
| What does monomorphization do? | Generates specialized code per concrete generic instantiation. |
| What is a tradeoff of monomorphization? | Larger binaries and longer compile times. |
| When might a trait object beat a generic API? | When runtime heterogeneity or API simplification matters more than static specialization. |
| What do const generics add? | Compile-time values as part of type identity. |
| What is a sign a trait parameter should be an associated type? | Each implementor has one natural output type rather than many meaningful impl variants. |

## Chapter Cheat Sheet

| Problem | Prefer | Why |
|---|---|---|
| Many valid instantiations | generic parameter | broad reusable algorithm |
| One natural trait-related output | associated type | clearer API contract |
| Fixed-size type-level invariant | const generic | compile-time size identity |
| Need runtime heterogeneity | trait object | dynamic dispatch |
| Need hidden static return type | `impl Trait` | opaque but monomorphized |

---
