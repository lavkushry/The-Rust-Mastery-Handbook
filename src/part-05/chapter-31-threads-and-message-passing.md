# Chapter 31: Threads and Message Passing
<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-02/chapter-10-ownership-first-contact.md">Ch 10: Ownership</a>
      <a href="../part-03/chapter-20-move-semantics-copy-clone-and-drop.md">Ch 20: Move/Copy/Clone</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>Why <code>thread::spawn</code> requires <code>move</code></li>
      <li>Channels as ownership handoff, not shared mailboxes</li>
      <li><code>thread::scope</code> for safe temporary parallelism</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">45<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapters 32 and 33</strong>
    Ch 32 introduces <code>Arc</code>/<code>Mutex</code> for shared state (the other concurrency model). Ch 33 applies the same ownership rules to async, where <code>Send + 'static</code> plays the same role as <code>move</code> does here.
    <a href="../part-05/chapter-32-shared-state-arc-mutex-and-send-sync.md">Ch 32: Shared State →</a>
  </div>
</div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--async);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Thread Lifetime</div><h2 class="visual-figure__title">Why `thread::spawn` Needs Owned Data</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Timeline showing parent stack frame ending before spawned thread if it only borrowed local data">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(58,134,255,0.18)"></rect>
        <line x1="120" y1="124" x2="474" y2="124" stroke="#023e8a" stroke-width="4"></line>
        <line x1="120" y1="250" x2="474" y2="250" stroke="#023e8a" stroke-width="4"></line>
        <text x="56" y="128" class="svg-label" style="fill:#023e8a;">main</text>
        <text x="46" y="254" class="svg-label" style="fill:#023e8a;">thread</text>
        <rect x="152" y="108" width="184" height="28" rx="14" fill="#e63946"></rect>
        <text x="182" y="126" class="svg-small" style="fill:#ffffff;">buf lives on main stack</text>
        <rect x="192" y="234" width="210" height="28" rx="14" fill="#3a86ff"></rect>
        <text x="222" y="252" class="svg-small" style="fill:#ffffff;">spawned thread may still run</text>
        <path d="M336 88 v224" stroke="#d62828" stroke-width="5" stroke-dasharray="8 8"></path>
        <text x="346" y="182" class="svg-small" style="fill:#d62828;">main scope ends</text>
        <rect x="214" y="280" width="110" height="40" rx="12" fill="#fee2e2" stroke="#d62828" stroke-width="2"></rect>
        <text x="236" y="304" class="svg-small" style="fill:#d62828;">dangling borrow</text>
        <text x="154" y="348" class="svg-small" style="fill:#4b5563;">`move` fixes this by transferring ownership into the closure.</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--move);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Message Passing</div><h2 class="visual-figure__title">A Channel Send Is an Ownership Handoff</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Ownership handoff through a channel from sender thread to receiver thread">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="48" y="96" width="138" height="208" rx="18" fill="#1f2937" stroke="#3a86ff" stroke-width="3"></rect>
        <rect x="202" y="146" width="136" height="108" rx="18" fill="#16253c" stroke="#fb8500" stroke-width="3"></rect>
        <rect x="356" y="96" width="138" height="208" rx="18" fill="#1f2937" stroke="#52b788" stroke-width="3"></rect>
        <text x="78" y="126" class="svg-subtitle" style="fill:#dbeafe;">sender</text>
        <text x="238" y="178" class="svg-subtitle" style="fill:#ffd8cc;">channel</text>
        <text x="384" y="126" class="svg-subtitle" style="fill:#d9fbe9;">receiver</text>
        <rect x="76" y="174" width="82" height="38" rx="10" fill="#e63946"></rect>
        <text x="102" y="198" class="svg-small" style="fill:#ffffff;">String</text>
        <path d="M158 193 H 202" stroke="#fb8500" stroke-width="6" marker-end="url(#msgArrow1)"></path>
        <path d="M338 193 H 356" stroke="#52b788" stroke-width="6" marker-end="url(#msgArrow2)"></path>
        <rect x="386" y="174" width="82" height="38" rx="10" fill="#52b788"></rect>
        <text x="412" y="198" class="svg-small" style="fill:#073b1d;">String</text>
        <text x="74" y="252" class="svg-small" style="fill:#ffd9dc;">before send: sender owns</text>
        <text x="366" y="252" class="svg-small" style="fill:#d9fbe9;">after recv: receiver owns</text>
        <text x="162" y="324" class="svg-small" style="fill:#f8fafc;">No ambiguous shared ownership. The value crosses the boundary once.</text>
        <defs>
          <marker id="msgArrow1" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#fb8500"></path></marker>
          <marker id="msgArrow2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#52b788"></path></marker>
        </defs>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem

Concurrency begins with a basic tension: you want more than one unit of work to make progress, but the same memory cannot be used carelessly by all of them.

In C and C++, thread creation is easy and lifetime mistakes are easy too. A thread may outlive the stack frame it borrowed from. A pointer may still point somewhere that used to be valid. A shared queue may "work" in testing and then fail under scheduler timing you did not anticipate.

The failure mode is not abstract. This is what an unsafe shape looks like:

```c
void *worker(void *arg) {
    printf("%s\n", (char *)arg);
    return NULL;
}

int main(void) {
    pthread_t tid;
    char buf[32] = "hello";
    pthread_create(&tid, NULL, worker, buf);
    return 0; // buf's stack frame is gone, worker may still run
}
```

The bug is simple: the spawned thread was handed a pointer into a stack frame that can disappear before the thread reads it.

Message passing is a second version of the same problem. If two threads both believe they still own the same value after a send, you have either duplication of responsibility or unsynchronized sharing. Both lead to bugs.

## Step 2 - Rust's Design Decision

Rust makes two strong decisions here.

First, an unscoped thread must own what it uses. That is why `thread::spawn` requires a `'static` future or closure environment in practice: the new thread may outlive the current stack frame, so borrowed data from that frame is not acceptable.

Second, sending a value over a channel transfers ownership of that value. Rust refuses the design where a send is "just a copy of a reference unless you remember not to mutate it." That would reintroduce the same aliasing and lifetime problems under a more polite API.

Rust did accept some cost:

- You must think about `move`.
- You must understand why `'static` appears at thread boundaries.
- You often restructure code rather than keeping implicit borrowing.

Rust refused other costs:

- no tracing GC to keep borrowed values alive for threads
- no hidden runtime ownership scheme
- no "hope the race detector catches it later" model

## Step 3 - The Mental Model

Plain English rule: a spawned thread must either own the data it uses or borrow it from a scope that is guaranteed to outlive the thread.

For channels, the rule is just as simple: sending a value means handing off responsibility for that value.

If the compiler rejects your thread code, it is usually protecting one of two invariants:

- no thread may outlive the data it borrows
- no value may have ambiguous ownership after being handed across threads

## Step 4 - Minimal Code Example

```rust
use std::thread;

fn main() {
    let values = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("{values:?}");
    });

    handle.join().unwrap();
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

```rust
use std::thread;

fn main() {
    let values = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("{values:?}");
    });

    handle.join().unwrap();
}
```

Line by line, the compiler sees this:

1. `values` is an owned `Vec<i32>` in `main`.
2. `move || { ... }` tells the compiler to capture `values` by value, not by reference.
3. Ownership of `values` moves into the closure environment.
4. `thread::spawn` takes ownership of that closure environment and may execute it after `main` continues.
5. Because the closure owns `values`, there is no dangling borrow risk.
6. `join()` waits for completion and returns a `Result`, because the thread may panic.

If you remove `move`, the closure tries to borrow `values` from `main`. Now the compiler must consider the possibility that the thread runs after `main` reaches the end of scope. That would mean a thread still holds a reference into dead stack data. Rust rejects that shape before the program exists.

You will typically see an error in the E0373 family for "closure may outlive the current function, but it borrows..." The exact wording varies slightly across compiler versions, but the design reason does not.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

`move` on a thread closure means "the new thread gets its own stuff." Without that, the new thread would be trying to borrow from the current function, which might finish too soon.

</div>
<div class="level-panel" data-level="Engineer">

Use `thread::spawn` when the thread's lifetime is logically independent. Use `thread::scope` when the thread is just temporary parallel work inside a parent scope and should be allowed to borrow local data safely.

Channels are the idiomatic tool when ownership handoff is the design. Shared state behind locks is the tool when many threads must observe or update the same long-lived state.

</div>
<div class="level-panel" data-level="Deep Dive">

`thread::spawn` forces a strong boundary because the thread is scheduled independently by the OS. Rust cannot assume when it will run or when the parent stack frame will end. The `'static` requirement is not about "must live forever." It means "contains no borrow that could become invalid before the thread is done."

Message passing composes well with ownership because a send is a move. The type system can reason about exactly one owner before the send and exactly one owner after the send. That makes channel-based concurrency a natural extension of Rust's single-owner model.

</div>
</div>


## Scoped Threads

Sometimes a thread does not need to escape the current scope. In that case, requiring ownership of everything would be unnecessarily strict.

```rust
use std::thread;

fn main() {
    let mut values = vec![1, 2, 3, 4];

    thread::scope(|scope| {
        let (left, right) = values.split_at_mut(2);

        scope.spawn(move || left.iter_mut().for_each(|x| *x *= 2));
        scope.spawn(move || right.iter_mut().for_each(|x| *x *= 10));
    });

    assert_eq!(values, vec![2, 4, 30, 40]);
}
```

`thread::scope` changes the proof obligation. The compiler now knows every spawned thread must complete before the scope exits, so borrowing from local data is safe if the borrows are themselves non-overlapping and valid.

That is a very Rust design move: make the safe case explicit, then let the compiler exploit the stronger invariant.

## Channels and Backpressure

The standard library gives you `std::sync::mpsc`, which is adequate for many cases and great for understanding the model.

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        tx.send(String::from("ready")).unwrap();
    });

    let message = rx.recv().unwrap();
    assert_eq!(message, "ready");
}
```

The most important thing here is not the API. It is the ownership event:

- sender owns the `String`
- `send` moves the `String` into the channel
- receiver becomes the new owner when `recv` returns it

For high-throughput or more feature-rich cases, many production codebases use `crossbeam-channel` because it supports better performance characteristics and richer coordination patterns. The design lesson stays the same: moving messages is often cleaner than sharing data structures.

Bounded channels matter because they encode backpressure. If a producer can always enqueue without limit, memory becomes the pressure valve. That is usually the wrong valve.

## Step 7 - Common Misconceptions

> **Common Mistake**
> Thinking `move` "copies" captured values into a thread. It does not. It moves ownership unless the captured type is `Copy`.

Wrong model 1: "If I call `join()`, borrowing into `thread::spawn` should be fine."

Why it forms: humans read top to bottom and see the join immediately after spawn.

Why it is wrong: `thread::spawn` does not know, at the type level, that you will definitely join before the borrowed data dies. The API is intentionally conservative because the thread is fundamentally unscoped.

Correction: use `thread::scope` when borrowing is logically correct.

Wrong model 2: "`'static` means heap allocation."

Why it forms: many examples use `String`, `Arc`, or owned data.

Why it is wrong: `'static` is about the absence of non-static borrows, not where bytes live.

Correction: a moved `Vec<T>` satisfies a `thread::spawn` boundary without becoming immortal.

Wrong model 3: "Channels are for copying data around."

Why it forms: in other languages, channel sends often look like passing references around casually.

Why it is wrong: in Rust, the valuable property is ownership transfer.

Correction: think "handoff," not "shared mailbox with hidden aliases."

## Step 8 - Real-World Pattern

You will see two recurring shapes in real Rust repositories:

1. request or event ownership is moved into worker tasks or threads
2. bounded queues are used to express capacity limits, not just communication

Tokio-based servers, background workers, and data-pipeline code often use channels to decouple ingress from processing. The important design pattern is not the exact crate. It is that work units become owned values crossing concurrency boundaries.

CLI and search tools take the same approach. A parser thread may produce paths or work items, and worker threads consume them. That structure reduces lock contention and makes shutdown behavior easier to reason about.

## Step 9 - Practice Block

### Code Exercise

Write a program that:

- creates a bounded channel
- spawns two producers that each send five strings
- has one consumer print messages in receive order
- exits cleanly when both producers are done

### Code Reading Drill

Read this and explain who owns `job` at each step:

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel();
let tx2 = tx.clone();

thread::spawn(move || tx.send(String::from("a")).unwrap());
thread::spawn(move || tx2.send(String::from("b")).unwrap());

for job in rx {
    println!("{job}");
}
```

### Spot the Bug

What will the compiler object to here, and why?

```rust
use std::thread;

fn main() {
    let name = String::from("worker");
    let name_ref = &name;

    let handle = thread::spawn(|| {
        println!("{name_ref}");
    });

    handle.join().unwrap();
}
```

### Refactoring Drill

Take a design that shares `Arc<Mutex<Vec<Job>>>` across many worker threads and replace it with a channel-based design. Explain what got simpler and what got harder.

### Compiler Error Interpretation

If you see an error saying the closure may outlive the current function but borrows a local variable, translate it into plain English: "this thread boundary requires owned data, but I tried to smuggle a borrow through it."

## Step 10 - Contribution Connection

After this chapter, you can start reading:

- worker-pool code
- producer-consumer pipelines
- test helpers that use threads to simulate concurrent clients
- code that uses `thread::scope` for temporary parallelism

Approachable first PRs include:

- replace unbounded work queues with bounded ones where backpressure is needed
- convert awkward shared mutable state into message passing
- improve shutdown or join handling in threaded tests

## In Plain English

Threads are separate workers. Rust insists that each worker either owns its data or borrows it from a scope that is guaranteed to stay alive long enough. That matters to systems engineers because concurrency bugs are often timing bugs, and timing bugs are the most expensive class of bugs to debug after deployment.

## What Invariant Is Rust Protecting Here?

No thread may observe memory through a borrow that can become invalid before the thread finishes using it. For channels, ownership after a send must be unambiguous.

## If You Remember Only 3 Things

- `thread::spawn` is an ownership boundary, so `move` is usually the correct mental starting point.
- `thread::scope` exists because some threads are temporary parallel work, not detached lifetimes.
- Channels are most useful when you think of them as ownership handoff plus backpressure, not just communication syntax.

## Memory Hook

An unscoped thread is a courier leaving the building. If you hand it a borrowed office key instead of the actual package, you are assuming the office will still exist when the courier arrives.

## Flashcard Deck

| Question | Answer |
|---|---|
| Why does `thread::spawn` usually need `move`? | Because the spawned thread may outlive the current scope, so captured data must be owned rather than borrowed. |
| What does `'static` mean at a thread boundary? | The closure environment contains no borrow that could expire too early. |
| When should you prefer `thread::scope` over `thread::spawn`? | When child threads are temporary work that must finish before the current scope exits. |
| What happens to a value sent over a channel? | Ownership moves into the channel and then to the receiver. |
| Why are bounded channels important? | They encode backpressure and prevent the queue from turning memory into an unbounded shock absorber. |
| Why is a post-`spawn` `join()` not enough to justify borrowing into `thread::spawn`? | Because the API itself does not encode that promise; the compiler must type-check the thread boundary independently. |
| What kind of compiler error often appears when a thread closure borrows locals? | E0373-style "closure may outlive the current function" errors. |
| What is the design difference between message passing and shared mutable state? | Message passing transfers ownership of work units; shared mutable state requires synchronization around aliased data. |

## Chapter Cheat Sheet

| Need | Tool | Reason |
|---|---|---|
| Independent background thread | `thread::spawn(move || ...)` | Requires owned closure environment |
| Borrow local data in temporary parallel work | `thread::scope` | Scope proves child threads finish in time |
| Hand work items from producer to consumer | channel | Ownership transfer is explicit |
| Prevent unbounded producer growth | bounded channel | Backpressure is part of the design |
| Wait for a spawned thread | `JoinHandle::join()` | Surfaces panic as `Result` |

---
