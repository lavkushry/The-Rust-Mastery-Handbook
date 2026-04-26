# Chapter 18: Lifetimes, Relationships Not Durations

<div class="ferris-says" data-variant="insight">
<p>Lifetimes. The word that scares new Rust programmers and vanishes from your vocabulary after month two. Lifetimes are not durations — they are <em>relationships</em>. This chapter is the one that reframes the whole idea, and by the end you will wonder why it ever seemed hard.</p>
</div>

<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-02/chapter-11-borrowing-and-references-first-contact.md">Ch 11: Borrowing</a>
      <a href="../part-03/chapter-17-borrowing-constrained-access.md">Ch 17: Borrow Rules</a>
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
    <a href="../part-02/chapter-11-borrowing-and-references-first-contact.md">Revisit Ch 11 →</a>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapter 39</strong>
    Ch 39 explores advanced lifetime patterns: higher-ranked trait bounds, lifetime variance, and subtyping — all built on the model you learn here.
    <a href="../part-06/chapter-39-lifetimes-in-depth.md">Ch 39: Lifetimes in Depth →</a>
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

## In plain English first

<div class="ferris-says" data-variant="insight">
<p>"Lifetimes" is the most-feared word in Rust. It should be one of the simplest. Read this section first; the depth below clicks instantly afterwards.</p>
</div>

A lifetime is **not** a duration. It is not "how long a variable lives". A lifetime is a **relationship**: a tag the compiler attaches to a borrow that says, "this reference cannot outlive its source."

Here is the everyday version. You photocopy a page from a library book. The photocopy refers back to the book. The compiler's job is to say "as long as the book exists, your photocopy is fine; the moment the book is returned and re-shelved, your photocopy must not be in active use." A lifetime annotation is just a name for that "as long as the book exists" relationship — `'a` is "the lifetime of the book", and `&'a str` means "a photocopy that can only be valid while the book is".

When you see `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str`, read it as: "given two photocopies whose books I'll call `'a`, I'll return another photocopy that *also* refers back to a book that lives at least `'a`." The single `'a` is a relationship between three references — input, input, output — saying they share a common minimum validity.

You almost never write lifetime annotations in beginner code. The compiler infers them through three small "elision rules" we cover later. The reason this chapter exists is not so you write more `'a`s; it is so you read existing ones without flinching.

<div class="ferris-says">
<p>Lifetime annotation = "I am stating the relationship that already exists in your code so the compiler can verify it." Nothing more.</p>
</div>

## Beginner walkthrough — every idea in this chapter, plain English

<div class="ferris-says" data-variant="insight">
<p>This is the chapter that made dozens of Rust learners give up before reading it. It's actually one of the simplest. The trick is to swap the word "lifetime" out of your head and put "relationship" in. Then the syntax stops looking arbitrary and starts looking like exactly what it is: the compiler asking you to label which references must stay valid relative to which sources.</p>
</div>

### 1. A lifetime is a label on a reference

In `&'a str`, the `'a` is a *name* the compiler picks (or you write) for the relationship "this reference is valid for some region of code we'll call `'a`." The name itself is meaningless — `'a`, `'foo`, `'data` all work. What matters is that **two references with the same name share the same validity region**.

You almost never write lifetime names yourself. The compiler infers them through three small rules (covered below). The reason this chapter exists is so you can *read* lifetime names in other people's code without flinching, and write them in the rare cases where the compiler genuinely can't infer.

### 2. Lifetimes are *not* durations

A common misreading: "`'a` means this reference exists for a long time."

Wrong. `'a` is just a label for "the region of code this borrow is alive". It doesn't measure clock time or indicate "long" vs "short". `'static` doesn't even mean "lives forever" — it means "*could* live forever if needed", which a `String` literal, a `Box::leak`, or any value owning no borrows all satisfy.

The simplest re-frame: replace every "lifetime" in your head with "borrow region" and the rest of the chapter falls into place.

### 3. The function signature trick

Look at this signature:

```rust,ignore
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str
```

Read it as three statements:

1. "I take two `&str` references and call their shared validity region `'a`."
2. "I return a `&str` — and it borrows from one of the inputs."
3. "Therefore, the returned reference is valid for as long as `'a` — meaning, as long as both inputs are valid."

The `'a` on the return type is the contract: *the caller can safely use the result while both inputs are still in scope.* The compiler enforces both sides — the function body must produce a `&str` borrowing from the inputs, and the caller must not use the result after either input goes out of scope.

That's the whole mechanism. Lifetime annotations are *contracts about validity regions*. Nothing more.

### 4. Why most code doesn't need annotations: the elision rules

In simple cases, Rust applies three "elision rules" that fill in the lifetimes for you:

1. **Each input parameter that is a reference gets its own lifetime.** `fn f(s: &str)` → `fn f<'a>(s: &'a str)` automatically.
2. **If there's exactly one input lifetime, it's assigned to all output references.** `fn first_word(s: &str) -> &str` → `fn first_word<'a>(s: &'a str) -> &'a str` automatically.
3. **If there's `&self` or `&mut self`, its lifetime is assigned to all output references.** `fn name(&self) -> &str` → returns a borrow tied to `self`.

Together, these rules cover ~95% of function signatures. You only write `'a` explicitly when the rules don't apply — typically when a function takes multiple references and the caller needs to know which one the output borrows from.

### 5. Lifetimes in structs

When a struct contains a reference, the struct itself has a lifetime parameter:

```rust,ignore
struct Excerpt<'a> {
    text: &'a str,    // Excerpt borrows from somewhere
}
```

Read it as: "an `Excerpt` is valid only as long as the `&str` it points at is valid." The compiler enforces this — any `Excerpt<'a>` value cannot outlive its source.

The reason structs with references are unusual: most of the time, the cleaner design is to *own* the data instead of borrow it. `struct Excerpt { text: String }` doesn't need a lifetime parameter; it owns its bytes; it's simpler to use; the cost is one allocation. Lifetimes-in-structs is the right answer when you genuinely need to borrow (zero-copy parsers like `serde_json::from_slice`, the `wordc::WordIter<'a>` we built in step 13), and the wrong answer when you reach for it out of habit.

### 6. NLL: the compiler got smarter

Until 2018, a borrow's region extended to the end of the enclosing block. Tons of code felt arbitrarily restricted because the borrow was considered alive when in fact you were done with it. Non-Lexical Lifetimes (NLL) replaced "end of block" with "last use". Most of "this used to not compile and now does" Rust programmers talk about is NLL. The mental model didn't change; the compiler's analysis got tighter.

### 7. The `'static` lifetime, demystified

There are two distinct things called `'static`:

**(a) The reference type `&'static T`** — a reference that's valid for the entire program duration. `&'static str` literals (`"hello"`) are baked into the binary. `Box::leak(...)` produces references with `'static`.

**(b) The trait bound `T: 'static`** — "type `T` does not contain any borrows that would constrain its lifetime." A `String` satisfies `T: 'static` because it owns its data; an `Excerpt<'a>` does not, unless `'a = 'static`.

Most beginner confusion comes from conflating these two. Almost every time you see `T: 'static` in a generic bound (like `tokio::spawn`), it's the second one — "the value can be moved between threads or stored beyond its origin scope without dangling."

<div class="ferris-says">
<p>If you can read someone else's signature with <code>'a</code> in it and explain it as "this borrow ties to that source for a region we'll call <code>'a</code>", you have already won. The depth track below adds variance, higher-ranked bounds, and elision edge cases — all useful, none scary.</p>
</div>

## Chapter Resources

* **Official Source:** [The Rust Reference: Lifetimes](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html)
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

## Compiler Error Decoder - Lifetime Relationships

| Error code | What it usually means                                          | Typical fix direction                                        |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| E0597      | Referenced value does not live long enough                     | Move owner to a wider scope or return owned data instead     |
| E0515      | Returning a reference to local data                            | Return an owned value, or borrow from caller-provided inputs |
| E0621      | Function signature lifetime contract mismatches implementation | Align annotations with real input-output borrow relationship |

Treat lifetime errors as relationship mismatches, not annotation shortages.

## Lexical vs NLL — a step-through

<div class="ferris-says" data-variant="insight">
<p>The following six lines compile today. Before Rust 1.31 (non-lexical lifetimes), they did not. Step through to see why. The borrow checker used to treat a borrow as "alive" until the end of its enclosing block — now it ends the borrow at its <em>last use</em>. Same code, same programmer intent, vastly smarter compiler.</p>
</div>

<div class="step-through" data-title="How NLL made more code compile without changing a line">
  <div class="step-through__frame">
    <svg viewBox="0 0 720 300" role="img" aria-label="Frame 1: A code snippet is shown. let mut v = vec [1,2,3]; let r = first(&v); println! r; v.push 4; No annotations yet — just the code.">
      <rect x="10" y="10" width="700" height="280" rx="16" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#1d3557;font-weight:bold">Frame 1 — the code</text>
      <text x="60" y="90" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">fn main() {</text>
      <text x="80" y="116" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">let mut v = vec![1, 2, 3];</text>
      <text x="80" y="142" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">let r = &amp;v[0];</text>
      <text x="80" y="168" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">println!("{r}");</text>
      <text x="80" y="194" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">v.push(4);</text>
      <text x="60" y="220" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">}</text>
      <text x="360" y="268" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#457b9d">Goal: read first element, then mutate. Reasonable code.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 300" role="img" aria-label="Frame 2: Pre-NLL lexical view. A red bracket extends from line 3 to the end of the block, showing the immutable borrow was considered alive for the full remainder of the block.">
      <rect x="10" y="10" width="700" height="280" rx="16" fill="#fef2f2" stroke="#d62828"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#d62828;font-weight:bold">Frame 2 — pre-NLL (lexical): borrow lasts until the closing brace</text>
      <text x="60" y="90" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">fn main() {</text>
      <text x="80" y="116" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">let mut v = vec![1, 2, 3];</text>
      <text x="80" y="142" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">let r = &amp;v[0];</text>
      <text x="80" y="168" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">println!("{r}");</text>
      <text x="80" y="194" style="font-family:var(--font-code);font-size:16px;fill:#d62828">v.push(4);  // E0502 — error!</text>
      <text x="60" y="220" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">}</text>
      <path d="M440 142 L 440 220 L 455 220" stroke="#d62828" stroke-width="3" fill="none"></path>
      <path d="M440 142 L 455 142" stroke="#d62828" stroke-width="3"></path>
      <text x="500" y="182" style="font-family:var(--font-display);font-size:13px;fill:#d62828">borrow r considered</text>
      <text x="500" y="198" style="font-family:var(--font-display);font-size:13px;fill:#d62828">alive to closing brace</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 300" role="img" aria-label="Frame 3: NLL view. A green bracket spans only from line 3 to the println line, ending at r's last use, so v.push succeeds.">
      <rect x="10" y="10" width="700" height="280" rx="16" fill="#ecfdf5" stroke="#047857"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#047857;font-weight:bold">Frame 3 — with NLL: borrow ends at the last use</text>
      <text x="60" y="90" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">fn main() {</text>
      <text x="80" y="116" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">let mut v = vec![1, 2, 3];</text>
      <text x="80" y="142" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">let r = &amp;v[0];</text>
      <text x="80" y="168" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">println!("{r}");</text>
      <text x="80" y="194" style="font-family:var(--font-code);font-size:16px;fill:#047857">v.push(4);  // OK!</text>
      <text x="60" y="220" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">}</text>
      <path d="M440 142 L 440 168 L 455 168" stroke="#047857" stroke-width="3" fill="none"></path>
      <path d="M440 142 L 455 142" stroke="#047857" stroke-width="3"></path>
      <text x="500" y="150" style="font-family:var(--font-display);font-size:13px;fill:#047857">borrow r ends</text>
      <text x="500" y="166" style="font-family:var(--font-display);font-size:13px;fill:#047857">at its last use</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 300" role="img" aria-label="Frame 4: A summary panel explaining that NLL changed borrow-checker tracking from lexical scope to actual usage, making thousands of previously-rejected programs compile.">
      <rect x="10" y="10" width="700" height="280" rx="16" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <text x="360" y="44" text-anchor="middle" style="font-family:var(--font-display);font-size:18px;fill:#1d3557;font-weight:bold">Frame 4 — what changed</text>
      <text x="80" y="100" style="font-family:var(--font-display);font-size:15px;fill:#1a1a2e">Lexical lifetimes (pre-2018):</text>
      <text x="100" y="126" style="font-family:var(--font-display);font-size:14px;fill:#457b9d">A borrow was considered "alive" from the moment it was taken</text>
      <text x="100" y="148" style="font-family:var(--font-display);font-size:14px;fill:#457b9d">until the end of the enclosing <tspan style="font-family:var(--font-code);">{}</tspan> block.</text>
      <text x="80" y="190" style="font-family:var(--font-display);font-size:15px;fill:#1a1a2e">Non-lexical lifetimes (2018+):</text>
      <text x="100" y="216" style="font-family:var(--font-display);font-size:14px;fill:#047857">A borrow ends at its <tspan font-weight="bold">last use</tspan>, tracked through the control</text>
      <text x="100" y="238" style="font-family:var(--font-display);font-size:14px;fill:#047857">flow graph. Thousands of obviously-correct programs now compile.</text>
      <text x="360" y="270" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#1d3557">You write the same code. The compiler got smarter.</text>
    </svg>
  </div>
</div>

## wordc, step 13 — a `WordIter<'a>` tied to its source

<div class="ferris-says" data-variant="insight">
The previous step had three little functions returning <code>&amp;str</code> values that all referred back to one big <code>&amp;str</code>. Now we'll wrap that pattern in a struct. Lifetimes will be the type-system glue that says "this iterator cannot outlive the text it scans".
</div>

Every realistic word counter eventually wants an iterator: yield each word, one at a time, without allocating a `Vec<&str>`. Standard library style:

```rust
pub struct WordIter<'a> {
    rest: &'a str,
    min_len: usize,
}

impl<'a> WordIter<'a> {
    pub fn new(text: &'a str, min_len: usize) -> Self {
        WordIter { rest: text, min_len }
    }
}

impl<'a> Iterator for WordIter<'a> {
    type Item = &'a str;

    fn next(&mut self) -> Option<&'a str> {
        loop {
            let s = self.rest.trim_start();
            if s.is_empty() { return None; }
            let end = s.find(char::is_whitespace).unwrap_or(s.len());
            let (word, after) = s.split_at(end);
            self.rest = after;
            if word.chars().count() >= self.min_len {
                return Some(word);
            }
        }
    }
}
```

The lifetime parameter `'a` is doing real work in three places:

1. **`text: &'a str`** in `new` — "the caller passes me a borrow that lives for at least region `'a`."
2. **`rest: &'a str`** inside the struct — "I am storing a borrow that lives for at least `'a`."
3. **`type Item = &'a str`** — "every `&str` I yield also lives for at least `'a`."

The compiler now enforces a contract for free: **as long as the source `&str` is alive, the iterator and every word it yields are valid; the moment the source goes out of scope, the iterator and yielded words become unusable.** No copies, no clones, just types.

```rust
fn dump_words(session: &WordcSession, min_len: usize) {
    let text = std::str::from_utf8(&session.bytes).unwrap_or("");
    for word in WordIter::new(text, min_len) {
        println!("{word}");
    }
}
```

`text` borrows from `session.bytes`. `WordIter::new(text, ...)` produces a `WordIter<'_>` whose lifetime is tied to `text`. Every `word: &str` yielded inside the loop is tied to `text` too. The whole chain unwinds at the end of `dump_words`.

<div class="ferris-says" data-variant="warning">
Try returning the iterator from a function whose only argument is the path: <code>fn iter_from(path: &amp;Path) -&gt; WordIter&lt;'?&gt;</code>. You can't write a lifetime that satisfies the compiler — because the bytes you'd read inside the function go out of scope when the function returns. The iterator would dangle. The compiler is doing the right thing.
</div>

### What if I want to "own" the iterator?

Then change the *strategy*, not the lifetime: collect into a `Vec<String>` (each word owned), or keep the bytes alive somewhere outside the iterator and have it borrow them. There is no annotation that lets a borrow outlive its source — that would be unsoundness. Lifetimes are how Rust says "I need this referent alive at least this long" and refuses to compile if you can't promise it.

### What you should be able to read now

```rust
fn longest_with_at_least<'a>(text: &'a str, min_len: usize) -> Option<&'a str>
```

In English: "given a `&str` borrow with some lifetime `'a`, I'll either return `None` or return a `&str` borrowed from the same source, with the same lifetime." The single `'a` is the *relationship*: output cannot outlive input.

## Check yourself

<div class="quiz" data-answer="1">
  <div class="quiz__head"><span>Quiz — 1 of 2</span><span>Lifetimes</span></div>
  <p class="quiz__q">What does the signature <code>fn longest&lt;'a&gt;(x: &amp;'a str, y: &amp;'a str) -&gt; &amp;'a str</code> tell the compiler?</p>
  <ul class="quiz__options">
    <li>Both inputs live for exactly the same duration as measured in clock ticks.</li>
    <li>The returned reference will live no longer than the <em>shorter</em> of the two input references' lifetimes.</li>
    <li>The returned reference has lifetime <code>'static</code> — it lives until program end.</li>
    <li>The compiler will extend the lifetime of one input to match the other.</li>
  </ul>
  <div class="quiz__explain">Correct. Lifetimes are <em>relationships</em>, not durations. The single <code>'a</code> shared across both inputs and the output means "the output is valid as long as both inputs are still valid" — i.e., for the intersection of their lifetimes. The compiler never extends lifetimes; it only checks that your usage fits inside them.</div>
  <div class="quiz__explain quiz__explain--wrong">Read the chapter's opening: "lifetimes are relationships, not durations". Which option reflects that?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quiz — 2 of 2</span><span>E0597</span></div>
  <p class="quiz__q">The error <code>E0597: borrowed value does not live long enough</code> usually means:</p>
  <ul class="quiz__options">
    <li>You need to add more lifetime annotations.</li>
    <li>You need to call <code>.clone()</code>.</li>
    <li>A reference outlives the value it was pointing at — the owner went out of scope while something still borrowed it.</li>
    <li>The compiler cannot infer type parameters.</li>
  </ul>
  <div class="quiz__explain">Correct. This is the canonical dangling-reference case, except in Rust it is caught at compile time instead of causing a use-after-free at runtime. The fix is almost always to <em>move the owner to a wider scope</em> or return an owned value instead of a borrow — not to add annotations.</div>
  <div class="quiz__explain quiz__explain--wrong">Look at the Compiler Error Decoder for E0597. What is the fix direction?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>
