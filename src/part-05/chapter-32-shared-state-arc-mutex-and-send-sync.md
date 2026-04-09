# Chapter 32: Shared State, Arc, Mutex, and Send/Sync
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-05/chapter-31-threads-and-message-passing.md">Ch 31: Threads</a><a href="../part-04/chapter-30-smart-pointers-and-interior-mutability.md">Ch 30: Smart Pointers</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li><code>Send</code> vs <code>Sync</code> — the thread-safety gates</li><li><code>Arc&lt;Mutex&lt;T&gt;&gt;</code> pattern and its tradeoffs</li><li>Why <code>Rc</code>/<code>RefCell</code> cannot cross thread boundaries</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">45<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div></div>
</div>
<div class="concept-link builds-on"><div class="concept-link-icon">←</div><div class="concept-link-body"><strong>Builds on Chapters 30 and 31</strong>Ch 30 introduced smart pointers for single-threaded shared ownership. Ch 31 showed ownership transfer across threads. This chapter combines both: shared ownership AND mutation across threads.<a href="../part-05/chapter-31-threads-and-message-passing.md">Revisit Ch 31 →</a></div></div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--trait);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Thread Traits</div><h2 class="visual-figure__title">`Send` vs `Sync`</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Visual distinction between moving a value to another thread and sharing a reference to a value across threads">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(33,158,188,0.18)"></rect>
        <rect x="56" y="86" width="180" height="248" rx="18" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect>
        <rect x="304" y="86" width="180" height="248" rx="18" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
        <text x="118" y="120" class="svg-subtitle" style="fill:#0f5c70;">`Send`</text>
        <text x="366" y="120" class="svg-subtitle" style="fill:#2d6a4f;">`Sync`</text>
        <rect x="98" y="164" width="96" height="40" rx="10" fill="#e63946"></rect>
        <text x="128" y="188" class="svg-small" style="fill:#ffffff;">T</text>
        <path d="M194 184 H 224" stroke="#fb8500" stroke-width="6" marker-end="url(#sendArrow)"></path>
        <text x="92" y="242" class="svg-small" style="fill:#4b5563;">value may move to another thread</text>
        <text x="94" y="262" class="svg-small" style="fill:#4b5563;">ownership crosses the boundary</text>
        <rect x="344" y="164" width="96" height="40" rx="10" fill="#457b9d"></rect>
        <text x="366" y="188" class="svg-small" style="fill:#ffffff;">&amp;T</text>
        <path d="M344 226 L 314 266" stroke="#52b788" stroke-width="6"></path>
        <path d="M440 226 L 470 266" stroke="#52b788" stroke-width="6"></path>
        <text x="332" y="302" class="svg-small" style="fill:#4b5563;">shared reference may be used</text>
        <text x="338" y="322" class="svg-small" style="fill:#4b5563;">from multiple threads safely</text>
        <defs><marker id="sendArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#fb8500"></path></marker></defs>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--borrow-exclusive);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Shared State</div><h2 class="visual-figure__title"><code>Arc&lt;Mutex&lt;T&gt;&gt;</code> Separates Ownership from Access</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Arc and Mutex diagram showing many owners and one lock-controlled mutable access path">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <circle cx="270" cy="190" r="64" fill="#f4a261"></circle>
        <text x="230" y="184" class="svg-subtitle" style="fill:#5e3a07;">Mutex</text>
        <text x="242" y="208" class="svg-small" style="fill:#5e3a07;">inner T</text>
        <circle cx="128" cy="120" r="36" fill="#3a86ff"></circle>
        <circle cx="128" cy="260" r="36" fill="#3a86ff"></circle>
        <circle cx="412" cy="190" r="36" fill="#3a86ff"></circle>
        <text x="104" y="126" class="svg-small" style="fill:#ffffff;">Arc</text>
        <text x="104" y="266" class="svg-small" style="fill:#ffffff;">Arc</text>
        <text x="388" y="196" class="svg-small" style="fill:#ffffff;">Arc</text>
        <path d="M160 132 L 212 162 M160 248 L 212 218 M378 190 H 334" stroke="#3a86ff" stroke-width="6"></path>
        <path d="M270 256 V 318" stroke="#ffbe0b" stroke-width="8" marker-end="url(#lockArrow)"></path>
        <rect x="214" y="318" width="112" height="34" rx="10" fill="#ffbe0b"></rect>
        <text x="238" y="340" class="svg-small" style="fill:#6b3e00;">MutexGuard</text>
        <text x="92" y="366" class="svg-small" style="fill:#f8fafc;">`Arc` = many owners. `Mutex` = one mutable accessor at a time.</text>
        <defs><marker id="lockArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#ffbe0b"></path></marker></defs>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem

Message passing is not enough for every design. Sometimes many threads need access to the same state:

- a cache
- a metrics registry
- a connection pool
- shared configuration or shutdown state

The classic failure mode is shared mutable access without synchronization. In C or C++, two threads incrementing the same counter through plain pointers create a data race. That is undefined behavior, not merely "a wrong answer sometimes."

Even when you add locks manually, another problem remains: how do you encode, in types, which values are safe to move across threads and which are safe to share by reference across threads?

## Step 2 - Rust's Design Decision

Rust splits the problem in two.

1. Ownership and borrowing still determine who can access a value.
2. Auto traits determine whether a type may cross or be shared across thread boundaries.

Those auto traits are `Send` and `Sync`.

- `Send`: ownership of this type may move to another thread
- `Sync`: a shared reference to this type may be used from another thread

For shared mutable state, Rust does not permit "many aliases, everyone mutate if careful." It requires a synchronization primitive whose API itself enforces access discipline. That is why `Mutex<T>` gives you a guard, not a raw pointer.

## Step 3 - The Mental Model

Plain English rule: if multiple threads need the same data, separate the question of ownership from the question of access.

- `Arc<T>` answers ownership: many owners
- `Mutex<T>` answers access: one mutable accessor at a time
- `RwLock<T>` answers access differently: many readers or one writer

And underneath all of it:

- `Send` decides whether a value may move to another thread
- `Sync` decides whether `&T` may be shared across threads

## Step 4 - Minimal Code Example

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = Vec::new();

    for _ in 0..4 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            let mut guard = counter.lock().unwrap();
            *guard += 1;
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    assert_eq!(*counter.lock().unwrap(), 4);
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `Arc::new(...)` creates shared ownership with atomic reference counting.
2. `Mutex::new(0)` wraps the integer in a synchronization primitive.
3. `Arc::clone(&counter)` increments the atomic refcount; it does not clone the protected `i32`.
4. `thread::spawn(move || { ... })` moves one `Arc<Mutex<i32>>` handle into each thread.
5. `counter.lock()` acquires the mutex and returns `MutexGuard<i32>`.
6. Dereferencing the guard gives mutable access to the inner `i32`.
7. When the guard goes out of scope, `Drop` unlocks the mutex automatically.

The invariant being checked is subtle but strong:

- many threads may own handles to the same shared object
- only the lock guard grants mutable access
- unlocking is tied to scope exit through RAII

If you tried the same shape with `Rc<RefCell<i32>>`, `thread::spawn` would reject it because `Rc<T>` is not `Send`, and `RefCell<T>` is not `Sync`. That is not a missing convenience. It is the type system telling you those primitives were built for single-threaded aliasing, not cross-thread sharing.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

`Arc` lets many threads own the same value. `Mutex` makes sure only one thread changes it at a time. The lock guard is like a temporary permission slip.

</div>
<div class="level-panel" data-level="Engineer">

The common pattern is `Arc<Mutex<T>>` or `Arc<RwLock<T>>`, but mature Rust code treats that as a tool, not a default.

Use it when state is truly shared and long-lived. Do not use it as a reflex to silence the borrow checker. Many designs become simpler if you isolate ownership and send messages to a single state-owning task instead.

</div>
<div class="level-panel" data-level="Deep Dive">

`Send` and `Sync` are `unsafe` auto traits. The compiler derives them structurally for safe code, but incorrect manual implementations can create undefined behavior. `Rc<T>` is `!Send` because non-atomic refcount updates would race. `Cell<T>` and `RefCell<T>` are `!Sync` because shared references to them do not provide thread-safe mutation discipline.

`Arc<Mutex<T>>` works because the components line up:

- `Arc` provides thread-safe shared ownership
- `Mutex` provides exclusive interior access
- `T` is then accessed under a synchronization contract rather than raw aliasing

</div>
</div>


## `Send` and `Sync` Precisely

| Trait | Precise meaning | Typical implication |
|---|---|---|
| `Send` | A value of this type can be moved to another thread safely | `thread::spawn` and `tokio::spawn` often require it |
| `Sync` | `&T` can be shared between threads safely | Many shared references across threads require it |

A useful equivalence to remember:

`T` is `Sync` if and only if `&T` is `Send`.

That sentence is dense, but it reveals Rust's model: thread sharing is analyzed in terms of what references may do.

## `RwLock` and Atomics

`RwLock<T>` is a better fit when reads are common, writes are rare, and the read critical sections are meaningful.

```rust
use std::sync::{Arc, RwLock};

let state = Arc::new(RwLock::new(String::from("ready")));
let read_guard = state.read().unwrap();
assert_eq!(&*read_guard, "ready");
```

Atomics are a better fit when the shared state is a small primitive with simple lock-free updates and carefully chosen memory ordering.

```rust
use std::sync::atomic::{AtomicUsize, Ordering};

let counter = AtomicUsize::new(0);
counter.fetch_add(1, Ordering::Relaxed);
```

Do not read this as "atomics are faster, so prefer them." The right mental model is:

- `Mutex<T>` for compound state and easy invariants
- atomics for narrow state transitions you can reason about precisely

## Deadlock and Lock Design

Rust prevents data races. It does not prevent deadlocks.

That distinction matters. A program can be memory-safe and still stall forever because two threads wait on each other.

The practical rules are old but still essential:

- keep lock scopes short
- avoid holding one lock while acquiring another
- define a lock acquisition order if multiple locks are necessary
- prefer moving work outside the critical section

> **Design Insight**
> Rust eliminates unsynchronized mutation bugs, not bad concurrency architecture. You still need engineering judgment.

## Step 7 - Common Misconceptions

Wrong model 1: "`Arc` makes mutation thread-safe."

Why it forms: `Arc` is the cross-thread version of `Rc`, so people assume it solves all cross-thread problems.

Correction: `Arc` only solves shared ownership. It does nothing by itself about safe mutation.

Wrong model 2: "`Mutex` is a Rust replacement for borrowing."

Why it forms: beginners often add a mutex when the borrow checker blocks them.

Correction: a mutex is a synchronization design choice, not a borrow-checker escape hatch.

Wrong model 3: "If it compiles, deadlock cannot happen."

Why it forms: Rust's safety guarantees feel broad.

Correction: Rust prevents data races, not logical waiting cycles.

Wrong model 4: "`RwLock` is always better for read-heavy workloads."

Why it forms: more readers sounds automatically better.

Correction: `RwLock` has overhead, writer starvation tradeoffs, and can perform worse under real contention patterns.

## Step 8 - Real-World Pattern

You will see `Arc<AppState>` in web services, often with inner members like pools, caches, or configuration handles. The best versions of those designs avoid wrapping the entire application state in one giant `Mutex`. Instead, they use:

- immutable shared state where possible
- fine-grained synchronization where necessary
- owned messages to serialize stateful work

That pattern appears across async web services, observability pipelines, and long-running daemons. Mature code keeps the synchronized portion small and explicit.

## Step 9 - Practice Block

### Code Exercise

Build a small in-memory metrics registry with:

- `Arc<RwLock<HashMap<String, u64>>>`
- a writer thread that increments counters
- two reader threads that snapshot the map periodically

Then explain whether a channel-based design would be simpler.

### Code Reading Drill

What is being cloned here, and what is not?

```rust
use std::sync::{Arc, Mutex};

let state = Arc::new(Mutex::new(vec![1, 2, 3]));
let state2 = Arc::clone(&state);
```

### Spot the Bug

What would go wrong conceptually if this compiled?

```rust
use std::cell::RefCell;
use std::rc::Rc;
use std::thread;

let data = Rc::new(RefCell::new(0));
thread::spawn(move || {
    *data.borrow_mut() += 1;
});
```

### Refactoring Drill

Take a design that uses one `Arc<Mutex<AppState>>` containing twenty unrelated fields. Split it into a cleaner design and justify the new boundaries.

### Compiler Error Interpretation

If the compiler says `Rc<...>` cannot be sent between threads safely, translate that as: "this type's internal mutation discipline is not thread-safe, so the thread boundary is closed to it."

## Step 10 - Contribution Connection

After this chapter, you can read and modify:

- shared service state initialization
- lock-guarded caches
- metrics counters and registries
- thread-safe wrappers around non-thread-safe internals

Beginner-safe PRs include:

- shrinking oversized lock scopes
- replacing `Arc<Mutex<T>>` with immutable sharing where mutation is not needed
- documenting `Send` and `Sync` expectations on public types

## In Plain English

Sometimes many workers need access to the same thing. Rust separates "who owns it" from "who may touch it right now." That matters to systems engineers because shared state is where performance, correctness, and operational bugs collide.

## What Invariant Is Rust Protecting Here?

Shared access across threads must never create unsynchronized mutation or unsound aliasing. If a type crosses a thread boundary, its internal behavior must make that safe.

## If You Remember Only 3 Things

- `Arc` solves shared ownership, not shared mutation.
- `Send` and `Sync` are the thread-safety gates the compiler uses to police concurrency boundaries.
- `Arc<Mutex<T>>` is useful, but a design built entirely from it is often signaling missing ownership structure.

## Memory Hook

`Arc` is the shared building deed. `Mutex` is the single key to the control room. Owning the building does not mean everyone gets to turn knobs at once.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does `Send` mean? | A value of the type can be moved to another thread safely. |
| What does `Sync` mean? | A shared reference `&T` can be used from another thread safely. |
| Why is `Rc<T>` not `Send`? | Its reference count is updated non-atomically, so cross-thread cloning or dropping would race. |
| Why is `RefCell<T>` not `Sync`? | Its runtime borrow checks are not thread-safe synchronization. |
| What does `Arc::clone` clone? | The pointer and atomic refcount participation, not the underlying protected value. |
| What unlocks a `Mutex` in idiomatic Rust? | Dropping the `MutexGuard`, usually at scope end. |
| Does Rust prevent deadlock? | No. Rust prevents data races, not waiting cycles. |
| When should you consider atomics instead of a mutex? | When the shared state is a narrow primitive transition you can reason about with memory ordering semantics. |

## Chapter Cheat Sheet

| Situation | Preferred tool | Reason |
|---|---|---|
| Shared ownership, no mutation | `Arc<T>` | Cheap clone of ownership handle |
| Shared mutable compound state | `Arc<Mutex<T>>` | Exclusive access with simple invariants |
| Read-heavy shared state | `Arc<RwLock<T>>` | Many readers, one writer |
| Single integer or flag with simple updates | atomics | No lock, explicit memory ordering |
| Single-threaded shared ownership | `Rc<T>` | Cheaper than `Arc`, but not thread-safe |

---
