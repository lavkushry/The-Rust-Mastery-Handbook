# Chapter 22: Collections, `Vec`, `String`, and `HashMap`

<div class="ferris-says" data-variant="insight">
<p>Vec, String, HashMap — the three collections that carry 95% of Rust programs. This chapter goes beyond the API: iterator adapters, capacity vs length, when to pre-allocate, and the memory layout that makes Rust's collections fast.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-02/chapter-10-ownership-first-contact.md">Ch 10: Ownership</a><a href="../part-02/chapter-11-borrowing-and-references-first-contact.md">Ch 11: Borrowing</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li><code>String</code> vs <code>&amp;str</code> — ownership vs borrowing text</li><li>The Entry API for idiomatic HashMap use</li><li>Three ownership modes of iteration</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">40<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div></div>
</div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--stack);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Collection Roles</div><h2 class="visual-figure__title">Choose by Ownership and Access Pattern</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Three collection cards for Vec, String and HashMap with ownership and access notes"><rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(45,106,79,0.16)"></rect><rect x="46" y="88" width="132" height="210" rx="18" fill="#edf8f1" stroke="#2d6a4f" stroke-width="3"></rect><text x="94" y="122" class="svg-small" style="fill:#1f6f4d;">Vec&lt;T&gt;</text><text x="70" y="156" class="svg-small" style="fill:#1f6f4d;">owned contiguous</text><text x="70" y="182" class="svg-small" style="fill:#1f6f4d;">growable buffer</text><text x="70" y="208" class="svg-small" style="fill:#1f6f4d;">iteration friendly</text><rect x="204" y="88" width="132" height="210" rx="18" fill="#fff5eb" stroke="#e76f51" stroke-width="3"></rect><text x="244" y="122" class="svg-small" style="fill:#8f3d22;">String</text><text x="228" y="156" class="svg-small" style="fill:#8f3d22;">owned UTF-8</text><text x="228" y="182" class="svg-small" style="fill:#8f3d22;">&amp;str borrows it</text><text x="228" y="208" class="svg-small" style="fill:#8f3d22;">no fake char indexing</text><rect x="362" y="88" width="132" height="210" rx="18" fill="#eef2ff" stroke="#3a86ff" stroke-width="3"></rect><text x="390" y="122" class="svg-small" style="fill:#1e40af;">HashMap</text><text x="384" y="156" class="svg-small" style="fill:#1e40af;">owned keys/values</text><text x="384" y="182" class="svg-small" style="fill:#1e40af;">borrowed lookup</text><text x="384" y="208" class="svg-small" style="fill:#1e40af;">absence via Option</text></svg></div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--stack);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Entry API</div><h2 class="visual-figure__title">One Lookup, Then Occupied or Vacant</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="HashMap entry API flow with occupied and vacant branches returning mutable access"><rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect><rect x="170" y="58" width="200" height="52" rx="16" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect><text x="220" y="90" class="svg-small" style="fill:#dbeafe;">map.entry(key)</text><path d="M270 110 V 150" stroke="#3a86ff" stroke-width="5"></path><path d="M270 150 L 136 214 M270 150 L 404 214" stroke="#3a86ff" stroke-width="5" fill="none"></path><rect x="64" y="214" width="144" height="84" rx="18" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect><text x="100" y="250" class="svg-small" style="fill:#d9fbe9;">occupied</text><text x="82" y="276" class="svg-small" style="fill:#d9fbe9;">get &amp;mut V directly</text><rect x="332" y="214" width="144" height="84" rx="18" fill="#3a1c17" stroke="#e76f51" stroke-width="3"></rect><text x="374" y="250" class="svg-small" style="fill:#ffd8cc;">vacant</text><text x="354" y="276" class="svg-small" style="fill:#ffd8cc;">insert default value</text><rect x="154" y="324" width="232" height="34" rx="12" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect><text x="198" y="346" class="svg-small" style="fill:#8f5d00;">both paths yield a mutable place to update</text></svg></div>
  </figure>
</div>

## Readiness Check - Collection Selection and Ownership

| Skill                           | Level 0                               | Level 1                       | Level 2                                                    | Level 3                                                            |
| ------------------------------- | ------------------------------------- | ----------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| Choose the right collection     | I default to one structure everywhere | I can name basic tradeoffs    | I can justify choice by ownership, lookup, and order needs | I can redesign data flow to make collection semantics explicit     |
| Handle text ownership correctly | I mix `String` and `&str` blindly     | I know owned vs borrowed text | I design APIs that accept `&str` and own only when needed  | I optimize hot paths to minimize unnecessary allocation            |
| Update maps idiomatically       | I branch with repetitive lookups      | I can use `insert` and `get`  | I use `entry` for single-pass update patterns              | I enforce invariants and absence handling cleanly with typed flows |

Target Level 2+ before performance tuning or parser-heavy chapters.

## Compiler Error Decoder - Collections and Strings

| Error code | What it usually means                                                 | Typical fix direction                                                            |
| ---------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| E0277      | Invalid operation for type (for example indexing `String` by integer) | Use iterator/grapheme logic or byte APIs intentionally; avoid fake char indexing |
| E0308      | Mismatched types (`String` vs `&str`, wrong map key/value type)       | Align API boundary types and convert at ownership boundaries, not everywhere     |
| E0599      | Method not found on current collection/view type                      | Verify whether you have owned collection, reference, iterator, or entry handle   |

When debugging: write down collection type, ownership mode, and operation expectation before changing code.

## Step 1 - The Problem

Real programs spend much of their time moving through collections. That sounds mundane, but collection choice controls:

- ownership shape
- allocation behavior
- lookup complexity
- iteration cost
- how easy it is to preserve invariants around absent or malformed data

Languages with pervasive nullability or loose mutation semantics often encourage a style where collections are global buckets and string handling is a pile of ad hoc indexing. Rust pushes back on that because collections sit at the boundary between representation and logic.

## Step 2 - Rust's Design Decision

Rust gives you a few foundational collections with strong semantic boundaries:

- `Vec<T>` for owned, growable contiguous storage
- `String` for owned UTF-8 text
- `&str` for borrowed UTF-8 text
- `HashMap<K, V>` for key-based lookup with owned or borrowed access patterns
- `BTreeMap` and sets when ordering or deterministic traversal matters

Rust accepted:

- explicit ownership distinction between `String` and `&str`
- no direct string indexing by character
- more visible allocation behavior

Rust refused:

- pretending text is bytes and characters interchangeably
- returning null instead of type-level absence
- hiding lookup failure behind unchecked access

## Step 3 - The Mental Model

Plain English rule:

- `Vec<T>` owns elements in one contiguous growable buffer
- `String` is a `Vec<u8>` with a UTF-8 invariant
- `&str` is a borrowed view into UTF-8 bytes
- `HashMap` owns associations and makes missing keys explicit through `Option`

The deeper rule is:

choose a collection for the ownership and access pattern you want, not just for what other languages taught you first.

## Step 4 - Minimal Code Example

```rust
use std::collections::HashMap;

fn main() {
    let mut counts = HashMap::new();
    counts.insert(String::from("error"), 1usize);

    *counts.entry(String::from("error")).or_insert(0) += 1;

    assert_eq!(counts.get("error"), Some(&2));
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `HashMap::new()` creates an empty map with owned keys and values.
2. `insert(String::from("error"), 1usize)` moves the `String` and `usize` into the map.
3. `entry(...)` performs a lookup and gives you a stateful handle describing whether the key is occupied or vacant.
4. `or_insert(0)` ensures a value exists and returns `&mut usize`.
5. `*... += 1` mutates the value in place under that mutable reference.
6. `get("error")` works with `&str` because `String` keys support borrowed lookup via `Borrow<str>`.

This example already shows several idiomatic collection ideas:

- ownership is explicit
- missing data is explicit
- mutation is localized
- borrowed lookup avoids needless temporary allocation

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Use `Vec<T>` when you want a growable list. Use `String` when you own text. Use `&str` when you only need to read text. Use `HashMap` when you want to find values by key.

</div>
<div class="level-panel" data-level="Engineer">

Idiomatic collection work often starts with these questions:

- who owns the data?
- will this grow?
- do I need stable ordering?
- do I need fast lookup?
- can I borrow instead of clone?

Examples:

- prefer `with_capacity` when size is predictable
- prefer `.get()` over indexing when absence is possible in production paths
- accept `&str` in APIs so callers can pass both literals and `String`
- use the `Entry` API to combine lookup and mutation into one operation

</div>
<div class="level-panel" data-level="Deep Dive">

`Vec<T>` is Rust's workhorse because contiguous storage is cache-friendly and simple to optimize. `String` inherits that contiguity but adds UTF-8 semantics, which is why byte indexing is not exposed as character indexing. `HashMap` is powerful, but hash-based lookup has tradeoffs:

- non-deterministic iteration order
- hashing cost
- memory overhead versus denser structures

Sometimes `BTreeMap` wins because predictable ordering and better small-collection locality matter more than average-case hash lookup speed.

</div>
</div>


## `Vec<T>` in Practice

```rust
let mut values = Vec::with_capacity(1024);
for i in 0..1024 {
    values.push(i);
}
```

Capacity is not length.

- length = initialized elements currently in the vector
- capacity = elements the allocation can hold before reallocation

That distinction matters when performance tuning hot paths. `with_capacity` is not always necessary, but when you know roughly how much data is coming, it often prevents repeated reallocations.

Also understand the three ownership modes of iteration:

```rust
for v in values.iter() {
    // shared borrow of each element
}

for v in values.iter_mut() {
    // mutable borrow of each element
}

for v in values {
    // moves each element out, consuming the Vec
}
```

Those are different ownership stories, not cosmetic method variants.

## `String` vs `&str`

This distinction is one of the first real taste markers in Rust.

Rules of thumb:

- own text with `String`
- borrow text with `&str`
- accept `&str` in most read-only APIs
- return `String` when constructing new owned text

Why no `s[0]`?

Because UTF-8 characters are variable-width. A byte offset is not the same thing as a character boundary. Rust refuses the fiction that string indexing is simple when it would make Unicode handling subtly wrong.

## `HashMap` and the Entry API

The `Entry` API is one of the most important collection patterns in production Rust:

```rust
use std::collections::HashMap;

let mut counts = HashMap::new();
for word in ["rust", "safe", "rust"] {
    *counts.entry(word).or_insert(0) += 1;
}
```

Why is this idiomatic?

Because it prevents:

- duplicate lookups
- awkward "if contains_key then get_mut else insert" branching
- temporary ownership confusion

## `BTreeMap`, `BTreeSet`, and `HashSet`

Use:

- `HashMap` or `HashSet` when fast average-case lookup is primary
- `BTreeMap` or `BTreeSet` when sorted traversal, deterministic output, or range queries matter

Deterministic iteration is not a cosmetic property. It matters in:

- CLI output
- testing
- serialization stability
- debugging and log comparison

## Step 7 - Common Misconceptions

Wrong model 1: "`String` and `&str` are the same except one is mutable."

Correction: one owns text, one borrows it. Ownership is the primary distinction.

Wrong model 2: "`v[i]` and `v.get(i)` are equivalent."

Correction: one can panic; the other forces you to handle absence explicitly.

Wrong model 3: "Hash-based collections are always the fastest choice."

Correction: not when ordering, small-size behavior, or determinism matter.

Wrong model 4: "Allocating a new `String` for every lookup is fine."

Correction: borrowed lookup exists for a reason. Avoid allocation when a borrowed key will do.

## Step 8 - Real-World Pattern

In serious Rust repositories:

- CLI tools often use `BTreeMap` for stable printed output
- web services accept `&str` at the edges and convert to validated owned types internally
- counters and aggregators rely on `HashMap::entry`
- parser and search code use `Vec<T>` heavily because contiguous storage is hard to beat

You can see this style across crates like `clap`, `tracing`, and `ripgrep`: data structures are chosen for semantic and performance reasons together.

## Step 9 - Practice Block

### Code Exercise

Write a log summarizer that counts occurrences of log levels using `HashMap<&str, usize>`, then refactor it to `HashMap<String, usize>` and explain the ownership difference.

### Code Reading Drill

Explain the ownership and failure behavior here:

```rust
let first = values.get(0);
let risky = &values[0];
```

### Spot the Bug

Why is this a poor API?

```rust
fn greet(name: &String) -> String {
    format!("hello {name}")
}
```

### Refactoring Drill

Take code that does:

```rust
if map.contains_key(key) {
    *map.get_mut(key).unwrap() += 1;
} else {
    map.insert(key.to_string(), 1);
}
```

Refactor it with the `Entry` API.

### Compiler Error Interpretation

If the compiler complains that you moved a `String` into a collection and then tried to use it again, translate that as: "the collection became the new owner."

## Step 10 - Contribution Connection

After this chapter, you can read and improve:

- data aggregation code
- config and parser modules
- CLI output shaping
- search and indexing paths

Good first PRs include:

- replacing double-lookups with the `Entry` API
- accepting `&str` instead of `&String` in public APIs
- adding `with_capacity` where input size is known and hot

## In Plain English

Collections are where a program stores and finds its data. Rust makes you be honest about who owns that data and what happens if a key or index is missing. That matters because production bugs often begin when code quietly assumes data will always be present or text will always behave like raw bytes.

## What Invariant Is Rust Protecting Here?

Collection APIs preserve ownership clarity and make absence, invalid text access, and mutation boundaries explicit instead of implicit.

## Quick check

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quick check</span><span>Vec growth</span></div>
  <p class="quiz__q">A <code>Vec&lt;u32&gt;</code> with capacity 8 is full. You call <code>push</code>. What happens, in order?</p>
  <ul class="quiz__options">
    <li>Push fails and returns an error you must handle.</li>
    <li>The existing buffer is extended in place if there is free space after it on the heap.</li>
    <li>A new buffer (typically 2x capacity) is allocated, all 8 elements are <em>moved</em> to it, the old buffer is freed, then the new value is written.</li>
    <li>The new value is written to a separate overflow buffer the <code>Vec</code> keeps in reserve.</li>
  </ul>
  <div class="quiz__explain">Correct. Growth is amortised O(1): every reallocation copies <em>everything</em>, but it doubles capacity, so any one element is copied at most ~log2(n) times across its lifetime. This is also exactly why <code>push</code> requires <code>&amp;mut self</code> and invalidates outstanding borrows — the old buffer's address is now invalid.</div>
  <div class="quiz__explain quiz__explain--wrong">Heap allocators don't generally extend in place. What does <code>Vec</code> do when it runs out of room?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

## If You Remember Only 3 Things

- Accept `&str` for read-only string inputs; own text with `String` only when ownership is needed.
- Prefer `.get()` and other explicit-absence APIs in fallible production paths.
- Use `HashMap::entry` when lookup and mutation belong to one logical operation.

## Memory Hook

A `String` is the full book on your shelf. A `&str` is a bookmark to pages inside a book. A `HashMap` is the index card catalog. Confusing those roles leads to confusion everywhere else.

## Flashcard Deck

| Question                                                         | Answer                                                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| What is the core distinction between `String` and `&str`?        | `String` owns UTF-8 text; `&str` borrows it.                                     |
| Why does Rust not allow direct character indexing into `String`? | UTF-8 is variable-width, so byte offsets are not character positions.            |
| What is the difference between vector length and capacity?       | Length is initialized elements; capacity is allocated space before reallocation. |
| When should you use `HashMap::entry`?                            | When lookup and insertion/update are one logical operation.                      |
| Why is `map.get("key")` useful when keys are `String`?           | Borrowed lookup avoids allocating a temporary owned key.                         |
| When might `BTreeMap` be preferable to `HashMap`?                | When ordered or deterministic iteration matters.                                 |
| What does iterating `for x in vec` do?                           | It consumes the vector and moves out each element.                               |
| What is a common API smell around strings in Rust?               | Accepting `&String` where `&str` would be more flexible.                         |

## Chapter Cheat Sheet

| Need                      | Prefer              | Why                                    |
| ------------------------- | ------------------- | -------------------------------------- |
| Growable contiguous list  | `Vec<T>`            | cache-friendly general-purpose storage |
| Owned text                | `String`            | own and mutate UTF-8 bytes             |
| Borrowed text             | `&str`              | flexible non-owning text input         |
| Count or aggregate by key | `HashMap` + `entry` | efficient update pattern               |
| Stable ordered output     | `BTreeMap`          | deterministic traversal                |

---
