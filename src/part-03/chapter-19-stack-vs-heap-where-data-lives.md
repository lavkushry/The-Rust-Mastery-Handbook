# Chapter 19: Stack vs Heap, Where Data Lives

<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-02/chapter-10-ownership-first-contact.md">Ch 10: Ownership</a><a href="../part-03/chapter-16-ownership-as-resource-management.md">Ch 16: RAII</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Stack frames, heap allocation, and static data</li><li>Thin vs fat pointers in Rust</li><li>Why "String lives on the heap" is incomplete</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">35<span class="snapshot-time-unit"> min</span></div></div>
</div>
<div class="concept-link builds-on"><div class="concept-link-icon">←</div><div class="concept-link-body"><strong>Builds on Chapter 16</strong>RAII told you scope exit triggers cleanup. This chapter shows WHERE data physically lives and how ownership metadata stays on the stack while owned data may live on the heap.<a href="../part-03/chapter-16-ownership-as-resource-management.md">Revisit Ch 16 →</a></div></div>

<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--stack);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Reference Diagram</div>
      <h2 class="visual-figure__title">A Running Rust Process: Binary, Stack, and Heap</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 720" role="img" aria-label="Comprehensive memory architecture diagram of a Rust program">
      <rect x="42" y="28" width="896" height="664" rx="28" fill="#0f172a" stroke="rgba(255,255,255,0.08)"></rect>
      <rect x="116" y="82" width="748" height="116" rx="20" fill="#10233f" stroke="#023e8a" stroke-width="3"></rect>
      <text x="146" y="122" class="svg-subtitle" style="fill:#dbeafe;">BINARY / STATIC DATA</text>
      <text x="146" y="152" class="svg-small" style="fill:#dbeafe;">code, vtables, string literals, `static` items</text>
      <rect x="156" y="166" width="118" height="22" rx="11" fill="#8338ec"></rect>
      <text x="172" y="181" class="svg-small" style="fill:#ffffff;">"hello"</text>
      <rect x="320" y="166" width="154" height="22" rx="11" fill="#219ebc"></rect>
      <text x="340" y="181" class="svg-small" style="fill:#ffffff;">trait vtable</text>
      <rect x="116" y="228" width="330" height="392" rx="20" fill="#102a20" stroke="#2d6a4f" stroke-width="3"></rect>
      <text x="146" y="268" class="svg-subtitle" style="fill:#cfead7;">STACK</text>
      <text x="146" y="294" class="svg-small" style="fill:#cfead7;">fast, scoped, fixed-size per frame</text>
      <rect x="152" y="330" width="258" height="88" rx="14" fill="#173b2d" stroke="#52b788"></rect>
      <text x="176" y="358" class="svg-label" style="fill:#d9fbe9;">current frame</text>
      <text x="176" y="384" class="svg-small" style="fill:#d9fbe9;">x: i32 = 42</text>
      <text x="176" y="404" class="svg-small" style="fill:#d9fbe9;">s: String { ptr, len, cap }</text>
      <rect x="152" y="440" width="258" height="88" rx="14" fill="#1d4736" stroke="#74c69d"></rect>
      <text x="176" y="468" class="svg-label" style="fill:#d9fbe9;">caller frame</text>
      <text x="176" y="494" class="svg-small" style="fill:#d9fbe9;">return address</text>
      <text x="176" y="514" class="svg-small" style="fill:#d9fbe9;">saved locals</text>
      <path d="M408 552 v-206" stroke="#cfead7" stroke-width="6" marker-end="url(#stackPointerArrow)"></path>
      <text x="268" y="576" class="svg-small" style="fill:#cfead7;">stack pointer moves downward / upward with calls</text>
      <rect x="534" y="228" width="330" height="392" rx="20" fill="#3a1c17" stroke="#e76f51" stroke-width="3"></rect>
      <text x="564" y="268" class="svg-subtitle" style="fill:#ffd8cc;">HEAP</text>
      <text x="564" y="294" class="svg-small" style="fill:#ffd8cc;">dynamic storage behind owners on the stack</text>
      <rect x="570" y="330" width="258" height="74" rx="14" fill="#5a241c" stroke="#ff8e72"></rect>
      <text x="594" y="374" class="svg-label" style="fill:#ffd8cc;">String bytes: h e l l o</text>
      <rect x="570" y="426" width="258" height="74" rx="14" fill="#632b22" stroke="#ff8e72"></rect>
      <text x="594" y="470" class="svg-label" style="fill:#ffd8cc;">Vec&lt;T&gt; backing buffer</text>
      <rect x="570" y="522" width="258" height="74" rx="14" fill="#6b3027" stroke="#ff8e72"></rect>
      <text x="594" y="566" class="svg-label" style="fill:#ffd8cc;">Box&lt;Node&gt; allocation</text>
      <path d="M410 396 C 488 396, 514 372, 570 366" stroke="#e63946" stroke-width="7" fill="none" marker-end="url(#heapArrow)"></path>
      <text x="424" y="352" class="svg-small" style="fill:#f8fafc;">owner metadata stays on the stack</text>
      <defs>
        <marker id="stackPointerArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#cfead7"></path>
        </marker>
        <marker id="heapArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#e63946"></path>
        </marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">The sentence “a `String` lives on the heap” is incomplete. The bytes do. The owner metadata is an ordinary value in a stack frame unless it is itself stored somewhere else.</figcaption>
</figure>
<figure class="visual-figure" style="--chapter-accent: var(--heap);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Pointer Anatomy</div>
      <h2 class="visual-figure__title">Thin Pointers vs Fat Pointers</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 420" role="img" aria-label="Fat pointer anatomy for str slices, slices, and trait objects">
      <rect x="34" y="38" width="912" height="344" rx="26" fill="#fffdf8" stroke="rgba(231,111,81,0.18)"></rect>
      <g font-family="JetBrains Mono, monospace" font-size="13">
        <rect x="86" y="94" width="250" height="220" rx="18" fill="#fff5eb" stroke="#e76f51" stroke-width="3"></rect>
        <text x="112" y="126" class="svg-subtitle" style="fill:#e76f51;">&amp;str</text>
        <rect x="112" y="154" width="96" height="42" rx="10" fill="#8338ec"></rect>
        <rect x="218" y="154" width="92" height="42" rx="10" fill="#457b9d"></rect>
        <text x="132" y="180" class="svg-small" style="fill:#ffffff;">ptr</text>
        <text x="246" y="180" class="svg-small" style="fill:#ffffff;">len</text>
        <text x="112" y="232" class="svg-small" style="fill:#4b5563;">slice view into UTF-8 bytes</text>
        <rect x="364" y="94" width="250" height="220" rx="18" fill="#eef6fb" stroke="#457b9d" stroke-width="3"></rect>
        <text x="394" y="126" class="svg-subtitle" style="fill:#457b9d;">&amp;[T]</text>
        <rect x="392" y="154" width="96" height="42" rx="10" fill="#8338ec"></rect>
        <rect x="498" y="154" width="92" height="42" rx="10" fill="#457b9d"></rect>
        <text x="412" y="180" class="svg-small" style="fill:#ffffff;">ptr</text>
        <text x="526" y="180" class="svg-small" style="fill:#ffffff;">len</text>
        <text x="392" y="232" class="svg-small" style="fill:#4b5563;">borrowed view of contiguous elements</text>
        <rect x="642" y="94" width="250" height="220" rx="18" fill="#f5f1ff" stroke="#8338ec" stroke-width="3"></rect>
        <text x="668" y="126" class="svg-subtitle" style="fill:#8338ec;">&amp;dyn Trait</text>
        <rect x="670" y="154" width="96" height="42" rx="10" fill="#8338ec"></rect>
        <rect x="776" y="154" width="92" height="42" rx="10" fill="#219ebc"></rect>
        <text x="690" y="180" class="svg-small" style="fill:#ffffff;">data</text>
        <text x="800" y="180" class="svg-small" style="fill:#ffffff;">vtable</text>
        <text x="670" y="232" class="svg-small" style="fill:#4b5563;">dynamic dispatch needs metadata too</text>
      </g>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">Rust needs size information to lay out values. Fat pointers are how the language carries enough metadata to talk about dynamically sized or dynamically dispatched things without hiding the representation from you.</figcaption>
</figure>

## Readiness Check - Memory Model Reasoning

Use this checkpoint before moving on to move/copy/clone semantics.

| Skill                             | Level 0                                      | Level 1                                  | Level 2                                                   | Level 3                                                    |
| --------------------------------- | -------------------------------------------- | ---------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| Explain stack vs heap accurately  | I confuse value and allocation location      | I can describe stack and heap separately | I can explain where owner metadata and owned bytes live   | I can predict layout implications in unfamiliar code       |
| Reason about pointer metadata     | I treat all references as identical pointers | I recognize slices carry extra metadata  | I can explain thin vs fat pointers correctly              | I can use pointer-shape reasoning to debug APIs and errors |
| Connect memory model to ownership | I memorize facts without transfer reasoning  | I know ownership controls cleanup        | I can explain how ownership metadata drives drop behavior | I can design data flow to avoid accidental allocations     |

Target Level 2+ before continuing to Chapter 20.

## Compiler Error Decoder - Memory Layout and Access

| Error code | What it usually means                                    | Typical fix direction                                                           |
| ---------- | -------------------------------------------------------- | ------------------------------------------------------------------------------- |
| E0277      | Type does not satisfy required trait bound               | Ensure required trait implementations or change API constraints                 |
| E0308      | Type mismatch from wrong data representation assumptions | Align concrete type (`String`, `&str`, slices, trait objects) with API contract |
| E0609      | Tried to access field that does not exist on value shape | Re-check whether you have a concrete struct, reference, or trait object         |

When these appear, inspect the value shape first: ownership, pointer metadata, and concrete type.

## Step 1 - The Problem
