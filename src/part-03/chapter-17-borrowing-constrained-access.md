# Chapter 17: Borrowing, Constrained Access
<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-02/chapter-10-ownership-first-contact.html">Ch 10: Ownership</a>
      <a href="../part-02/chapter-11-borrowing-and-references-first-contact.html">Ch 11: Borrowing Intro</a>
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
    <a href="../part-02/chapter-10-ownership-first-contact.html">Revisit Ch 10 →</a>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapters 21 and 32</strong>
    The borrow checker (Ch 21) enforces these rules at MIR level. Send/Sync (Ch 32) extend aliasing-XOR-mutation to thread boundaries.
    <a href="../part-03/chapter-21-the-borrow-checker-how-the-compiler-thinks.html">Ch 21: Borrow Checker →</a>
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

## Step 1 - The Problem
