# Chapter 17: Borrowing, Constrained Access

<div class="ferris-says" data-variant="insight">
<p>Borrowing, pushed until it breaks. We go past "one writer or many readers" into <em>why</em> that rule exists, what it rules out (a shocking number of real-world bugs), and the clever workarounds (<code>Cell</code>, <code>RefCell</code>, interior mutability) that let you bend the rule when you need to.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-02/chapter-10-ownership-first-contact.md">Ch 10: Ownership</a>
      <a href="../part-02/chapter-11-borrowing-and-references-first-contact.md">Ch 11: Borrowing Intro</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>Aliasing XOR mutation as a formal invariant</li>
      <li>Why iterator invalidation is impossible in Rust</li>
      <li>How NLL changed Rust 2018 borrow scoping</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">40<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div>
  </div>
</div>
<div class="concept-link builds-on">
  <div class="concept-link-icon">←</div>
  <div class="concept-link-body">
    <strong>Builds on Chapters 10 and 11</strong>
    This chapter formalizes what Ch 10 introduced informally. The aliasing-XOR-mutation rule is the reason Ch 10's "one owner" works: shared mutation would mean two owners.
    <a href="../part-02/chapter-10-ownership-first-contact.md">Revisit Ch 10 →</a>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapters 21 and 32</strong>
    The borrow checker (Ch 21) enforces these rules at MIR level. Send/Sync (Ch 32) extend aliasing-XOR-mutation to thread boundaries.
    <a href="../part-03/chapter-21-the-borrow-checker-how-the-compiler-thinks.md">Ch 21: Borrow Checker →</a>
  </div>
</div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--borrow-shared);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Aliasing Problem</div><h2 class="visual-figure__title">Two Readers Is Stable, Reader Plus Writer Is Not</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Two scenarios comparing safe shared reads with dangerous simultaneous read and write">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(69,123,157,0.18)"></rect>
        <rect x="54" y="76" width="182" height="264" rx="18" fill="#eef6fb" stroke="#457b9d" stroke-width="3"></rect>
        <text x="90" y="110" class="svg-subtitle" style="fill:#457b9d;">Shared readers</text>
        <rect x="102" y="170" width="86" height="56" rx="12" fill="#ffffff"></rect>
        <text x="128" y="204" class="svg-small" style="fill:#023e8a;">42</text>
        <path d="M78 190 H 102 M188 190 H 214" stroke="#457b9d" stroke-width="6" marker-end="url(#readArrow)"></path>
        <text x="94" y="290" class="svg-small" style="fill:#4b5563;">both observers see the same stable value</text>
        <text x="146" y="318" class="svg-label" style="fill:#52b788;">✓</text>
        <rect x="304" y="76" width="182" height="264" rx="18" fill="#fff5eb" stroke="#f4a261" stroke-width="3"></rect>
        <text x="330" y="110" class="svg-subtitle" style="fill:#f4a261;">Reader + writer</text>
        <rect x="352" y="170" width="86" height="56" rx="12" fill="#ffffff"></rect>
        <text x="378" y="204" class="svg-small" style="fill:#8a4b08;">42 → ?</text>
        <path d="M328 190 H 352" stroke="#457b9d" stroke-width="6" marker-end="url(#readArrow2)"></path>
        <path d="M462 154 L 430 182" stroke="#f4a261" stroke-width="6" marker-end="url(#writeArrow)"></path>
        <text x="330" y="290" class="svg-small" style="fill:#4b5563;">one view assumes stability while another changes the cell</text>
        <text x="394" y="318" class="svg-label" style="fill:#d62828;">✗</text>
        <defs>
          <marker id="readArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#457b9d"></path></marker>
          <marker id="readArrow2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#457b9d"></path></marker>
          <marker id="writeArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#f4a261"></path></marker>
        </defs>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--borrow-exclusive);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Iterator Safety</div><h2 class="visual-figure__title">Why Rust Rejects Iterator Invalidation</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Step-by-step vector reallocation and dangling iterator prevention">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <g font-family="IBM Plex Sans, sans-serif" font-size="12">
          <rect x="54" y="72" width="432" height="64" rx="14" fill="#1f2937" stroke="#52b788"></rect>
          <rect x="82" y="92" width="44" height="24" rx="6" fill="#52b788"></rect>
          <rect x="132" y="92" width="44" height="24" rx="6" fill="#52b788"></rect>
          <rect x="182" y="92" width="44" height="24" rx="6" fill="#52b788"></rect>
          <path d="M140 140 v38" stroke="#457b9d" stroke-width="5" marker-end="url(#iterArrow)"></path>
          <text x="102" y="194" class="svg-small" style="fill:#dbeafe;">iterator points into current buffer</text>
          <rect x="54" y="214" width="432" height="64" rx="14" fill="#1f2937" stroke="#f4a261"></rect>
          <rect x="82" y="234" width="44" height="24" rx="6" fill="#f4a261"></rect>
          <rect x="132" y="234" width="44" height="24" rx="6" fill="#f4a261"></rect>
          <rect x="182" y="234" width="44" height="24" rx="6" fill="#f4a261"></rect>
          <rect x="232" y="234" width="44" height="24" rx="6" fill="#f4a261"></rect>
          <text x="298" y="248" class="svg-small" style="fill:#ffd8cc;">push may reallocate storage</text>
          <path d="M140 180 C 140 212, 118 218, 118 248" stroke="#d62828" stroke-width="5"></path>
          <path d="M108 238 L 128 258 M128 238 L108 258" stroke="#d62828" stroke-width="5"></path>
          <text x="88" y="316" class="svg-small" style="fill:#ffd9dc;">old iterator would dangle after move</text>
          <text x="88" y="338" class="svg-small" style="fill:#52b788;">Rust rejects the conflicting borrow before runtime</text>
        </g>
        <defs><marker id="iterArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#457b9d"></path></marker></defs>
      </svg>
    </div>
  </figure>
</div>


<div class="annotated-code" style="--chapter-accent: var(--borrow-exclusive);">

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];       // shared borrow of v
v.push(4);                // ERROR: &mut borrow while &v lives
println!("{first}");      // shared borrow used after conflict
```

<div class="ann-col">
  <div class="ann-item ann-own">
    <strong>Owner created</strong>
    <code>v</code> owns the Vec. Heap buffer at address A.
  </div>
  <div class="ann-item ann-borrow">
    <strong>&T borrow</strong>
    <code>first</code> borrows into v's buffer. It assumes buffer stability.
  </div>
  <div class="ann-item ann-error">
    <strong>E0502</strong>
    <code>push</code> needs <code>&mut v</code> but <code>first</code>'s <code>&v</code> is still live. push may reallocate, moving the buffer.
  </div>
  <div class="ann-item ann-error">
    <strong>Dangling prevented</strong>
    If <code>push</code> reallocated, <code>first</code> would point to freed memory. Borrow checker prevents it.
  </div>
</div>
</div>


### In Your Language: Iterator Invalidation

<div class="lang-compare">
<div class="lang-panel">
<span class="lang-label lang-label--rust">Rust — compile-time prevention</span>

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];
v.push(4);          // COMPILE ERROR
println!("{first}"); // borrow still live
```

</div>
<div class="lang-panel">
<span class="lang-label lang-label--python">Python — runtime crash possible</span>

```python
v = [1, 2, 3]
it = iter(v)
next(it)          # 1
v.append(4)       # works! but...
# iterator may give unexpected results
# no compile-time guard
```

</div>
</div>

### Walk Through: Why push Invalidates a Reference

<div class="stepper">
<div class="stepper-step">
<strong>Step 1: Vec allocates</strong>
<code>let mut v = vec![1, 2, 3];</code> — Vec allocates a heap buffer large enough for 3 elements (capacity may be 3 or 4). <code>v</code> owns this buffer.
</div>
<div class="stepper-step">
<strong>Step 2: Borrow into the buffer</strong>
<code>let first = &v[0];</code> — <code>first</code> is a <code>&i32</code> pointing <em>directly into the heap buffer</em>. It assumes the buffer is at a stable address.
</div>
<div class="stepper-step">
<strong>Step 3: Push may reallocate</strong>
<code>v.push(4);</code> — If capacity is exhausted, Vec allocates a new, larger buffer, copies all elements, and frees the old one. <code>first</code> now points to freed memory → <strong>dangling pointer</strong>.
</div>
<div class="stepper-step">
<strong>Step 4: Rust prevents it</strong>
The borrow checker sees that <code>first</code> holds <code>&v</code> (shared borrow) while <code>push</code> requires <code>&mut v</code> (exclusive). Since `first` is used after `push`, their borrow regions overlap → <strong>E0502 at compile time</strong>. No runtime crash possible.
</div>
</div>

## In plain English first

<div class="ferris-says" data-variant="insight">
<p>The deep walkthrough below is the systems-engineer view. Here is the beginner-first version that makes the rest land easily.</p>
</div>

Imagine a Google Doc. Many people can read at the same time without anything going wrong. The moment one person starts editing, you would *not* want others reading half-applied changes. So either: many readers, no writer; or, exactly one writer, no readers. Pick a mode, swap when you need to.

That is the entire borrowing rule, and Rust calls it **aliasing XOR mutation**: at any moment, a value has either many shared borrows (`&T`) or one exclusive borrow (`&mut T`), never both. The compiler proves it for you, statically, before your program runs.

The reason this matters is not abstract. It eliminates an entire family of real-world bugs: iterator invalidation (mutating a list while iterating it), data races between threads, callback APIs that re-enter and corrupt their own state. None of those are reachable in safe Rust — *because* aliasing XOR mutation rules them out.

<div class="ferris-says">
<p>Many readers ↔ <code>&amp;T</code>. One writer ↔ <code>&amp;mut T</code>. The hard part is not memorising the names; it is reading code and noticing which mode each line is operating in. The walkthroughs below train exactly that skill.</p>
</div>

## Beginner walkthrough — every idea in this chapter, plain English

<div class="ferris-says" data-variant="insight">
<p>The onramp gave you the rule (many readers XOR one writer). This walkthrough is the rule applied — what bugs it eliminates, where it shows up in real code, and the small set of patterns for working <em>with</em> the rule rather than fighting it.</p>
</div>

### 1. The rule, restated and demonstrated

At any single moment, a value can have either:

- *Many* shared borrows (`&T`), each of which can read but not modify, OR
- *Exactly one* exclusive borrow (`&mut T`), which can read and modify.

Never both. The compiler proves it before your program runs.

This isn't an arbitrary policy — it's a *physical* invariant. Two threads modifying the same memory without coordination is a data race, and the result is undefined. One thread modifying memory while another reads halfway through is a torn read. Rust's rule rules out both at the type-system level. The aliasing rule isn't restricting you; it's articulating the precondition that already had to hold for your program to be correct.

### 2. The bug class that disappears: iterator invalidation

Here is the canonical example of the rule paying off. In Python:

```python
xs = [1, 2, 3, 4]
for x in xs:
    if x == 2:
        xs.append(5)        # mutate while iterating
```

This silently does the wrong thing — sometimes you visit the appended element, sometimes you don't, and on Python 3.x you may iterate forever in pathological cases. The same pattern in C++ is undefined behaviour. The same pattern in Java throws `ConcurrentModificationException` *at runtime* if you're lucky.

In Rust:

```rust,ignore
let mut xs = vec![1, 2, 3, 4];
for x in &xs {
    if *x == 2 {
        xs.push(5);                  // ← compile error
    }
}
```

`for x in &xs` takes a `&Vec<i32>` borrow. `xs.push(5)` requires `&mut Vec<i32>`. Both alive at the same point. Rule violated. The compiler refuses with E0502: "cannot borrow `xs` as mutable because it is also borrowed as immutable."

The bug isn't *prevented at runtime*. It's *unrepresentable in the source code*. That's the difference.

### 3. The deeper reason `Vec::push` requires `&mut`

A `Vec` is a struct holding three things: a pointer to its heap buffer, a length, and a capacity. When you `push` and the length would exceed the capacity, the `Vec` allocates a *new, larger* heap buffer, copies the elements over, and frees the old one.

If anyone was holding a `&i32` reference into the old buffer, that reference is now pointing at freed memory. Use-after-free.

This is why `Vec::push` is `fn push(&mut self, ...)` — and why the borrow checker requires *no `&` borrows* to be alive at the same time. The rule isn't bureaucratic. It's saving you from a real, repeatable, hard-to-debug bug.

### 4. When you genuinely need to mutate while reading

Three escape hatches, in order of preference:

**(a) Restructure the borrow scope.** Often the "I need both" feeling goes away if you read the value into a local first. `for x in xs.clone() { xs.push(...) }` works because the iterator is over the clone, not the live `xs`.

**(b) Use indices instead of references.** `for i in 0..xs.len() { if xs[i] == 2 { xs.push(5); break; } }` — indices are `usize`, not borrows, so the aliasing rule doesn't constrain them. The trade-off is you give up the iterator's bounds-check elision and you have to handle the case where pushing changes `xs.len()` mid-loop.

**(c) Use interior mutability.** `Cell<T>`, `RefCell<T>`, `Mutex<T>` move the borrow check from compile time to runtime. You hold a shared `&Cell<T>` and call `.set()` through it; the compiler is OK with this because the *type* opted into runtime checking. We cover these in detail in chapter 30.

### 5. NLL is what makes the rule pleasant in 2024

Pre-Rust-2018, a borrow's "region" extended from creation to the end of the enclosing block. Lots of obviously-fine code didn't compile because borrows were considered alive longer than they really were.

Non-Lexical Lifetimes (NLL, Rust 2018+) computes the borrow's region from the *control-flow graph*: a borrow is alive only between its creation and its *last use*. This single change made huge amounts of code compile that used to require contortions.

```rust,ignore
let mut v = vec![1, 2, 3];
let first = &v[0];
println!("{first}");      // last use of `first`
v.push(4);                // OK — `first` is no longer alive
```

Pre-NLL: error. Post-NLL: compiles. The rule is the same; the compiler is just smarter about *when* a borrow ends.

### 6. The shape that keeps showing up

Once you internalise aliasing XOR mutation, you'll start seeing the same shape repeatedly across the standard library and well-designed crates: methods that *read* take `&self`, methods that *modify* take `&mut self`, and the type of `Self` is the public contract for which kinds of access can coexist. That contract is the borrow checker's input. The rest is mechanics.

<div class="ferris-says">
<p>Most of fighting the borrow checker, the first month, is fighting against this rule. Most of <em>not</em> fighting the borrow checker, after the first month, is recognising the rule's shape early and writing your function signatures to express what you really need.</p>
</div>

## wordc, step 12 — many readers over the same `&[u8]`

<div class="ferris-says" data-variant="insight">
The <code>WordcSession</code> we built last chapter <em>owns</em> the file's bytes. Now we'll fan out work over those bytes by handing out shared borrows. Many readers, no writers — exactly the case the aliasing rule allows.
</div>

A real word counter wants to compute several stats over the same file: word count, line count, longest word, the histogram of word lengths. We don't want each pass to re-read the file or clone the bytes. Borrowing makes that free.

```rust
fn count_words(text: &str, min_len: usize) -> usize {
    text.split_whitespace().filter(|w| w.chars().count() >= min_len).count()
}

fn count_lines(text: &str) -> usize {
    text.lines().count()
}

fn longest_word(text: &str) -> Option<&str> {
    text.split_whitespace().max_by_key(|w| w.chars().count())
}

fn report(session: &WordcSession) {
    let text = std::str::from_utf8(&session.bytes).unwrap_or("");

    let words = count_words(text, 1);
    let lines = count_lines(text);
    let longest = longest_word(text).unwrap_or("");

    println!("words:   {words}");
    println!("lines:   {lines}");
    println!("longest: {longest:?}");
}
```

Three different functions all hold a `&str` into the *same* underlying `Vec<u8>` at the same time. The borrow checker is fine with this — they're shared borrows, and the session is alive across the entire block. There are no writers, so there is nothing for an aliased reader to race with.

<div class="ferris-says" data-variant="warning">
Now try inserting a write — e.g. mutate <code>session.bytes</code> while <code>longest</code> still references <code>text</code>. The compiler refuses (E0502): a <code>&mut</code> against the bytes would invalidate the <code>&str</code>. The aliasing rule is not arbitrary; it is exactly what protects <code>longest</code> from pointing at freed or moved memory.
</div>

### Why this is the same rule as `Vec::push`

When `Vec::push` reallocates, it invalidates every borrow into the old buffer. The compiler models this as: `push` requires `&mut self`, and `&mut self` is incompatible with any outstanding `&self` borrow.

`wordc::report` benefits from the same rule in the *good* direction: as long as no one writes, every reader is safe to keep its `&str`. We get parallel reads of the same bytes for free, with zero copies and zero locks.

### A subtle point: `&str` vs `&[u8]`

`std::str::from_utf8(&self.bytes)` returns a `Result<&str, Utf8Error>`. The `&str` *re-borrows* a piece of the `&[u8]` we already had. Both point at the same memory. The Rust type system tracks both, and ensures the `&str` cannot outlive the bytes it borrows from. We will rely on this in the next step (lifetimes).

## Readiness Check - Borrowing Confidence

Before proceeding, self-check your ability to reason about aliasing and mutation.

| Skill                         | Level 0                    | Level 1                               | Level 2                                                      | Level 3                                                  |
| ----------------------------- | -------------------------- | ------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| Explain aliasing XOR mutation | I memorize the phrase only | I can explain many-readers/one-writer | I can identify why a specific borrow conflict occurs         | I can predict borrow regions before compiling            |
| Debug borrow conflicts        | I try random edits         | I can fix one obvious E0502 case      | I can choose between borrow narrowing and ownership transfer | I can refactor APIs to make borrow discipline obvious    |
| Design mutation flow safely   | I mutate where convenient  | I can isolate mutation blocks         | I can structure code to minimize overlapping borrows         | I can review code for hidden iterator invalidation risks |

Target Level 2+ before moving to Chapter 21.

## Compiler Error Decoder - Constrained Access

| Error code | What it usually means                           | Typical fix direction                                            |
| ---------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| E0502      | Immutable and mutable borrows overlap           | Narrow borrow lifetimes with smaller scopes and earlier last-use |
| E0499      | Two mutable borrows coexist                     | Refactor into one mutation path at a time                        |
| E0506      | Assigned to a value while it was still borrowed | Delay assignment until borrow ends or clone required data first  |

Always ask: "Which borrow must stay live here?" Then eliminate or shorten the other one.

## Check yourself

<div class="quiz" data-answer="3">
  <div class="quiz__head"><span>Quiz — 1 of 2</span><span>Interior mutability</span></div>
  <p class="quiz__q">You have a <code>Vec&lt;T&gt;</code> that one reader needs to observe and one writer needs to append to, all from a single thread. Which primitive is appropriate?</p>
  <ul class="quiz__options">
    <li><code>Arc&lt;Mutex&lt;Vec&lt;T&gt;&gt;&gt;</code> — it is always safe, so use it.</li>
    <li>Raw pointers and <code>unsafe</code>.</li>
    <li>Two independent <code>Vec</code>s, one per role.</li>
    <li><code>RefCell&lt;Vec&lt;T&gt;&gt;</code> — it enforces the aliasing rule at <em>runtime</em>, single-threaded, no lock cost.</li>
  </ul>
  <div class="quiz__explain">Correct. <code>RefCell</code> is the single-threaded interior-mutability primitive: it checks "one writer or many readers" at runtime and panics on violation. <code>Mutex</code> solves the same problem for cross-thread, with a real OS-level lock. Using <code>Mutex</code> where <code>RefCell</code> would do is leaving performance on the table.</div>
  <div class="quiz__explain quiz__explain--wrong">Look at the chapter's section on <code>Cell</code> / <code>RefCell</code>. Which one solves this single-threaded case without an OS lock?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

<div class="quiz" data-answer="0">
  <div class="quiz__head"><span>Quiz — 2 of 2</span><span>NLL</span></div>
  <p class="quiz__q">What does "non-lexical lifetimes" change about Rust's borrow checker?</p>
  <ul class="quiz__options">
    <li>A borrow ends at its <em>last use</em>, not at the closing brace of the scope — so more correct programs now compile.</li>
    <li>You can skip the borrow checker entirely with <code>#[no_nll]</code>.</li>
    <li>Borrows now live forever unless explicitly ended.</li>
    <li>Lifetimes become dynamic; they are tracked at runtime.</li>
  </ul>
  <div class="quiz__explain">Correct. Pre-NLL, a borrow was "alive" from creation until the end of its enclosing <code>{}</code> block — often much longer than needed. NLL made the borrow end at its <em>last real use</em>, which is a much tighter and more intuitive model. Many programs that "should obviously compile" only started compiling after NLL landed in 2018.</div>
  <div class="quiz__explain quiz__explain--wrong">Re-read the NLL section. The key word is <em>last use</em>.</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>
