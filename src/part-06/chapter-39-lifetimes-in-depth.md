# Chapter 39: Lifetimes in Depth

<div class="ferris-says" data-variant="insight">
<p><code>unsafe</code> is the escape hatch. Most Rust programmers write zero unsafe in their career. Some write a tiny amount, very carefully, at the core of a safe library. This chapter is the operating manual for the escape hatch.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-03/chapter-18-lifetimes-relationships-not-durations.md">Ch 18: Lifetimes</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Variance: covariance, contravariance, invariance</li><li>Higher-ranked trait bounds (<code>for&lt;'a&gt;</code>)</li><li>Lifetime elision rules and when they fail</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">45<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--lifetime);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Variance</div><h2 class="visual-figure__title">Which Lifetime Substitutions Are Safe?</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Covariant shared reference versus invariant mutable reference substitution">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(131,56,236,0.18)"></rect>
        <rect x="56" y="86" width="180" height="250" rx="18" fill="#eef6fb" stroke="#457b9d" stroke-width="3"></rect>
        <rect x="304" y="86" width="180" height="250" rx="18" fill="#fff5eb" stroke="#f4a261" stroke-width="3"></rect>
        <text x="82" y="120" class="svg-subtitle" style="fill:#457b9d;">covariant</text>
        <text x="336" y="120" class="svg-subtitle" style="fill:#f4a261;">invariant</text>
        <text x="94" y="168" class="svg-small" style="fill:#4b5563;">&amp;'long T</text>
        <path d="M124 178 H 170" stroke="#52b788" stroke-width="6" marker-end="url(#varArrow1)"></path>
        <text x="94" y="218" class="svg-small" style="fill:#4b5563;">usable as &amp;'short T</text>
        <text x="336" y="168" class="svg-small" style="fill:#4b5563;">&amp;mut T&lt;'long&gt;</text>
        <path d="M366 178 H 412" stroke="#d62828" stroke-width="6"></path>
        <text x="336" y="218" class="svg-small" style="fill:#4b5563;">cannot safely become</text>
        <text x="336" y="238" class="svg-small" style="fill:#4b5563;">&amp;mut T&lt;'short&gt;</text>
        <text x="86" y="300" class="svg-small" style="fill:#457b9d;">reader-only view permits narrower borrow</text>
        <text x="332" y="300" class="svg-small" style="fill:#f4a261;">mutation would let callers smuggle bad lifetimes in</text>
        <defs><marker id="varArrow1" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#52b788"></path></marker></defs>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--lifetime);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">HRTB</div><h2 class="visual-figure__title"><code>for&lt;'a&gt;</code> Means “For Every Caller Lifetime”</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Universal quantification diagram for higher-ranked trait bounds">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="128" y="56" width="284" height="56" rx="16" fill="#1f2937" stroke="#8338ec" stroke-width="3"></rect>
        <text x="176" y="90" class="svg-small" style="fill:#f1e8ff;">for&lt;'a&gt; Fn(&amp;'a str) -&gt; &amp;'a str</text>
        <path d="M270 112 V 166" stroke="#8338ec" stroke-width="6"></path>
        <rect x="72" y="166" width="116" height="40" rx="12" fill="#457b9d"></rect>
        <rect x="212" y="166" width="116" height="40" rx="12" fill="#52b788"></rect>
        <rect x="352" y="166" width="116" height="40" rx="12" fill="#f4a261"></rect>
        <text x="96" y="190" class="svg-small" style="fill:#ffffff;">'short</text>
        <text x="240" y="190" class="svg-small" style="fill:#073b1d;">'medium</text>
        <text x="378" y="190" class="svg-small" style="fill:#5e3a07;">'long</text>
        <text x="106" y="252" class="svg-small" style="fill:#f8fafc;">must work</text>
        <text x="244" y="252" class="svg-small" style="fill:#f8fafc;">must work</text>
        <text x="384" y="252" class="svg-small" style="fill:#f8fafc;">must work</text>
        <text x="92" y="326" class="svg-small" style="fill:#f8fafc;">not “one special lifetime” but every caller-provided borrow lifetime</text>
      </svg>
    </div>
  </figure>
</div>

## In plain English first

<div class="ferris-says" data-variant="insight">
<p>Chapter 18 introduced lifetimes as relationships. This chapter pushes that idea until the harder corners (variance, higher-ranked trait bounds, <code>'static</code> bounds) stop being mysterious. Read this onramp first.</p>
</div>

Three things to remember before the depth content:

**`'static` does not mean "lives forever".** It means "is allowed to live forever if necessary." A `&'static str` like `"hello"` is baked into the binary, yes — but a `T: 'static` *bound* on a generic only means "this value contains no borrows that would constrain how long it can live." A `String` satisfies `T: 'static` because it owns its data. The bound is about *what could limit the lifetime*, not "infinite duration."

**Variance is the rule for which lifetimes can substitute for which.** Shared references `&T` are "covariant in `'a`" — a `&'static str` works wherever a `&'a str` is wanted, because longer-lived can stand in for shorter-lived (it satisfies *more* constraints, not fewer). Mutable references `&mut T` are "invariant in `T`" — no substitution allowed — because the function might *write* a shorter-lived reference into the slot, breaking the longer-lived caller.

**Higher-ranked trait bounds (`for<'a>`)** are how you say "this works for *any* lifetime the caller picks." A function taking `F: for<'a> Fn(&'a str) -> usize` accepts a closure that works for *every* possible input lifetime. You'll meet `for<'a>` mostly in trait objects and closures over references.

<div class="ferris-says">
<p>None of these three need to be at the tip of your tongue when you write Rust day-to-day. They show up when you're <em>reading</em> harder libraries (<code>tokio</code>, <code>serde</code>, <code>actix</code>) and want their function signatures to make sense. That's what this chapter equips you for.</p>
</div>

## Step 1 - The Problem

Beginner lifetime errors are usually about "this borrow does not live long enough." Advanced lifetime reasoning is different. The hard problems are:

- how lifetimes compose in generic APIs
- when one lifetime can substitute for another
- why some positions are covariant and others invariant
- why trait objects default to `'static` in some contexts
- why self-referential structures are fundamentally hard

Without this level of understanding, advanced library signatures look arbitrary and compiler errors feel mystical.

## Step 2 - Rust's Design Decision

Rust models lifetimes as relationships among borrows, not durations attached to values like timers. To make generic reasoning sound, it also tracks variance:

- where a longer lifetime may substitute for a shorter one
- where substitution is forbidden because mutation or aliasing would become unsound

Rust accepted:

- more abstract type signatures
- HRTBs and variance as advanced concepts

Rust refused:

- hand-waving lifetime substitution rules
- letting mutation accidentally launder one borrow lifetime into another

## Step 3 - The Mental Model

Plain English rule: advanced lifetimes are about what relationships a type allows callers to substitute safely.

Variance answers: if I know `T<'long>`, may I use it where `T<'short>` is expected?

## Step 4 - Minimal Code Example

```rust
fn apply<F>(f: F)
where
    F: for<'a> Fn(&'a str) -> &'a str,
{
    let a = String::from("hello");
    let b = String::from("world");
    assert_eq!(f(&a), "hello");
    assert_eq!(f(&b), "world");
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

`for<'a>` means the closure or function works for any lifetime `'a`, not one specific hidden lifetime.

So the compiler reads this as:

for all possible borrow lifetimes `'a`, given `&'a str`, the function returns `&'a str`.

That is stronger than "there exists some lifetime for which this works." It is universal quantification. This is why higher-ranked trait bounds show up in iterator adapters, callback APIs, and borrow-preserving abstractions.

The invariant is:

the callee must not smuggle in a borrow tied to one specific captured lifetime when the API promises it works for all caller-provided lifetimes.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Some functions must work with whatever borrow the caller gives them. `for<'a>` is how Rust says that explicitly.

</div>
<div class="level-panel" data-level="Engineer">

Advanced lifetime tools matter in:

- parser and visitor APIs
- callback traits
- streaming or lending iterators
- trait objects carrying borrowed data

Variance matters because mutability changes what substitutions are safe. Shared references are usually covariant. Mutable references are invariant in the referenced type because mutation can break substitution assumptions.

</div>
<div class="level-panel" data-level="Deep Dive">

Variance summary:

| Position | Usual variance intuition |
|---|---|
| `&'a T` over `'a` | covariant |
| `&'a T` over `T` | covariant |
| `&'a mut T` over `T` | invariant |
| `fn(T) -> U` over input `T` | contravariant idea, though user-facing reasoning is often simplified |
| interior mutability wrappers | often invariant |

Why does this matter? Because if `&mut T<'long>` could be treated as `&mut T<'short>` too freely, code could write a shorter-lived borrow into a place expecting a longer-lived one. That would be unsound.

</div>
</div>


## Lifetime Subtyping and Trait Objects

If `'long: 'short`, then `'long` outlives `'short`. Shared references often allow covariance under that relationship.

Trait objects add another wrinkle. `Box<dyn Trait>` often means `Box<dyn Trait + 'static>` unless another lifetime is stated. That is not because trait objects are eternal. It is because the erased object has no borrowed-data lifetime bound supplied, so `'static` becomes the default object lifetime bound in many contexts.

## Self-Referential Structs

This is where many advanced lifetime ideas collide with reality.

A struct containing a pointer or reference into itself cannot be freely moved. That is why self-referential patterns usually require:

- pinning
- indices instead of internal references
- arenas
- or unsafe code with extremely careful invariants

The key lesson is not "lifetimes are annoying." It is that moving values and borrowing into them are deeply connected.

## Step 7 - Common Misconceptions

Wrong model 1: "`for<'a>` just means add another lifetime."

Correction: it means universal quantification, which is much stronger than one named lifetime parameter.

Wrong model 2: "Variance is an academic topic with little practical value."

Correction: it explains why many generic lifetime signatures compile or fail the way they do.

Wrong model 3: "`Box<dyn Trait>` means the object itself lives forever."

Correction: it usually means the erased object does not contain non-static borrows.

Wrong model 4: "Self-referential structs are a lifetime syntax problem."

Correction: they are fundamentally a movement and address-stability problem.

## Step 8 - Real-World Pattern

You will see advanced lifetime reasoning in:

- borrow-preserving parser APIs
- callback traits that must work for any input borrow
- trait objects carrying explicit non-static lifetimes
- unsafe abstractions using `PhantomData` to describe borrowed relationships

Once you see lifetimes as substitution rules, not time durations, these APIs become much easier to read.

## Step 9 - Practice Block

### Code Exercise

Write a function bound with `for<'a> Fn(&'a [u8]) -> &'a [u8]` and explain why a closure returning a captured slice would not satisfy the bound.

### Code Reading Drill

Explain what this means:

```rust
struct View<'a> {
    bytes: &'a [u8],
}
```

Then explain how the story changes if the bytes come from inside the struct itself.

### Spot the Bug

Why can this not work as written?

```rust
struct Bad<'a> {
    text: String,
    slice: &'a str,
}
```

### Refactoring Drill

Take a self-referential design and redesign it using indices or offsets instead of internal references.

### Compiler Error Interpretation

If the compiler says a borrowed value does not live long enough in a higher-ranked context, translate it as: "I promised this API works for any caller lifetime, but my implementation only works for one particular lifetime relationship."

## Step 10 - Contribution Connection

After this chapter, you can read:

- nontrivial parser and visitor signatures
- callback-heavy generic APIs
- trait objects with explicit lifetime bounds
- advanced unsafe code using `PhantomData<&'a T>`

Good first PRs include:

- simplifying over-constrained lifetime signatures
- replacing accidental `'static` requirements with precise lifetime bounds
- improving docs on borrow relationships in public APIs

## In Plain English

Advanced lifetimes are Rust's way of saying exactly which borrowed relationships stay valid when generic code is reused in many contexts. That matters because serious library code cannot rely on "just trust me" borrowing; it has to describe precisely what substitutions are safe.

## What Invariant Is Rust Protecting Here?

Borrow substitutions across generic code must preserve validity: a shorter-lived borrow must not be smuggled into a place that promises longer validity, especially through mutation or erased abstractions.

## Variance — a step-through

<div class="ferris-says" data-variant="insight">
<p>Variance is the rule that decides which lifetimes are <em>substitutable</em> for which. <code>&amp;'a T</code> is covariant in <code>'a</code>: longer lifetimes can stand in for shorter ones. <code>&amp;'a mut T</code> is invariant in <code>T</code>: no substitution allowed. Step through to see <em>why</em> these rules differ — they're not arbitrary.</p>
</div>

<div class="step-through" data-title="Why &T is covariant and &mut T is invariant">
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 1: covariance of shared references. A long lifetime 'static reference is shown being used where a shorter 'a lifetime is expected, with a green checkmark. The arrow shows substitution direction: longer can stand in for shorter.">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#ecfdf5" stroke="#047857"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#047857;font-weight:bold">Frame 1 — <code>&amp;'a T</code> is <em>covariant</em> in <code>'a</code></text>
      <text x="60" y="84" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">fn print_str&lt;'a&gt;(s: &amp;'a str) { println!("{s}"); }</text>
      <text x="60" y="124" style="font-family:var(--font-code);font-size:15px;fill:#1a1a2e">let global: &amp;'static str = "hello";  // lives forever</text>
      <text x="60" y="148" style="font-family:var(--font-code);font-size:15px;fill:#047857">print_str(global);  // OK — &amp;'static substitutes for &amp;'a</text>
      <rect x="60" y="180" width="600" height="80" rx="10" fill="#fff" stroke="#047857"></rect>
      <text x="80" y="206" style="font-family:var(--font-display);font-size:14px;fill:#047857">Read it as: <code>'static</code>: <code>'a</code>. The lifetime relation flows the</text>
      <text x="80" y="226" style="font-family:var(--font-display);font-size:14px;fill:#047857">same direction as the type — <em>longer is a subtype of shorter</em>.</text>
      <text x="80" y="246" style="font-family:var(--font-display);font-size:13px;fill:#1a1a2e">Anywhere a "lives at least as long as 'a" is required, "lives forever" works.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 2: invariance of mutable references. A function takes a mutable reference to a Vec of strings with lifetime 'a. Calling it with a Vec of static strings would be unsound because the function might write a shorter-lived reference into it.">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#fef2f2" stroke="#d62828"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#d62828;font-weight:bold">Frame 2 — <code>&amp;'a mut T</code> is <em>invariant</em> in <code>T</code></text>
      <text x="60" y="84" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">fn replace&lt;'a&gt;(v: &amp;mut Vec&lt;&amp;'a str&gt;, s: &amp;'a str) {</text>
      <text x="80" y="106" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">v[0] = s;  // writes &amp;'a str into the Vec</text>
      <text x="60" y="128" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">}</text>
      <text x="60" y="160" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">let mut globals: Vec&lt;&amp;'static str&gt; = vec!["hi"];</text>
      <text x="60" y="184" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">let local = String::from("bye");</text>
      <text x="60" y="208" style="font-family:var(--font-code);font-size:14px;fill:#d62828">replace(&amp;mut globals, &amp;local);</text>
      <text x="60" y="232" style="font-family:var(--font-code);font-size:14px;fill:#d62828">// would write &amp;'local into Vec&lt;&amp;'static&gt; — UB if allowed!</text>
      <text x="360" y="282" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#d62828">If <code>&amp;mut</code> were covariant, the callee could store</text>
      <text x="360" y="302" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#d62828">a shorter-lived reference where a longer-lived one is expected.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 3: a side-by-side rule summary. Shared references are covariant in their lifetime parameter; the inner T's variance is propagated. Mutable references are covariant in the lifetime but invariant in T. Cells and mutex's interior types are invariant.">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#1d3557;font-weight:bold">Frame 3 — the variance reference table</text>
      <g font-family="var(--font-code)" font-size="14">
        <text x="60" y="80" fill="#1a1a2e">&amp;'a T</text>
        <text x="200" y="80" fill="#047857">covariant in 'a</text>
        <text x="380" y="80" fill="#047857">covariant in T</text>
        <text x="60" y="108" fill="#1a1a2e">&amp;'a mut T</text>
        <text x="200" y="108" fill="#047857">covariant in 'a</text>
        <text x="380" y="108" fill="#d62828">INVARIANT in T</text>
        <text x="60" y="136" fill="#1a1a2e">Cell&lt;T&gt;, RefCell&lt;T&gt;</text>
        <text x="200" y="136" fill="#1a1a2e">—</text>
        <text x="380" y="136" fill="#d62828">INVARIANT in T</text>
        <text x="60" y="164" fill="#1a1a2e">Box&lt;T&gt;, Vec&lt;T&gt;</text>
        <text x="200" y="164" fill="#1a1a2e">—</text>
        <text x="380" y="164" fill="#047857">covariant in T</text>
        <text x="60" y="192" fill="#1a1a2e">fn(T) -&gt; ()</text>
        <text x="200" y="192" fill="#1a1a2e">—</text>
        <text x="380" y="192" fill="#d62828">CONTRAVARIANT in T</text>
        <text x="60" y="220" fill="#1a1a2e">fn() -&gt; T</text>
        <text x="200" y="220" fill="#1a1a2e">—</text>
        <text x="380" y="220" fill="#047857">covariant in T</text>
      </g>
      <text x="360" y="276" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#457b9d">Rule of thumb: if the type can <em>write</em> to <code>T</code>, it's invariant.</text>
      <text x="360" y="296" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#457b9d">Read-only positions are covariant; argument positions are contravariant.</text>
    </svg>
  </div>
</div>

## Quick check

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quick check</span><span>Variance</span></div>
  <p class="quiz__q"><code>&amp;'a T</code> is <em>covariant</em> in <code>'a</code>. In plain English, that means:</p>
  <ul class="quiz__options">
    <li>Longer lifetimes can be substituted where shorter lifetimes are expected — a <code>&amp;'static str</code> can be used wherever a <code>&amp;'a str</code> is wanted.</li>
    <li>Lifetimes can be freely reordered.</li>
    <li>The reference type is invariant; you cannot substitute lifetimes at all.</li>
    <li>Shorter lifetimes can be substituted for longer ones — never sound.</li>
  </ul>
  <div class="quiz__explain">Correct. Covariance over <code>'a</code> says: anywhere a borrow of lifetime <code>'a</code> is wanted, a borrow that lives <em>longer</em> works. <code>&amp;'static T</code> outlives every <code>'a</code>, so it's always assignable. Mutable references <code>&amp;mut T</code> are <em>invariant</em> in <code>T</code>, which is why <code>&amp;mut Vec&lt;&amp;'static str&gt;</code> cannot be passed where <code>&amp;mut Vec&lt;&amp;'a str&gt;</code> is expected — it would let the callee write a shorter-lived reference into a longer-lived slot.</div>
  <div class="quiz__explain quiz__explain--wrong">Re-read the variance section. Which direction is sound for shared references?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

## If You Remember Only 3 Things

- `for<'a>` means "for every possible lifetime," not "for one extra named lifetime."
- Variance explains which lifetime substitutions are safe and which are not.
- Self-referential structs are hard because movement and borrowing collide, not because lifetime syntax is missing.

## Memory Hook

Lifetimes are not clocks. They are lane markings on a highway interchange telling you which vehicles may merge where without collision.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does `for<'a>` mean? | The bound must hold for every possible lifetime `'a`. |
| Why are mutable references often invariant? | Because mutation can otherwise smuggle incompatible lifetimes or types into a place that assumed a stricter relationship. |
| What does `'long: 'short` mean? | `'long` outlives `'short`. |
| Why does `Box<dyn Trait>` often imply `'static`? | Because object lifetime defaults often use `'static` when no narrower borrow lifetime is specified. |
| Are lifetimes durations? | No. They are relationships among borrows and validity scopes. |
| Why are self-referential structs difficult? | Moving the struct can invalidate internal references into itself. |
| Where do HRTBs commonly appear? | Callback APIs, parser/visitor patterns, and borrow-preserving abstractions. |
| What does variance explain in practice? | Which lifetime or type substitutions are safe in generic positions. |

## Chapter Cheat Sheet

| Need | Concept | Why |
|---|---|---|
| API works for any caller borrow | HRTB `for<'a>` | universal lifetime requirement |
| Understand substitution safety | variance | explains compile successes and failures |
| Non-static borrowed trait object | explicit object lifetime bound | avoid accidental `'static` |
| Self-referential data | pinning, arenas, or indices | movement-safe design |
| Explain lifetime signature | relationship language | avoid duration-based confusion |

---
