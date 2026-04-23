# PART 2 - Core Rust Foundations

<div class="ferris-says" data-variant="insight">
<p>Now we build the Rust programmer's toolkit — the syntax, the types, the cargo workflow, and the first real encounter with ownership. If Part 1 was 'why does this language exist', Part 2 is 'how do I hold the hammer'. Do the exercises. The muscle memory you build here pays dividends for the rest of the book.</p>
</div>


<section class="part-spread" style="--chapter-accent: var(--compiler);">
  <div class="part-spread__grid">
    <div>
      <div class="part-spread__eyebrow">Part Opener</div>
      <h1 class="part-spread__title">Core Rust Foundations</h1>
      <p class="part-spread__hook">Not baby Rust. This part builds every surface you will use daily — variables, types, functions, ownership, borrowing, structs, enums, error handling, and module architecture — so that the deep chapters feel like deepening, not contradiction.</p>
      <div class="part-spread__meta">
        <span class="part-spread__pill">Variables &amp; Types</span>
        <span class="part-spread__pill">Ownership &amp; Borrowing</span>
        <span class="part-spread__pill">Enums &amp; Errors</span>
        <span class="part-spread__pill">Modules</span>
      </div>
    </div>
    <div aria-hidden="true">
      <svg class="svg-frame" viewBox="0 0 560 360" role="img" aria-label="Blueprint schematic of Rust's foundational building blocks">
        <defs>
          <linearGradient id="p2Glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.22)"></stop>
            <stop offset="100%" stop-color="rgba(255,255,255,0.02)"></stop>
          </linearGradient>
        </defs>
        <rect x="24" y="24" width="512" height="312" rx="30" fill="url(#p2Glow)" stroke="rgba(255,255,255,0.18)"></rect>
        <!-- Building blocks -->
        <rect x="56" y="238" width="100" height="64" rx="12" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)"></rect>
        <text x="72" y="276" class="svg-small" style="fill:#fff;">Variables</text>
        <rect x="172" y="238" width="100" height="64" rx="12" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)"></rect>
        <text x="200" y="276" class="svg-small" style="fill:#fff;">Types</text>
        <rect x="288" y="238" width="100" height="64" rx="12" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)"></rect>
        <text x="300" y="276" class="svg-small" style="fill:#fff;">Functions</text>
        <rect x="114" y="160" width="116" height="62" rx="12" fill="rgba(230,57,70,0.28)" stroke="#e63946" stroke-width="2"></rect>
        <text x="130" y="196" class="svg-small" style="fill:#ffd9dc;">Ownership</text>
        <rect x="246" y="160" width="116" height="62" rx="12" fill="rgba(69,123,157,0.28)" stroke="#457b9d" stroke-width="2"></rect>
        <text x="262" y="196" class="svg-small" style="fill:#dbeafe;">Borrowing</text>
        <rect x="180" y="86" width="120" height="58" rx="12" fill="rgba(131,56,236,0.22)" stroke="#8338ec" stroke-width="2"></rect>
        <text x="192" y="120" class="svg-small" style="fill:#e6dbff;">Enums &amp; Errors</text>
        <!-- Connecting lines -->
        <path d="M172 238 v-16" stroke="rgba(255,255,255,0.25)" stroke-width="3"></path>
        <path d="M304 238 v-16" stroke="rgba(255,255,255,0.25)" stroke-width="3"></path>
        <path d="M172 160 v-16" stroke="rgba(255,255,255,0.2)" stroke-width="3"></path>
        <path d="M304 160 v-16" stroke="rgba(255,255,255,0.2)" stroke-width="3"></path>
        <!-- Keystone -->
        <rect x="404" y="106" width="120" height="120" rx="20" fill="rgba(255,190,11,0.16)" stroke="#ffbe0b" stroke-width="3"></rect>
        <text x="430" y="160" class="svg-subtitle" style="fill:#ffd34d;">Module</text>
        <text x="418" y="184" class="svg-small" style="fill:#ffd34d;">Architecture</text>
      </svg>
    </div>
  </div>
</section>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--compiler);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Concept Map</div>
        <h2 class="visual-figure__title">Part 2 Chapter Prerequisites</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 620 440" role="img" aria-label="Concept map connecting the twelve chapters in Part 2 with prerequisite arrows">
        <!-- Connection paths -->
        <g fill="none" stroke="rgba(2,62,138,0.16)" stroke-width="3">
          <path d="M140 80 C 200 80, 220 80, 280 80"></path>
          <path d="M140 80 C 180 120, 200 162, 230 162"></path>
          <path d="M340 80 C 400 80, 420 120, 430 162"></path>
          <path d="M310 174 v36"></path>
          <path d="M510 174 C 510 220, 500 240, 480 258"></path>
          <path d="M310 248 v28"></path>
          <path d="M310 330 C 340 350, 400 350, 420 340"></path>
          <path d="M310 330 C 280 350, 202 352, 172 340"></path>
        </g>
        <!-- Chapter nodes -->
        <g>
          <rect x="56" y="56" width="144" height="48" rx="14" fill="#eef2ff" stroke="#023e8a" stroke-width="2"></rect>
          <text x="72" y="86" class="svg-small" style="fill:#023e8a;">Ch 4-5: Tooling</text>
        </g>
        <g>
          <rect x="230" y="56" width="164" height="48" rx="14" fill="#fff5eb" stroke="#f4a261" stroke-width="2"></rect>
          <text x="246" y="86" class="svg-small" style="fill:#8a4b08;">Ch 6-9: Vars / Types / Ctrl</text>
        </g>
        <g>
          <rect x="230" y="138" width="160" height="48" rx="14" fill="#fff1f2" stroke="#e63946" stroke-width="2"></rect>
          <text x="248" y="168" class="svg-small" style="fill:#e63946;">Ch 10: Ownership</text>
        </g>
        <g>
          <rect x="430" y="138" width="160" height="48" rx="14" fill="#eef6fb" stroke="#457b9d" stroke-width="2"></rect>
          <text x="450" y="168" class="svg-small" style="fill:#457b9d;">Ch 11: Borrowing</text>
        </g>
        <g>
          <rect x="230" y="222" width="160" height="48" rx="14" fill="#f5f1ff" stroke="#8338ec" stroke-width="2"></rect>
          <text x="248" y="252" class="svg-small" style="fill:#8338ec;">Ch 12-13: Data Shape</text>
        </g>
        <g>
          <rect x="388" y="300" width="180" height="48" rx="14" fill="#eefbf4" stroke="#52b788" stroke-width="2"></rect>
          <text x="404" y="330" class="svg-small" style="fill:#2d6a4f;">Ch 14: Option / Result</text>
        </g>
        <g>
          <rect x="78" y="300" width="180" height="48" rx="14" fill="#fff8df" stroke="#ffbe0b" stroke-width="2"></rect>
          <text x="98" y="330" class="svg-small" style="fill:#8a5d00;">Ch 15: Modules / Vis</text>
        </g>
        <!-- Summary node -->
        <circle cx="310" cy="406" r="30" fill="#fff7df" stroke="#ffbe0b" stroke-width="3"></circle>
        <text x="283" y="412" class="svg-small" style="fill:#8a5d00;">Part 3</text>
        <path d="M200 348 C 240 380, 268 396, 280 406" fill="none" stroke="rgba(2,62,138,0.14)" stroke-width="3"></path>
        <path d="M450 348 C 410 380, 360 396, 340 406" fill="none" stroke="rgba(2,62,138,0.14)" stroke-width="3"></path>
      </svg>
    </div>
  </figure>

  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--compiler);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Big Picture</div>
        <h2 class="visual-figure__title">A Blueprint of Rust's Everyday Building Blocks</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 620 380" role="img" aria-label="Blueprint-style illustration of Rust's core building blocks stacked into a coherent foundation">
        <rect x="26" y="32" width="568" height="316" rx="26" fill="#08111f" stroke="rgba(255,255,255,0.08)"></rect>
        <!-- Grid overlay -->
        <g stroke="rgba(255,255,255,0.06)" stroke-width="1">
          <line x1="26" y1="108" x2="594" y2="108"></line>
          <line x1="26" y1="188" x2="594" y2="188"></line>
          <line x1="26" y1="268" x2="594" y2="268"></line>
          <line x1="200" y1="32" x2="200" y2="348"></line>
          <line x1="380" y1="32" x2="380" y2="348"></line>
        </g>
        <!-- Layer labels -->
        <text x="54" y="72" class="svg-label" style="fill:#f8fafc;">Architecture</text>
        <text x="54" y="148" class="svg-label" style="fill:#f8fafc;">Safety Model</text>
        <text x="54" y="228" class="svg-label" style="fill:#f8fafc;">Data Shapes</text>
        <text x="54" y="308" class="svg-label" style="fill:#f8fafc;">Fundamentals</text>
        <!-- Blocks -->
        <rect x="218" y="48" width="156" height="44" rx="10" fill="rgba(255,190,11,0.18)" stroke="#ffbe0b" stroke-width="2"></rect>
        <text x="236" y="76" class="svg-small" style="fill:#ffd34d;">Modules &amp; Visibility</text>
        <rect x="398" y="48" width="164" height="44" rx="10" fill="rgba(33,158,188,0.18)" stroke="#219ebc" stroke-width="2"></rect>
        <text x="420" y="76" class="svg-small" style="fill:#8ecae6;">Error Philosophy</text>
        <rect x="218" y="124" width="156" height="44" rx="10" fill="rgba(230,57,70,0.22)" stroke="#e63946" stroke-width="2"></rect>
        <text x="258" y="152" class="svg-small" style="fill:#ffd9dc;">Ownership</text>
        <rect x="398" y="124" width="164" height="44" rx="10" fill="rgba(69,123,157,0.22)" stroke="#457b9d" stroke-width="2"></rect>
        <text x="440" y="152" class="svg-small" style="fill:#dbeafe;">Borrowing</text>
        <rect x="218" y="204" width="156" height="44" rx="10" fill="rgba(131,56,236,0.18)" stroke="#8338ec" stroke-width="2"></rect>
        <text x="240" y="232" class="svg-small" style="fill:#e6dbff;">Structs &amp; Enums</text>
        <rect x="398" y="204" width="164" height="44" rx="10" fill="rgba(82,183,136,0.18)" stroke="#52b788" stroke-width="2"></rect>
        <text x="418" y="232" class="svg-small" style="fill:#d9fbe9;">Option &amp; Result</text>
        <rect x="218" y="280" width="156" height="44" rx="10" fill="rgba(244,162,97,0.18)" stroke="#f4a261" stroke-width="2"></rect>
        <text x="246" y="308" class="svg-small" style="fill:#f4a261;">Vars &amp; Mutability</text>
        <rect x="398" y="280" width="164" height="44" rx="10" fill="rgba(2,62,138,0.18)" stroke="#023e8a" stroke-width="2"></rect>
        <text x="424" y="308" class="svg-small" style="fill:#dbeafe;">Types &amp; Functions</text>
      </svg>
    </div>
  </figure>
</div>

Part 2 is not "baby Rust."

It is where a professional programmer learns Rust's surface area correctly the first time, before bad habits harden. The point is not to memorize syntax tables. The point is to understand what the everyday tools of the language are preparing you for:

- explicit ownership
- visible mutability
- expression-oriented control flow
- type-driven absence and failure
- module boundaries that are architectural, not cosmetic

Everything here is foundational. If you read it carelessly, later chapters feel harder than they are. If you read it with the right mental model, later chapters feel like deepening, not contradiction.

---

## Chapters in This Part

- [Chapter 4: Environment and Toolchain](chapter-04-environment-and-toolchain.md)
- [Chapter 5: Cargo and Project Structure](chapter-05-cargo-and-project-structure.md)
- [Chapter 6: Variables, Mutability, and Shadowing](chapter-06-variables-mutability-and-shadowing.md)
- [Chapter 7: Types, Scalars, Compounds, and the Unit Type](chapter-07-types-scalars-compounds-and-the-unit-type.md)
- [Chapter 8: Functions and Expressions](chapter-08-functions-and-expressions.md)
- [Chapter 9: Control Flow](chapter-09-control-flow.md)
- [Chapter 10: Ownership, First Contact](chapter-10-ownership-first-contact.md)
- [Chapter 11: Borrowing and References, First Contact](chapter-11-borrowing-and-references-first-contact.md)
- [Chapter 11A: Slices, Borrowed Views into Contiguous Data](chapter-11a-slices-borrowed-views-into-contiguous-data.md)
- [Chapter 12: Structs](chapter-12-structs.md)
- [Chapter 13: Enums and Pattern Matching](chapter-13-enums-and-pattern-matching.md)
- [Chapter 14: `Option`, `Result`, and Rust's Error Philosophy](chapter-14-option-result-and-rusts-error-philosophy.md)
- [Chapter 15: Modules, Crates, and Visibility](chapter-15-modules-crates-and-visibility.md)

---

## Part 2 Summary

Part 2 is where Rust's everyday surface becomes coherent:

- tooling makes workflow disciplined
- Cargo makes build and dependency structure explicit
- mutability is visible, not ambient
- types carry real meaning
- functions and control flow are expression-oriented
- ownership and borrowing begin as responsibility and access
- slices generalize borrowed views
- structs and enums shape data clearly
- `Option` and `Result` make absence and failure explicit
- modules and visibility make boundaries intentional

This is the foundation the rest of the handbook keeps building on. Not because these are "basic features," but because they are the everyday faces of Rust's deeper design.
