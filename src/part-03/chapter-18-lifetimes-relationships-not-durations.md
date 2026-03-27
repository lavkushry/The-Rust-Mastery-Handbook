# Chapter 18: Lifetimes, Relationships Not Durations

<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-02/chapter-11-borrowing-and-references-first-contact.html">Ch 11: Borrowing</a>
      <a href="../part-03/chapter-17-borrowing-constrained-access.html">Ch 17: Borrow Rules</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>Lifetimes as relationship contracts, not durations</li>
      <li>The three elision rules and when to annotate</li>
      <li>Why <code>'static</code> does not mean "lives forever"</li>
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
    <strong>Builds on Chapter 11</strong>
    A lifetime annotation makes explicit what the compiler already checks: every reference must be valid for as long as it is used.
    <a href="../part-02/chapter-11-borrowing-and-references-first-contact.html">Revisit Ch 11 →</a>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapter 39</strong>
    Ch 39 explores advanced lifetime patterns: higher-ranked trait bounds, lifetime variance, and subtyping — all built on the model you learn here.
    <a href="../part-06/chapter-39-lifetimes-in-depth.html">Ch 39: Lifetimes in Depth →</a>
  </div>
</div>

<figure class="visual-figure" style="--chapter-accent: var(--lifetime);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Core Diagram</div>
      <h2 class="visual-figure__title">Lifetimes as Relationships Between Valid Regions</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1120 620" role="img" aria-label="Lifetime timeline diagram showing valid and invalid reference relationships">
      <rect x="28" y="34" width="1064" height="552" rx="28" fill="#fffdf8" stroke="rgba(131,56,236,0.18)"></rect>
      <g font-family="IBM Plex Sans, sans-serif">
        <text x="86" y="118" class="svg-label" style="fill:#023e8a;">Valid borrow</text>
        <text x="86" y="300" class="svg-label" style="fill:#023e8a;">Rejected borrow</text>
        <text x="86" y="480" class="svg-label" style="fill:#023e8a;">Returned reference relationship</text>
      </g>
      <g stroke="#cbd5e1" stroke-width="3">
        <line x1="252" y1="110" x2="988" y2="110"></line>
        <line x1="252" y1="292" x2="988" y2="292"></line>
        <line x1="252" y1="472" x2="988" y2="472"></line>
      </g>
      <g font-family="JetBrains Mono, monospace" font-size="14">
        <text x="250" y="86" class="svg-small" style="fill:#6b7280;">time / program points →</text>
        <rect x="302" y="96" width="418" height="26" rx="13" fill="#e63946"></rect>
        <text x="324" y="114" class="svg-small" style="fill:#ffffff;">owner x lives here</text>
        <rect x="368" y="142" width="220" height="24" rx="12" fill="#457b9d"></rect>
        <text x="392" y="158" class="svg-small" style="fill:#ffffff;">borrow r: &amp;x</text>
        <path d="M368 176 v18" stroke="#8338ec" stroke-width="4"></path>
        <path d="M588 176 v18" stroke="#8338ec" stroke-width="4"></path>
        <text x="430" y="202" class="svg-small" style="fill:#8338ec;">'a must stay inside x's valid region</text>
        <rect x="302" y="278" width="186" height="26" rx="13" fill="#e63946"></rect>
        <text x="324" y="296" class="svg-small" style="fill:#ffffff;">owner x</text>
        <rect x="418" y="324" width="278" height="24" rx="12" fill="#457b9d"></rect>
        <text x="442" y="340" class="svg-small" style="fill:#ffffff;">borrow r wants to live longer</text>
        <rect x="418" y="320" width="70" height="32" rx="10" fill="rgba(214,40,40,0.16)" stroke="#d62828" stroke-width="3"></rect>
        <text x="520" y="372" class="svg-small" style="fill:#d62828;">❌ reference outlives referent</text>
        <text x="438" y="396" class="svg-small" style="fill:#d62828;">compiler rejects dangling relationship</text>
        <rect x="302" y="458" width="274" height="26" rx="13" fill="#e63946"></rect>
        <rect x="626" y="458" width="188" height="26" rx="13" fill="#e63946" fill-opacity="0.5"></rect>
        <text x="324" y="476" class="svg-small" style="fill:#ffffff;">input x: &amp;'a str</text>
        <text x="648" y="476" class="svg-small" style="fill:#ffffff;">input y: &amp;'a str</text>
        <rect x="404" y="504" width="172" height="24" rx="12" fill="#8338ec"></rect>
        <text x="430" y="520" class="svg-small" style="fill:#ffffff;">output: &amp;'a str</text>
        <path d="M490 484 v20" stroke="#8338ec" stroke-width="4"></path>
        <path d="M720 484 C 688 506, 634 514, 576 516" stroke="#8338ec" stroke-width="4" fill="none"></path>
        <text x="632" y="534" class="svg-small" style="fill:#8338ec;">returned borrow cannot outlive the shortest valid input source</text>
      </g>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">This is the lifetime reframe that matters: a lifetime annotation does not extend an object’s existence. It names the region within which a borrowed reference is allowed to be used.</figcaption>
</figure>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--lifetime);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Elision Rules</div>
        <h2 class="visual-figure__title">What the Compiler Infers for You</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Three lifetime elision rules shown visually">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#faf5ff" stroke="#8338ec" stroke-width="2"></rect>
        <g font-family="JetBrains Mono, monospace" font-size="13">
          <text x="56" y="74" class="svg-label" style="fill:#8338ec;">Rule 1</text>
          <text x="56" y="98">fn f(x: &amp;str, y: &amp;str)</text>
          <text x="56" y="122">becomes &amp;'a str, &amp;'b str</text>
          <text x="56" y="148" class="svg-small" style="fill:#4b5563;">each input gets its own lifetime</text>
          <text x="56" y="196" class="svg-label" style="fill:#8338ec;">Rule 2</text>
          <text x="56" y="220">fn f(x: &amp;str) -&gt; &amp;str</text>
          <text x="56" y="244">becomes fn f&lt;'a&gt;(x: &amp;'a str) -&gt; &amp;'a str</text>
          <text x="56" y="270" class="svg-small" style="fill:#4b5563;">single input lifetime flows to output</text>
          <text x="56" y="318" class="svg-label" style="fill:#8338ec;">Rule 3</text>
          <text x="56" y="342">fn get(&amp;self) -&gt; &amp;str</text>
          <text x="56" y="366">output ties to self's borrow</text>
        </g>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--lifetime);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">`'static`</div>
        <h2 class="visual-figure__title">Valid for the Whole Program</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Program timeline contrasting static data with ordinary borrows">
        <rect x="26" y="28" width="488" height="364" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <line x1="84" y1="92" x2="460" y2="92" stroke="#f8fafc" stroke-width="4"></line>
        <line x1="84" y1="204" x2="460" y2="204" stroke="#f8fafc" stroke-width="4"></line>
        <line x1="84" y1="312" x2="460" y2="312" stroke="#f8fafc" stroke-width="4"></line>
        <text x="86" y="68" class="svg-small" style="fill:#f8fafc;">program start → program end</text>
        <rect x="114" y="78" width="312" height="28" rx="14" fill="#8338ec"></rect>
        <text x="186" y="96" class="svg-small" style="fill:#ffffff;">string literal: &amp;'static str</text>
        <rect x="192" y="190" width="126" height="28" rx="14" fill="#457b9d"></rect>
        <text x="214" y="208" class="svg-small" style="fill:#ffffff;">local borrow</text>
        <rect x="114" y="298" width="312" height="28" rx="14" fill="#023e8a"></rect>
        <text x="154" y="316" class="svg-small" style="fill:#dbeafe;">stored in binary / static data segment</text>
      </svg>
    </div>
  </figure>
</div>

## Chapter Resources

* **Official Source:** [The Rust Reference: Lifetimes](https://doc.rust-lang.org/reference/lifetimes.html)
* **Rustonomicon:** [Lifetimes](https://doc.rust-lang.org/nomicon/lifetimes.html)
* **Rust by Example:** [Lifetimes](https://doc.rust-lang.org/rust-by-example/scope/lifetime.html)

<div class="annotated-code" style="--chapter-accent: var(--lifetime);">

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

let result;
let s1 = String::from("long");
{
    let s2 = String::from("hi");
    result = longest(&s1, &s2);  // 'a = shorter of s1, s2
}                                // s2 dropped — result would dangle
// println!("{result}");         // E0597: s2 doesn't live long enough
```

<div class="ann-col">
  <div class="ann-item ann-life">
    <strong>'a annotation</strong>
    "The return value lives at most as long as both inputs." Not a duration — a relationship constraint.
  </div>
  <div class="ann-item ann-borrow">
    <strong>Both inputs tied</strong>
    Compiler unifies <code>'a</code> to the shorter of the two lifetimes.
  </div>
  <div class="ann-item ann-error">
    <strong>E0597</strong>
    <code>s2</code> is dropped at <code>}</code>. <code>result</code> might hold a reference to <code>s2</code>, so compiler rejects.
  </div>
</div>
</div>

### In Your Language: Lifetimes vs Garbage Collection

<div class="lang-compare">
<div class="lang-panel">
<span class="lang-label lang-label--rust">Rust — explicit lifetime annotations</span>

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
// Compiler verifies both inputs outlive the return value
```

</div>
<div class="lang-panel">
<span class="lang-label lang-label--go">Go — GC handles it</span>

```go
func longest(x, y string) string {
    if len(x) > len(y) { return x }
    return y
}
// No annotation needed — GC keeps both alive
// But: unpredictable pause times, higher memory usage
```

</div>
</div>

## Readiness Check - Lifetime Reasoning

Use this checkpoint to confirm you can reason about reference relationships, not just syntax.

| Skill                         | Level 0                              | Level 1                                    | Level 2                                                       | Level 3                                                       |
| ----------------------------- | ------------------------------------ | ------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------- |
| Explain what a lifetime means | I think it is a time duration        | I know it describes validity scope         | I can explain it as a relationship between borrows and owners | I can teach why annotations do not extend object lifetime     |
| Read lifetime signatures      | I avoid annotated signatures         | I can parse single-input/output signatures | I can explain multi-input relationships like `longest<'a>`    | I can redesign signatures to express clearer borrow contracts |
| Diagnose lifetime errors      | I guess and add annotations randomly | I can recognize outlives problems          | I can pinpoint the dropped owner causing E0597/E0515          | I can choose when returning owned values is the better design |

If any row is below Level 2, revisit Chapter 11 and run Drill Deck 2 again.

## Step 1 - The Problem

> **Learning Objective**
> By the end of this chapter, you should be able to explain how lifetimes define relationships between borrowed data, rather than magically extending how long data exists.
