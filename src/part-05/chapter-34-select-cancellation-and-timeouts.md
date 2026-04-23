# Chapter 34: `select!`, Cancellation, and Timeouts

<div class="ferris-says" data-variant="insight">
<p><code>select!</code>, <code>tokio::select!</code>, cancellation tokens, timeouts, back-pressure. The vocabulary of real-world async Rust. If you came from JavaScript expecting <code>Promise.race</code>, this is where the Rust version reveals itself as both more and less than what you knew.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-05/chapter-33-async-await-and-futures.md">Ch 33: Async</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li><code>tokio::select!</code> for racing multiple futures</li><li>Cancellation safety and drop semantics</li><li>Timeouts as first-class concurrency primitives</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">35<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--async);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Race Diagram</div><h2 class="visual-figure__title">`select!` Chooses One Winner and Drops the Losers</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Select race among receive future, timer, and shutdown future with losers dropped">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(58,134,255,0.18)"></rect>
        <rect x="78" y="100" width="122" height="40" rx="12" fill="#3a86ff"></rect>
        <rect x="78" y="180" width="122" height="40" rx="12" fill="#ffbe0b"></rect>
        <rect x="78" y="260" width="122" height="40" rx="12" fill="#e63946"></rect>
        <text x="112" y="124" class="svg-small" style="fill:#ffffff;">recv()</text>
        <text x="112" y="204" class="svg-small" style="fill:#6b3e00;">sleep()</text>
        <text x="104" y="284" class="svg-small" style="fill:#ffffff;">shutdown</text>
        <path d="M200 120 H 286 M200 200 H 286 M200 280 H 286" stroke="#94a3b8" stroke-width="6"></path>
        <circle cx="338" cy="120" r="22" fill="#52b788"></circle>
        <circle cx="338" cy="200" r="22" fill="#d62828"></circle>
        <circle cx="338" cy="280" r="22" fill="#d62828"></circle>
        <text x="328" y="126" class="svg-small" style="fill:#073b1d;">✓</text>
        <text x="328" y="206" class="svg-small" style="fill:#ffffff;">✗</text>
        <text x="328" y="286" class="svg-small" style="fill:#ffffff;">✗</text>
        <rect x="388" y="94" width="84" height="52" rx="14" fill="#52b788"></rect>
        <text x="406" y="124" class="svg-small" style="fill:#073b1d;">branch runs</text>
        <text x="256" y="340" class="svg-small" style="fill:#4b5563;">losing futures are cancelled by `Drop`</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--error);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Cancellation Safety</div><h2 class="visual-figure__title">Safe Losers vs Dangerous Losers</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Contrast between cancellation-safe timer or recv futures and dangerous partial write futures">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="52" y="76" width="182" height="260" rx="18" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect>
        <rect x="306" y="76" width="182" height="260" rx="18" fill="#40161b" stroke="#d62828" stroke-width="3"></rect>
        <text x="92" y="110" class="svg-subtitle" style="fill:#d9fbe9;">Safe to drop</text>
        <text x="344" y="110" class="svg-subtitle" style="fill:#ffd9dc;">Dangerous to drop</text>
        <text x="86" y="164" class="svg-small" style="fill:#d9fbe9;">timer future</text>
        <text x="86" y="190" class="svg-small" style="fill:#d9fbe9;">channel recv future</text>
        <text x="86" y="216" class="svg-small" style="fill:#d9fbe9;">no external partial side effect</text>
        <text x="334" y="164" class="svg-small" style="fill:#ffd9dc;">multipart write</text>
        <text x="334" y="190" class="svg-small" style="fill:#ffd9dc;">buffered custom parser</text>
        <text x="334" y="216" class="svg-small" style="fill:#ffd9dc;">lock-held protocol step</text>
        <path d="M116 262 l18 18 34 -40" fill="none" stroke="#52b788" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M364 240 L 430 306 M430 240 L364 306" stroke="#d62828" stroke-width="8" stroke-linecap="round"></path>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem

Real systems rarely wait on one thing at a time. They need to react to whichever event happens first:

- an inbound message
- a timeout
- a shutdown signal
- completion of one among several tasks

If you cannot race those events cleanly, you either block too long or build brittle coordination code. But racing futures introduces a new danger: what happens to the losers?

In callback-heavy environments, it is common to forget cleanup paths or to accidentally continue two branches of work after only one should win. In async Rust, the failure mode usually appears as cancellation bugs: partial work, lost buffered data, or dropped locks.

## Step 2 - Rust's Design Decision

Rust and Tokio make cancellation explicit through `Drop`.

When `select!` chooses one branch, the futures in the losing branches are dropped unless you structured the code to keep them around. This is a clean model because it reuses the existing resource cleanup story, but it means cancellation safety becomes a real design concern.

Rust accepted:

- you must understand dropping as cancellation
- you must reason about partial progress inside futures

Rust refused:

- hidden task abortion semantics
- implicit rollback magic for partially completed work

## Step 3 - The Mental Model

Plain English rule: `select!` waits on several futures and runs the branch for the one that becomes ready first. Every losing branch is cancelled by being dropped.

That means you must ask one question for every branch:

If this future is dropped right here, is the system still correct?

## Step 4 - Minimal Code Example

```rust
use tokio::sync::mpsc;
use tokio::time::{self, Duration};

async fn recv_or_timeout(mut rx: mpsc::Receiver<String>) {
    tokio::select! {
        Some(msg) = rx.recv() => println!("got {msg}"),
        _ = time::sleep(Duration::from_secs(5)) => println!("timed out"),
    }
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `rx.recv()` creates a future that will resolve when a message is available or the channel closes.
2. `time::sleep(...)` creates a timer future.
3. `tokio::select!` polls both futures.
4. When one becomes ready, the corresponding branch runs.
5. The other future is dropped.

Why this is safe in the example:

- `recv()` is cancellation-safe in the sense that dropping the receive future does not consume a message and lose it silently
- dropping `sleep` simply abandons the timer

Now imagine a future that incrementally fills an internal buffer before returning a complete frame. If it is dropped mid-way and the buffered bytes are not preserved elsewhere, cancellation may discard meaningful progress. That is a correctness problem, not a type error.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

`select!` is a race. The first ready thing wins. The others stop.

</div>
<div class="level-panel" data-level="Engineer">

Use `select!` for event loops, shutdown handling, heartbeats, and timeouts. But audit each branch for cancellation safety.

Futures tied directly to queue receives, socket accepts, or timer ticks are often cancellation-safe. Futures doing multipart writes, custom buffering, or lock-heavy workflows often need more care.

</div>
<div class="level-panel" data-level="Deep Dive">

Cancellation in Rust async is not a separate runtime feature bolted on later. It is a consequence of ownership. A future owns its in-progress state. Dropping the future destroys that state. Therefore, cancellation safety is really a statement about whether destroying in-progress state at a suspension point preserves system invariants.

This is why careful async code often separates:

- state machine progress
- externally committed side effects
- retry boundaries

</div>
</div>


## Timeouts and Graceful Shutdown

Timeouts are just another race:

```rust
use tokio::time::{timeout, Duration};

async fn run_with_timeout() {
    match timeout(Duration::from_secs(2), slow_operation()).await {
        Ok(value) => println!("completed: {value:?}"),
        Err(_) => println!("timed out"),
    }
}

async fn slow_operation() -> &'static str {
    tokio::time::sleep(Duration::from_secs(10)).await;
    "done"
}
```

Graceful shutdown often looks like this:

```rust
use tokio::sync::watch;

async fn worker(mut shutdown: watch::Receiver<bool>) {
    loop {
        tokio::select! {
            _ = shutdown.changed() => {
                if *shutdown.borrow() {
                    break;
                }
            }
            _ = do_one_unit_of_work() => {}
        }
    }
}

async fn do_one_unit_of_work() {
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;
}
```

That pattern appears constantly in services: do work until a shutdown signal wins the race.

## Step 7 - Common Misconceptions

Wrong model 1: "`select!` is just like `match` for async."

Correction: `match` inspects a value you already have. `select!` coordinates live concurrent futures and drops losers.

Wrong model 2: "If a branch loses, it pauses and resumes later."

Correction: not unless you explicitly keep the future alive somewhere. Normally it is dropped.

Wrong model 3: "Timeouts are harmless wrappers."

Correction: a timeout is cancellation. If the wrapped future is not cancellation-safe, timing out may leave inconsistent in-progress state.

Wrong model 4: "Safe Rust means cancellation-safe code."

Correction: memory safety and logical protocol safety are different properties.

## Step 8 - Real-World Pattern

Production async services use `select!` for:

- request stream plus shutdown signal
- message receive plus periodic flush timer
- heartbeat plus inbound command
- completion of one task versus timeout of another

Tokio-based services also rely on bounded channels and `select!` together: queue receive is one branch, shutdown is another, and timer-driven maintenance is a third. Once you see that shape, large async codebases become far easier to navigate.

## Step 9 - Practice Block

### Code Exercise

Write an async worker that:

- receives jobs from a channel
- emits a heartbeat every second
- exits on shutdown

Use `tokio::select!` and explain what gets dropped on each branch win.

### Code Reading Drill

Explain the cancellation behavior here:

```rust
tokio::select! {
    value = fetch_config() => value,
    _ = tokio::time::sleep(Duration::from_secs(1)) => default_config(),
}
```

### Spot the Bug

Why can this be dangerous?

```rust
tokio::select! {
    _ = write_whole_response(&mut socket, &buffer) => {}
    _ = shutdown.changed() => {}
}
```

Hint: think about what happens if the write future is dropped halfway through.

### Refactoring Drill

Take a loop that does `recv().await`, then separately checks for shutdown, then separately sleeps. Refactor it into one `select!` loop and justify the behavioral change.

### Compiler Error Interpretation

If a `select!` branch complains about needing a pinned future, translate that as: "this future may be polled multiple times from the same storage location, so it cannot be moved casually between polls."

## Step 10 - Contribution Connection

After this chapter, you can read and improve:

- graceful shutdown loops
- retry plus timeout wrappers
- periodic maintenance tasks
- queue-processing loops with heartbeats or flush timers

Good first PRs include:

- documenting cancellation assumptions
- fixing timeout handling around non-cancellation-safe operations
- restructuring event loops to make shutdown behavior explicit

## In Plain English

Sometimes a program must react to whichever thing happens first. Rust lets you race those possibilities, but it makes you deal honestly with the loser paths. That matters to systems engineers because the hard bugs are often not "which path won" but "what state was left behind when the other path lost."

## What Invariant Is Rust Protecting Here?

Dropping a future must not violate protocol correctness or lose essential state silently. Cancellation must preserve the program's externally meaningful invariants.

## If You Remember Only 3 Things

- `select!` is a race, and losing branches are normally dropped.
- Cancellation safety is about whether dropping in-progress work preserves correctness.
- Timeouts are not neutral wrappers; they are cancellation boundaries.

## Memory Hook

`select!` is a race marshal firing the starter pistol. One runner breaks the tape. The others do not pause on the track. They leave the race.

## Flashcard Deck

| Question | Answer |
|---|---|
| What happens to losing futures in `tokio::select!`? | They are dropped unless explicitly preserved elsewhere. |
| Why is timeout behavior really cancellation behavior? | Because timing out works by dropping the in-progress future. |
| What does cancellation-safe mean? | Dropping the future at a suspension point does not violate correctness or silently lose essential state. |
| Why is `rx.recv()` commonly considered cancellation-safe? | Dropping the receive future does not consume and discard a message that was not returned. |
| Why can write operations be tricky under `select!`? | Partial progress may already have happened when the future is dropped. |
| What common service pattern uses `select!`? | Work loop plus shutdown signal plus timer tick. |
| Does Rust's memory safety guarantee imply cancellation safety? | No. They protect different invariants. |
| What question should you ask for every `select!` branch? | "If this future is dropped right here, is the system still correct?" |

## Chapter Cheat Sheet

| Need | Tool | Warning |
|---|---|---|
| Wait for whichever event happens first | `tokio::select!` | Losing futures are dropped |
| Add a hard time limit | `tokio::time::timeout` | Timeout implies cancellation |
| Graceful shutdown | shutdown channel plus `select!` | Make exit path explicit |
| Periodic maintenance | `interval.tick()` branch | Know whether missed ticks matter |
| Queue work plus heartbeat | `recv()` plus timer in `select!` | Audit both branches for cancellation safety |

---
