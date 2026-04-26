# PART 5 - Concurrency and Async

<div class="ferris-says" data-variant="insight">
<p>Concurrency is the test Rust was built to pass. The promise — 'if it compiles, there is no data race' — is not marketing copy. It falls out of ownership and <code>Send</code>/<code>Sync</code> almost for free. Async adds another layer: <em>stackless</em> tasks that let you multiplex millions of connections onto a handful of threads. This part is where the language's full payoff lands.</p>
</div>

<section class="part-spread" style="--chapter-accent: var(--info);">
  <div class="part-spread__grid">
    <div>
      <div class="part-spread__eyebrow">Part Opener</div>
      <h1 class="part-spread__title">Concurrency and Async</h1>
      <p class="part-spread__hook">Threads give you parallelism. Channels give you coordination. <code>Send</code>/<code>Sync</code> give you correctness. Async gives you <em>scale</em>. All four answer different questions; this part teaches them as one coherent system so the next data race in your team's codebase never compiles.</p>
      <div class="part-spread__meta">
        <span class="part-spread__pill">Threads</span>
        <span class="part-spread__pill">Send &amp; Sync</span>
        <span class="part-spread__pill">Async / Await</span>
        <span class="part-spread__pill">Pin</span>
      </div>
    </div>
    <div aria-hidden="true">
      <svg class="svg-frame" viewBox="0 0 560 360" role="img" aria-label="Four lanes of concurrent tasks flowing through a shared coordinator, illustrating Rust's Send/Sync model: ownership-marked values flow across threads without data races.">
        <defs>
          <linearGradient id="p5Glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.25)"></stop>
            <stop offset="100%" stop-color="rgba(255,255,255,0.02)"></stop>
          </linearGradient>
        </defs>
        <rect x="24" y="24" width="512" height="312" rx="30" fill="url(#p5Glow)" stroke="rgba(255,255,255,0.18)"></rect>
        <g stroke="#60a5fa" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.9">
          <path d="M60 80 Q 160 80, 260 180 T 500 280"></path>
          <path d="M60 140 Q 180 140, 280 180 T 500 220"></path>
          <path d="M60 220 Q 180 220, 280 180 T 500 140"></path>
          <path d="M60 280 Q 160 280, 260 180 T 500 80"></path>
        </g>
        <circle cx="280" cy="180" r="36" fill="#2563eb" stroke="rgba(255,255,255,0.4)" stroke-width="3"></circle>
        <text x="280" y="185" text-anchor="middle" style="font-family:var(--font-code);font-size:13px;fill:#ffffff;font-weight:bold">Arc</text>
        <g fill="#60a5fa">
          <circle cx="70" cy="80" r="12"></circle>
          <circle cx="70" cy="140" r="12"></circle>
          <circle cx="70" cy="220" r="12"></circle>
          <circle cx="70" cy="280" r="12"></circle>
        </g>
        <g fill="#93c5fd">
          <circle cx="495" cy="80" r="10"></circle>
          <circle cx="495" cy="140" r="10"></circle>
          <circle cx="495" cy="220" r="10"></circle>
          <circle cx="495" cy="280" r="10"></circle>
        </g>
        <text x="70" y="320" text-anchor="middle" style="font-family:var(--font-display);font-size:11px;fill:#cbd5f5">producers</text>
        <text x="495" y="320" text-anchor="middle" style="font-family:var(--font-display);font-size:11px;fill:#cbd5f5">consumers</text>
      </svg>
    </div>
  </div>
</section>

Rust's concurrency story is not "here are some APIs for threads." It is a language-level claim: if your program is safe Rust, it cannot contain a data race. That claim shapes everything in this part. `Send` and `Sync` are not trivia. `async fn` is not syntax sugar in the casual sense. `Pin` is not an arbitrary complication. They are all consequences of Rust refusing to separate safety from performance.

This part matters because serious Rust work quickly becomes concurrent Rust work. Servers handle many requests. CLIs spawn subprocesses and read streams. data pipelines coordinate producers and consumers. Libraries expose types that must behave correctly under shared use. If your mental model of concurrency is shallow, your Rust code will compile only after repeated fights with the type system. If your mental model is correct, the compiler becomes a design partner.

---

## Chapters in This Part

- [Chapter 31: Threads and Message Passing](chapter-31-threads-and-message-passing.md)
- [Chapter 32: Shared State, Arc, Mutex, and Send/Sync](chapter-32-shared-state-arc-mutex-and-send-sync.md)
- [Chapter 33: Async/Await and Futures](chapter-33-async-await-and-futures.md)
- [Chapter 34: `select!`, Cancellation, and Timeouts](chapter-34-select-cancellation-and-timeouts.md)
- [Chapter 35: Pin and Why Async Is Hard](chapter-35-pin-and-why-async-is-hard.md)

---

## Part 5 Summary

Rust concurrency is one coherent system:

- threads require ownership or proven scoped borrowing
- shared state requires explicit synchronization and thread-safety auto traits
- async uses futures and executors to make waiting cheap
- `select!` turns dropping into cancellation
- pinning protects address-sensitive state in async machinery

If you hold that model firmly, the APIs stop feeling like unrelated complexity and start looking like one design expressed at different concurrency boundaries.
