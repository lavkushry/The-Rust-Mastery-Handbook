# Chapter 11: Borrowing and References, First Contact

<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-02/chapter-10-ownership-first-contact.html">Ch 10: Ownership</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li><code>&amp;T</code> vs <code>&amp;mut T</code> — shared vs exclusive</li>
      <li>Why references cannot outlive their owner</li>
      <li>How NLL shortened borrow lifetimes</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">25<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 15 min exercises</div>
  </div>
</div>
<div class="concept-link builds-on">
  <div class="concept-link-icon">←</div>
  <div class="concept-link-body">
    <strong>Builds on Chapter 10</strong>
    Borrowing exists because of ownership — a reference borrows the owner's data without taking ownership.
    <a href="../part-02/chapter-10-ownership-first-contact.html">Revisit Ch 10 →</a>
  </div>
</div>

<figure class="visual-figure" style="--chapter-accent: var(--borrow-shared);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Borrow Timeline</div>
      <h2 class="visual-figure__title">Many Readers or One Writer</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1080 440" role="img" aria-label="Borrow checker timeline showing valid overlapping shared borrows and invalid overlap with mutable borrow">
      <rect x="30" y="38" width="1020" height="364" rx="28" fill="#fffdf8" stroke="rgba(69,123,157,0.18)"></rect>
      <line x1="116" y1="118" x2="958" y2="118" stroke="#023e8a" stroke-width="4"></line>
      <line x1="116" y1="254" x2="958" y2="254" stroke="#023e8a" stroke-width="4"></line>
      <g font-family="IBM Plex Sans, sans-serif">
        <text x="62" y="122" class="svg-label" style="fill:#023e8a;">Valid</text>
        <text x="62" y="258" class="svg-label" style="fill:#023e8a;">Rejected</text>
        <text x="118" y="92" class="svg-small" style="fill:#4b5563;">value lifetime</text>
        <text x="118" y="228" class="svg-small" style="fill:#4b5563;">value lifetime</text>
      </g>
      <rect x="178" y="90" width="628" height="22" rx="11" fill="#e63946"></rect>
      <rect x="236" y="142" width="216" height="28" rx="14" fill="#457b9d"></rect>
      <rect x="372" y="178" width="216" height="28" rx="14" fill="#457b9d"></rect>
      <rect x="628" y="214" width="118" height="28" rx="14" fill="#f4a261"></rect>
      <text x="254" y="161" class="svg-small" style="fill:#ffffff;">&amp;T borrow r1</text>
      <text x="390" y="197" class="svg-small" style="fill:#ffffff;">&amp;T borrow r2</text>
      <text x="648" y="233" class="svg-small" style="fill:#5e3a07;">&amp;mut borrow w</text>
      <text x="834" y="160" class="svg-small" style="fill:#52b788;">✓ shared borrows overlap safely</text>
      <text x="834" y="233" class="svg-small" style="fill:#52b788;">✓ writer starts after readers end</text>
      <rect x="178" y="226" width="628" height="22" rx="11" fill="#e63946"></rect>
      <rect x="236" y="278" width="260" height="28" rx="14" fill="#457b9d"></rect>
      <rect x="430" y="314" width="224" height="28" rx="14" fill="#f4a261"></rect>
      <rect x="432" y="278" width="64" height="64" rx="10" fill="rgba(214,40,40,0.16)" stroke="#d62828" stroke-width="3"></rect>
      <text x="254" y="297" class="svg-small" style="fill:#ffffff;">&amp;T borrow r1 still live</text>
      <text x="458" y="333" class="svg-small" style="fill:#5e3a07;">&amp;mut borrow w</text>
      <text x="434" y="364" class="svg-small" style="fill:#d62828;">❌ overlap</text>
      <text x="728" y="332" class="svg-small" style="fill:#d62828;">E0502: cannot mutably borrow while shared borrow is live</text>
      <text x="780" y="116" class="svg-small" style="fill:#8338ec;">NLL insight: borrows end at last use, not always block end</text>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">Borrowing is not “pointers with better manners.” It is a time-structured access contract. The timeline is the right mental tool because the question is always whether access regions overlap in a forbidden way.</figcaption>
</figure>
<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--borrow-shared);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Reference Memory Diagram</div>
      <h2 class="visual-figure__title">A Reference Points Into an Existing Ownership Story</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1080 460" role="img" aria-label="Stack and heap diagram showing owner string and a reference to it">
      <rect x="36" y="36" width="1008" height="388" rx="28" fill="#0f172a" stroke="rgba(255,255,255,0.08)"></rect>
      <rect x="78" y="98" width="430" height="258" rx="20" fill="#102a20" stroke="#2d6a4f" stroke-width="3"></rect>
      <rect x="572" y="98" width="430" height="258" rx="20" fill="#3a1c17" stroke="#e76f51" stroke-width="3"></rect>
      <text x="102" y="132" class="svg-subtitle" style="fill:#cfead7;">STACK</text>
      <text x="596" y="132" class="svg-subtitle" style="fill:#ffd8cc;">HEAP</text>
      <g font-family="JetBrains Mono, monospace" font-size="14">
        <rect x="122" y="176" width="170" height="108" rx="14" fill="#173b2d" stroke="#e63946" stroke-width="3"></rect>
        <text x="154" y="204" class="svg-label" style="fill:#ffd9dc;">s1: String</text>
        <text x="148" y="228" fill="#d9fbe9">ptr: 0x1000</text>
        <text x="148" y="250" fill="#d9fbe9">len: 5</text>
        <text x="148" y="272" fill="#d9fbe9">cap: 5</text>
        <rect x="326" y="196" width="124" height="72" rx="14" fill="#1b314a" stroke="#457b9d" stroke-width="3"></rect>
        <text x="358" y="224" class="svg-label" style="fill:#dbeafe;">r1: &amp;s1</text>
        <text x="354" y="248" class="svg-small" style="fill:#dbeafe;">borrow only</text>
        <rect x="642" y="204" width="224" height="62" rx="14" fill="#5a241c" stroke="#ff8e72" stroke-width="3"></rect>
        <text x="708" y="242" class="svg-label" style="fill:#ffd8cc;">h  e  l  l  o</text>
      </g>
      <path d="M292 228 C 454 228, 556 228, 642 228" stroke="#e63946" stroke-width="7" fill="none" marker-end="url(#refOwnArrow)"></path>
      <path d="M450 232 C 484 232, 506 222, 522 214" stroke="#457b9d" stroke-width="7" fill="none" marker-end="url(#refBorrowArrow)"></path>
      <text x="326" y="316" class="svg-small" style="fill:#dbeafe;">r1 points into an existing owner path.</text>
      <text x="638" y="308" class="svg-small" style="fill:#ffd8cc;">Borrowing does not create a second owner.</text>
      <defs>
        <marker id="refOwnArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#e63946"></path>
        </marker>
        <marker id="refBorrowArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#457b9d"></path>
        </marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">A reference is meaningful only inside the ownership graph it borrows from. That is why “references are just pointers” is the wrong model. The pointer shape may exist, but the aliasing and validity contract is what makes it a Rust reference.</figcaption>
</figure>
<figure class="visual-figure" style="--chapter-accent: var(--borrow-shared);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Rules Card</div>
      <h2 class="visual-figure__title">The Two Borrowing Invariants</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1080 380" role="img" aria-label="Two-panel borrowing rules card showing aliasing XOR mutation and no dangling references">
      <rect x="30" y="28" width="1020" height="324" rx="28" fill="#fffdf8" stroke="rgba(69,123,157,0.18)"></rect>
      <!-- Panel 1: Aliasing XOR Mutation -->
      <rect x="64" y="62" width="450" height="256" rx="20" fill="#eef6fb" stroke="#457b9d" stroke-width="3"></rect>
      <text x="138" y="100" class="svg-subtitle" style="fill:#457b9d;">Rule 1 — Aliasing XOR Mutation</text>
      <!-- readers (blue figures) -->
      <circle cx="136" cy="168" r="18" fill="#457b9d"></circle>
      <rect x="126" y="190" width="20" height="40" rx="6" fill="#457b9d"></rect>
      <circle cx="196" cy="168" r="18" fill="#457b9d"></circle>
      <rect x="186" y="190" width="20" height="40" rx="6" fill="#457b9d"></rect>
      <circle cx="256" cy="168" r="18" fill="#457b9d"></circle>
      <rect x="246" y="190" width="20" height="40" rx="6" fill="#457b9d"></rect>
      <text x="136" y="256" class="svg-small" style="fill:#457b9d;">Many &amp;T readers</text>
      <!-- XOR symbol -->
      <text x="312" y="204" font-family="JetBrains Mono, monospace" font-size="32" font-weight="800" fill="#023e8a">XOR</text>
      <!-- writer (orange figure) -->
      <circle cx="424" cy="168" r="22" fill="#f4a261"></circle>
      <rect x="412" y="194" width="24" height="44" rx="6" fill="#f4a261"></rect>
      <text x="388" y="256" class="svg-small" style="fill:#f4a261;">One &amp;mut T writer</text>
      <text x="86" y="300" class="svg-small" style="fill:#4b5563;">Never both at the same time</text>
      <!-- Panel 2: No Dangling References -->
      <rect x="566" y="62" width="450" height="256" rx="20" fill="#fff5f5" stroke="#d62828" stroke-width="3"></rect>
      <text x="640" y="100" class="svg-subtitle" style="fill:#d62828;">Rule 2 — No Dangling References</text>
      <!-- reference arrow to empty -->
      <rect x="616" y="152" width="120" height="52" rx="14" fill="#eef6fb" stroke="#457b9d" stroke-width="3"></rect>
      <text x="646" y="184" class="svg-label" style="fill:#457b9d;">r: &amp;T</text>
      <path d="M736 178 H 850" stroke="#457b9d" stroke-width="6" marker-end="url(#ch11DangArrow)"></path>
      <rect x="850" y="152" width="120" height="52" rx="14" fill="#f5f5f5" stroke="#94a3b8" stroke-dasharray="8 6" stroke-width="3"></rect>
      <text x="870" y="184" class="svg-label" style="fill:#94a3b8;">DROPPED</text>
      <!-- red X through arrow -->
      <path d="M776 156 l44 44 M820 156 l-44 44" stroke="#d62828" stroke-width="8" stroke-linecap="round"></path>
      <text x="620" y="240" class="svg-small" style="fill:#d62828;">A reference must never outlive</text>
      <text x="620" y="260" class="svg-small" style="fill:#d62828;">the value it borrows from</text>
      <text x="620" y="300" class="svg-small" style="fill:#4b5563;">Compiler rejects dangling at compile time</text>
      <defs>
        <marker id="ch11DangArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#457b9d"></path>
        </marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">These two rules are the entire borrowing system. Every borrow checker error traces back to one of them. Learn to identify which rule is being violated and the error message becomes a diagnosis, not a mystery.</figcaption>
</figure>

<div class="annotated-code" style="--chapter-accent: var(--borrow-shared);">

```rust
let mut data = vec![1, 2, 3];
let r1 = &data;          // shared borrow
let r2 = &data;          // another shared borrow
println!("{r1:?} {r2:?}");  // last use of r1, r2
data.push(4);            // mutable access OK — borrows ended
```

<div class="ann-col">
  <div class="ann-item ann-own">
    <strong>Owner</strong>
    <code>data</code> owns the Vec on the heap.
  </div>
  <div class="ann-item ann-borrow">
    <strong>&T shared borrows</strong>
    <code>r1</code> and <code>r2</code> borrow <code>data</code> immutably. Multiple readers allowed.
  </div>
  <div class="ann-item ann-valid">
    <strong>NLL ends borrows here</strong>
    Non-Lexical Lifetimes: borrows end at last use, not block end.
  </div>
  <div class="ann-item ann-mut">
    <strong>&mut T access</strong>
    <code>push</code> requires <code>&mut self</code>. Valid because shared borrows already ended.
  </div>
</div>
</div>

### In Your Language: References vs Pointers

<div class="lang-compare">
<div class="lang-panel">
<span class="lang-label lang-label--rust">Rust — borrowing</span>

```rust
fn len(s: &String) -> usize {
    s.len()  // borrow — no ownership transfer
}
let owned = String::from("hi");
let n = len(&owned);  // owned is still valid
```

</div>
<div class="lang-panel">
<span class="lang-label lang-label--java">Java — everything is a reference</span>

```java
int len(String s) {
    return s.length(); // s is a reference (always)
}
String owned = "hi";
int n = len(owned); // works — GC manages lifetime
// But: anyone could mutate s in Java
```

</div>
</div>

## Compiler Error Decoder - Borrowing Basics

These are the top errors learners hit in early borrowing code.

| Error code | What it usually means                          | Typical fix direction                                                    |
| ---------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| E0502      | Mutable and immutable borrows overlap          | End shared borrows earlier, split scopes, or reorder operations          |
| E0499      | More than one mutable borrow exists at once    | Keep one `&mut` alive at a time; refactor into sequential mutation steps |
| E0596      | Tried to mutate through an immutable reference | Change to `&mut`, or move mutation to the owner                          |

When debugging, first mark where each borrow starts and where its last use occurs. Most fixes come from shrinking one overlapping region.

## Step 1 - The Problem
