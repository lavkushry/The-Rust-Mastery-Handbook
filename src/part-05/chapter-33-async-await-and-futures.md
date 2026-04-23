# Chapter 33: Async/Await and Futures

<div class="ferris-says" data-variant="insight">
<p>Async in Rust is different from async in almost any other language — futures are <em>state machines</em>, not callbacks. This chapter is the mental model that makes <code>.await</code>, executors, and runtimes make sense.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-05/chapter-31-threads-and-message-passing.md">Ch 31: Threads</a>
      <a href="../part-04/chapter-25-traits-rusts-core-abstraction.md">Ch 25: Traits</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>How <code>async fn</code> compiles to a state machine</li>
      <li>The Future trait and polling model</li>
      <li><code>join!</code> vs <code>tokio::spawn</code> for concurrency</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">45<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div>
  </div>
</div>
<div class="concept-link builds-on">
  <div class="concept-link-icon">←</div>
  <div class="concept-link-body">
    <strong>Builds on Chapter 31</strong>
    Async solves the same concurrency problem as threads but with cooperative scheduling instead of OS preemption. The ownership model (Send + 'static) applies identically.
    <a href="../part-05/chapter-31-threads-and-message-passing.md">Revisit Ch 31 →</a>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapter 35</strong>
    Pin exists because async state machines must not be moved in memory while references span await points. Ch 35 explains why.
    <a href="../part-05/chapter-35-pin-and-why-async-is-hard.md">Ch 35: Pin →</a>
  </div>
</div>

<figure class="visual-figure" style="--chapter-accent: var(--async);">
  <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">State Machine</div><h2 class="visual-figure__title">An `async fn` Becomes a Pollable Future</h2></div></div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 460" role="img" aria-label="Process flow showing async function call producing a future that is repeatedly polled until ready">
      <rect x="28" y="28" width="924" height="404" rx="24" fill="#fffdf8" stroke="rgba(58,134,255,0.18)"></rect>
      <rect x="64" y="164" width="146" height="78" rx="16" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect>
      <text x="100" y="198" class="svg-subtitle" style="fill:#023e8a;">async fn</text>
      <text x="90" y="220" class="svg-small" style="fill:#4b5563;">call creates future</text>
      <path d="M210 203 H 296" stroke="#3a86ff" stroke-width="6" marker-end="url(#asyncArrow1)"></path>
      <rect x="296" y="146" width="188" height="112" rx="18" fill="#eef6fb" stroke="#3a86ff" stroke-width="3"></rect>
      <text x="340" y="184" class="svg-subtitle" style="fill:#1d4ed8;">Future</text>
      <text x="324" y="210" class="svg-small" style="fill:#4b5563;">state machine with</text>
      <text x="330" y="228" class="svg-small" style="fill:#4b5563;">paused internal state</text>
      <path d="M484 203 H 570" stroke="#3a86ff" stroke-width="6" marker-end="url(#asyncArrow2)"></path>
      <rect x="570" y="136" width="164" height="134" rx="18" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
      <text x="610" y="176" class="svg-subtitle" style="fill:#2d6a4f;">Executor</text>
      <text x="604" y="202" class="svg-small" style="fill:#4b5563;">polls when progress</text>
      <text x="624" y="220" class="svg-small" style="fill:#4b5563;">might be possible</text>
      <path d="M734 176 C 800 176, 824 230, 734 230" stroke="#8338ec" stroke-width="6" fill="none" marker-end="url(#asyncArrow3)"></path>
      <text x="776" y="206" class="svg-small" style="fill:#8338ec;">Pending ↺</text>
      <path d="M734 270 H 858" stroke="#52b788" stroke-width="6" marker-end="url(#asyncArrow4)"></path>
      <rect x="858" y="242" width="66" height="56" rx="14" fill="#52b788"></rect>
      <text x="876" y="276" class="svg-small" style="fill:#073b1d;">Ready</text>
      <defs>
        <marker id="asyncArrow1" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#3a86ff"></path></marker>
        <marker id="asyncArrow2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#3a86ff"></path></marker>
        <marker id="asyncArrow3" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#8338ec"></path></marker>
        <marker id="asyncArrow4" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#52b788"></path></marker>
      </defs>
    </svg>
  </div>
</figure>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--async);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Concurrency Shape</div><h2 class="visual-figure__title">`join!` vs `spawn`</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Comparison between join macro and spawned tasks">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(58,134,255,0.18)"></rect>
        <rect x="56" y="76" width="182" height="272" rx="18" fill="#eef6fb" stroke="#3a86ff" stroke-width="3"></rect>
        <text x="110" y="112" class="svg-subtitle" style="fill:#1d4ed8;">`join!`</text>
        <rect x="92" y="152" width="110" height="34" rx="10" fill="#3a86ff"></rect>
        <rect x="92" y="214" width="110" height="34" rx="10" fill="#3a86ff" fill-opacity="0.7"></rect>
        <text x="118" y="173" class="svg-small" style="fill:#ffffff;">fut A</text>
        <text x="118" y="235" class="svg-small" style="fill:#ffffff;">fut B</text>
        <text x="84" y="294" class="svg-small" style="fill:#4b5563;">same task, same parent</text>
        <rect x="302" y="76" width="182" height="272" rx="18" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
        <text x="352" y="112" class="svg-subtitle" style="fill:#2d6a4f;">`spawn`</text>
        <circle cx="394" cy="160" r="26" fill="#52b788"></circle>
        <circle cx="354" cy="230" r="26" fill="#52b788"></circle>
        <circle cx="434" cy="230" r="26" fill="#52b788"></circle>
        <text x="382" y="166" class="svg-small" style="fill:#073b1d;">rt</text>
        <text x="344" y="236" class="svg-small" style="fill:#073b1d;">A</text>
        <text x="424" y="236" class="svg-small" style="fill:#073b1d;">B</text>
        <text x="322" y="294" class="svg-small" style="fill:#4b5563;">runtime owns scheduled tasks</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--async);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Await Semantics</div><h2 class="visual-figure__title">`.await` Yields Cooperatively</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Timeline showing one async task yielding so another task can run">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <line x1="96" y1="116" x2="468" y2="116" stroke="#f8fafc" stroke-width="4"></line>
        <line x1="96" y1="246" x2="468" y2="246" stroke="#f8fafc" stroke-width="4"></line>
        <text x="52" y="120" class="svg-label" style="fill:#f8fafc;">task A</text>
        <text x="52" y="250" class="svg-label" style="fill:#f8fafc;">task B</text>
        <rect x="128" y="100" width="138" height="28" rx="14" fill="#3a86ff"></rect>
        <text x="154" y="118" class="svg-small" style="fill:#ffffff;">run until await</text>
        <rect x="292" y="230" width="126" height="28" rx="14" fill="#52b788"></rect>
        <text x="326" y="248" class="svg-small" style="fill:#073b1d;">task B runs</text>
        <rect x="354" y="100" width="82" height="28" rx="14" fill="#3a86ff" fill-opacity="0.7"></rect>
        <text x="372" y="118" class="svg-small" style="fill:#ffffff;">resume</text>
        <path d="M266 114 C 302 150, 302 214, 292 244" stroke="#8338ec" stroke-width="5" fill="none"></path>
        <text x="198" y="176" class="svg-small" style="fill:#dbeafe;">Pending → executor switches work</text>
      </svg>
    </div>
  </figure>
</div>


<div class="annotated-code" style="--chapter-accent: var(--async);">

```rust
async fn fetch_data(url: &str) -> String {
    let resp = reqwest::get(url).await?;
    resp.text().await?
}

#[tokio::main]
async fn main() {
    let (a, b) = tokio::join!(
        fetch_data("https://api.a.com"),
        fetch_data("https://api.b.com"),
    );
}
```

<div class="ann-col">
  <div class="ann-item ann-async">
    <strong>async fn</strong>
    Returns a <code>Future</code>, not the value. Body doesn't run until polled.
  </div>
  <div class="ann-item ann-async">
    <strong>.await</strong>
    Yield point: suspends this future, lets the executor poll others. Resumes when I/O completes.
  </div>
  <div class="ann-item ann-valid">
    <strong>join! concurrency</strong>
    Both futures polled concurrently on one thread. Not parallel — cooperative multitasking.
  </div>
</div>
</div>


### In Your Language: Async Models

<div class="lang-compare">
<div class="lang-panel">
<span class="lang-label lang-label--rust">Rust — zero-cost async</span>

```rust
async fn fetch(url: &str) -> String {
    reqwest::get(url).await?.text().await?
}
// Future is a state machine — no heap alloc per task
// Must choose runtime: tokio, async-std, smol
```

</div>
<div class="lang-panel">
<span class="lang-label lang-label--python">Python — asyncio</span>

```python
async def fetch(url: str) -> str:
    async with aiohttp.get(url) as r:
        return await r.text()
# Coroutine objects heap-allocated
# Single built-in event loop (asyncio)
# GIL limits true parallelism
```

</div>
</div>

## Step 1 - The Problem



> **Learning Objective**
> By the end of this chapter, you should be able to explain how `async/await` transforms functions into pollable state machines, and why calling an `async fn` does not start execution immediately.


Threads are powerful, but they are an expensive unit for waiting on I/O.

A web server that handles ten thousand mostly-idle connections does not want ten thousand blocked OS threads if it can avoid it. Each thread carries stack memory, scheduler cost, and coordination overhead. The problem is not that threads are bad. The problem is that "waiting" is too expensive when the unit of waiting is an OS thread.

Other ecosystems solve this by using:

- event loops and callbacks
- green threads managed by a runtime
- goroutines plus a scheduler

Those work, but they often hide memory, scheduling, or cancellation costs behind a runtime or garbage collector.

## Step 2 - Rust's Design Decision

Rust chose a different model:

- `async fn` compiles into a state machine
- that state machine implements `Future`
- an executor polls the future when it can make progress
- there is no built-in runtime in the language

This design keeps async as a library-level ecosystem choice rather than a hard-coded runtime commitment.

Rust accepted:

- steeper learning curve
- explicit runtime choice
- `Send` and pinning complexity at task boundaries

Rust refused:

- mandatory GC
- hidden heap traffic as the price of async
- a single scheduler model forced on CLI, server, embedded, and desktop code alike

## Step 3 - The Mental Model

Plain English rule: calling an `async fn` creates a future, but it does not run the body to completion right away.

A future is a paused computation that can be resumed later by polling.

The key reframe is this:

- threads are scheduled by the OS
- futures are scheduled cooperatively by an executor

## Step 4 - Minimal Code Example

```rust
async fn answer() -> u32 {
    42
}

fn main() {
    let future = answer();
    drop(future);
}
```

This program does not print anything and does not evaluate the `42` in a useful way. The point is structural: calling `answer()` builds a future value. Nothing drives it.

## Step 5 - Line-by-Line Compiler Walkthrough

Take this version:

```rust
async fn load() -> String {
    String::from("done")
}

#[tokio::main]
async fn main() {
    let result = load().await;
    println!("{result}");
}
```

What the compiler sees conceptually:

1. `load()` is transformed into a type that implements `Future<Output = String>`.
2. The body becomes states in that generated future.
3. `#[tokio::main]` creates a runtime and enters it.
4. `load().await` polls the future until it yields `Poll::Ready(String)`.
5. `println!` runs with the produced value.

What `.await` means is often misunderstood. It does not "spawn a thread and wait." It asks the current async task to suspend until the future is ready, allowing the executor to run something else in the meantime.

The central invariant is:

the executor may pause and resume the computation at each `.await`, but the future's internal state must remain valid across those pauses.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

An async function gives you a task-shaped value. `.await` is how you ask Rust to keep checking that task until it finishes.

</div>
<div class="level-panel" data-level="Engineer">

Use async when the workload is dominated by waiting on I/O: sockets, files, timers, database round-trips, RPC calls. Do not use async because it feels modern. CPU-bound work inside async code still consumes executor time and may need `spawn_blocking` or dedicated threads.

Tokio dominates server-side Rust because it provides:

- runtime
- reactor for I/O readiness
- scheduler
- channels and synchronization primitives
- timers

</div>
<div class="level-panel" data-level="Deep Dive">

The `Future` trait is a polling interface:

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

trait DemoFuture {
    type Output;
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}
```

`Poll::Pending` means "not ready yet, but I have registered how to wake me." That wakeup path is how the runtime avoids busy-waiting.

Rust async is zero-cost in the sense that the state machine is concrete and optimizable. But that does not mean "free." Futures still have size, allocation strategies still matter, and scheduler behavior still matters. Zero-cost means the abstraction does not force extra indirection beyond what the semantics require.

</div>
</div>


## Executors, `tokio::spawn`, and `join!`

`tokio::spawn` schedules a future onto the runtime and returns a `JoinHandle`.

```rust
use tokio::task;

async fn work(id: u32) -> u32 {
    id * 2
}

#[tokio::main]
async fn main() {
    let a = task::spawn(work(10));
    let b = task::spawn(work(20));

    let result = a.await.unwrap() + b.await.unwrap();
    assert_eq!(result, 60);
}
```

Why the `Send + 'static` requirement often appears:

- the runtime may move tasks between worker threads
- the task may outlive the current stack frame

That is the same ownership story from threads, now expressed in async form.

`join!` is different:

```rust
let (a, b) = tokio::join!(work(10), work(20));
```

`join!` runs futures concurrently within the current task and waits for all of them. It does not create detached background tasks. This distinction matters in real code because it changes:

- cancellation behavior
- task ownership
- error handling shape
- `Send` requirements

## Step 7 - Common Misconceptions

Wrong model 1: "Calling an async function starts it immediately."

Correction: it constructs a future. Progress begins only when something polls it.

Wrong model 2: "Async makes code faster."

Correction: async makes waiting cheaper. CPU-heavy work is not magically accelerated.

Wrong model 3: "`.await` blocks like a thread join."

Correction: `.await` yields cooperatively so the executor can schedule other tasks.

Wrong model 4: "Tokio is Rust async."

Correction: Tokio is the dominant runtime, not the language feature itself.

## Step 8 - Real-World Pattern

Serious async Rust repositories usually separate:

- protocol parsing
- application logic
- background tasks
- shutdown and cancellation paths

In an `axum` or `hyper` service, request handlers are async because socket and database operations are mostly waiting. In `tokio`, spawned background tasks often own their state and communicate via channels. In observability stacks, async pipelines decouple ingestion from export with bounded buffers and backpressure.

That is the pattern to notice: async is most powerful when paired with explicit ownership boundaries and capacity boundaries.

## Step 9 - Practice Block

### Code Exercise

Write a Tokio program that:

- concurrently fetches two simulated values with `tokio::time::sleep`
- uses `join!` to wait for both
- logs total elapsed time

Then rewrite it with sequential `.await` and explain the difference.

### Code Reading Drill

What is concurrent here and what is not?

```rust
let a = fetch_user().await;
let b = fetch_orders().await;
```

What changes here?

```rust
let (a, b) = tokio::join!(fetch_user(), fetch_orders());
```

### Spot the Bug

Why is this likely a bad design in a server?

```rust
async fn handler() {
    let mut total = 0u64;
    for i in 0..50_000_000 {
        total += i;
    }
    println!("{total}");
}
```

### Refactoring Drill

Take a callback-style network flow from another language you know and redesign it as futures plus `join!` or spawned tasks. Explain where ownership lives.

### Compiler Error Interpretation

If `tokio::spawn` complains that a future is not `Send`, translate it as: "some state captured by this task cannot safely move between runtime worker threads."

## Step 10 - Contribution Connection

After this chapter, you can start reading:

- async handlers in web frameworks
- background worker loops
- retry or timeout wrappers around network calls
- task spawning and task coordination code

Approachable PRs include:

- replacing accidental sequential awaits with `join!`
- moving CPU-heavy work off the async executor
- clarifying task ownership and shutdown behavior in async tests

## In Plain English

Async is Rust's way of letting one thread juggle many waiting jobs without creating a new thread for each one. That matters to systems engineers because servers spend most of their time waiting on networks and disks, and waiting is exactly where wasted threads become wasted capacity.

## What Invariant Is Rust Protecting Here?

A future's state must remain valid across suspension points, and task boundaries must not capture data that can become invalid or unsafely shared.

## If You Remember Only 3 Things

- An `async fn` call returns a future; it does not run to completion by itself.
- `.await` is a cooperative suspension point, not an OS-thread block.
- `join!` means "run together and wait for all," while `tokio::spawn` means "hand this task to the runtime."

## Memory Hook

An async task is a folded travel itinerary in your pocket. It is the whole trip, but you only unfold the next section when the train arrives.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does calling an `async fn` produce? | A future value representing suspended work. |
| What does `.await` do conceptually? | Polls a future until ready, yielding control cooperatively when it is pending. |
| What problem does async primarily solve? | Making I/O waiting cheaper than dedicating one OS thread per waiting operation. |
| Why does Rust have external runtimes instead of one built-in runtime? | Different domains need different scheduling and runtime tradeoffs, and Rust avoids forcing one global model. |
| What does `tokio::spawn` usually require? | A future that is `Send + 'static`. |
| What is the difference between `join!` and `tokio::spawn`? | `join!` runs futures concurrently in the current task; `spawn` schedules a separate task on the runtime. |
| Does async help CPU-bound work by itself? | No. It helps waiting-heavy work, not raw computation. |
| What does `Poll::Pending` imply besides "not ready"? | The future has arranged to be woken when progress is possible. |

## Chapter Cheat Sheet

| Need | Tool | Why |
|---|---|---|
| Wait for one async operation | `.await` | Cooperative suspension |
| Run several futures and wait for all | `join!` | No detached background task needed |
| Start a background task | `tokio::spawn` | Runtime-managed task |
| Run blocking CPU or sync I/O | `spawn_blocking` or threads | Protect the executor from starvation |
| Add timers | `tokio::time` | Runtime-aware sleeping and intervals |

## From async fn to state machine — a step-through

<div class="ferris-says" data-variant="insight">
<p>This is the hardest-to-see part of Rust async. The compiler transforms your <code>async fn</code> into a struct with variants — one per <code>.await</code> point. Each <code>poll</code> resumes from where it left off. Step through frame by frame to watch the transformation happen.</p>
</div>

<div class="step-through" data-title="What the compiler generates when it sees async fn">
  <div class="step-through__frame">
    <svg viewBox="0 0 760 320" role="img" aria-label="Frame 1: The user writes an async fn fetch_user. It has two awaits — one to read a config file and one to call an HTTP API. This is the surface syntax.">
      <rect x="10" y="10" width="740" height="300" rx="16" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <text x="380" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#1d3557;font-weight:bold">Frame 1 — what you write</text>
      <text x="60" y="86" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">async fn fetch_user(id: u64) -&gt; User {</text>
      <text x="80" y="112" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">let cfg = load_config().await;</text>
      <text x="80" y="138" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">let res = http::get(&amp;cfg.base, id).await;</text>
      <text x="80" y="164" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">parse_user(res)</text>
      <text x="60" y="190" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">}</text>
      <text x="380" y="260" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#457b9d">Two <tspan style="font-family:var(--font-code);font-weight:bold;">.await</tspan> points. Each marks a possible suspension.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 760 320" role="img" aria-label="Frame 2: The compiler lowers the async fn to an enum with three variants — Start, Awaiting config, Awaiting HTTP response. Each variant holds the local state needed to resume.">
      <rect x="10" y="10" width="740" height="300" rx="16" fill="#eef6ff" stroke="#457b9d"></rect>
      <text x="380" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#1d3557;font-weight:bold">Frame 2 — what the compiler generates</text>
      <text x="60" y="82" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">enum FetchUserState {</text>
      <text x="80" y="106" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">Start { id: u64 },</text>
      <text x="80" y="130" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">AwaitingConfig { id: u64, fut: LoadConfigFut },</text>
      <text x="80" y="154" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">AwaitingHttp { cfg: Config, fut: HttpGetFut },</text>
      <text x="80" y="178" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">Done,</text>
      <text x="60" y="202" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">}</text>
      <text x="380" y="258" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#1d3557">Each variant stores <em>exactly</em> the locals that survive across an .await.</text>
      <text x="380" y="280" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#457b9d">This is why async state machines can be surprisingly large.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 760 320" role="img" aria-label="Frame 3: The poll implementation. A match over the state advances it by one step each time the runtime calls poll. Reaching an await returns Pending if the inner future is not yet ready.">
      <rect x="10" y="10" width="740" height="300" rx="16" fill="#fff5eb" stroke="#f4a261"></rect>
      <text x="380" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#b45309;font-weight:bold">Frame 3 — poll() is just a state-machine step</text>
      <text x="60" y="80" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">fn poll(mut self: Pin&lt;&amp;mut Self&gt;, cx: &amp;mut Context) -&gt; Poll&lt;User&gt; {</text>
      <text x="80" y="104" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">loop { match self.state {</text>
      <text x="100" y="128" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">Start { id } =&gt; { self.state = AwaitingConfig { ... } }</text>
      <text x="100" y="152" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">AwaitingConfig { fut, .. } =&gt; match fut.poll(cx) {</text>
      <text x="120" y="176" style="font-family:var(--font-code);font-size:14px;fill:#b45309">Pending =&gt; return Pending,</text>
      <text x="120" y="200" style="font-family:var(--font-code);font-size:14px;fill:#047857">Ready(cfg) =&gt; self.state = AwaitingHttp { cfg, ... },</text>
      <text x="100" y="224" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">}</text>
      <text x="100" y="248" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">...</text>
      <text x="80" y="272" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">}}</text>
      <text x="60" y="296" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">}</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 760 320" role="img" aria-label="Frame 4: A timeline showing thousands of state machines multiplexed onto a small pool of OS threads. Each poll is cheap — this is how one async runtime handles millions of connections.">
      <rect x="10" y="10" width="740" height="300" rx="16" fill="#ecfdf5" stroke="#047857"></rect>
      <text x="380" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#047857;font-weight:bold">Frame 4 — why this matters</text>
      <line x1="60" y1="140" x2="700" y2="140" stroke="#047857" stroke-width="2"></line>
      <text x="60" y="130" style="font-family:var(--font-code);font-size:12px;fill:#047857">OS thread</text>
      <g transform="translate(0,0)">
        <rect x="80" y="100" width="80" height="30" rx="6" fill="#047857"></rect>
        <text x="120" y="120" text-anchor="middle" style="font-family:var(--font-code);font-size:11px;fill:#fff">poll A</text>
        <rect x="170" y="100" width="80" height="30" rx="6" fill="#457b9d"></rect>
        <text x="210" y="120" text-anchor="middle" style="font-family:var(--font-code);font-size:11px;fill:#fff">poll B</text>
        <rect x="260" y="100" width="80" height="30" rx="6" fill="#f4a261"></rect>
        <text x="300" y="120" text-anchor="middle" style="font-family:var(--font-code);font-size:11px;fill:#fff">poll C</text>
        <rect x="350" y="100" width="80" height="30" rx="6" fill="#047857"></rect>
        <text x="390" y="120" text-anchor="middle" style="font-family:var(--font-code);font-size:11px;fill:#fff">poll A</text>
        <rect x="440" y="100" width="80" height="30" rx="6" fill="#457b9d"></rect>
        <text x="480" y="120" text-anchor="middle" style="font-family:var(--font-code);font-size:11px;fill:#fff">poll B</text>
        <rect x="530" y="100" width="80" height="30" rx="6" fill="#f4a261"></rect>
        <text x="570" y="120" text-anchor="middle" style="font-family:var(--font-code);font-size:11px;fill:#fff">poll C</text>
      </g>
      <text x="380" y="190" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#1a1a2e">Each "poll X" is a single state-machine advance — cheap, stackless.</text>
      <text x="380" y="218" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#1a1a2e">Thousands of tasks interleave on one thread. No kernel stack per task.</text>
      <text x="380" y="260" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#047857;font-weight:bold">This is how tokio handles millions of connections on a handful of threads.</text>
    </svg>
  </div>
</div>

## Check yourself

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quiz — 1 of 2</span><span>Async fn</span></div>
  <p class="quiz__q">When you write <code>async fn fetch(url: String) -&gt; String</code>, what does the compiler actually produce?</p>
  <ul class="quiz__options">
    <li>A regular function that blocks the thread until <code>fetch</code> returns.</li>
    <li>A function that returns a callback-based API, like JavaScript promises.</li>
    <li>A function returning <code>impl Future&lt;Output = String&gt;</code> — i.e., a <em>state machine</em> that does nothing until polled.</li>
    <li>A coroutine that runs on its own OS thread.</li>
  </ul>
  <div class="quiz__explain">Correct. This is the single most important mental model in Rust async: <code>async fn</code> is syntax sugar for "construct a state machine that implements <code>Future</code>". Nothing happens at call time — no task scheduled, no work started. The future is inert until a runtime polls it. That is why calling an async function without <code>.await</code>ing (or spawning) it is almost always a bug.</div>
  <div class="quiz__explain quiz__explain--wrong">Re-read "In Your Language: Async Models" and "An async fn Becomes a Pollable Future". The key word is <em>state machine</em>.</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

<div class="quiz" data-answer="1">
  <div class="quiz__head"><span>Quiz — 2 of 2</span><span>Pin</span></div>
  <p class="quiz__q">Why does <code>Future</code>'s <code>poll</code> method take <code>self: Pin&lt;&amp;mut Self&gt;</code> rather than plain <code>&amp;mut self</code>?</p>
  <ul class="quiz__options">
    <li>Performance — Pin avoids a virtual call.</li>
    <li>Because an <code>async fn</code> state machine may contain references <em>into itself</em> (self-referential), so it must not move in memory between polls. <code>Pin</code> is the compile-time promise that it will not.</li>
    <li><code>Pin</code> prevents data races across threads.</li>
    <li>It is a historical artifact from pre-async Rust that cannot be changed.</li>
  </ul>
  <div class="quiz__explain">Correct. When the compiler lowers an <code>async fn</code> into a state machine struct, local borrows that live across an <code>.await</code> become fields <em>pointing into other fields</em> of the same struct. If the struct moved in memory, those pointers would dangle. <code>Pin</code> is the guarantee that it will not move, and it is why you cannot freely move pinned futures around. This is covered in depth in Chapter 35.</div>
  <div class="quiz__explain quiz__explain--wrong">Read the chapter's section on self-referential state machines. Why would moving be a problem?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

## Chapter Resources
* **Official Source:** [Asynchronous Programming in Rust (The Async Book)](https://rust-lang.github.io/async-book/)
* **Tokio Docs:** [Tokio Tutorial: Spawning](https://tokio.rs/tokio/tutorial/spawning)
* **Under the Hood:** [Without Boats: The Waker API](https://without.boats/blog/wakers-i/)

---
