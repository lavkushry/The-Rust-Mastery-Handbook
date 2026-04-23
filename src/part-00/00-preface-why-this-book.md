# Why You Will Actually Like Rust

<div class="one-sentence">
  If you only remember one thing: <strong>Rust catches at compile time the exact bugs you usually catch in production at 3 a.m.</strong>
</div>

## The one-paragraph pitch

You have probably shipped code that crashed because something was `None`, or `null`, or `undefined`, when you thought it was not. You have probably debugged a race condition that only happened on Tuesdays. You have probably watched a server leak memory and restarted it on a cron job. Rust is a language whose entire personality is *"what if we just made those bugs impossible to compile?"* That is it. That is the whole pitch.

<figure class="visual-figure" style="--chapter-accent: var(--valid);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">The bargain</div>
      <h2 class="visual-figure__title">A small amount of friction up front, a large amount of peace later</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 960 360" role="img" aria-label="Two curves: Rust has higher friction early that drops to near zero; other languages have low friction early that rises over time as bugs accumulate in production.">
      <rect x="20" y="20" width="920" height="320" rx="24" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <line x1="80" y1="300" x2="900" y2="300" stroke="#1a1a2e" stroke-width="2"></line>
      <line x1="80" y1="60" x2="80" y2="300" stroke="#1a1a2e" stroke-width="2"></line>
      <text x="450" y="332" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#475569">time on the project →</text>
      <text x="70" y="56" text-anchor="end" style="font-family:var(--font-display);font-size:14px;fill:#475569">pain</text>
      <path d="M80 180 Q 180 110 280 140 Q 380 170 500 180 Q 700 200 900 220" stroke="#d62828" stroke-width="4" fill="none"></path>
      <text x="860" y="212" style="font-family:var(--font-display);font-size:14px;fill:#d62828" text-anchor="end">other languages</text>
      <path d="M80 110 Q 160 80 260 180 Q 400 270 620 280 Q 780 286 900 288" stroke="#52b788" stroke-width="4" fill="none"></path>
      <text x="860" y="278" style="font-family:var(--font-display);font-size:14px;fill:#2d6a4f" text-anchor="end">rust</text>
      <text x="120" y="98" style="font-family:var(--font-display);font-size:12px;fill:#2d6a4f">fight the compiler</text>
      <text x="540" y="268" style="font-family:var(--font-display);font-size:12px;fill:#2d6a4f">ship confident code</text>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">Rust front-loads the work the compiler does for you. Other languages back-load it onto your on-call rotation.</figcaption>
</figure>

## The four bugs Rust deletes

The same four bugs have eaten more engineering time than every other category combined. Rust removes them at compile time.

<div class="analogy-card">
  <div class="analogy-card__head">The four</div>
  <div class="analogy-card__body">
    <ol>
      <li><strong>Null / None surprise.</strong> You think a value is there. It is not. In Rust you cannot even <em>ask</em> for a value without first answering "what if it is missing?"</li>
      <li><strong>Data race.</strong> Two threads write to the same variable without coordinating. In Rust this is a compile error, not a Heisenbug.</li>
      <li><strong>Use-after-free.</strong> You free memory, then accidentally read from it. In Rust the compiler will not let that code link.</li>
      <li><strong>Silent failure.</strong> A function quietly returns a default when something went wrong. In Rust, errors are ordinary values you cannot forget to look at.</li>
    </ol>
  </div>
</div>

## "But is it not famously hard?"

Rust has a reputation for being hard. The reputation is half deserved. The half that is deserved is real: **Rust asks you to think about one thing most languages let you ignore — who is allowed to touch a piece of data, and when.** That is the idea behind ownership. It is not complicated, it is just *new*, and like anything new it feels awkward for about a week.

The half that is *not* deserved is the rest: Rust's syntax is not weirder than TypeScript's, its tooling is better than almost any other language's, its error messages are the best in the industry, and its documentation is excellent. Once the ownership idea clicks — and Part 0 is built to make it click fast — the rest feels like any other modern language, just with fewer 3 a.m. pages.

## Who this book is for

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>If you can read JavaScript, Python, or TypeScript without a dictionary, you can read this book. We assume you know what a variable, a function, and an <code>if</code> are. We assume nothing else.</p>
</div>

If you have written C or C++, you will move faster through Part 0. If you have not, nothing in Part 0 requires you to.

## How to get the most out of it

Three rules.

1. **Run every code example.** Every block has a "Run in Playground" link. Click it. Change a number. Re-run it. This costs you thirty seconds per block and saves you thirty minutes of re-reading.
2. **Do not skip the pictures.** The SVG figures carry at least half the meaning of this book. The prose is the caption; the picture is the point.
3. **When the compiler shouts at you, read what it said.** Rust's compiler is a senior engineer looking over your shoulder. Its error messages usually tell you exactly which three characters to change. The habit of reading them carefully is the single biggest thing that separates frustrated Rust beginners from happy ones.

Ready? <a href="01-hello-rust.md">Hello, Rust →</a>
