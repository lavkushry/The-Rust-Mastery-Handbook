# PART 4 - Idiomatic Rust Engineering

Part 3 taught you Rust's core ownership model. Part 4 is where that model turns into engineering taste.

This is the section where many programmers become superficially productive in Rust and then stall. They can make code compile, but they still write:

- unnecessary clones
- vague error surfaces
- over-boxed abstractions
- giant mutable functions
- APIs that are technically legal and socially expensive

Idiomatic Rust is not about memorizing "best practices" as detached rules. It is about noticing the invariants that strong Rust libraries preserve:

- collections make ownership and access explicit
- iterators preserve structure without paying runtime tax
- traits express capabilities precisely
- error types tell downstream code what went wrong and what can be recovered
- smart pointers are chosen for ownership shape, not because the borrow checker felt annoying

That is the thread running through this part.

---

# Chapter 22: Collections, `Vec`, `String`, and `HashMap`

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

### Level 1 - Beginner

Use `Vec<T>` when you want a growable list. Use `String` when you own text. Use `&str` when you only need to read text. Use `HashMap` when you want to find values by key.

### Level 2 - Engineer

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

### Level 3 - Systems

`Vec<T>` is Rust's workhorse because contiguous storage is cache-friendly and simple to optimize. `String` inherits that contiguity but adds UTF-8 semantics, which is why byte indexing is not exposed as character indexing. `HashMap` is powerful, but hash-based lookup has tradeoffs:

- non-deterministic iteration order
- hashing cost
- memory overhead versus denser structures

Sometimes `BTreeMap` wins because predictable ordering and better small-collection locality matter more than average-case hash lookup speed.

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

## If You Remember Only 3 Things

- Accept `&str` for read-only string inputs; own text with `String` only when ownership is needed.
- Prefer `.get()` and other explicit-absence APIs in fallible production paths.
- Use `HashMap::entry` when lookup and mutation belong to one logical operation.

## Memory Hook

A `String` is the full book on your shelf. A `&str` is a bookmark to pages inside a book. A `HashMap` is the index card catalog. Confusing those roles leads to confusion everywhere else.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is the core distinction between `String` and `&str`? | `String` owns UTF-8 text; `&str` borrows it. |
| Why does Rust not allow direct character indexing into `String`? | UTF-8 is variable-width, so byte offsets are not character positions. |
| What is the difference between vector length and capacity? | Length is initialized elements; capacity is allocated space before reallocation. |
| When should you use `HashMap::entry`? | When lookup and insertion/update are one logical operation. |
| Why is `map.get("key")` useful when keys are `String`? | Borrowed lookup avoids allocating a temporary owned key. |
| When might `BTreeMap` be preferable to `HashMap`? | When ordered or deterministic iteration matters. |
| What does iterating `for x in vec` do? | It consumes the vector and moves out each element. |
| What is a common API smell around strings in Rust? | Accepting `&String` where `&str` would be more flexible. |

## Chapter Cheat Sheet

| Need | Prefer | Why |
|---|---|---|
| Growable contiguous list | `Vec<T>` | cache-friendly general-purpose storage |
| Owned text | `String` | own and mutate UTF-8 bytes |
| Borrowed text | `&str` | flexible non-owning text input |
| Count or aggregate by key | `HashMap` + `entry` | efficient update pattern |
| Stable ordered output | `BTreeMap` | deterministic traversal |

---

# Chapter 23: Iterators, the Rust Superpower

## Step 1 - The Problem

Most data-processing code is some form of:

- transform
- filter
- combine
- aggregate

Many languages force you to choose between low-level loops that are explicit but verbose, and high-level pipelines that are elegant but expensive. Rust explicitly tries to erase that tradeoff.

## Step 2 - Rust's Design Decision

Rust's iterator model builds almost everything on one core method:

```rust
trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

Adapters like `map`, `filter`, `enumerate`, `zip`, and `flat_map` are lazy wrappers around that model. Consumers like `collect`, `fold`, `sum`, and `count` drive execution.

Rust accepted:

- more types under the hood
- a slightly steeper learning curve around ownership in pipelines

Rust refused:

- forcing heap allocation for every intermediate step
- turning expressive pipelines into runtime abstraction tax

## Step 3 - The Mental Model

Plain English rule: iterator chains describe a computation, but nothing happens until a consumer pulls values through the chain.

That means:

- adapters are lazy
- consumers trigger work
- ownership shape still matters throughout the chain

## Step 4 - Minimal Code Example

```rust
let values = vec![1, 2, 3, 4, 5, 6];

let result: Vec<i32> = values
    .into_iter()
    .filter(|x| x % 2 == 0)
    .map(|x| x * 10)
    .collect();
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `into_iter()` takes ownership of the vector and yields owned `i32` values.
2. `filter(...)` wraps that iterator in a new lazy adapter.
3. `map(...)` wraps the filtered iterator in another lazy adapter.
4. `collect()` repeatedly calls `next()` through the chain until `None`.
5. No intermediate `Vec` is required by the abstraction itself.

The invariant here is:

the structure of the pipeline stays visible enough for the compiler to optimize it as one streaming computation.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Iterators let you say what transformation you want without manually managing indexes and temporary lists.

### Level 2 - Engineer

Iterator style is ideal for:

- parsing and transformation pipelines
- log and metrics analysis
- CLI filtering and formatting
- data cleanup code

Choose among:

- `iter()` for shared borrows
- `iter_mut()` for mutable borrows
- `into_iter()` for owned values

That choice determines what closure signatures and downstream operations are possible.

### Level 3 - Systems

Iterator chains are Rust's canonical zero-cost abstraction story. The compiler can inline small closures, specialize the concrete adapter types, and turn a chain into code equivalent to a hand-written loop. But you only keep that advantage while preserving static structure. Boxing iterators or erasing them behind `dyn Iterator` trades some of that away deliberately.

## Adapters and Consumers

Useful adapters:

- `map`
- `filter`
- `filter_map`
- `flat_map`
- `enumerate`
- `zip`
- `chain`
- `take`
- `skip`

Useful consumers:

- `collect`
- `fold`
- `sum`
- `count`
- `find`
- `any`
- `all`
- `position`

`fold` deserves special respect because it makes stateful reductions explicit:

```rust
let total_len = ["a", "bb", "ccc"]
    .iter()
    .fold(0usize, |acc, s| acc + s.len());
```

## Custom Iterators

Implementing `Iterator` yourself is often simpler than it first appears:

```rust
struct Counter {
    current: usize,
    end: usize,
}

impl Iterator for Counter {
    type Item = usize;

    fn next(&mut self) -> Option<Self::Item> {
        if self.current >= self.end {
            None
        } else {
            let out = self.current;
            self.current += 1;
            Some(out)
        }
    }
}
```

The virtue of this API is not just convenience. It turns traversal state into a well-defined abstraction that composes with the rest of the iterator ecosystem immediately.

## When to Prefer a `for` Loop

Iterator chains are not a religion.

Prefer a `for` loop when:

- there is branching or mutation that would make the chain opaque
- you need early exits that are clearer imperatively
- the iterator pipeline becomes harder to read than the loop

Idiomatic Rust is not "most chained methods wins." It is "clear structure with no unnecessary runtime tax."

## Step 7 - Common Misconceptions

Wrong model 1: "Iterator chains allocate intermediate collections."

Correction: not unless you explicitly collect.

Wrong model 2: "Iterators are always more readable than loops."

Correction: not when the chain hides too much control flow.

Wrong model 3: "`iter()` and `into_iter()` are almost the same."

Correction: one borrows; one consumes. That changes ownership throughout the chain.

Wrong model 4: "Dynamic iterators are bad."

Correction: they are a tradeoff. Use them when heterogeneity or API simplification is worth the indirection.

## Step 8 - Real-World Pattern

Iterator-heavy style appears all over crates like `ripgrep`, parsers, and observability tools because it makes streaming transformations explicit and composable. Strong Rust code often reads like dataflow without becoming a hidden allocation pipeline.

## Step 9 - Practice Block

### Code Exercise

Take a list of log lines and compute the number of non-empty lines containing `"ERROR"` but not `"EXPECTED"`, first with a loop and then with iterators.

### Code Reading Drill

Explain the ownership and laziness here:

```rust
let iter = values.iter().map(|x| x * 2);
```

### Spot the Bug

Why does this fail?

```rust
let names = vec![String::from("a"), String::from("b")];
let first_chars: Vec<&str> = names
    .into_iter()
    .map(|name| &name[..1])
    .collect();
```

### Refactoring Drill

Take a `for` loop that pushes transformed items into a new vector and rewrite it as an iterator pipeline if readability improves. Explain whether ownership changed.

### Compiler Error Interpretation

If the compiler says a collected type cannot be built from an iterator, translate that as: "the item type produced by my chain does not match the collection type I asked for."

## Step 10 - Contribution Connection

After this chapter, you can read and improve:

- parser pipelines
- search and filtering code
- formatting and aggregation logic
- custom traversal abstractions

Good first PRs include:

- replacing manual push loops with clearer iterator pipelines
- simplifying iterator ownership mode mistakes
- improving custom iterators with better naming and tests

## In Plain English

Iterators let Rust process data one piece at a time without building lots of temporary containers. That matters because many real programs are just streams of data being transformed, and Rust lets those transformations stay both expressive and fast.

## What Invariant Is Rust Protecting Here?

Iterator composition preserves the ownership and sequence semantics of the underlying data while avoiding unnecessary intermediate allocation.

## If You Remember Only 3 Things

- Adapters are lazy; consumers do the work.
- `iter`, `iter_mut`, and `into_iter` are ownership decisions, not style choices.
- Use iterator chains when they clarify the dataflow, not when they obscure it.

## Memory Hook

An iterator chain is an assembly line, not a warehouse. Parts move through stations one by one until the final collector takes them off the belt.

## Flashcard Deck

| Question | Answer |
|---|---|
| What method powers all iterators? | `next`, returning `Option<Self::Item>`. |
| What is the difference between an adapter and a consumer? | Adapters transform lazily; consumers drive iteration to completion or a result. |
| What does `iter()` yield? | Shared references to elements. |
| What does `into_iter()` yield for a vector? | Owned elements, consuming the vector. |
| Do iterator chains allocate intermediate containers by default? | No. Not unless a consumer like `collect` requests one. |
| When is a `for` loop preferable? | When it expresses branching or mutation more clearly than a long method chain. |
| What does `fold` do? | Carries an accumulator through an iteration to produce one result. |
| What is a common reason `collect()` fails to compile? | The chain's item type does not match the target collection type. |

## Chapter Cheat Sheet

| Need | Tool | Why |
|---|---|---|
| Borrow and transform | `iter()` | non-consuming pipeline |
| Mutate items in place | `iter_mut()` | mutable borrow |
| Consume items | `into_iter()` | owned pipeline |
| Combine transform and filter | `filter_map` | concise and allocation-free |
| Reduce to one value | `fold` | explicit accumulator |

---

# Chapter 24: Closures, Functions That Capture

## Step 1 - The Problem

Many APIs need behavior as input:

- iterator predicates
- sorting keys
- retry policies
- callbacks
- task bodies

Ordinary functions can express some of this, but they cannot naturally carry local context. Closures solve that problem by capturing values from the surrounding environment.

## Step 2 - Rust's Design Decision

Rust closures are not one opaque callable kind. They are classified by how they capture:

- `Fn` for shared access
- `FnMut` for mutable access
- `FnOnce` for consuming captured values

Rust accepted:

- more trait names to learn
- a more explicit capture model

Rust refused:

- hiding movement or mutation cost behind a generic "callable" abstraction

## Step 3 - The Mental Model

Plain English rule: a closure is code plus an environment, and the way it uses that environment determines which callable traits it implements.

## Step 4 - Minimal Code Example

```rust
let threshold = 10;
let is_large = |value: &i32| *value > threshold;
assert!(is_large(&12));
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `threshold` is a local `i32`.
2. The closure uses it without moving or mutating it.
3. The compiler captures `threshold` by shared borrow or copy-like semantics as appropriate.
4. The closure can be called repeatedly, so it implements `Fn`.

Now compare:

```rust
let mut seen = 0;
let mut record = |_: i32| {
    seen += 1;
};
```

This closure mutates captured state, so it requires `FnMut`.

And:

```rust
let name = String::from("worker");
let consume = move || name;
```

This closure moves `name` out when called, so it is only `FnOnce`.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Closures can use values from the place where they were created. That is what makes them useful for filters, callbacks, and tasks.

### Level 2 - Engineer

Most iterator closures are `Fn` or `FnMut`. Thread and async task closures often need `move` because the closure must own the captured values across the new execution boundary.

This is why `move` shows up so often in:

- `thread::spawn`
- `tokio::spawn`
- callback registration

### Level 3 - Systems

A closure is a compiler-generated struct plus one or more trait impls from the `Fn*` family. Captured variables become fields. The call operator lowers to methods on those traits. This is why closure capture mode is part of the type story, not just syntax sugar.

## `move` Closures

`move` does not mean "copy everything." It means "capture by value."

For `Copy` types, that looks like a copy.
For owned non-`Copy` values, it means a move.

That distinction matters because `move` is often the right choice at execution-boundary APIs, but it can also change the closure from `Fn` or `FnMut` to `FnOnce` depending on how the captured fields are used.

## Closures as Parameters and Returns

You will see:

```rust
fn apply<F>(value: i32, f: F) -> i32
where
    F: Fn(i32) -> i32,
{
    f(value)
}
```

And sometimes:

```rust
fn make_checker(limit: i32) -> impl Fn(i32) -> bool {
    move |x| x > limit
}
```

Returning closures by trait object is possible too:

```rust
fn make_boxed() -> Box<dyn Fn(i32) -> i32> {
    Box::new(|x| x + 1)
}
```

Use trait objects when runtime erasure is useful. Use `impl Fn` when one concrete closure type is enough.

## Step 7 - Common Misconceptions

Wrong model 1: "Closures are just anonymous functions."

Correction: they are anonymous function-like values with captured environment.

Wrong model 2: "`move` copies the environment."

Correction: it captures by value, which may mean move or copy depending on the type.

Wrong model 3: "`FnOnce` means the closure always gets called exactly once."

Correction: it means the closure may consume captured state and therefore can only be called once safely.

Wrong model 4: "If a closure compiles in an iterator, it will work in a thread spawn."

Correction: thread boundaries impose stronger ownership and often `Send + 'static` constraints.

## Step 8 - Real-World Pattern

Closures are everywhere in idiomatic Rust:

- iterator adapters
- sort comparators
- retry wrappers
- `tracing` instrumentation helpers
- async task bodies

Strong Rust code relies on closures heavily, but it also respects their ownership behavior instead of treating them as syntactic sugar over lambdas from other languages.

## Step 9 - Practice Block

### Code Exercise

Write one closure that implements `Fn`, one that implements `FnMut`, and one that is only `FnOnce`. Explain why each falls into that category.

### Code Reading Drill

What does this closure capture, and how?

```rust
let prefix = String::from("id:");
let format_id = |id: u32| format!("{prefix}{id}");
```

### Spot the Bug

Why does this fail after the spawn?

```rust
let data = String::from("hello");
let handle = std::thread::spawn(move || data);
println!("{data}");
```

### Refactoring Drill

Take a named helper function that only exists to capture one local configuration value and rewrite it as a closure if that improves locality.

### Compiler Error Interpretation

If the compiler says a closure only implements `FnOnce`, translate that as: "this closure consumes part of its captured environment."

## Step 10 - Contribution Connection

After this chapter, you can read:

- iterator-heavy closures
- task and thread bodies
- higher-order helper APIs
- boxed callback registries

Good first PRs include:

- removing unnecessary clones around closures
- choosing narrower `Fn` bounds when `FnMut` or `FnOnce` are not needed
- documenting why `move` is required at a boundary

## In Plain English

Closures are little bundles of behavior and remembered context. Rust cares about exactly how they remember that context because borrowing, mutation, and ownership still matter even when code is passed around like data.

## What Invariant Is Rust Protecting Here?

Closure calls must respect how captured data is borrowed, mutated, or consumed, so callable reuse stays consistent with ownership rules.

## If You Remember Only 3 Things

- A closure is code plus captured environment.
- `Fn`, `FnMut`, and `FnOnce` describe what the closure needs from that environment.
- `move` captures by value; it does not guarantee copying.

## Memory Hook

A closure is a backpacked function. What is in the backpack, and whether it gets borrowed, edited, or emptied, determines how often the traveler can keep walking.

## Flashcard Deck

| Question | Answer |
|---|---|
| What extra thing does a closure have that a plain function usually does not? | Captured environment. |
| What does `Fn` mean? | The closure can be called repeatedly without mutating or consuming captures. |
| What does `FnMut` mean? | The closure may mutate captured state between calls. |
| What does `FnOnce` mean? | The closure may consume captured state and therefore can only be called once safely. |
| What does `move` do? | Captures values by value rather than by borrow. |
| Why is `move` common in thread or task APIs? | The closure must own its captured data across the execution boundary. |
| Can a closure implement more than one `Fn*` trait? | Yes. A non-consuming closure can implement `Fn`, `FnMut`, and `FnOnce` hierarchically. |
| When might you return `Box<dyn Fn(...)>`? | When you need runtime-erased callable values with a uniform interface. |

## Chapter Cheat Sheet

| Need | Bound or tool | Why |
|---|---|---|
| Reusable read-only callback | `Fn` | no mutation or consumption |
| Stateful callback | `FnMut` | mutable captured state |
| One-shot consuming callback | `FnOnce` | captured ownership is consumed |
| Spawn thread/task with captures | `move` closure | own the environment |
| Hide closure concrete type | `impl Fn` or `Box<dyn Fn>` | opaque or dynamic callable |

---

# Chapter 25: Traits, Rust's Core Abstraction

## Step 1 - The Problem

How do you write generic code without inheritance and without turning every abstraction into runtime dispatch?

Rust's answer is traits, but traits do more than interfaces in many languages. They define capabilities, drive static dispatch, shape blanket impls, and act as part of API design rather than just hierarchy design.

## Step 2 - Rust's Design Decision

Rust chose:

- explicit trait definitions
- explicit implementations
- static dispatch by default with generics
- dynamic dispatch only when requested
- coherence rules to keep trait resolution predictable

Rust accepted:

- more visible trait bounds
- orphan-rule friction

Rust refused:

- hidden virtual dispatch everywhere
- structural interface matching with ambiguous resolution

## Step 3 - The Mental Model

Plain English rule: a trait is a named set of capabilities, and trait bounds are contracts about what operations generic code may rely on.

## Step 4 - Minimal Code Example

```rust
use std::fmt::Display;

fn print_twice<T>(value: T)
where
    T: Display,
{
    println!("{value}");
    println!("{value}");
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `print_twice` is generic over `T`.
2. The bound `T: Display` tells the compiler and caller that formatting with `{}` must be available.
3. At each call site, the compiler monomorphizes the function for the concrete type.
4. If a caller uses a type without `Display`, compilation fails before the function body is ever instantiated successfully.

The invariant is:

generic code may only rely on capabilities it states in its bounds.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Traits describe what a type can do. Trait bounds on a function say what abilities that function needs from its input types.

### Level 2 - Engineer

Traits matter for:

- generic algorithms
- conversions
- formatting
- error handling
- async and concurrency marker properties

Standard-library traits are not just convenience. They form the common language of composable Rust code.

### Level 3 - Systems

Traits are where Rust's abstraction model becomes disciplined. Coherence and the orphan rule prevent multiple crates from defining overlapping impls that would make method resolution ambiguous. Blanket impls let one implementation cover many types, which is powerful, but only because the coherence model keeps the universe consistent.

## Standard Traits That Matter Constantly

You should develop instinctive familiarity with:

- `Debug`
- `Display`
- `Clone`
- `Copy`
- `Default`
- `PartialEq`, `Eq`, `PartialOrd`, `Ord`
- `Hash`
- `From`, `Into`, `TryFrom`
- `AsRef`, `Borrow`
- `Iterator`
- `Error`
- `Send`, `Sync`

These are not random conveniences. They form the grammar of serious Rust APIs.

## Default Implementations and Blanket Impl Patterns

Traits can provide default method bodies:

```rust
trait Preview {
    fn summary(&self) -> String;

    fn preview(&self) -> String {
        format!("{}...", self.summary())
    }
}
```

And blanket impls let you implement a trait for many types meeting a condition:

```rust
impl<T: Display> ToPrettyString for T {
    fn to_pretty_string(&self) -> String {
        format!(">> {self}")
    }
}
```

This is enormously powerful, which is exactly why coherence restrictions exist.

## Orphan Rule and Coherence

The orphan rule says, roughly:

you may implement a trait for a type if either the trait or the type is local to your crate.

Why?

Because otherwise two different downstream crates could each add conflicting impls for the same foreign trait and foreign type pair, and the ecosystem would become ambiguous.

This is one of those Rust rules that feels restrictive until you imagine maintaining dependency graphs without it.

## Step 7 - Common Misconceptions

Wrong model 1: "Traits are just interfaces."

Correction: they also drive static dispatch, blanket impls, associated types, marker properties, and coherence.

Wrong model 2: "Adding more trait bounds is always better documentation."

Correction: extra bounds narrow reuse and can become semver burdens. State only the capabilities you actually need.

Wrong model 3: "The orphan rule is arbitrary."

Correction: it prevents overlapping trait worlds across crates.

Wrong model 4: "If a type can derive `Copy`, it probably should."

Correction: `Copy` changes ownership semantics. Use it only when bitwise duplication is cheap and semantically appropriate.

## Step 8 - Real-World Pattern

Serious crates lean heavily on traits:

- `serde` uses traits for serialization contracts
- `Iterator` and related traits shape streaming APIs everywhere
- error handling relies on `Error`, `Display`, and `From`
- async and concurrency APIs rely on marker traits like `Send` and `Sync`

Reading strong Rust code means reading trait constraints fluently.

## Step 9 - Practice Block

### Code Exercise

Define a trait for human-readable summaries and implement it for two types. Then add a generic function that accepts any summarizable value.

### Code Reading Drill

What capability contract does this signature express?

```rust
fn write_json<T: serde::Serialize + Send>(value: &T) -> Vec<u8>
```

### Spot the Bug

Why is this likely over-constrained?

```rust
fn log_value<T>(value: &T)
where
    T: Clone + Debug + Display + Send + Sync + 'static,
{
    println!("{value}");
}
```

### Refactoring Drill

Take a function with several inline bounds and rewrite it with a `where` clause if readability improves.

### Compiler Error Interpretation

If the compiler says a trait bound is not satisfied, translate it as: "this generic code asked for a capability the concrete type does not provide."

## Step 10 - Contribution Connection

After this chapter, you can read:

- generic helper APIs
- conversion layers
- error propagation code
- concurrency-related trait bounds

Good first PRs include:

- tightening over-broad trait bounds
- deriving or implementing standard traits where semantics fit
- improving trait-bound docs for public APIs

## In Plain English

Traits are Rust's way of saying what a type can do without forcing everything into a class hierarchy. That matters because reusable systems code needs clear capability contracts, not vague assumptions about what methods happen to exist.

## What Invariant Is Rust Protecting Here?

Generic code must only rely on capabilities that are explicitly declared, and trait resolution must remain coherent across crates.

## If You Remember Only 3 Things

- Trait bounds are capability contracts.
- Coherence and the orphan rule keep the ecosystem from ending up with conflicting impl worlds.
- Standard traits are the shared vocabulary of idiomatic Rust APIs.

## Memory Hook

Traits are tool labels in a workshop. A generic function is allowed to pick up only the tools whose labels it listed on the work order.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is a trait bound? | A contract that says which capabilities a generic type must provide. |
| Why does Rust use static dispatch by default for traits in generics? | To keep abstraction costs low and preserve concrete type information. |
| What problem does the orphan rule prevent? | Conflicting implementations of foreign traits for foreign types across crates. |
| What is a blanket impl? | An implementation that applies to many types satisfying some bound. |
| Why should trait bounds be kept minimal? | Extra bounds reduce reuse and tighten the public contract unnecessarily. |
| What is `Display` for? | User-facing textual formatting. |
| What is `Debug` for? | Developer-facing diagnostic formatting. |
| Why is `Copy` a stronger choice than `Clone`? | It changes assignment semantics to implicit duplication. |

## Chapter Cheat Sheet

| Need | Trait or pattern | Why |
|---|---|---|
| Developer debug output | `Debug` | diagnostics |
| User-facing output | `Display` | readable formatting |
| Cheap implicit duplication | `Copy` | value semantics |
| Explicit deep duplication | `Clone` | controlled copying |
| Generic capability contract | trait bound | reusable function design |
| Many-type implementation | blanket impl | shared behavior |

---

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

# Chapter 27: Error Handling in Depth

## Step 1 - The Problem

Systems programs fail constantly:

- files do not exist
- config is malformed
- networks timeout
- upstream services misbehave
- user input is invalid

The design problem is not "how do I avoid failure?" It is "how do I represent failure in a way that callers can reason about, recover from when possible, and diagnose when not?"

Exceptions hide control flow. Error codes are easy to ignore. Rust chose typed error values.

## Step 2 - Rust's Design Decision

Rust uses:

- `Option<T>` for absence that is not exceptional
- `Result<T, E>` for operations that can fail with meaningful error information
- `?` for ergonomic propagation

The ecosystem then layered:

- `thiserror` for library-quality error types
- `anyhow` for application-level ergonomic propagation and context

Rust accepted:

- visible error paths
- more types

Rust refused:

- invisible throws
- unchecked null as failure signaling

## Step 3 - The Mental Model

Plain English rule:

- libraries should usually expose structured errors
- applications should usually add context and propagate errors ergonomically

## Step 4 - Minimal Code Example

```rust
use std::fs;
use std::io;

fn load(path: &str) -> Result<String, io::Error> {
    let content = fs::read_to_string(path)?;
    Ok(content)
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `read_to_string` returns `Result<String, io::Error>`.
2. `?` matches on the result.
3. If `Ok(content)`, execution continues with the unwrapped `String`.
4. If `Err(e)`, the function returns early with `Err(e)`.

That is the core desugaring idea. `?` is not magical exception syntax. It is structured early return through the `Try`-style machinery around `Result` and related types.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Rust makes failure visible in the type system, so callers cannot pretend something never fails if it actually can.

### Level 2 - Engineer

Use:

- custom `enum` error types in libraries
- `thiserror` to reduce boilerplate
- `anyhow::Result` in apps, binaries, and top-level orchestration code
- `.context(...)` to attach actionable operational detail

Avoid `unwrap` in production paths unless you are asserting an invariant so strong that a panic is truly the right failure mode.

### Level 3 - Systems

Typed errors are part of API design. They say what can go wrong, what can be matched on, and where recovery is possible. `From<E>` integration lets `?` convert lower-level errors into higher-level structured ones. Context chains matter in production because the original low-level error alone often does not explain which operation failed semantically.

## `thiserror` vs `anyhow`

Library-style:

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("failed to read config file: {0}")]
    Io(#[from] std::io::Error),
    #[error("invalid config format: {0}")]
    Parse(String),
}
```

Application-style:

```rust
use anyhow::{Context, Result};

fn start() -> Result<()> {
    let text = std::fs::read_to_string("config.toml")
        .context("while reading startup config")?;
    let _ = text;
    Ok(())
}
```

The split exists because libraries and applications have different audiences:

- libraries are consumed programmatically
- applications are operated by humans

## When to Panic

Panic is appropriate when:

- an internal invariant is broken
- test code expects a failure
- a prototype or one-off script prioritizes speed over resilience

Panic is a poor substitute for expected error handling. "File missing" and "user provided bad input" are not panics in serious software.

## Step 7 - Common Misconceptions

Wrong model 1: "`unwrap()` is okay because I know this cannot fail."

Correction: maybe. But if that claim matters, consider making the invariant explicit or using `expect` with a meaningful message.

Wrong model 2: "`anyhow` is the best error type everywhere."

Correction: great for apps, poor as the main public error surface of reusable libraries.

Wrong model 3: "Error enums are just boilerplate."

Correction: they are part of your API contract and recovery model.

Wrong model 4: "Context is redundant because the original error is already there."

Correction: the original error often lacks the operation-level story humans need.

## Step 8 - Real-World Pattern

Strong Rust libraries expose:

- precise error enums
- `From` conversions for lower-level failures
- stable `Display` text

Strong Rust binaries add context at operational boundaries:

- reading config
- starting listeners
- connecting to databases
- parsing input files

This split shows up clearly in `thiserror` and `anyhow` usage across the ecosystem.

## Step 9 - Practice Block

### Code Exercise

Design a `CliError` enum for a file-processing tool and decide which variants should wrap `std::io::Error`, parse errors, and user-input validation failures.

### Code Reading Drill

Explain what `?` does here and what type conversion it may trigger:

```rust
let cfg: Config = serde_json::from_str(&text)?;
```

### Spot the Bug

Why is this weak error handling for a library?

```rust
pub fn parse(data: &str) -> anyhow::Result<Model> {
    let model = serde_json::from_str(data)?;
    Ok(model)
}
```

### Refactoring Drill

Take code with repeated `map_err(|e| ...)` boilerplate and redesign the error type with `From` conversions or `thiserror`.

### Compiler Error Interpretation

If `?` fails because `From<LowerError>` is not implemented for your error type, translate that as: "the propagation path is missing a conversion contract."

## Step 10 - Contribution Connection

After this chapter, you can read and improve:

- error enums
- propagation chains
- operational context messages
- panic-versus-result decisions

Good first PRs include:

- replacing stringly-typed errors with enums
- adding `context` to top-level app failures
- removing `unwrap` from expected-failure paths

## In Plain English

Rust treats failure as data you must account for, not as invisible control flow. That matters because production software fails in many normal ways, and good software says clearly what failed, where, and whether the caller can do anything about it.

## What Invariant Is Rust Protecting Here?

Failure paths must remain explicit and type-checked so callers cannot silently ignore or misunderstand what can go wrong.

## If You Remember Only 3 Things

- Libraries usually want structured error types; applications usually want ergonomic propagation plus context.
- `?` is typed early return, not invisible exception handling.
- Panic is for broken invariants and truly unrecoverable conditions, not ordinary operational failures.

## Memory Hook

An error type is a shipping label on failure. If the label is vague, the package still arrives broken, but nobody knows where it came from or what to do next.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is `Result<T, E>` for? | Operations that can fail with structured error information. |
| What does `?` do? | Propagates `Err` early or unwraps `Ok` on the success path. |
| When is `thiserror` usually appropriate? | For library-facing structured error types. |
| When is `anyhow` usually appropriate? | For application-level orchestration and ergonomic propagation. |
| Why is context important? | It explains which higher-level operation failed, not just the low-level cause. |
| When is panic appropriate? | Broken invariants, tests, or truly unrecoverable states. |
| Why are string-only error types weak? | They are hard to match on, compose, and reason about programmatically. |
| What missing trait often breaks `?` propagation? | `From<LowerError>` for the target error type. |

## Chapter Cheat Sheet

| Need | Prefer | Why |
|---|---|---|
| Expected absence | `Option<T>` | not every miss is an error |
| Recoverable failure | `Result<T, E>` | explicit typed failure path |
| Library error surface | `thiserror` + enum | matchable public contract |
| App top-level error plumbing | `anyhow::Result` + context | ergonomic operations |
| Assertion of impossible state | `panic!` or `expect` | invariant failure |

---

# Chapter 28: Testing, Docs, and Confidence

## Step 1 - The Problem

Rust's type system catches a lot, but it does not catch:

- wrong business logic
- incorrect boundary assumptions
- regressions in output shape
- integration mistakes across crates or modules

Strong Rust codebases treat tests and docs as part of API design, not as afterthoughts.

## Step 2 - Rust's Design Decision

Rust's built-in testing story spans:

- unit tests inside modules
- integration tests in `tests/`
- doctests in documentation

The ecosystem adds:

- `proptest` for property-based testing
- `insta` for snapshot testing

Rust accepted:

- multiple test layers
- some boilerplate around module organization

Rust refused:

- a single monolithic testing style pretending all confidence needs are identical

## Step 3 - The Mental Model

Plain English rule:

- unit tests validate small logic locally
- integration tests validate public behavior from outside the crate
- doctests validate examples and documentation truth

## Step 4 - Minimal Code Example

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_two_numbers() {
        assert_eq!(add(2, 3), 5);
    }
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `#[cfg(test)]` means the module exists only when compiling tests.
2. `use super::*;` imports the surrounding module's items.
3. `#[test]` marks a function for the test harness.
4. `cargo test` builds a test binary and runs all discovered tests.

This arrangement matters because unit tests inside the module can access private implementation details, while integration tests in `tests/` can only use the public API.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Unit tests sit close to the code they check. Integration tests act more like real users of the crate.

### Level 2 - Engineer

Strong test strategy often looks like:

- unit tests for pure logic and edge cases
- integration tests for public workflows
- doctests for usage examples
- snapshot tests for structured output
- property tests for invariants that should hold across many generated inputs

### Level 3 - Systems

Tests are how you preserve invariants the type system cannot encode. They are especially important around:

- parsing
- formatting
- protocol boundaries
- concurrency behavior
- error surface stability

The best Rust codebases often read tests first because tests reveal intended usage and failure boundaries more directly than implementation files.

## `cargo test`, `#[cfg(test)]`, and Organization

Useful commands:

```bash
cargo test
cargo test some_name
cargo test -- --nocapture
cargo test -- --test-threads=1
```

Keep pure helper functions small enough that they are easy to unit test. Use integration tests when you care about the public contract rather than private internals.

## `proptest`, `insta`, and Test Doubles

Property testing is valuable when invariants matter more than example cases:

- parser round trips
- serialization stability
- ordering guarantees

Snapshot testing is useful when output structure matters:

- CLI output
- generated config
- structured serialization

Test doubles in Rust often come from traits rather than mocking frameworks first. If behavior is abstracted behind a trait, fake implementations are often enough.

## Step 7 - Common Misconceptions

Wrong model 1: "The borrow checker means fewer tests are needed."

Correction: memory safety and behavioral correctness are different.

Wrong model 2: "Integration tests are just slower unit tests."

Correction: they validate a different contract: the public API as a consumer sees it.

Wrong model 3: "Doctests are cosmetic."

Correction: they are executable examples and one of the best ways to stop docs from rotting.

Wrong model 4: "Mocking is always the right way to test."

Correction: in Rust, small traits and real-value tests are often cleaner than heavy mocking.

## Step 8 - Real-World Pattern

Mature Rust repositories often rely heavily on:

- integration tests for CLI and HTTP behavior
- snapshot tests for user-visible output
- doctests for public libraries
- properties for parsers and serializers

Tests are often the fastest map into an unfamiliar codebase because they show intended usage instead of implementation detail first.

## Step 9 - Practice Block

### Code Exercise

Write:

- one unit test
- one integration-test idea
- one doctest example

for a small parser function.

### Code Reading Drill

Explain what this test can access and why:

```rust
#[cfg(test)]
mod tests {
    use super::*;
}
```

### Spot the Bug

Why is this test likely brittle?

```rust
assert_eq!(format!("{value:?}"), "State { x: 1, y: 2 }");
```

### Refactoring Drill

Take a long integration test that mixes setup, action, and assertions chaotically. Restructure it into a clearer scenario.

### Compiler Error Interpretation

If a doctest fails because an item is private, translate that as: "my documentation example is pretending to be a crate user, but I documented an internal-only path."

## Step 10 - Contribution Connection

After this chapter, you can read and add:

- unit and integration tests
- doctest examples
- property and snapshot coverage
- regression tests for reported bugs

Good first PRs include:

- turning a bug report into a failing test
- adding missing doctests to public APIs
- improving snapshot coverage for CLI output

## In Plain English

Rust catches many mistakes before the program runs, but it cannot tell whether your feature does the right thing. Tests and docs close that gap. That matters because good systems code is not just safe code; it is code whose behavior stays trustworthy over time.

## What Invariant Is Rust Protecting Here?

Behavioral contracts, public examples, and regression boundaries must stay true even when internal implementations change.

## If You Remember Only 3 Things

- Unit, integration, and doctests serve different purposes.
- Tests are often the best map into a codebase's intended behavior.
- The type system reduces a class of bugs; it does not remove the need for behavioral verification.

## Memory Hook

Types are the building frame. Tests are the load test. The frame can be perfect and still fail if the wrong bridge is attached to it.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is `#[cfg(test)]` for? | Compiling test-only code when running the test harness. |
| What can unit tests access that integration tests usually cannot? | Private items in the same module tree. |
| What do integration tests validate? | The public API from an external consumer perspective. |
| Why are doctests valuable? | They keep examples executable and documentation honest. |
| When is `proptest` useful? | When invariants matter across many generated inputs. |
| When is `insta` useful? | When structured output should remain stable and reviewable. |
| Why are bug-regression tests valuable? | They prevent the same failure from quietly returning later. |
| Why can tests be a good onboarding tool? | They show intended usage and edge cases clearly. |

## Chapter Cheat Sheet

| Need | Test layer | Why |
|---|---|---|
| Pure local logic | unit test | fast and close to code |
| Public API workflow | integration test | consumer perspective |
| Executable docs | doctest | example correctness |
| Output stability | snapshot test | visible diff review |
| General invariant | property test | many generated cases |

---

# Chapter 29: Serde, Logging, and Builder Patterns

## Step 1 - The Problem

Real applications spend huge amounts of time doing three practical things:

- moving data across serialization boundaries
- explaining what the system is doing
- constructing configuration-rich objects safely

The naive versions are easy to write and hard to maintain:

- hand-written serialization glue
- unstructured log strings
- constructors with seven positional arguments

## Step 2 - Rust's Design Decision

The ecosystem standardized around:

- `serde` for serialization and deserialization
- `tracing` for structured diagnostics
- builders for readable staged construction

Rust accepted:

- derive macros and supporting crate conventions
- a little extra ceremony for observability and configuration

Rust refused:

- stringly-typed logging as the main observability story
- giant constructor signatures as the default interface for complex types

## Step 3 - The Mental Model

Plain English rule:

- `serde` turns Rust types into data formats and back
- `tracing` records structured events and spans, not just strings
- builders make complex construction readable and safer

## Step 4 - Minimal Code Example

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    host: String,
    port: u16,
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

`#[derive(Serialize, Deserialize)]` runs procedural macros that generate impls of the `serde` traits for `Config`.

The field names and types become part of the serialization contract unless further customized with serde attributes.

That means this derive is not just convenience. It is a statement about how data crosses process or persistence boundaries.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Serde saves you from manually turning structs into JSON, TOML, YAML, and other formats.

### Level 2 - Engineer

Serde is at its best when your Rust types already reflect the domain shape well. Attributes like `default`, `rename`, and `skip_serializing_if` let you keep the external wire format stable while evolving internal types carefully.

Structured logging with `tracing` is similarly powerful because fields become queryable and filterable instead of getting trapped inside free-form messages.

Builders are valuable when object construction needs defaults, optional fields, or validation at the final step.

### Level 3 - Systems

Serialization is an ABI of sorts for data. Once a type is persisted, sent over the network, or documented as config, its serde behavior becomes part of the operational contract.

Structured logs are also data contracts. If you log `user_id`, `request_id`, and latency as fields, downstream tooling can filter and aggregate them. If you hide all of that in one formatted string, you gave up machine usefulness for convenience.

## Serde Attributes and Customization

```rust
use serde::{Deserialize, Serialize};

fn default_port() -> u16 {
    8080
}

#[derive(Debug, Serialize, Deserialize)]
struct Settings {
    host: String,
    #[serde(default = "default_port")]
    port: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    tls_cert: Option<String>,
}
```

Custom impls are worth the effort when:

- validation and decoding must happen together
- external formats are irregular
- backwards compatibility requires translation logic

## `tracing` vs `log`

`log` is a thin facade for textual levels.
`tracing` models events and spans with fields.

That difference matters in distributed and async systems:

- spans can represent request lifetimes
- events can attach typed structured fields
- subscribers can export to observability backends

Example:

```rust
use tracing::{info, instrument};

#[instrument(skip(secret))]
fn login(user: &str, secret: &str) {
    info!(user, "login attempt");
}
```

The skip list itself is a design statement: observability should not leak secrets.

## Builders and Typestate Builders

Ordinary builder:

```rust
struct ServerConfig {
    host: String,
    port: u16,
    tls: bool,
}

struct ServerConfigBuilder {
    host: String,
    port: u16,
    tls: bool,
}

impl ServerConfigBuilder {
    fn new(host: impl Into<String>) -> Self {
        Self { host: host.into(), port: 8080, tls: false }
    }

    fn port(mut self, port: u16) -> Self {
        self.port = port;
        self
    }

    fn tls(mut self, tls: bool) -> Self {
        self.tls = tls;
        self
    }

    fn build(self) -> ServerConfig {
        ServerConfig { host: self.host, port: self.port, tls: self.tls }
    }
}
```

Use a typestate builder when required steps matter strongly enough to justify the extra generic machinery. Otherwise, ordinary builders usually hit the sweet spot.

## Step 7 - Common Misconceptions

Wrong model 1: "Serde derive is just boilerplate reduction."

Correction: it defines real data-boundary behavior and becomes part of your contract.

Wrong model 2: "Logging is just printf with levels."

Correction: in modern systems, observability depends on structured fields and spans.

Wrong model 3: "Builders are always overkill."

Correction: not when constructors become unreadable or configuration defaults matter.

Wrong model 4: "More builder methods automatically mean better API design."

Correction: builders should still preserve invariants and avoid meaningless combinations.

## Step 8 - Real-World Pattern

Across the Rust ecosystem:

- `serde` powers config, wire formats, and persistence layers
- `tracing` powers async and service observability
- builder APIs appear in clients, configs, and request construction

The common thread is contract clarity: data shape, diagnostic shape, and construction shape all become explicit.

## Step 9 - Practice Block

### Code Exercise

Design a config type with:

- defaults
- one optional field
- one renamed serialized field

Then explain what became part of the external data contract.

### Code Reading Drill

What will and will not be logged here?

```rust
#[instrument(skip(password))]
fn login(user: &str, password: &str) {}
```

### Spot the Bug

Why is this constructor a maintenance hazard?

```rust
fn new(host: String, port: u16, tls: bool, retries: usize, timeout_ms: u64, log_json: bool) -> Self
```

### Refactoring Drill

Take a struct with many optional settings and redesign it with a builder. Explain whether a typestate builder is justified.

### Compiler Error Interpretation

If serde derive fails because one field type does not implement `Serialize` or `Deserialize`, translate that as: "my outer data contract depends on a field whose own contract is missing."

## Step 10 - Contribution Connection

After this chapter, you can read and improve:

- config loading layers
- API request and response models
- structured instrumentation
- builder-style client configuration

Good first PRs include:

- adding serde defaults and skip rules thoughtfully
- converting free-form logs to structured tracing fields
- replacing huge constructors with builders

## In Plain English

Applications need to move data around, explain what they are doing, and construct complex objects without confusion. Rust's ecosystem gives strong tools for all three, but they work well only when you treat them as contracts rather than shortcuts.

## What Invariant Is Rust Protecting Here?

Serialized data, diagnostic fields, and staged construction should preserve clear, machine-usable structure rather than relying on ad hoc string conventions or fragile positional arguments.

## If You Remember Only 3 Things

- Serde derives are part of your external data contract.
- `tracing` is about structured events and spans, not prettier `println!`.
- Builders are for readability and invariant-preserving construction, not only for style.

## Memory Hook

Serde is the shipping crate label. Tracing is the flight recorder. A builder is the assembly jig. Each exists because structure beats improvisation when systems get large.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does serde derive generate? | Implementations of `Serialize` and/or `Deserialize` for the type. |
| Why can serde attributes matter operationally? | They shape the external config or wire-format contract. |
| What does `tracing` add beyond plain logging? | Structured fields and spans for machine-usable observability. |
| Why use `#[instrument(skip(...))]`? | To record useful context while avoiding sensitive or noisy fields. |
| When is a builder better than a constructor? | When there are many options, defaults, or readability concerns. |
| What is a typestate builder for? | Enforcing required construction steps at compile time. |
| Why are positional mega-constructors risky? | They are easy to misuse and hard to read or evolve safely. |
| What does it mean for logs to be structured? | Important fields are recorded separately, not buried in one string. |

## Chapter Cheat Sheet

| Need | Tool | Why |
|---|---|---|
| Serialize config or payload | `serde` derive | standard data contract |
| Add defaults or field control | serde attributes | external-format customization |
| Structured diagnostics | `tracing` | fields and spans |
| Complex object construction | builder | readable staged config |
| Compile-time required builder steps | typestate builder | stronger construction invariant |

---

# Chapter 30: Smart Pointers and Interior Mutability

## Step 1 - The Problem

Ownership and borrowing cover most programs, but not all ownership shapes are "one owner, straightforward borrows."

Sometimes you need:

- heap allocation independent of stack size
- multiple owners
- mutation behind shared references
- shared mutable state across threads

The temptation is to treat smart pointers as "ways to satisfy the borrow checker." That is exactly the wrong mental model.

## Step 2 - Rust's Design Decision

Rust offers different smart pointers because they represent different invariants:

- `Box<T>` for owned heap allocation
- `Rc<T>` for shared ownership in single-threaded code
- `Arc<T>` for shared ownership across threads
- `Cell<T>` and `RefCell<T>` for single-threaded interior mutability
- `Mutex<T>` and `RwLock<T>` for thread-safe interior mutability

Rust accepted:

- more pointer types
- explicit runtime-cost choices

Rust refused:

- one universal reference-counted mutable object model
- hidden shared mutability everywhere

## Step 3 - The Mental Model

Plain English rule: choose the pointer for the ownership shape you mean.

Ask two questions:

1. how many owners are there?
2. where is mutation allowed and who synchronizes it?

## Step 4 - Minimal Code Example

```rust
use std::cell::RefCell;
use std::rc::Rc;

let shared = Rc::new(RefCell::new(vec![1, 2, 3]));
shared.borrow_mut().push(4);
assert_eq!(shared.borrow().len(), 4);
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `Rc::new(...)` creates shared ownership with non-atomic reference counting.
2. `RefCell::new(...)` allows mutation checked at runtime instead of compile time.
3. `borrow_mut()` returns a runtime-checked mutable borrow guard.
4. If another borrow incompatible with that mutable borrow existed simultaneously, `RefCell` would panic.

The invariant here is not "mutability is free now." It is:

the aliasing rule still exists, but enforcement moved from compile time to runtime.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Smart pointers are not just pointers. Each one adds a rule about ownership or mutation.

### Level 2 - Engineer

Pick them deliberately:

- `Box<T>` when you need heap storage, recursive types, or trait objects
- `Rc<T>` when many parts of one thread need shared ownership
- `Arc<T>` when many threads need shared ownership
- `RefCell<T>` when a single-threaded design truly needs interior mutability
- `Mutex<T>` or `RwLock<T>` when cross-thread mutation must be synchronized

### Level 3 - Systems

Each smart pointer trades one cost for another:

- `Box<T>`: allocation, but simple semantics
- `Rc<T>`: refcount overhead, not thread-safe
- `Arc<T>`: atomic refcount overhead, thread-safe
- `RefCell<T>`: runtime borrow checks, panic on violation
- `Mutex<T>`: locking cost and deadlock risk

These are design decisions, not borrow-checker escape hatches.

## `Box<T>`, Trait Objects, and Recursive Types

`Box<T>` matters because some types need indirection:

- recursive enums
- heap storage separate from stack frame size
- trait objects like `Box<dyn Error>`

It is the simplest smart pointer: single owner, no shared state semantics.

## `Rc<T>` vs `Arc<T>`

The distinction is not "local versus global." It is atomicity:

- `Rc<T>` is cheaper, but not thread-safe
- `Arc<T>` is safe across threads, but pays atomic refcount costs

If you are not crossing threads, `Rc<T>` is usually the better fit.

## Interior Mutability

Interior mutability exists because sometimes `&self` methods must still update hidden state:

- memoization
- cached parsing
- mock recording in tests
- counters or deferred initialization

Single-threaded:

- `Cell<T>` for small `Copy` data
- `RefCell<T>` for richer borrowed access patterns

Multi-threaded:

- `Mutex<T>`
- `RwLock<T>`

The important design question is always:

why is shared outer access compatible with hidden inner mutation here?

## Avoiding `Rc<RefCell<T>>` Hell

`Rc<RefCell<T>>` is sometimes the right tool. It is also one of the clearest smells in beginner Rust when used everywhere.

Why it goes wrong:

- ownership boundaries disappear
- runtime borrow panics replace compile-time reasoning
- graph-like object models from other languages get imported without redesign

Alternatives often include:

- clearer single ownership plus message passing
- indices into arenas
- staged mutation
- redesigning APIs so borrowing is local instead of global

## Step 7 - Common Misconceptions

Wrong model 1: "Smart pointers are for making the borrow checker happy."

Correction: they encode real ownership and mutation semantics.

Wrong model 2: "`Rc<RefCell<T>>` is idiomatic anytime ownership is hard."

Correction: sometimes necessary, often a sign the design needs reshaping.

Wrong model 3: "`Arc` is just the thread-safe `Box`."

Correction: it is shared ownership with atomic refcounting, not mere heap allocation.

Wrong model 4: "Interior mutability breaks Rust's rules."

Correction: it keeps the rules but enforces some of them at runtime or under synchronization.

## Step 8 - Real-World Pattern

You see:

- `Box<dyn Error>` and boxed trait objects at abstraction boundaries
- `Arc`-wrapped shared app state in services
- `Mutex` and `RwLock` around caches and registries
- `RefCell` in tests, single-threaded caches, and some compiler-style interior bookkeeping

Strong code treats these as deliberate boundary tools rather than default building blocks.

## Step 9 - Practice Block

### Code Exercise

For each scenario, pick a pointer and justify it:

- recursive AST node
- shared cache in one thread
- shared config across worker threads
- mutable test double used through `&self`

### Code Reading Drill

What two independent meanings are encoded here?

```rust
let state = Arc::new(Mutex::new(HashMap::<String, usize>::new()));
```

### Spot the Bug

Why is this suspicious design?

```rust
struct App {
    state: Rc<RefCell<HashMap<String, String>>>,
}
```

Assume this sits at the heart of a growing application.

### Refactoring Drill

Take a design relying on `Rc<RefCell<T>>` across many modules and redesign it with one clear owner plus borrowed views or messages.

### Compiler Error Interpretation

If the compiler says `Rc<T>` cannot be sent between threads safely, translate that as: "this ownership-sharing tool was designed only for single-threaded use."

## Step 10 - Contribution Connection

After this chapter, you can read and improve:

- app-state wiring
- cache internals
- trait-object boundaries
- shared ownership and mutation decisions

Good first PRs include:

- replacing unnecessary `Arc<Mutex<_>>` layers
- documenting why a smart pointer is used
- simplifying designs that overuse `Rc<RefCell<T>>`

## In Plain English

Smart pointers exist because not all ownership problems look the same. Some values need heap storage, some need many owners, and some need carefully controlled hidden mutation. Rust makes those differences explicit so you pay only for the behavior you actually need.

## What Invariant Is Rust Protecting Here?

Pointer-like abstractions must preserve the intended ownership count, mutation discipline, and thread-safety guarantees rather than collapsing all sharing into one vague mutable object model.

## If You Remember Only 3 Things

- Pick smart pointers for ownership shape, not as a reflex.
- Interior mutability moves enforcement, but it does not erase the aliasing rule.
- `Rc<RefCell<T>>` can be valid, but widespread use often signals missing structure.

## Memory Hook

Smart pointers are different kinds of building keys. `Box` is one key. `Rc` is many copies of one key for one building. `Arc` is many secured badges for a cross-site campus. `RefCell` and `Mutex` are the locked cabinets inside.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is `Box<T>` mainly for? | Single-owner heap allocation, recursive types, and trait-object storage. |
| What is the key difference between `Rc<T>` and `Arc<T>`? | `Arc` uses atomic reference counting for thread safety; `Rc` does not. |
| What does `RefCell<T>` do? | Provides interior mutability with runtime borrow checking in single-threaded code. |
| What is `Cell<T>` best for? | Small `Copy` values that need simple interior mutation. |
| What does `Mutex<T>` add? | Thread-safe exclusive access via locking. |
| Does interior mutability remove Rust's aliasing rule? | No. It changes how and when the rule is enforced. |
| Why can `Rc<RefCell<T>>` become a smell? | It often hides poor ownership design and replaces compile-time reasoning with runtime panics. |
| What question should guide smart-pointer choice? | How many owners exist, and how is mutation synchronized or restricted? |

## Chapter Cheat Sheet

| Need | Prefer | Why |
|---|---|---|
| One owner on heap | `Box<T>` | simple indirection |
| Shared ownership in one thread | `Rc<T>` | cheap refcount |
| Shared ownership across threads | `Arc<T>` | atomic refcount |
| Hidden mutation in one thread | `Cell<T>` / `RefCell<T>` | interior mutability |
| Hidden mutation across threads | `Mutex<T>` / `RwLock<T>` | synchronized access |

---

## Part 4 Summary

Idiomatic Rust engineering is not a bag of style tips. It is the practice of choosing data structures, abstractions, and APIs whose invariants stay visible:

- collections make ownership and absence explicit
- iterators preserve streaming structure without hidden work
- closures carry context with ownership-aware capture
- traits and generics express capability and type relationships precisely
- error handling turns failure into part of the contract
- tests and docs preserve behavioral truth
- serde, tracing, and builders make structure visible at boundaries
- smart pointers encode ownership shape rather than escaping it

That is what strong Rust code feels like when you read it: not clever, but deliberate.
