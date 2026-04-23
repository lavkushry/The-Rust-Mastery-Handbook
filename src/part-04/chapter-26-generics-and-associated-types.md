# Chapter 26: Generics and Associated Types

<div class="ferris-says" data-variant="insight">
<p>Generics let you write code that works across many types without sacrificing the speed of hand-written specialisations. Monomorphisation is the trick. Associated types are where generics go from "template" to "algebra".</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-04/chapter-25-traits-rusts-core-abstraction.md">Ch 25: Traits</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Monomorphization: generics compiled to concrete types</li><li>Associated types vs generic type parameters</li><li>Trait bounds as capability contracts</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">35<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--trait);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Abstraction Choice</div><h2 class="visual-figure__title">Generic Parameter or Associated Type?</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Comparison between generics for many valid instantiations and associated types for one natural related output"><rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(33,158,188,0.16)"></rect><rect x="52" y="88" width="186" height="232" rx="18" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect><text x="110" y="122" class="svg-small" style="fill:#0b5e73;">generic</text><text x="82" y="158" class="svg-small" style="fill:#0b5e73;">fn max&lt;T: Ord&gt;(...)</text><text x="82" y="188" class="svg-small" style="fill:#0b5e73;">many meaningful T values</text><text x="82" y="218" class="svg-small" style="fill:#0b5e73;">algorithm reused broadly</text><rect x="302" y="88" width="186" height="232" rx="18" fill="#f3f0ff" stroke="#8338ec" stroke-width="3"></rect><text x="344" y="122" class="svg-small" style="fill:#5c2bb1;">associated type</text><text x="334" y="158" class="svg-small" style="fill:#5c2bb1;">trait Iterator {</text><text x="334" y="184" class="svg-small" style="fill:#5c2bb1;">type Item;</text><text x="334" y="210" class="svg-small" style="fill:#5c2bb1;">}</text><text x="324" y="250" class="svg-small" style="fill:#5c2bb1;">one natural output per impl</text></svg></div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--trait);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Monomorphization</div><h2 class="visual-figure__title">Zero Runtime Cost, Some Compile-Time Cost</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Monomorphization flow from one generic function to concrete specialized versions"><rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect><rect x="152" y="62" width="236" height="56" rx="16" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect><text x="196" y="95" class="svg-small" style="fill:#dbeafe;">fn process&lt;T&gt;(value: T)</text><path d="M270 118 V 166" stroke="#3a86ff" stroke-width="6"></path><path d="M270 166 L 112 236 M270 166 L 270 236 M270 166 L 428 236" stroke="#3a86ff" stroke-width="6" fill="none"></path><rect x="50" y="236" width="124" height="60" rx="16" fill="#123e2e" stroke="#52b788"></rect><text x="76" y="271" class="svg-small" style="fill:#d9fbe9;">process_i32</text><rect x="208" y="236" width="124" height="60" rx="16" fill="#231942" stroke="#8338ec"></rect><text x="238" y="271" class="svg-small" style="fill:#efe8ff;">process_u64</text><rect x="366" y="236" width="124" height="60" rx="16" fill="#3a1c17" stroke="#e76f51"></rect><text x="388" y="271" class="svg-small" style="fill:#ffd8cc;">process_String</text><text x="84" y="344" class="svg-small" style="fill:#fff3c4;">tradeoff: fast runtime and concrete optimization, but more compile work and possible code growth</text></svg></div>
  </figure>
</div>

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


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Generics let code work with many types. Associated types are for traits where an implementation naturally comes with one specific related type.

</div>
<div class="level-panel" data-level="Engineer">

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

</div>
<div class="level-panel" data-level="Deep Dive">

Monomorphization is why generics are usually zero-cost at runtime. Each concrete use site gets specialized code. The tradeoff is compile time and binary size. Associated types improve trait ergonomics and help avoid impl ambiguity by encoding the natural type family relationship inside the trait itself.

</div>
</div>


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
