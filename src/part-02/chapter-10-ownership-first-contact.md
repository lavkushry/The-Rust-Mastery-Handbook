# Chapter 10: Ownership, First Contact
<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-02/chapter-06-variables-mutability-and-shadowing.html">Ch 6: Variables &amp; Mutability</a>
      <a href="../part-02/chapter-07-types-scalars-compounds-and-the-unit-type.html">Ch 7: Types</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>The three ownership rules</li>
      <li>Why assignment moves, not copies</li>
      <li>How scope triggers <code>drop</code></li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">30<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapters 11, 16, and 17</strong>
    Ownership is the foundation of borrowing. Ch 11 introduces references as borrowed access, Ch 16 formalizes ownership as RAII, and Ch 17 gives the aliasing-XOR-mutation rule.
    <a href="../part-02/chapter-11-borrowing-and-references-first-contact.html">Ch 11: Borrowing →</a>
  </div>
</div>

<figure class="visual-figure" style="--chapter-accent: var(--ownership);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Hero Illustration</div>
      <h2 class="visual-figure__title">Ownership as the Library Checkout Card</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1080 520" role="img" aria-label="Library book ownership illustration showing owner, move, use-after-move rejection, and drop">
      <rect x="34" y="38" width="1012" height="444" rx="28" fill="#fffaf6" stroke="rgba(230,57,70,0.18)"></rect>
      <g>
        <rect x="76" y="88" width="212" height="320" rx="20" fill="#fff1f2" stroke="#e63946" stroke-width="3"></rect>
        <rect x="136" y="132" width="92" height="118" rx="10" fill="#b56576"></rect>
        <rect x="110" y="270" width="140" height="28" rx="14" fill="#e9c46a"></rect>
        <circle cx="182" cy="332" r="28" fill="#e63946"></circle>
        <text x="126" y="372" class="svg-label" style="fill:#e63946;">1. OWNER</text>
        <text x="98" y="396" class="svg-small" style="fill:#4b5563;">Person A holds the</text>
        <text x="102" y="414" class="svg-small" style="fill:#4b5563;">checkout card.</text>
      </g>
      <g>
        <rect x="318" y="88" width="212" height="320" rx="20" fill="#fff5eb" stroke="#fb8500" stroke-width="3"></rect>
        <circle cx="372" cy="332" r="28" fill="#fb8500"></circle>
        <circle cx="474" cy="332" r="28" fill="#fb8500"></circle>
        <rect x="352" y="140" width="60" height="86" rx="10" fill="#b56576"></rect>
        <rect x="430" y="140" width="60" height="86" rx="10" fill="#b56576"></rect>
        <path d="M390 264 H 456" stroke="#fb8500" stroke-width="8" marker-end="url(#ownMoveArrow)"></path>
        <text x="390" y="372" class="svg-label" style="fill:#fb8500;">2. MOVE</text>
        <text x="364" y="396" class="svg-small" style="fill:#4b5563;">Responsibility moves</text>
        <text x="372" y="414" class="svg-small" style="fill:#4b5563;">with the card.</text>
      </g>
      <g>
        <rect x="560" y="88" width="212" height="320" rx="20" fill="#fff5f5" stroke="#d62828" stroke-width="3"></rect>
        <rect x="620" y="140" width="88" height="114" rx="10" fill="#b56576" fill-opacity="0.35"></rect>
        <circle cx="610" cy="332" r="28" fill="#e5e7eb" stroke="#d62828" stroke-width="3"></circle>
        <path d="M642 174 l44 44 M686 174 l-44 44" stroke="#d62828" stroke-width="8" stroke-linecap="round"></path>
        <text x="600" y="372" class="svg-label" style="fill:#d62828;">3. USE AFTER MOVE</text>
        <text x="602" y="396" class="svg-small" style="fill:#4b5563;">Old name still exists,</text>
        <text x="592" y="414" class="svg-small" style="fill:#4b5563;">authority does not.</text>
      </g>
      <g>
        <rect x="802" y="88" width="212" height="320" rx="20" fill="#f3f0ff" stroke="#6d6875" stroke-width="3"></rect>
        <rect x="864" y="144" width="86" height="110" rx="12" fill="#b56576" fill-opacity="0.25" stroke="#6d6875" stroke-dasharray="8 6"></rect>
        <path d="M904 280 v40" stroke="#6d6875" stroke-width="8" stroke-linecap="round"></path>
        <path d="M886 318 h36" stroke="#6d6875" stroke-width="8" stroke-linecap="round"></path>
        <text x="870" y="372" class="svg-label" style="fill:#6d6875;">4. DROP</text>
        <text x="858" y="396" class="svg-small" style="fill:#4b5563;">Scope ends. The book</text>
        <text x="858" y="414" class="svg-small" style="fill:#4b5563;">goes back exactly once.</text>
      </g>
      <defs>
        <marker id="ownMoveArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#fb8500"></path>
        </marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">The checkout card is the key detail. Rust ownership is not “who can see the book.” It is “who is responsible for it.” The name that loses the card is not allowed to act like the owner anymore.</figcaption>
</figure>
<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--ownership);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Memory Diagram</div>
      <h2 class="visual-figure__title">`String` Ownership on Stack and Heap</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1080 520" role="img" aria-label="Ownership memory diagram showing s1 and s2 over stack and heap with moved invalidation">
      <rect x="34" y="38" width="1012" height="444" rx="28" fill="#0f172a" stroke="rgba(255,255,255,0.08)"></rect>
      <rect x="72" y="102" width="402" height="304" rx="22" fill="#102a20" stroke="#2d6a4f" stroke-width="3"></rect>
      <rect x="604" y="102" width="402" height="304" rx="22" fill="#3a1c17" stroke="#e76f51" stroke-width="3"></rect>
      <text x="94" y="136" class="svg-subtitle" style="fill:#cfead7;">STACK</text>
      <text x="624" y="136" class="svg-subtitle" style="fill:#ffd8cc;">HEAP</text>
      <g font-family="JetBrains Mono, monospace" font-size="14">
        <rect x="116" y="176" width="148" height="102" rx="14" fill="#173b2d" stroke="#52b788"></rect>
        <text x="138" y="204" class="svg-label" style="fill:#d9fbe9;">Step 1: s1</text>
        <text x="138" y="228" fill="#d9fbe9">ptr: 0x1000</text>
        <text x="138" y="250" fill="#d9fbe9">len: 5</text>
        <text x="138" y="272" fill="#d9fbe9">cap: 5</text>
        <rect x="298" y="176" width="148" height="102" rx="14" fill="#334155" stroke="#94a3b8" stroke-dasharray="8 6"></rect>
        <text x="320" y="204" class="svg-label" style="fill:#e5e7eb;">Step 2: s1</text>
        <text x="328" y="238" class="svg-small" style="fill:#e5e7eb;">MOVED</text>
        <text x="322" y="260" class="svg-small" style="fill:#e5e7eb;">invalid name</text>
        <rect x="298" y="296" width="148" height="102" rx="14" fill="#1f3d31" stroke="#52b788"></rect>
        <text x="320" y="324" class="svg-label" style="fill:#d9fbe9;">Step 2: s2</text>
        <text x="320" y="348" fill="#d9fbe9">ptr: 0x1000</text>
        <text x="320" y="370" fill="#d9fbe9">len: 5</text>
        <text x="320" y="392" fill="#d9fbe9">cap: 5</text>
        <rect x="652" y="226" width="256" height="74" rx="14" fill="#5a241c" stroke="#ff8e72" stroke-width="3"></rect>
        <text x="684" y="270" class="svg-label" style="fill:#ffd8cc;">h  e  l  l  o</text>
      </g>
      <path d="M264 228 C 424 228, 534 238, 652 246" stroke="#e63946" stroke-width="7" fill="none" marker-end="url(#ownPtrArrow)"></path>
      <path d="M446 346 C 560 338, 616 306, 652 286" stroke="#fb8500" stroke-width="7" fill="none" marker-end="url(#ownMoveArrow2)"></path>
      <text x="410" y="152" class="svg-small" style="fill:#f8fafc;">assignment moves responsibility,</text>
      <text x="416" y="170" class="svg-small" style="fill:#f8fafc;">not heap bytes</text>
      <circle cx="956" cy="362" r="30" fill="#6d6875"></circle>
      <text x="938" y="369" class="svg-label" style="fill:#f8fafc;">DROP</text>
      <defs>
        <marker id="ownPtrArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#e63946"></path>
        </marker>
        <marker id="ownMoveArrow2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#fb8500"></path>
        </marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">The physical stack fields can be copied. The semantic event is still a move, because Rust treats those fields as the unique responsibility token for the heap allocation.</figcaption>
</figure>
<div class="annotated-code" style="--chapter-accent: var(--ownership);">

```rust
let s1 = String::from("hello");
let s2 = s1;
// println!("{s1}");   // ERROR
println!("{s2}");
```

<div class="ann-col">
  <div class="ann-item ann-own">
    <strong>Own created</strong>
    <code>s1</code> owns heap data. Stack stores ptr + len + cap.
  </div>
  <div class="ann-item ann-move">
    <strong>Move occurs</strong>
    s1 → s2. Stack repr copied. <code>s1</code> invalidated.
  </div>
  <div class="ann-item ann-error">
    <strong>E0382</strong>
    Use of moved value. <code>s1</code> no longer has authority.
  </div>
  <div class="ann-item ann-valid">
    <strong>Valid</strong>
    <code>s2</code> is the sole owner. Drops on scope exit.
  </div>
</div>
</div>

<figure class="visual-figure" style="--chapter-accent: var(--ownership);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Ownership Flow</div>
      <h2 class="visual-figure__title">Passing to a Function Moves Ownership</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1080 400" role="img" aria-label="Ownership transfer flow diagram showing main scope moving value s to a function scope where it is dropped, leaving main's variable invalid">
      <rect x="30" y="30" width="1020" height="340" rx="28" fill="#fffdf8" stroke="rgba(230,57,70,0.18)"></rect>
      <!-- main scope box -->
      <rect x="72" y="84" width="260" height="226" rx="20" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect>
      <text x="140" y="118" class="svg-subtitle" style="fill:#023e8a;">main scope</text>
      <rect x="104" y="144" width="196" height="52" rx="14" fill="#fff1f2" stroke="#e63946" stroke-width="3"></rect>
      <text x="128" y="176" class="svg-label" style="fill:#e63946;">s = String::from(…)</text>
      <!-- move arrow -->
      <path d="M332 170 H 460" stroke="#fb8500" stroke-width="8" marker-end="url(#ch10FlowArrow)"></path>
      <rect x="356" y="140" width="82" height="28" rx="14" fill="#fb8500"></rect>
      <text x="370" y="159" class="svg-small" style="fill:#ffffff;">MOVE s</text>
      <!-- function scope box -->
      <rect x="460" y="84" width="280" height="226" rx="20" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect>
      <text x="520" y="118" class="svg-subtitle" style="fill:#023e8a;">fn takes_ownership(s)</text>
      <rect x="492" y="144" width="216" height="52" rx="14" fill="#fff1f2" stroke="#e63946" stroke-width="3"></rect>
      <text x="518" y="176" class="svg-label" style="fill:#e63946;">s is used inside fn</text>
      <!-- drop icon inside function -->
      <circle cx="600" cy="260" r="28" fill="#6d6875"></circle>
      <text x="582" y="267" class="svg-label" style="fill:#f8fafc;">DROP</text>
      <text x="502" y="300" class="svg-small" style="fill:#4b5563;">scope ends → heap freed</text>
      <!-- back in main: invalid -->
      <rect x="104" y="224" width="196" height="52" rx="14" fill="#f5f5f5" stroke="#94a3b8" stroke-dasharray="8 6" stroke-width="3"></rect>
      <text x="154" y="256" class="svg-label" style="fill:#94a3b8;">s — INVALID</text>
      <path d="M162 200 v20" stroke="#d62828" stroke-width="5"></path>
      <path d="M142 234 l40 32 M182 234 l-40 32" stroke="#d62828" stroke-width="6" stroke-linecap="round"></path>
      <!-- summary labels -->
      <text x="778" y="130" class="svg-label" style="fill:#023e8a;">After the call:</text>
      <text x="778" y="158" class="svg-small" style="fill:#4b5563;">• The function owned s</text>
      <text x="778" y="180" class="svg-small" style="fill:#4b5563;">• Drop ran when fn returned</text>
      <text x="778" y="202" class="svg-small" style="fill:#4b5563;">• main's binding is now dead</text>
      <text x="778" y="234" class="svg-small" style="fill:#d62828;">Using s after this call</text>
      <text x="778" y="256" class="svg-small" style="fill:#d62828;">produces E0382.</text>
      <rect x="778" y="278" width="212" height="42" rx="14" fill="#fff5f5" stroke="#d62828" stroke-width="2"></rect>
      <text x="798" y="304" class="svg-small" style="fill:#d62828;">value used after move</text>
      <defs>
        <marker id="ch10FlowArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#fb8500"></path>
        </marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">A function call that takes ownership is a one-way transfer. The caller gives up the value permanently. The only way to get it back is for the function to return it explicitly — there is no implicit "loan."</figcaption>
</figure>
<div class="concept-card-row" style="--chapter-accent: var(--ownership);">
  <article class="concept-card">
    <div class="concept-card__num">1</div>
    <p class="concept-card__text">One value has one current owner. Ownership is responsibility, not mere visibility.</p>
  </article>
  <article class="concept-card">
    <div class="concept-card__num">2</div>
    <p class="concept-card__text">Assignment of non-`Copy` values moves that responsibility unless the API says otherwise.</p>
  </article>
  <article class="concept-card">
    <div class="concept-card__num">3</div>
    <p class="concept-card__text">When the owner leaves scope, `Drop` runs exactly once. That is the invariant the compiler is protecting.</p>
  </article>
</div>

### Why This Matters

Ownership is Rust's defining feature. Before learning *how* to satisfy the borrow checker, you must understand *why* it exists. Systems languages typically make you choose between manual memory management (fast but error-prone, like C) or garbage collection (safe but unpredictable, like Java or Go).

Rust chooses a third path: **Ownership**. By enforcing strict rules at compile time about who is responsible for a piece of data, Rust guarantees memory safety without needing a runtime garbage collector. This is the foundation of Rust's "fearless concurrency" and zero-cost abstractions.

### Mental Model: The Checkout Card

Think of ownership like a library checkout card for a rare, one-of-a-kind book.

1. **One Owner:** Only the person whose name is on the card is responsible for the book.
2. **Move:** If you give the book to a friend, you *must* also hand over the checkout card. You are no longer responsible for it, and the library will not accept it from you.
3. **Drop:** When the person holding the card leaves town (goes out of scope), they *must* return the book to the library.


### In Your Language: Ownership vs Garbage Collection

<div class="lang-compare">
<div class="lang-panel">
<span class="lang-label lang-label--rust">Rust — ownership</span>

```rust
let s1 = String::from("hello");
let s2 = s1;       // s1 MOVED, now invalid
// s1 can't be used here
drop(s2);           // freed deterministically
```

</div>
<div class="lang-panel">
<span class="lang-label lang-label--python">Python — GC</span>

```python
s1 = "hello"
s2 = s1        # both point to same object
print(s1)      # still works — refcount = 2
del s2         # refcount = 1, not freed yet
# GC decides when to free (non-deterministic)
```

</div>
</div>

### Walk Through: What Happens During a Move

<div class="stepper">
<div class="stepper-step">
<strong>Step 1: Allocation</strong>
<code>let s1 = String::from("hello");</code> — The allocator places <code>"hello"</code> on the heap. <code>s1</code>'s stack frame stores pointer, length (5), and capacity (5). <code>s1</code> is the sole owner.
</div>
<div class="stepper-step">
<strong>Step 2: Move</strong>
<code>let s2 = s1;</code> — The 24 bytes of stack metadata (ptr, len, cap) are copied into <code>s2</code>'s stack slot. The compiler marks <code>s1</code> as uninitialized. The heap allocation is NOT duplicated.
</div>
<div class="stepper-step">
<strong>Step 3: Drop</strong>
When <code>s2</code> leaves scope, <code>Drop::drop</code> runs, freeing the heap buffer. Because only <code>s2</code> is live, exactly one <code>free()</code> call happens. No double-free, no leak.
</div>
</div>

## Step 1 - The Problem


> **Learning Objective**
> By the end of this step, you should be able to explain the core problem ownership solves: tracking responsibility for dynamically allocated memory without a garbage collector.

## Step 2 - The Heap and the Stack

To understand ownership, you must understand where data lives.

* **The Stack:** Fast, fixed-size, strictly ordered (Last In, First Out). Local variables go here. When a function ends, its stack frame is instantly popped.
* **The Heap:** Slower, dynamic size, unordered. You request space from the OS, and it gives you a pointer.

If you have a `String` (which can grow), the characters live on the heap. But the pointer to those characters, along with the length and capacity, lives on the stack.

When the stack variable goes out of scope, who cleans up the heap data? That is the problem ownership solves.

### Real-World Pattern
When you contribute to large Rust codebases (like Tokio or Serde), you will see very few calls to raw allocation or deallocation. Instead, you see types like `Box`, `Vec`, and `String` managing memory internally. Because ownership is strict, contributors do not need to guess if a function will free memory they pass to it. If the function takes a value (not a reference), it takes responsibility.

## Step 3 - Practice

### Code Reading Drill
Consider this snippet:
```rust
let my_string = String::from("Rust");
let s2 = my_string;
```
Who is responsible for the string data after line 2 executes?

### Error Interpretation
If you try to use `my_string` after the snippet above, `rustc` will give you error `E0382: use of moved value`. This is the compiler telling you that the authority to read or modify the string has transferred to `s2`.

## Chapter Resources
* **Official Source:** [The Rust Programming Language, Chapter 4: Understanding Ownership](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html)
* **Official Source:** [Rustonomicon: Ownership](https://doc.rust-lang.org/nomicon/ownership.html)
