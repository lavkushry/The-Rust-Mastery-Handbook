# Chapter 21: The Borrow Checker, How the Compiler Thinks

<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-03/chapter-16-ownership-as-resource-management.html">Ch 16: Ownership as RAII</a>
      <a href="../part-03/chapter-17-borrowing-constrained-access.html">Ch 17: Borrowing Rules</a>
      <a href="../part-03/chapter-18-lifetimes-relationships-not-durations.html">Ch 18: Lifetimes</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>Where borrow checking runs in the compiler pipeline</li>
      <li>How to simulate borrow errors mentally</li>
      <li>What E0382, E0502, and E0505 really mean</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">45<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div>
  </div>
</div>

<figure class="visual-figure" style="--chapter-accent: var(--compiler);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Compiler Pipeline</div>
      <h2 class="visual-figure__title">Where the Borrow Checker Runs</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1120 420" role="img" aria-label="Rust compilation pipeline with borrow checker highlighted on MIR">
      <rect x="28" y="32" width="1064" height="356" rx="28" fill="#fffdf8" stroke="rgba(2,62,138,0.15)"></rect>
      <g font-family="IBM Plex Sans, sans-serif" font-size="14">
        <rect x="60" y="126" width="144" height="128" rx="18" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect>
        <text x="110" y="164" class="svg-label" style="fill:#023e8a;">Source</text>
        <text x="86" y="196" class="svg-small" style="fill:#4b5563;">surface Rust syntax</text>
        <rect x="236" y="126" width="144" height="128" rx="18" fill="#eef6fb" stroke="#457b9d" stroke-width="3"></rect>
        <text x="292" y="164" class="svg-label" style="fill:#457b9d;">AST</text>
        <text x="264" y="196" class="svg-small" style="fill:#4b5563;">parsed structure</text>
        <rect x="412" y="126" width="144" height="128" rx="18" fill="#f5f1ff" stroke="#8338ec" stroke-width="3"></rect>
        <text x="466" y="164" class="svg-label" style="fill:#8338ec;">HIR</text>
        <text x="430" y="196" class="svg-small" style="fill:#4b5563;">desugared, name resolved</text>
        <rect x="588" y="112" width="160" height="156" rx="22" fill="#eef2ff" stroke="#023e8a" stroke-width="5"></rect>
        <text x="650" y="158" class="svg-label" style="fill:#023e8a;">MIR</text>
        <text x="614" y="186" class="svg-small" style="fill:#4b5563;">control-flow aware</text>
        <text x="624" y="206" class="svg-small" style="fill:#4b5563;">moves, drops, temps</text>
        <rect x="618" y="220" width="100" height="28" rx="14" fill="#8338ec"></rect>
        <text x="634" y="239" class="svg-small" style="fill:#ffffff;">borrow check</text>
        <rect x="780" y="126" width="144" height="128" rx="18" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
        <text x="820" y="164" class="svg-label" style="fill:#2d6a4f;">LLVM IR</text>
        <text x="804" y="196" class="svg-small" style="fill:#4b5563;">lower-level optimizer input</text>
        <rect x="956" y="126" width="104" height="128" rx="18" fill="#fff5db" stroke="#ffbe0b" stroke-width="3"></rect>
        <text x="980" y="164" class="svg-label" style="fill:#8a5d00;">Binary</text>
        <text x="976" y="196" class="svg-small" style="fill:#4b5563;">machine code</text>
      </g>
      <g stroke="#023e8a" stroke-width="6" fill="none" marker-end="url(#pipeArrow)">
        <path d="M204 190 H 236"></path>
        <path d="M380 190 H 412"></path>
        <path d="M556 190 H 588"></path>
        <path d="M748 190 H 780"></path>
        <path d="M924 190 H 956"></path>
      </g>
      <defs>
        <marker id="pipeArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#023e8a"></path>
        </marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">Borrow checking happens on MIR because MIR makes liveness, control flow, drops, and temporaries explicit. The compiler is not arguing with your pretty syntax; it is reasoning over a lowered control-flow model.</figcaption>
</figure>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--compiler);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Worksheet</div>
        <h2 class="visual-figure__title">How to Simulate a Borrow Error</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Borrow checker mental simulation worksheet">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#eef2ff" stroke="#023e8a" stroke-width="2"></rect>
        <g font-family="IBM Plex Sans, sans-serif">
          <text x="56" y="72" class="svg-label" style="fill:#023e8a;">1. List owners</text>
          <rect x="56" y="88" width="428" height="54" rx="12" fill="#ffffff" stroke="#cbd5e1"></rect>
          <text x="72" y="120" class="svg-small" style="fill:#4b5563;">v owns Vec buffer</text>
          <text x="56" y="178" class="svg-label" style="fill:#023e8a;">2. Mark borrows and last use</text>
          <rect x="56" y="194" width="428" height="62" rx="12" fill="#ffffff" stroke="#cbd5e1"></rect>
          <rect x="88" y="214" width="156" height="14" rx="7" fill="#457b9d"></rect>
          <text x="252" y="226" class="svg-small" style="fill:#4b5563;">`first = &amp;v[0]` alive until last print</text>
          <text x="56" y="292" class="svg-label" style="fill:#023e8a;">3. Check conflicting overlap</text>
          <rect x="56" y="308" width="428" height="54" rx="12" fill="#ffffff" stroke="#cbd5e1"></rect>
          <rect x="88" y="326" width="156" height="14" rx="7" fill="#457b9d"></rect>
          <rect x="196" y="326" width="116" height="14" rx="7" fill="#f4a261"></rect>
          <text x="320" y="338" class="svg-small" style="fill:#d62828;">❌ shared + mutable overlap</text>
        </g>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--error);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Error Decoder Cards</div>
        <h2 class="visual-figure__title">What the Compiler Is Really Telling You</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Five mini error decoder cards for common borrow checker errors">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <g font-family="IBM Plex Sans, sans-serif">
          <rect x="52" y="54" width="194" height="92" rx="16" fill="#2b1120" stroke="#d62828"></rect>
          <text x="74" y="84" class="svg-label" style="fill:#ffd9dc;">E0382</text>
          <text x="74" y="106" class="svg-small" style="fill:#ffd9dc;">use after move</text>
          <rect x="292" y="54" width="194" height="92" rx="16" fill="#2b1120" stroke="#d62828"></rect>
          <text x="314" y="84" class="svg-label" style="fill:#ffd9dc;">E0502</text>
          <text x="314" y="106" class="svg-small" style="fill:#ffd9dc;">shared and mutable conflict</text>
          <rect x="52" y="164" width="194" height="92" rx="16" fill="#2b1120" stroke="#d62828"></rect>
          <text x="74" y="194" class="svg-label" style="fill:#ffd9dc;">E0505</text>
          <text x="74" y="216" class="svg-small" style="fill:#ffd9dc;">move while borrowed</text>
          <rect x="292" y="164" width="194" height="92" rx="16" fill="#2b1120" stroke="#d62828"></rect>
          <text x="314" y="194" class="svg-label" style="fill:#ffd9dc;">E0515</text>
          <text x="314" y="216" class="svg-small" style="fill:#ffd9dc;">returning dangling reference</text>
          <rect x="172" y="274" width="194" height="92" rx="16" fill="#2b1120" stroke="#d62828"></rect>
          <text x="194" y="304" class="svg-label" style="fill:#ffd9dc;">E0521</text>
          <text x="194" y="326" class="svg-small" style="fill:#ffd9dc;">borrow escapes closure/body</text>
        </g>
      </svg>
    </div>
  </figure>
</div>
<div class="error-card">
  <div class="error-code">E0382</div>
  <div class="error-name">use of moved value</div>
  <div class="error-invariant">
    You attempted to use a binding after its ownership was transferred. The compiler
    statically tracks every move and invalidates the original binding at that point.
    The moved-from name still exists in the source text but has no authority.
  </div>
  <div class="error-fix">
    Borrow instead of moving: <code>&amp;s1</code>. Or restructure so you use <code>s1</code> before the move.
    Or call <code>.clone()</code> if you genuinely need two independent copies.
  </div>
</div>
<div class="error-card">
  <div class="error-code">E0502</div>
  <div class="error-name">cannot borrow as mutable because it is also borrowed as immutable</div>
  <div class="error-invariant">
    A shared reference (<code>&amp;T</code>) is alive while you try to take an exclusive reference (<code>&amp;mut T</code>).
    Aliasing XOR mutation: the compiler refuses to let both exist simultaneously because
    the mutable borrow could invalidate what the shared reference sees.
  </div>
  <div class="error-fix">
    Shorten the shared borrow's lifetime — move its last use before the mutable borrow.
    NLL (Non-Lexical Lifetimes) makes this easier: a reference dies at its last use, not at scope end.
  </div>
</div>
<div class="error-card">
  <div class="error-code">E0505</div>
  <div class="error-name">cannot move out of value because it is borrowed</div>
  <div class="error-invariant">
    A reference still points into a value you are trying to move (transfer ownership).
    Moving would invalidate the reference, creating a dangling pointer — exactly what
    Rust's borrow checker exists to prevent.
  </div>
  <div class="error-fix">
    Ensure no references are alive at the point of the move. Restructure the code so
    borrows end before ownership transfer, or use <code>.clone()</code> to make the reference independent.
  </div>
</div>

<div class="annotated-code" style="--chapter-accent: var(--lifetime);">

```rust
let mut data = String::from("hello");
let r = &data;               // borrow starts
data.push_str(" world");     // E0502: &mut while &data lives
println!("{r}");             // borrow extends to here
```

<div class="ann-col">
  <div class="ann-item ann-borrow">
    <strong>Borrow starts</strong>
    MIR records <code>r</code> as a live shared borrow of <code>data</code>.
  </div>
  <div class="ann-item ann-error">
    <strong>E0502: conflict</strong>
    <code>push_str</code> requires <code>&mut data</code> but <code>r</code> holds <code>&data</code>. The borrow checker rejects.
  </div>
  <div class="ann-item ann-life">
    <strong>NLL liveness</strong>
    Borrow of <code>r</code> ends at its last use (line 4), not at scope end. Moving <code>println!</code> above <code>push_str</code> would fix it.
  </div>
</div>
</div>

## Readiness Check - Borrow Checker Mental Simulation

| Skill                        | Level 0                    | Level 1                             | Level 2                                        | Level 3                                                      |
| ---------------------------- | -------------------------- | ----------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| Trace ownership and borrows  | I only react to error text | I can identify owner and references | I can mark borrow start and last-use points    | I can predict likely errors before compiling                 |
| Decode compiler diagnostics  | I copy fixes blindly       | I can interpret one common error    | I can map multiple errors to one root conflict | I can choose minimal structural fixes confidently            |
| Restructure conflicting code | I use random clones/moves  | I can fix simple overlap conflicts  | I can refactor borrow scopes intentionally     | I can design APIs that avoid borrow friction by construction |

Target Level 2+ before advancing into larger async/concurrency ownership scenarios.

## Compiler Error Decoder - Borrow Checker Core

| Error code | What it usually means                       | Typical fix direction                                                      |
| ---------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| E0502      | Shared and mutable borrow overlap           | End shared borrow earlier or split scope before mutable operation          |
| E0505      | Move attempted while borrowed               | Reorder to end borrow first, or clone if independent ownership is required |
| E0515      | Returning reference to local/temporary data | Return owned value or borrow from caller-provided input                    |

Use one worksheet for every failure: owner, borrow region, conflicting operation, smallest safe rewrite.

## Step 1 - The Problem
