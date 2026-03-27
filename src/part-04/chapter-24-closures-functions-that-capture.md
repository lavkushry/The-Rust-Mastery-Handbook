# Chapter 24: Closures, Functions That Capture
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-02/chapter-10-ownership-first-contact.html">Ch 10: Ownership</a><a href="../part-04/chapter-25-traits-rusts-core-abstraction.html">Ch 25: Traits</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Closures as code + captured environment</li><li><code>Fn</code>, <code>FnMut</code>, <code>FnOnce</code> — the callable trait family</li><li>Why <code>move</code> is needed at thread/async boundaries</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">30<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--borrow-shared);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Capture Modes</div><h2 class="visual-figure__title">A Closure Is Code Plus Environment</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Closure anatomy with code block and captured environment fields"><rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(69,123,157,0.16)"></rect><rect x="76" y="112" width="170" height="170" rx="18" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect><text x="128" y="146" class="svg-small" style="fill:#023e8a;">code</text><text x="102" y="182" class="svg-small" style="fill:#023e8a;">|value| value &gt; limit</text><rect x="292" y="112" width="172" height="170" rx="18" fill="#eef6fb" stroke="#457b9d" stroke-width="3"></rect><text x="326" y="146" class="svg-small" style="fill:#2d5870;">environment</text><text x="322" y="182" class="svg-small" style="fill:#2d5870;">limit: 10</text><text x="322" y="208" class="svg-small" style="fill:#2d5870;">captured by borrow or value</text><path d="M246 196 H 292" stroke="#457b9d" stroke-width="5"></path><text x="132" y="320" class="svg-small" style="fill:#6b7280;">capture behavior determines callable trait, not just syntax</text></svg></div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--borrow-exclusive);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Callable Family</div><h2 class="visual-figure__title"><code>Fn</code>, <code>FnMut</code>, and <code>FnOnce</code> Reflect Capture Use</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Three callable trait cards showing shared borrow, mutable borrow, and consuming move"><rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect><rect x="42" y="118" width="136" height="170" rx="18" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect><text x="94" y="152" class="svg-small" style="fill:#dbeafe;">Fn</text><text x="70" y="186" class="svg-small" style="fill:#dbeafe;">reads captured data</text><text x="72" y="212" class="svg-small" style="fill:#dbeafe;">call many times</text><rect x="202" y="118" width="136" height="170" rx="18" fill="#3a2a14" stroke="#f4a261" stroke-width="3"></rect><text x="244" y="152" class="svg-small" style="fill:#ffe0bf;">FnMut</text><text x="220" y="186" class="svg-small" style="fill:#ffe0bf;">mutates capture</text><text x="230" y="212" class="svg-small" style="fill:#ffe0bf;">needs &amp;mut self</text><rect x="362" y="118" width="136" height="170" rx="18" fill="#3a1c17" stroke="#e63946" stroke-width="3"></rect><text x="402" y="152" class="svg-small" style="fill:#ffd8cc;">FnOnce</text><text x="382" y="186" class="svg-small" style="fill:#ffd8cc;">consumes capture</text><text x="392" y="212" class="svg-small" style="fill:#ffd8cc;">one safe call</text></svg></div>
  </figure>
</div>

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


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Closures can use values from the place where they were created. That is what makes them useful for filters, callbacks, and tasks.

</div>
<div class="level-panel" data-level="Engineer">

Most iterator closures are `Fn` or `FnMut`. Thread and async task closures often need `move` because the closure must own the captured values across the new execution boundary.

This is why `move` shows up so often in:

- `thread::spawn`
- `tokio::spawn`
- callback registration

</div>
<div class="level-panel" data-level="Deep Dive">

A closure is a compiler-generated struct plus one or more trait impls from the `Fn*` family. Captured variables become fields. The call operator lowers to methods on those traits. This is why closure capture mode is part of the type story, not just syntax sugar.

</div>
</div>


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
