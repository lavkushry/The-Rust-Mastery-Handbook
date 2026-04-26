# Chapter 40: PhantomData, Atomics, and Profiling

<div class="ferris-says" data-variant="insight">
<p>Embedded Rust, <code>embassy</code>, <code>RTIC</code>, the HAL ecosystem. Rust on microcontrollers is a first-class story now. If "systems programming" brought you to Rust, this chapter is where it pays off.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-06/chapter-36-memory-layout-and-zero-cost-abstractions.md">Ch 36: Memory Layout</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li><code>PhantomData</code> for unused type/lifetime parameters</li><li>Atomic types and memory ordering</li><li>Profiling with <code>perf</code>, <code>flamegraph</code>, <code>criterion</code></li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">40<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--trait);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Type Marker</div><h2 class="visual-figure__title"><code>PhantomData</code> Encodes a Relationship Without Runtime Bytes</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Typed ID wrapper with PhantomData marking a semantic relationship">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(33,158,188,0.18)"></rect>
        <rect x="104" y="112" width="332" height="124" rx="20" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect>
        <text x="166" y="148" class="svg-subtitle" style="fill:#0f5c70;">struct Id&lt;T&gt;</text>
        <rect x="136" y="174" width="112" height="34" rx="10" fill="#e76f51"></rect>
        <text x="170" y="196" class="svg-small" style="fill:#ffd8cc;">raw: u64</text>
        <rect x="268" y="174" width="136" height="34" rx="10" fill="#219ebc"></rect>
        <text x="286" y="196" class="svg-small" style="fill:#ffffff;">_marker: PhantomData&lt;T&gt;</text>
        <text x="126" y="280" class="svg-small" style="fill:#4b5563;">same runtime bytes, different type identity and compiler semantics</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--async);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Ordering Ladder</div><h2 class="visual-figure__title">Atomic Orderings From Weakest to Strongest</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Visual ladder of atomic memory orderings">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <g font-family="IBM Plex Sans, sans-serif">
          <rect x="136" y="70" width="268" height="34" rx="12" fill="#457b9d"></rect>
          <rect x="136" y="126" width="268" height="34" rx="12" fill="#3a86ff"></rect>
          <rect x="136" y="182" width="268" height="34" rx="12" fill="#52b788"></rect>
          <rect x="136" y="238" width="268" height="34" rx="12" fill="#ffbe0b"></rect>
          <rect x="136" y="294" width="268" height="34" rx="12" fill="#e63946"></rect>
          <text x="214" y="92" class="svg-small" style="fill:#ffffff;">Relaxed</text>
          <text x="218" y="148" class="svg-small" style="fill:#ffffff;">Acquire</text>
          <text x="220" y="204" class="svg-small" style="fill:#073b1d;">Release</text>
          <text x="220" y="260" class="svg-small" style="fill:#6b3e00;">AcqRel</text>
          <text x="220" y="316" class="svg-small" style="fill:#ffffff;">SeqCst</text>
          <text x="74" y="92" class="svg-small" style="fill:#f8fafc;">counter</text>
          <text x="66" y="148" class="svg-small" style="fill:#f8fafc;">load fence</text>
          <text x="60" y="204" class="svg-small" style="fill:#f8fafc;">publish</text>
          <text x="64" y="260" class="svg-small" style="fill:#f8fafc;">RMW sync</text>
          <text x="68" y="316" class="svg-small" style="fill:#f8fafc;">default if unsure</text>
        </g>
      </svg>
    </div>
  </figure>
</div>
<figure class="visual-figure" style="--chapter-accent: var(--perf);">
  <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Measurement Loop</div><h2 class="visual-figure__title">Profile, Benchmark, Change, Measure Again</h2></div></div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 260" role="img" aria-label="Performance workflow loop from profiling to benchmarking to verification">
      <rect x="28" y="28" width="924" height="204" rx="24" fill="#fffdf8" stroke="rgba(255,190,11,0.18)"></rect>
      <rect x="66" y="92" width="140" height="54" rx="16" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect>
      <rect x="260" y="92" width="140" height="54" rx="16" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect>
      <rect x="454" y="92" width="140" height="54" rx="16" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
      <rect x="648" y="92" width="140" height="54" rx="16" fill="#fff5eb" stroke="#e76f51" stroke-width="3"></rect>
      <text x="104" y="124" class="svg-small" style="fill:#023e8a;">Profile hot path</text>
      <text x="288" y="124" class="svg-small" style="fill:#6b3e00;">Benchmark target</text>
      <text x="492" y="124" class="svg-small" style="fill:#2d6a4f;">Verify correctness</text>
      <text x="688" y="124" class="svg-small" style="fill:#8a4b08;">Measure again</text>
      <path d="M206 118 H 260 M400 118 H 454 M594 118 H 648" stroke="#94a3b8" stroke-width="6" marker-end="url(#perfLoopArrow)"></path>
      <defs><marker id="perfLoopArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#94a3b8"></path></marker></defs>
    </svg>
  </div>
</figure>

## Step 1 - The Problem

Some systems concerns do not fit neatly into ordinary fields and methods.

You may need a type to behave as if it owns or borrows something it does not physically store. You may need lock-free coordination between threads. You may need measurement discipline so performance claims are based on evidence rather than intuition.

These are different topics, but they share a theme: they are about engineering with invisible structure.

## Step 2 - Rust's Design Decision

Rust provides:

- `PhantomData` to express type- or lifetime-level ownership relationships without runtime data
- atomic types with explicit memory ordering
- strong tooling for profiling and benchmarking rather than folklore tuning

Rust accepted:

- memory model complexity for atomics
- more explicit performance workflow

Rust refused:

- hiding ordering semantics behind vague "thread-safe" marketing
- letting type relationships disappear just because the bytes are zero-sized

## Step 3 - The Mental Model

Plain English rule:

- `PhantomData` tells the compiler about a relationship your fields do not represent directly
- atomics are for tiny shared state transitions whose ordering rules you must understand
- performance work starts with measurement, not instinct

## Step 4 - Minimal Code Example

```rust
use std::marker::PhantomData;

struct Id<T> {
    raw: u64,
    _marker: PhantomData<T>,
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

`Id<T>` stores only `raw`, but the compiler still treats `T` as part of the type identity. `PhantomData<T>` ensures:

- variance is computed as if `T` matters
- auto traits consider the intended relationship
- drop checking can reflect ownership or borrowing semantics, depending on the phantom form you use

This is why `PhantomData` is not "just to silence the compiler." It carries semantic information for the type system.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

`PhantomData` is how a type says, "I logically care about this type or lifetime even if I do not store a value of it."

</div>
<div class="level-panel" data-level="Engineer">

Use `PhantomData` for:

- typed IDs and markers
- FFI wrappers
- lifetime-carrying pointer wrappers
- variance control

Use atomics only when the shared state transition is small enough that you can explain the required ordering in a sentence. Otherwise, prefer a mutex.

</div>
<div class="level-panel" data-level="Deep Dive">

There are different phantom patterns with different implications:

- `PhantomData<T>` often signals ownership-like relation
- `PhantomData<&'a T>` signals borrowed relation
- `PhantomData<fn(T)>` and related tricks can influence variance in advanced designs

Atomics expose the memory model explicitly. `Relaxed` gives atomicity without synchronization. Acquire/Release establish happens-before edges. `SeqCst` gives the strongest globally ordered model and is often the right starting point when correctness matters more than micro-optimizing ordering.

</div>
</div>


## Atomics and Ordering Decision Rules

| Ordering | Meaning | Use when |
|---|---|---|
| `Relaxed` | atomicity only | counters and statistics not used for synchronization |
| `Acquire` | subsequent reads/writes cannot move before | loading a flag guarding access to published data |
| `Release` | prior reads/writes cannot move after | publishing data before flipping a flag |
| `AcqRel` | acquire + release on one operation | read-modify-write synchronization |
| `SeqCst` | strongest total-order model | start here unless you can prove weaker ordering is enough |

The practical rule:

- if the atomic value is a synchronization edge, not just a statistic, ordering matters
- if you cannot explain the happens-before relationship clearly, use `SeqCst` or a lock

## Profiling and Benchmarking

Performance engineering workflow:

1. profile to find hot paths
2. benchmark targeted changes
3. verify correctness stayed intact
4. measure again

Useful tools:

- `cargo flamegraph`
- `perf`
- `criterion`
- `cargo bloat`

Criterion matters because naive benchmarking is noisy. It helps with warmup, repeated sampling, and statistical comparison. `black_box` helps prevent the optimizer from deleting the work you thought you were measuring.

## Step 7 - Common Misconceptions

Wrong model 1: "`PhantomData` is just a compiler pacifier."

Correction: it affects variance, drop checking, and auto trait behavior.

Wrong model 2: "Atomics are faster mutexes."

Correction: atomics trade API simplicity for low-level ordering responsibility.

Wrong model 3: "`Relaxed` is fine for most things."

Correction: only if the value is not part of synchronization logic.

Wrong model 4: "If a benchmark got faster once, the optimization is real."

Correction: measurement needs repeatability, noise control, and representative workloads.

## Step 8 - Real-World Pattern

You will see:

- `PhantomData` in typed wrappers, pointer abstractions, and unsafe internals
- atomics in schedulers, refcounts, and coordination flags
- benchmarking and profiling integrated into crate maintenance, especially for parsers, runtimes, and data structures

Strong Rust projects treat performance like testing: as an engineering loop, not an anecdote.

## Step 9 - Practice Block

### Code Exercise

Create a typed `UserId` and `OrderId` wrapper over `u64` using `PhantomData`, then explain why mixing them is impossible.

### Code Reading Drill

What is this counter safe for, and what is it not safe for?

```rust
use std::sync::atomic::{AtomicUsize, Ordering};

static REQUESTS: AtomicUsize = AtomicUsize::new(0);

REQUESTS.fetch_add(1, Ordering::Relaxed);
```

### Spot the Bug

Why is this likely wrong?

```rust
READY.store(true, Ordering::Relaxed);
if READY.load(Ordering::Relaxed) {
    use_published_data();
}
```

Assume `READY` is meant to publish other shared data.

### Refactoring Drill

Replace an atomic-heavy state machine with a mutex-based one and explain what complexity disappeared and what throughput tradeoff you accepted.

### Compiler Error Interpretation

If a wrapper type unexpectedly ends up `Send` or `Sync` when it should not, translate that as: "my phantom relationship may not be modeling ownership or borrowing the way I thought."

## Step 10 - Contribution Connection

After this chapter, you can read:

- typed wrapper internals using `PhantomData`
- lock-free counters and flags
- profiling and benchmark harnesses
- binary-size investigations

Good first PRs include:

- replacing overly weak atomic orderings with justified ones
- adding criterion benchmarks for hot paths
- documenting why a phantom marker exists and what invariant it encodes

## In Plain English

Some of the most important facts about a system do not show up as ordinary fields. A type may logically own something it does not store directly, a flag may synchronize threads, and performance may depend on details you cannot guess from reading code casually. Rust gives you tools for these invisible relationships, but it expects you to use them precisely.

## What Invariant Is Rust Protecting Here?

Type-level relationships, cross-thread visibility, and performance claims must all reflect reality rather than assumption: phantom markers must describe real semantics, atomics must establish real ordering, and optimizations must be measured rather than imagined.

## Quick check

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quick check</span><span>PhantomData</span></div>
  <p class="quiz__q">When do you need <code>PhantomData&lt;T&gt;</code> in a struct?</p>
  <ul class="quiz__options">
    <li>Whenever you have a generic parameter you don't use.</li>
    <li>When a generic parameter or lifetime is mentioned in your struct's logical contract but not in any field — so the compiler knows the struct is "as if" it owned/borrowed a <code>T</code> for variance, drop check, and <code>Send</code>/<code>Sync</code> inference.</li>
    <li>To make the struct zero-sized.</li>
    <li>To avoid writing <code>impl Drop</code>.</li>
  </ul>
  <div class="quiz__explain">Correct. <code>PhantomData</code> is a zero-sized marker that tells the compiler "treat this struct as if it owned/borrowed a <code>T</code>". Without it, raw-pointer-based wrappers like <code>Vec</code>'s internals would have wrong variance and wrong drop check. <em>Mention</em> a parameter; <code>PhantomData</code> makes that mention semantically meaningful.</div>
  <div class="quiz__explain quiz__explain--wrong">Look at how <code>Vec&lt;T&gt;</code>'s internal raw pointer wrapper uses <code>PhantomData</code>. Why?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

## If You Remember Only 3 Things

- `PhantomData` communicates semantic relationships to the type system even when no runtime field exists.
- Atomics are for carefully reasoned state transitions, not as a default replacement for locks.
- Profile first, benchmark second, optimize third.

## Memory Hook

`PhantomData` is the invisible wiring diagram behind the wall. Atomics are the circuit breakers. Profiling is the voltage meter. None of them matter until something goes wrong, and then they matter a lot.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is `PhantomData` for? | Encoding type or lifetime relationships that are semantically real but not stored as runtime data. |
| Why can `PhantomData<&'a T>` matter differently from `PhantomData<T>`? | It communicates a borrowed relationship rather than an owned one, affecting variance and drop checking. |
| When is `Ordering::Relaxed` appropriate? | For atomicity-only use cases like statistics that do not synchronize other memory. |
| What do Acquire and Release establish together? | A happens-before relationship across threads. |
| What ordering should you start with if unsure? | `SeqCst`, or a mutex if the design is complicated. |
| Why use `criterion` instead of a naive loop and timer? | It provides better statistical benchmarking discipline. |
| What does `cargo flamegraph` help reveal? | CPU hot paths in real execution. |
| What is a sign you should use a mutex instead of atomics? | You cannot explain the required synchronization edge simply and precisely. |

## Chapter Cheat Sheet

| Problem | Tool | Why |
|---|---|---|
| Semantic type marker with no data | `PhantomData` | encode invariant in type system |
| Publish data with flag | Acquire/Release or stronger | establish visibility ordering |
| Pure counter metric | `Relaxed` atomic | atomicity without synchronization |
| Complex shared state | mutex or lock | easier invariants |
| Measure CPU hot path | flamegraph/perf | evidence before tuning |

---
