# Chapter 36: Memory Layout and Zero-Cost Abstractions
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href=\"../part-03/chapter-19-stack-vs-heap-where-data-lives.md\">Ch 19: Stack/Heap</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Struct layout, alignment, and padding rules</li><li>Zero-cost abstractions: what the compiler actually generates</li><li><code>#[repr(C)]</code> vs default Rust layout</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">40<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--memory);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Struct Layout</div><h2 class="visual-figure__title">Field Sizes, Alignment, and Padding</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Struct memory layout showing fields and padding for alignment">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(45,106,79,0.18)"></rect>
        <rect x="76" y="88" width="390" height="92" rx="18" fill="#eefbf4" stroke="#2d6a4f" stroke-width="3"></rect>
        <text x="108" y="122" class="svg-subtitle" style="fill:#2d6a4f;">struct Mixed { a: u8, b: u64, c: u16 }</text>
        <rect x="96" y="226" width="26" height="54" rx="8" fill="#52b788"></rect>
        <rect x="122" y="226" width="54" height="54" rx="8" fill="#ffbe0b"></rect>
        <rect x="176" y="226" width="168" height="54" rx="8" fill="#e76f51"></rect>
        <rect x="344" y="226" width="52" height="54" rx="8" fill="#3a86ff"></rect>
        <rect x="396" y="226" width="48" height="54" rx="8" fill="#ffbe0b"></rect>
        <text x="102" y="258" class="svg-small" style="fill:#073b1d;">a</text>
        <text x="130" y="258" class="svg-small" style="fill:#6b3e00;">pad</text>
        <text x="246" y="258" class="svg-small" style="fill:#ffd8cc;">b</text>
        <text x="360" y="258" class="svg-small" style="fill:#dbeafe;">c</text>
        <text x="408" y="258" class="svg-small" style="fill:#6b3e00;">pad</text>
        <text x="98" y="322" class="svg-small" style="fill:#4b5563;">alignment rules force empty bytes so `u64` stays properly aligned</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--perf);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Niche Optimization</div><h2 class="visual-figure__title"><code>Option&lt;&amp;T&gt;</code> Reuses an Impossible Bit Pattern</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Option reference niche optimization using null as None representation">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="70" y="88" width="170" height="96" rx="18" fill="#1f2937" stroke="#3a86ff" stroke-width="3"></rect>
        <text x="104" y="124" class="svg-subtitle" style="fill:#dbeafe;">&amp;u8</text>
        <rect x="102" y="138" width="104" height="28" rx="10" fill="#3a86ff"></rect>
        <text x="132" y="156" class="svg-small" style="fill:#ffffff;">non-null ptr</text>
        <rect x="296" y="88" width="178" height="216" rx="18" fill="#1f2937" stroke="#ffbe0b" stroke-width="3"></rect>
        <text x="318" y="124" class="svg-subtitle" style="fill:#fff3c4;">Option&lt;&amp;u8&gt;</text>
        <rect x="326" y="150" width="118" height="30" rx="10" fill="#52b788"></rect>
        <text x="362" y="169" class="svg-small" style="fill:#073b1d;">Some(ptr)</text>
        <rect x="326" y="208" width="118" height="30" rx="10" fill="#d62828"></rect>
        <text x="364" y="227" class="svg-small" style="fill:#ffffff;">None = null</text>
        <text x="70" y="336" class="svg-small" style="fill:#f8fafc;">the null pointer is impossible for a valid reference, so Rust reuses it as the missing-state tag</text>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem

Systems work is constrained by representation.

You are not only writing logic. You are choosing:

- how many bytes a value occupies
- how those bytes are aligned
- whether a branch needs a discriminant
- whether an abstraction disappears after optimization or leaves indirection behind

In many languages, representation details are deliberately hidden. That improves portability, but it also limits predictable performance engineering. In C and C++, you get raw representation control, but you often lose safety or create layout dependencies accidentally.

Rust tries to give you both discipline and visibility.

## Step 2 - Rust's Design Decision

Rust does not promise a stable layout for arbitrary `struct` and `enum` definitions unless you request one with a representation attribute such as `repr(C)`.

At the same time, Rust aggressively optimizes safe, high-level code through:

- monomorphization
- inlining
- dead-code elimination
- niche optimization

This is what zero-cost abstraction means in Rust:

you should not pay runtime overhead merely for using a higher-level abstraction when the compiler can prove it away.

Rust accepted:

- longer compile times
- larger binaries in some generic-heavy designs
- layout rules that are explicit rather than hidden behind folklore

Rust refused:

- forcing dynamic dispatch or heap allocation for ordinary abstractions
- pretending all data layouts are stable just because the language can generate them

## Step 3 - The Mental Model

Plain English rule: Rust lets you write abstractions whose cost is mostly the cost of the underlying machine-level work, but only when the abstraction still preserves enough static information for the compiler to optimize it.

Also:

layout is part of the contract only when you make it part of the contract.

## Step 4 - Minimal Code Example

```rust
use std::mem::size_of;

fn main() {
    assert_eq!(size_of::<&u8>(), size_of::<Option<&u8>>());
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

The compiler knows a reference `&u8` can never be null. That means one bit-pattern is unused in normal values. Rust can use that unused pattern as the `None` tag for `Option<&u8>`.

So conceptually:

- `Some(ptr)` uses the ordinary non-null pointer
- `None` uses the null pointer representation

No extra discriminant byte is needed. This is niche optimization.

The invariant is:

the inner type must have invalid bit-patterns Rust can safely reuse as variant tags.

That same idea explains why:

- `Option<Box<T>>` is typically the same size as `Box<T>`
- `Option<NonZeroUsize>` is the same size as `usize`

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Rust can often store extra meaning inside values without making them bigger. It uses impossible values, like a null pointer where a valid reference can never be null, to encode variants like `None`.

</div>
<div class="level-panel" data-level="Engineer">

Layout knowledge matters when you design:

- FFI boundaries
- memory-dense data structures
- enums used in hot paths
- public types whose size affects cache behavior

But "zero-cost" does not mean "free in every dimension." Generics can increase compile time and binary size. Iterator chains can optimize beautifully, but only if you keep enough static structure for the optimizer to work with.

</div>
<div class="level-panel" data-level="Deep Dive">

Rust's zero-cost claim lives on top of concrete compiler machinery. Generics become specialized code through monomorphization. Trait-object dispatch remains dynamic because you asked for runtime erasure. Slice references and trait objects are fat pointers because unsized values require metadata. Layout is a combination of:

- field sizes
- alignment requirements
- padding
- variant tagging strategy
- representation attributes

Understanding those pieces lets you predict when a design is cheap, when it is branch-heavy, and when it leaks abstraction cost into runtime.

</div>
</div>


## Field Ordering, Padding, and `repr`

```rust
use std::mem::{align_of, size_of};

struct Mixed {
    a: u8,
    b: u64,
    c: u16,
}

fn main() {
    println!("size = {}", size_of::<Mixed>());
    println!("align = {}", align_of::<Mixed>());
}
```

Padding exists because aligned access matters to hardware and generated code quality.

Important rules:

- Rust may reorder some layout details internally only to the extent allowed by its layout model; you should not assume a C-compatible field layout unless using `repr(C)`
- `repr(C)` makes layout appropriate for C interop expectations
- `repr(packed)` removes padding but can create unaligned access hazards

`repr(packed)` is not a performance switch. It is a representation promise with sharp edges.

## Fat Pointers and `?Sized`

Three common fat-pointer cases:

| Type | Payload | Metadata |
|---|---|---|
| `&[T]` | pointer to first element | length |
| `&str` | pointer to UTF-8 bytes | length |
| `&dyn Trait` | pointer to data | vtable pointer |

This is why these types are usually larger than a single machine pointer.

`Sized` means the compiler knows the size of the type at compile time. Most generic parameters are implicitly `Sized`. You write `?Sized` when your API wants to accept unsized forms too, usually behind pointers or references.

## Zero-Cost Abstraction Does Not Mean Zero Tradeoffs

Consider:

```rust
fn sum_iter() -> i32 {
    (0..1000).filter(|x| x % 2 == 0).map(|x| x * x).sum()
}

fn sum_loop() -> i32 {
    let mut sum = 0;
    for x in 0..1000 {
        if x % 2 == 0 {
            sum += x * x;
        }
    }
    sum
}
```

In optimized builds, these can compile to effectively the same machine-level work. That is the win.

But if you box the iterator chain into `Box<dyn Iterator<Item = i32>>`, you have chosen dynamic dispatch and likely extra indirection. Still valid. Not zero-cost relative to the loop anymore.

## Step 7 - Common Misconceptions

Wrong model 1: "Zero-cost means there is never any overhead."

Correction: it means you do not pay abstraction overhead you did not ask for. Chosen abstraction costs still exist.

Wrong model 2: "Rust layout is always like C layout."

Correction: only `repr(C)` gives you that contract.

Wrong model 3: "`repr(packed)` is a size optimization I should use often."

Correction: it is a low-level representation choice that can make references and field access unsafe or slower.

Wrong model 4: "If two values print the same size, they have equivalent cost."

Correction: size is only one part of cost. Branching, alignment, cache locality, and dispatch still matter.

## Step 8 - Real-World Pattern

You will see layout-aware design in:

- dense parsing structures
- byte-oriented protocol types
- `Option<NonZero*>` and `Option<Box<T>>` representations
- iterator-heavy APIs that rely on monomorphization instead of boxing

Standard-library and ecosystem code routinely use type structure to preserve static information long enough for LLVM to erase abstraction overhead.

## Step 9 - Practice Block

### Code Exercise

Measure `size_of` and `align_of` for:

- `String`
- `Vec<u8>`
- `&str`
- `Option<&str>`
- `Box<u64>`
- `Option<Box<u64>>`

Then explain every surprise.

### Code Reading Drill

What metadata does this pointer carry?

```rust
let s: &str = "hello";
```

### Spot the Bug

Why is assuming field offsets here a bad idea?

```rust
struct Header {
    tag: u8,
    len: u32,
}
```

Assume the code later treats this as a C layout without `repr(C)`.

### Refactoring Drill

Take an API returning `Box<dyn Iterator<Item = T>>` everywhere and redesign one hot path with `impl Iterator`. Explain the tradeoff.

### Compiler Error Interpretation

If the compiler says a generic parameter needs to be `Sized`, translate that as: "this position needs compile-time size information, but I tried to use an unsized form without an indirection."

## Step 10 - Contribution Connection

After this chapter, you can understand:

- why a public type's shape affects performance and FFI compatibility
- why some APIs return iterators opaquely rather than trait objects
- why layout assumptions are carefully isolated

Good first PRs include:

- replacing unnecessary boxing in hot iterator paths
- documenting `repr(C)` requirements on FFI structs
- shrinking overly padded internal structs when data density matters

## In Plain English

Rust does not make performance a rumor. It lets you inspect how values are shaped in memory and often optimize high-level code down to the same work a lower-level version would do. That matters because systems engineering is about real bytes, real branches, and real cache behavior.

## What Invariant Is Rust Protecting Here?

Type representation and optimization must preserve program meaning while exposing layout guarantees only when they are explicit and sound.

## If You Remember Only 3 Things

- Zero-cost means "no hidden abstraction tax you did not ask for," not "no tradeoffs anywhere."
- Layout is only part of the public contract when you make it so, usually with `repr(C)`.
- Fat pointers and niche optimization explain many of Rust's seemingly surprising size results.

## Memory Hook

Think of Rust abstractions as transparent machine casings. You can add gears without hiding where the shafts still connect.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is niche optimization? | Reusing impossible bit-patterns of a type to encode enum variants without extra space. |
| Why can `Option<&T>` often be the same size as `&T`? | Because references cannot be null, so null can represent `None`. |
| What does `repr(C)` do? | Gives a C-compatible representation contract for layout-sensitive interop. |
| What extra data does `&str` carry? | A length alongside the data pointer. |
| What extra data does `&dyn Trait` carry? | A vtable pointer alongside the data pointer. |
| What is monomorphization? | Generating specialized code for each concrete generic instantiation. |
| Does zero-cost abstraction guarantee smaller binaries? | No. Static specialization can increase code size. |
| When should you be careful with `repr(packed)`? | Always; it can create unaligned access hazards and sharp low-level constraints. |

## Chapter Cheat Sheet

| Need | Tool or concept | Why |
|---|---|---|
| Stable C-facing layout | `repr(C)` | interop contract |
| Dense optional pointer-like value | niche optimization | no extra discriminant |
| Unsized data behind pointer | fat pointer | carries metadata |
| Erase abstraction overhead in hot path | generics and inlining | keep static structure |
| Inspect representation | `size_of`, `align_of` | measure before assuming |

---
