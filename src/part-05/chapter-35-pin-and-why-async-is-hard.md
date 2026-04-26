# Chapter 35: Pin and Why Async Is Hard

<div class="ferris-says" data-variant="insight">
<p>Pinning, <code>Pin</code>, self-referential types. The one genuinely weird corner of async Rust. Approach it once, understand it, and mostly forget about it for the rest of your career — frameworks hide it well.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-05/chapter-33-async-await-and-futures.md">Ch 33: Async/Await</a><a href="../part-03/chapter-20-move-semantics-copy-clone-and-drop.md">Ch 20: Move Semantics</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Why some futures break if moved after internal references form</li><li><code>Pin</code> = "this value must not move from its current address"</li><li><code>Box::pin</code> and <code>tokio::pin!</code> in practice</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">40<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>
<div class="concept-link builds-on"><div class="concept-link-icon">←</div><div class="concept-link-body"><strong>Builds on Chapter 33</strong>Async/Await showed that futures are state machines polled to completion. Pin exists because those state machines may become self-referential across <code>.await</code> points — moving them would dangle internal pointers.<a href="../part-05/chapter-33-async-await-and-futures.md">Revisit Ch 33 →</a></div></div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--lifetime);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Self-Reference Problem</div><h2 class="visual-figure__title">Why Moving Some Values Is Unsound</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Struct moving in memory while an internal reference still points to the old location">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(131,56,236,0.18)"></rect>
        <rect x="66" y="116" width="160" height="140" rx="18" fill="#eef2ff" stroke="#3a86ff" stroke-width="3"></rect>
        <text x="108" y="148" class="svg-subtitle" style="fill:#1d4ed8;">before move</text>
        <rect x="92" y="176" width="108" height="34" rx="10" fill="#e63946"></rect>
        <text x="122" y="198" class="svg-small" style="fill:#ffffff;">data</text>
        <path d="M148 210 C 204 250, 240 250, 260 210" stroke="#8338ec" stroke-width="5" fill="none"></path>
        <rect x="314" y="116" width="160" height="140" rx="18" fill="#fff5eb" stroke="#f4a261" stroke-width="3"></rect>
        <text x="360" y="148" class="svg-subtitle" style="fill:#8a4b08;">after move</text>
        <rect x="340" y="176" width="108" height="34" rx="10" fill="#e63946"></rect>
        <text x="370" y="198" class="svg-small" style="fill:#ffffff;">data</text>
        <path d="M260 210 H 314" stroke="#fb8500" stroke-width="6" marker-end="url(#pinMoveArrow)"></path>
        <path d="M148 210 C 206 274, 286 294, 340 228" stroke="#d62828" stroke-width="5" fill="none" stroke-dasharray="8 6"></path>
        <text x="152" y="314" class="svg-small" style="fill:#d62828;">old internal pointer now points to stale location</text>
        <defs><marker id="pinMoveArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#fb8500"></path></marker></defs>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--lifetime);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Pin Contract</div><h2 class="visual-figure__title"><code>Pin&lt;P&gt;</code> Freezes the Pointee, Not the Variable</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Pinned box with stable pointee location and movable handle">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="72" y="160" width="118" height="46" rx="12" fill="#3a86ff"></rect>
        <text x="98" y="188" class="svg-small" style="fill:#ffffff;">Pin&lt;Box&lt;T&gt;&gt;</text>
        <path d="M190 183 H 280" stroke="#3a86ff" stroke-width="6" marker-end="url(#pinArrow)"></path>
        <rect x="280" y="124" width="170" height="118" rx="18" fill="#1f2937" stroke="#8338ec" stroke-width="3"></rect>
        <text x="326" y="158" class="svg-subtitle" style="fill:#f1e8ff;">pointee</text>
        <text x="316" y="186" class="svg-small" style="fill:#f1e8ff;">stable memory location</text>
        <text x="320" y="208" class="svg-small" style="fill:#f1e8ff;">do not move through</text>
        <text x="352" y="228" class="svg-small" style="fill:#f1e8ff;">this path</text>
        <path d="M118 238 v46" stroke="#52b788" stroke-width="6"></path>
        <text x="66" y="318" class="svg-small" style="fill:#dbeafe;">the handle can move; the pinned value may not</text>
        <defs><marker id="pinArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#3a86ff"></path></marker></defs>
      </svg>
    </div>
  </figure>
</div>

## In plain English first

<div class="ferris-says" data-variant="warning">
<p><code>Pin</code> exists for one reason. Once you see the reason, every API choice in this chapter follows from it.</p>
</div>

When the compiler turns your `async fn` into a state-machine struct, that struct can end up holding pointers into *itself*. (Example: you `let s = String::from(...)` and then write `let r = &s` and then `.await`. Both `s` and `r` end up as fields of the same struct. `r` is a pointer back into `s`.)

Self-referential structs are dangerous in Rust because moving a value normally invalidates pointers *into* the old location. If something moves the future struct after `r` was stored, `r` now points at freed memory. Use-after-free.

`Pin<P>` is a type-system promise: "the value behind this pointer will not be moved again before it is dropped." That's the entire idea. Once a future is wrapped in `Pin<&mut Future>`, the runtime can poll it confidently — the internal pointers stay valid because the future does not move.

`Pin` is a *type*, not a runtime mechanism. It costs zero bytes and zero CPU cycles. The whole machinery is enforced by the compiler refusing to compile code that would let you obtain a `&mut T` to a pinned value's interior (without the type opting in to `Unpin`).

<div class="ferris-says">
<p>You almost never write <code>Pin</code> by hand. The runtime's <code>spawn</code>/<code>block_on</code> hands you a pinned future, and crates like <code>pin-project-lite</code> handle the awkward ergonomics. Knowing <em>why</em> it exists is the win — that's what this chapter teaches.</p>
</div>

## Step 1 - The Problem

Some values are fine to move around in memory. Others become invalid if moved after internal references have been created.

This is the self-referential problem. A simple version in many languages looks like "store a pointer to one of your own fields." If the struct later moves, that pointer becomes stale.

Async Rust encounters this problem because the compiler-generated future for an `async fn` may contain references into its own internal state across suspension points.

Without a rule here, polling a future, moving it, and polling again could produce a dangling reference inside safe code. That is unacceptable.

## Step 2 - Rust's Design Decision

Rust introduced `Pin<P>` and `Unpin`.

- `Pin<P>` says the pointee will not be moved through this pinned access path
- `Unpin` says moving the value even after pinning is still harmless for this type

Rust accepted:

- a harder mental model
- explicit pinning APIs
- more advanced error messages when custom futures or streams are involved

Rust refused:

- hidden runtime object relocation rules
- GC-based fixing of internal references
- making all async values heap-allocated by default just to avoid movement concerns

## Step 3 - The Mental Model

Plain English rule: pinning means "this value must stay at a stable memory location while code relies on that stability."

Important refinement: pinning is about the value, not about the pointer variable that refers to it.

If a type is `Unpin`, pinning is mostly a formality. If a type is `!Unpin`, moving it after pinning would break its invariants.

## Step 4 - Minimal Code Example

```rust
use std::future::Future;
use std::pin::Pin;

fn make_future() -> Pin<Box<dyn Future<Output = u32>>> {
    Box::pin(async { 42 })
}
```

This is not the whole theory of pinning, but it is the most common practical encounter: a future is heap-allocated and pinned so it can be polled safely from a stable location.

## Step 5 - Line-by-Line Compiler Walkthrough

1. `async { 42 }` creates an anonymous future type.
2. `Box::pin(...)` allocates that future and returns `Pin<Box<...>>`.
3. The heap allocation gives the future a stable storage location.
4. The `Pin` wrapper expresses that the pointee must not move out of that location through safe access.

Why this matters for async:

polling a future may cause it to store references between its internal states. The next poll assumes those references still point to the same memory. Pinning is the mechanism that makes that assumption legal.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Some async values need to stay put in memory once execution has started. `Pin` is the type-system tool for saying "do not move this after this point."

</div>
<div class="level-panel" data-level="Engineer">

In ordinary application code, you mostly see pinning through:

- `Box::pin`
- `tokio::pin!`
- APIs taking `Pin<&mut T>`
- crates like `pin-project` or `pin-project-lite` to safely project pinned fields

If a compiler error mentions pinning, it usually means a future or stream is being polled through an API that requires stable storage.

</div>
<div class="level-panel" data-level="Deep Dive">

Pinning is subtle because Rust normally allows moves freely. A move is usually just a bitwise relocation of a value to a new storage slot. For self-referential state, that is unsound.

`Pin<P>` does not make arbitrary unsafe code safe by magic. It participates in a larger contract:

- safe code must not move a pinned `!Unpin` value through the pinned handle
- unsafe code implementing projection or custom futures must preserve that guarantee

That is why libraries like Tokio use `pin-project-lite` internally. Field projection of pinned structs is delicate. You cannot just grab a `&mut` to a structurally pinned field and move on.

</div>
</div>


## Why Async Rust Feels Harder Than JavaScript or Go

This is not accidental. Rust exposes complexity that those languages hide behind different runtime tradeoffs.

JavaScript hides many lifetime and movement issues behind GC and a single-threaded event-loop model.

Go hides much of the scheduling and stack management behind goroutines and a runtime that can grow and move stacks.

Rust refuses both tradeoffs. So you must reason about:

- which tasks may move between threads
- which futures are `Send`
- when cancellation drops in-progress state
- when pinning is required
- when holding a lock across `.await` can stall other work

That is harder. It is also why well-written async Rust can be both predictable and efficient.

## `tokio::pin!` and `pin-project`

Pinned stack storage often looks like this:

```rust
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let task = sleep(Duration::from_millis(10));
    tokio::pin!(task);

    (&mut task).await;
}
```

And pinned field projection in libraries often uses a helper macro crate:

- `pin-project`
- `pin-project-lite`

Those crates exist because manually projecting pinned fields is easy to get wrong in unsafe code.

## Why pinning matters — a step-through

<div class="ferris-says" data-variant="insight">
<p>The cleanest way to <em>see</em> why <code>Pin</code> exists is to watch what would go wrong without it. The compiler turns <code>async fn</code> into a state-machine struct that holds borrows into <em>itself</em>. Move that struct after the borrows are recorded, and the borrows now point at garbage. Step through the four frames.</p>
</div>

<div class="step-through" data-title="Why a self-referential async future cannot be moved">
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 1: an async function with a let binding to a local string and an await on a future that borrows that string">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#1d3557;font-weight:bold">Frame 1 — the async fn you wrote</text>
      <text x="60" y="78" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">async fn run() {</text>
      <text x="80" y="104" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">let s = String::from("hello");</text>
      <text x="80" y="130" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">let r: &amp;str = &amp;s;</text>
      <text x="80" y="156" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">slow_print(r).await;</text>
      <text x="60" y="182" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">}</text>
      <text x="60" y="232" style="font-family:var(--font-display);font-size:14px;fill:#457b9d">Looks ordinary. <tspan font-family="var(--font-code)">r</tspan> borrows from <tspan font-family="var(--font-code)">s</tspan>;</text>
      <text x="60" y="252" style="font-family:var(--font-display);font-size:14px;fill:#457b9d">both live in the same stack frame.</text>
      <text x="60" y="278" style="font-family:var(--font-display);font-size:14px;fill:#1d3557">But what stack frame? <tspan font-family="var(--font-code)">async fn</tspan> doesn't run until polled.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 2: the async fn is rewritten by the compiler into a state-machine enum holding both s and a pointer back into s, with an arrow showing the self-reference">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#eff6ff" stroke="#1d3557"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#1d3557;font-weight:bold">Frame 2 — what the compiler builds</text>
      <text x="60" y="78" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">enum RunFuture {</text>
      <text x="80" y="100" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">Start,</text>
      <text x="80" y="122" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">SuspendedAtAwait {</text>
      <text x="100" y="144" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">s: String,</text>
      <text x="100" y="166" style="font-family:var(--font-code);font-size:14px;fill:#d62828">r: *const str,  // points into s</text>
      <text x="80" y="188" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">},</text>
      <text x="80" y="210" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">Done,</text>
      <text x="60" y="232" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">}</text>
      <rect x="430" y="100" width="220" height="100" rx="8" fill="#fef2f2" stroke="#d62828"></rect>
      <text x="540" y="124" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#d62828;font-weight:bold">SELF-REFERENTIAL</text>
      <text x="440" y="148" style="font-family:var(--font-display);font-size:13px;fill:#1a1a2e"><tspan font-family="var(--font-code)">r</tspan> stores the address of</text>
      <text x="440" y="168" style="font-family:var(--font-display);font-size:13px;fill:#1a1a2e"><tspan font-family="var(--font-code)">s</tspan>'s heap pointer — but they</text>
      <text x="440" y="188" style="font-family:var(--font-display);font-size:13px;fill:#1a1a2e">live <em>in the same struct</em>.</text>
      <text x="60" y="282" style="font-family:var(--font-display);font-size:13px;fill:#457b9d">Local borrows that crossed an <tspan font-family="var(--font-code)">await</tspan> become struct fields.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 3: the state-machine struct is moved from one memory location to another. The internal pointer r still points at the old location, which is now garbage. A red arrow shows the dangling pointer.">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#fef2f2" stroke="#d62828"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#d62828;font-weight:bold">Frame 3 — what happens if the future is <em>moved</em></text>
      <rect x="50" y="80" width="240" height="90" rx="8" fill="#fff" stroke="#94a3b8" stroke-dasharray="6 4"></rect>
      <text x="170" y="106" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#94a3b8">old location (now garbage)</text>
      <text x="60" y="134" style="font-family:var(--font-code);font-size:13px;fill:#94a3b8">s: String("hello")</text>
      <text x="60" y="154" style="font-family:var(--font-code);font-size:13px;fill:#94a3b8">r: 0x7fff…1100</text>
      <rect x="430" y="80" width="240" height="90" rx="8" fill="#fff" stroke="#1d3557"></rect>
      <text x="550" y="106" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#1d3557">new location (after move)</text>
      <text x="440" y="134" style="font-family:var(--font-code);font-size:13px;fill:#1a1a2e">s: String("hello")</text>
      <text x="440" y="154" style="font-family:var(--font-code);font-size:13px;fill:#d62828">r: 0x7fff…1100  ← stale!</text>
      <path d="M440 154 Q 360 200 290 154" stroke="#d62828" stroke-width="2" fill="none" marker-end="url(#dangle)"></path>
      <defs>
        <marker id="dangle" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#d62828"></path></marker>
      </defs>
      <text x="360" y="232" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#d62828">The internal pointer still references the <em>old</em> address.</text>
      <text x="360" y="252" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#1a1a2e">Future polled here would dereference freed stack memory.</text>
      <text x="360" y="282" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#457b9d">This is the bug <code>Pin</code> exists to prevent.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 4: the same future is wrapped in Pin, which provides the guarantee that the inner value will not be moved again. The internal pointer r is now valid because the future stays put.">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#ecfdf5" stroke="#047857"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#047857;font-weight:bold">Frame 4 — <code>Pin&lt;&amp;mut RunFuture&gt;</code> fixes it</text>
      <rect x="200" y="80" width="320" height="100" rx="8" fill="#fff" stroke="#047857"></rect>
      <text x="360" y="104" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#047857">pinned location (cannot be moved)</text>
      <text x="220" y="134" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">s: String("hello")</text>
      <text x="220" y="158" style="font-family:var(--font-code);font-size:14px;fill:#047857">r: ptr-into-s — stable!</text>
      <path d="M340 158 Q 280 175 240 158" stroke="#047857" stroke-width="2" fill="none" marker-end="url(#stable)"></path>
      <defs>
        <marker id="stable" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#047857"></path></marker>
      </defs>
      <text x="60" y="220" style="font-family:var(--font-display);font-size:14px;fill:#1a1a2e"><code>Pin&lt;P&gt;</code> is a <em>type-system promise</em>: the value behind <code>P</code> won't be moved</text>
      <text x="60" y="240" style="font-family:var(--font-display);font-size:14px;fill:#1a1a2e">again before it's dropped. <code>poll</code> takes <code>Pin&lt;&amp;mut Self&gt;</code> precisely so</text>
      <text x="60" y="260" style="font-family:var(--font-display);font-size:14px;fill:#1a1a2e">the executor cannot accidentally invalidate the future's internal pointers.</text>
      <text x="360" y="290" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#047857">No runtime overhead. The whole guarantee is enforced in the type signatures.</text>
    </svg>
  </div>
</div>

## Step 7 - Common Misconceptions

Wrong model 1: "`Pin` means the pointer itself cannot move."

Correction: pinning is about the pointee's location and the promise not to move that value through the pinned access path.

Wrong model 2: "All futures are self-referential."

Correction: not all futures need pinning for the same reasons, and many are `Unpin`. The abstraction exists because some futures are not.

Wrong model 3: "`Pin` is only for heap allocation."

Correction: stack pinning exists too, for example with `tokio::pin!`.

Wrong model 4: "If I use `Box::pin`, I understand pinning."

Correction: you may understand the common application pattern without yet understanding the deeper contract. Those are different levels of mastery.

## Step 8 - Real-World Pattern

You will encounter pinning in:

- manual future combinators
- stream processing
- `select!` over reused futures
- library internals using projection macros
- executor and channel implementations

Tokio and related ecosystem crates use projection helpers specifically because `Pin` is not ornamental. It is part of the soundness boundary of async abstractions.

## Step 9 - Practice Block

### Code Exercise

Create a function that returns `Pin<Box<dyn Future<Output = String> + Send>>`, then use it inside a Tokio task and explain why pinning was convenient.

### Code Reading Drill

Explain what is pinned here and why:

```rust
let sleep = tokio::time::sleep(Duration::from_secs(1));
tokio::pin!(sleep);
```

### Spot the Bug

Why is a self-referential struct like this dangerous without special handling?

```rust
struct Bad<'a> {
    data: String,
    slice: &'a str,
}
```

### Refactoring Drill

Take code that recreates a timer future each loop iteration and redesign it so the same pinned future is reused where appropriate.

### Compiler Error Interpretation

If the compiler says a future cannot be unpinned or must be pinned before polling, translate that as: "this value's correctness depends on staying at a stable address while it is being driven."

## Step 10 - Contribution Connection

After this chapter, you can read:

- async combinator code
- custom stream and future implementations
- library code using `pin-project-lite`
- `select!` loops that pin a future once and poll it repeatedly

Approachable PRs include:

- replacing ad hoc pinning with clearer helper macros
- documenting why a type is `!Unpin`
- simplifying APIs that unnecessarily expose pinning to callers

## In Plain English

Some values can be moved around safely. Others break if they move after work has already started. `Pin` is Rust's way of saying "this must stay put now." That matters to systems engineers because async code is really a collection of paused state machines, and paused state machines still need their memory layout to make sense when resumed.

## What Invariant Is Rust Protecting Here?

A pinned `!Unpin` value must not be moved in a way that invalidates self-references or other address-sensitive internal state.

## If You Remember Only 3 Things

- `Pin` exists because some futures become address-sensitive across suspension points.
- `Box::pin` and `tokio::pin!` are the common practical tools; `pin-project` exists for safe field projection.
- Async Rust is harder partly because Rust refuses to hide movement, lifetime, and scheduling costs behind a GC or mandatory runtime.

## Memory Hook

Think of a future as wet concrete poured into a mold. Before it sets, you can move the mold. After internal supports are in place, moving it cracks the structure. Pinning says: leave it where it is.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does `Pin` protect? | The stable location of a value whose correctness depends on not being moved. |
| What does `Unpin` mean? | The type can still be moved safely even when accessed through pinning APIs. |
| Why do some async futures need pinning? | Because compiler-generated state machines may contain address-sensitive state across `.await` points. |
| What is the common heap-based pinning tool? | `Box::pin`. |
| What is the common stack-based pinning tool in Tokio code? | `tokio::pin!`. |
| Why do crates use `pin-project` or `pin-project-lite`? | To safely project fields of pinned structs without violating pinning guarantees. |
| Does `Pin` itself allocate memory? | No. It expresses a movement guarantee; allocation is a separate concern. |
| Why is async Rust harder than JavaScript or Go? | Rust exposes task movement, pinning, ownership, and cancellation tradeoffs that those ecosystems hide behind stronger runtimes or GC. |

## Chapter Cheat Sheet

| Situation | Tool | Why |
|---|---|---|
| Return a heap-pinned future | `Pin<Box<dyn Future<...>>>` | Stable storage plus erased type |
| Reuse one future in `select!` | `tokio::pin!` | Keep it at a stable stack location |
| Implement pinned field access safely | `pin-project` or `pin-project-lite` | Avoid unsound manual projection |
| Future polling API takes `Pin<&mut T>` | honor the contract | The future may be address-sensitive |
| Debugging pin errors | ask "what value must stay put?" | Usually reveals the invariant quickly |

---
