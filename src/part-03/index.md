# PART 3 - The Heart of Rust

<section class="part-spread" style="--chapter-accent: var(--ownership);">
  <div class="part-spread__grid">
    <div>
      <div class="part-spread__eyebrow">Part Opener</div>
      <h1 class="part-spread__title">The Heart of Rust</h1>
      <p class="part-spread__hook">Ownership, borrowing, lifetimes, moves, Copy, Clone, Drop, stack versus heap, and the borrow checker. Not separate topics — one resource model seen from different angles. This part is the center of the handbook.</p>
      <div class="part-spread__meta">
        <span class="part-spread__pill">Ownership</span>
        <span class="part-spread__pill">Borrowing</span>
        <span class="part-spread__pill">Lifetimes</span>
        <span class="part-spread__pill">Borrow Checker</span>
      </div>
    </div>
    <div aria-hidden="true">
      <svg class="svg-frame" viewBox="0 0 560 360" role="img" aria-label="The borrow checker as a stern but fair gatekeeper guarding safe code">
        <defs>
          <linearGradient id="p3Glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.22)"></stop>
            <stop offset="100%" stop-color="rgba(255,255,255,0.02)"></stop>
          </linearGradient>
        </defs>
        <rect x="24" y="24" width="512" height="312" rx="30" fill="url(#p3Glow)" stroke="rgba(255,255,255,0.18)"></rect>
        <!-- Gate frame -->
        <rect x="200" y="60" width="160" height="240" rx="18" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" stroke-width="3"></rect>
        <rect x="216" y="76" width="128" height="208" rx="12" fill="rgba(230,57,70,0.12)" stroke="#e63946" stroke-width="2"></rect>
        <!-- Gatekeeper (shield shape) -->
        <path d="M280 120 L 324 140 L 324 190 C 324 216, 306 238, 280 248 C 254 238, 236 216, 236 190 L 236 140 Z" fill="rgba(2,62,138,0.4)" stroke="#023e8a" stroke-width="4"></path>
        <text x="258" y="188" class="svg-label" style="fill:#dbeafe;">🦀</text>
        <!-- Check / X indicators -->
        <circle cx="128" cy="140" r="22" fill="rgba(82,183,136,0.2)" stroke="#52b788" stroke-width="3"></circle>
        <path d="M118 140 l7 8 14 -18" fill="none" stroke="#52b788" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
        <text x="98" y="182" class="svg-small" style="fill:#d9fbe9;">valid borrow</text>
        <circle cx="432" cy="140" r="22" fill="rgba(214,40,40,0.2)" stroke="#d62828" stroke-width="3"></circle>
        <path d="M422 130 l20 20 M442 130 l-20 20" stroke="#d62828" stroke-width="5" stroke-linecap="round"></path>
        <text x="404" y="182" class="svg-small" style="fill:#ffd9dc;">rejected borrow</text>
        <!-- Timeline bars below gate -->
        <rect x="92" y="228" width="148" height="16" rx="8" fill="#457b9d"></rect>
        <rect x="92" y="256" width="108" height="16" rx="8" fill="#f4a261"></rect>
        <rect x="320" y="228" width="148" height="16" rx="8" fill="#8338ec"></rect>
        <text x="92" y="296" class="svg-small" style="fill:rgba(255,255,255,0.7);">lifetime and borrow timelines</text>
      </svg>
    </div>
  </div>
</section>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--ownership);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Concept Map</div>
        <h2 class="visual-figure__title">Part 3 — One Model, Six Surfaces</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 620 380" role="img" aria-label="Concept map connecting chapters 16-21 around a central resource model node">
        <g fill="none" stroke="rgba(230,57,70,0.14)" stroke-width="3">
          <path d="M310 190 L 120 100"></path>
          <path d="M310 190 L 500 100"></path>
          <path d="M310 190 L 120 280"></path>
          <path d="M310 190 L 500 280"></path>
          <path d="M310 190 v-100"></path>
          <path d="M310 190 v100"></path>
        </g>
        <!-- Central node -->
        <circle cx="310" cy="190" r="52" fill="#fff1f2" stroke="#e63946" stroke-width="4"></circle>
        <text x="274" y="184" class="svg-subtitle" style="fill:#e63946;">Resource</text>
        <text x="286" y="204" class="svg-subtitle" style="fill:#e63946;">Model</text>
        <!-- Chapter nodes -->
        <rect x="44" y="68" width="156" height="48" rx="14" fill="#fff1f2" stroke="#e63946" stroke-width="2"></rect>
        <text x="60" y="98" class="svg-small" style="fill:#e63946;">Ch 16: RAII / Drop</text>
        <rect x="264" y="48" width="92" height="40" rx="14" fill="#eef6fb" stroke="#457b9d" stroke-width="2"></rect>
        <text x="276" y="74" class="svg-small" style="fill:#457b9d;">Ch 17</text>
        <rect x="420" y="68" width="156" height="48" rx="14" fill="#f5f1ff" stroke="#8338ec" stroke-width="2"></rect>
        <text x="436" y="98" class="svg-small" style="fill:#8338ec;">Ch 18: Lifetimes</text>
        <rect x="44" y="248" width="156" height="48" rx="14" fill="#eefbf4" stroke="#2d6a4f" stroke-width="2"></rect>
        <text x="56" y="278" class="svg-small" style="fill:#2d6a4f;">Ch 19: Stack / Heap</text>
        <rect x="264" y="296" width="92" height="40" rx="14" fill="#fff5eb" stroke="#fb8500" stroke-width="2"></rect>
        <text x="276" y="322" class="svg-small" style="fill:#fb8500;">Ch 20</text>
        <rect x="420" y="248" width="176" height="48" rx="14" fill="#eef2ff" stroke="#023e8a" stroke-width="2"></rect>
        <text x="432" y="278" class="svg-small" style="fill:#023e8a;">Ch 21: Borrow Checker</text>
      </svg>
    </div>
  </figure>

  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--ownership);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Big Picture</div>
        <h2 class="visual-figure__title">The Gatekeeper: Strict Rules, Sound Code</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 620 380" role="img" aria-label="Conceptual illustration of the borrow checker protecting the boundary between safe and unsafe code">
        <rect x="26" y="32" width="568" height="316" rx="26" fill="#08111f" stroke="rgba(255,255,255,0.08)"></rect>
        <!-- Divider line (boundary) -->
        <line x1="310" y1="52" x2="310" y2="328" stroke="rgba(255,255,255,0.12)" stroke-width="4" stroke-dasharray="10 8"></line>
        <!-- Left: rejected patterns -->
        <text x="72" y="72" class="svg-subtitle" style="fill:#ffd9dc;">Refused</text>
        <rect x="56" y="96" width="204" height="38" rx="10" fill="rgba(214,40,40,0.16)" stroke="#d62828" stroke-width="2"></rect>
        <text x="72" y="120" class="svg-small" style="fill:#ffd9dc;">use after move</text>
        <rect x="56" y="146" width="204" height="38" rx="10" fill="rgba(214,40,40,0.16)" stroke="#d62828" stroke-width="2"></rect>
        <text x="72" y="170" class="svg-small" style="fill:#ffd9dc;">overlapping &amp;mut + &amp;T</text>
        <rect x="56" y="196" width="204" height="38" rx="10" fill="rgba(214,40,40,0.16)" stroke="#d62828" stroke-width="2"></rect>
        <text x="72" y="220" class="svg-small" style="fill:#ffd9dc;">dangling reference</text>
        <rect x="56" y="246" width="204" height="38" rx="10" fill="rgba(214,40,40,0.16)" stroke="#d62828" stroke-width="2"></rect>
        <text x="72" y="270" class="svg-small" style="fill:#ffd9dc;">double free</text>
        <!-- Right: allowed patterns -->
        <text x="358" y="72" class="svg-subtitle" style="fill:#d9fbe9;">Allowed</text>
        <rect x="342" y="96" width="220" height="38" rx="10" fill="rgba(82,183,136,0.16)" stroke="#52b788" stroke-width="2"></rect>
        <text x="358" y="120" class="svg-small" style="fill:#d9fbe9;">single owner, clean drop</text>
        <rect x="342" y="146" width="220" height="38" rx="10" fill="rgba(82,183,136,0.16)" stroke="#52b788" stroke-width="2"></rect>
        <text x="358" y="170" class="svg-small" style="fill:#d9fbe9;">many &amp;T readers, no writer</text>
        <rect x="342" y="196" width="220" height="38" rx="10" fill="rgba(82,183,136,0.16)" stroke="#52b788" stroke-width="2"></rect>
        <text x="358" y="220" class="svg-small" style="fill:#d9fbe9;">one &amp;mut writer, no readers</text>
        <rect x="342" y="246" width="220" height="38" rx="10" fill="rgba(82,183,136,0.16)" stroke="#52b788" stroke-width="2"></rect>
        <text x="358" y="270" class="svg-small" style="fill:#d9fbe9;">reference within owner's life</text>
        <!-- Bottom caption -->
        <text x="136" y="318" class="svg-label" style="fill:#f8fafc;">The borrow checker enforces these at compile time.</text>
      </svg>
    </div>
  </figure>
</div>

This part is the center of the handbook.

If you understand Part 3 deeply, the rest of Rust stops looking like a list of disconnected rules. Traits make sense. Async makes sense. Smart pointers make sense. Even many compiler errors stop feeling arbitrary. If you do not understand Part 3, the rest of the language becomes a series of local tricks and workarounds.

The core claim of this part is simple:

ownership, borrowing, lifetimes, moves, `Copy`, `Clone`, `Drop`, stack versus heap, and the borrow checker are not separate topics. They are one resource model seen from different angles.

---

## Chapters in This Part

- [Chapter 16: Ownership as Resource Management](chapter-16-ownership-as-resource-management.md)
- [Chapter 17: Borrowing, Constrained Access](chapter-17-borrowing-constrained-access.md)
- [Chapter 18: Lifetimes, Relationships Not Durations](chapter-18-lifetimes-relationships-not-durations.md)
- [Chapter 19: Stack vs Heap, Where Data Lives](chapter-19-stack-vs-heap-where-data-lives.md)
- [Chapter 20: Move Semantics, `Copy`, `Clone`, and `Drop`](chapter-20-move-semantics-copy-clone-and-drop.md)
- [Chapter 21: The Borrow Checker, How the Compiler Thinks](chapter-21-the-borrow-checker-how-the-compiler-thinks.md)

---

## Part 3 Summary

Ownership is Rust's resource model.
Borrowing is Rust's access model.
Lifetimes are Rust's borrowed-relationship model.
Moves, `Copy`, `Clone`, and `Drop` are lifecycle events inside that model.
Stack versus heap explains the physical representation underneath it.
The borrow checker is the compiler enforcing all of it over control flow.

These are not six topics. They are one coherent design. Once you see that coherence, Rust stops feeling like a language of special cases and starts feeling like a language with one deep rule taught through many surfaces.
