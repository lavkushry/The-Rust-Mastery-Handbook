# Chapter 13: Enums and Pattern Matching
<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-02/chapter-07-types-scalars-compounds-and-the-unit-type.md">Ch 7: Types</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>Sum types vs product types in memory</li>
      <li>Pattern matching with exhaustiveness</li>
      <li>Why <code>match</code> must cover every variant</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">25<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 15 min exercises</div>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapter 14</strong>
    <code>Option</code> and <code>Result</code> are enums. Ch 14's entire error-handling model is built on the pattern matching you learn here.
    <a href="../part-02/chapter-14-option-result-and-rusts-error-philosophy.md">Ch 14: Option &amp; Result →</a>
  </div>
</div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--trait);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Type Shape</div>
        <h2 class="visual-figure__title">Product Types vs Sum Types</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Comparison between product types and sum types">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(33,158,188,0.18)"></rect>
        <rect x="56" y="78" width="180" height="254" rx="18" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect>
        <text x="98" y="112" class="svg-subtitle" style="fill:#219ebc;">Struct</text>
        <circle cx="146" cy="180" r="56" fill="#219ebc" fill-opacity="0.16"></circle>
        <circle cx="118" cy="180" r="40" fill="#219ebc" fill-opacity="0.2"></circle>
        <circle cx="174" cy="180" r="40" fill="#219ebc" fill-opacity="0.2"></circle>
        <text x="104" y="268" class="svg-small" style="fill:#4b5563;">width AND height AND color</text>
        <rect x="300" y="78" width="180" height="254" rx="18" fill="#f5f1ff" stroke="#8338ec" stroke-width="3"></rect>
        <text x="350" y="112" class="svg-subtitle" style="fill:#8338ec;">Enum</text>
        <path d="M390 180 L 336 250 A 78 78 0 0 1 390 102 z" fill="#8338ec"></path>
        <path d="M390 180 L 444 102 A 78 78 0 0 1 458 206 z" fill="#c7a9ff"></path>
        <path d="M390 180 L 458 206 A 78 78 0 0 1 336 250 z" fill="#e6dbff"></path>
        <text x="342" y="268" class="svg-small" style="fill:#4b5563;">Circle OR Rectangle OR Point</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--lifetime);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Exhaustiveness</div>
        <h2 class="visual-figure__title">Why `match` Feels Safer Than Ad Hoc Branching</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Pie chart style exhaustiveness illustration">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <path d="M200 200 L200 100 A100 100 0 0 1 286 148 z" fill="#219ebc"></path>
        <path d="M200 200 L286 148 A100 100 0 0 1 284 266 z" fill="#52b788"></path>
        <path d="M200 200 L284 266 A100 100 0 0 1 122 264 z" fill="#8338ec"></path>
        <path d="M200 200 L122 264 A100 100 0 0 1 200 100 z" fill="#f4a261"></path>
        <text x="330" y="132" class="svg-small" style="fill:#f8fafc;">arm 1 → variant A</text>
        <text x="330" y="164" class="svg-small" style="fill:#f8fafc;">arm 2 → variant B</text>
        <text x="330" y="196" class="svg-small" style="fill:#f8fafc;">arm 3 → variant C</text>
        <text x="330" y="228" class="svg-small" style="fill:#f8fafc;">arm 4 → variant D</text>
        <circle cx="390" cy="294" r="28" fill="#d62828"></circle>
        <text x="430" y="300" class="svg-small" style="fill:#ffd9dc;">add a new variant → compiler finds every missing arm</text>
      </svg>
    </div>
  </figure>
</div>
<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--lifetime);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Memory Layout</div>
      <h2 class="visual-figure__title">What an Enum Looks Like in Memory</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1080 420" role="img" aria-label="Enum memory layout showing discriminant byte and variant data for Shape Circle and Shape Point">
      <rect x="30" y="28" width="1020" height="364" rx="28" fill="#0f172a" stroke="rgba(255,255,255,0.08)"></rect>
      <text x="72" y="72" class="svg-subtitle" style="fill:#f8fafc;">Enum layout: discriminant + largest-variant data region</text>
      <!-- Example 1: Shape::Circle(5.0) -->
      <text x="72" y="118" class="svg-label" style="fill:#c7a9ff;">Shape::Circle(5.0)</text>
      <rect x="72" y="136" width="80" height="68" rx="12" fill="#2d1a4e" stroke="#8338ec" stroke-width="3"></rect>
      <text x="82" y="164" class="svg-small" style="fill:#e6dbff;">tag</text>
      <text x="82" y="184" class="svg-small" style="fill:#e6dbff;">0u8</text>
      <rect x="160" y="136" width="240" height="68" rx="12" fill="#1b314a" stroke="#457b9d" stroke-width="3"></rect>
      <text x="180" y="164" class="svg-small" style="fill:#dbeafe;">radius: f64</text>
      <text x="180" y="184" class="svg-small" style="fill:#dbeafe;">5.0 (8 bytes)</text>
      <rect x="408" y="136" width="120" height="68" rx="12" fill="#1f2937" stroke="#475569" stroke-dasharray="8 6" stroke-width="2"></rect>
      <text x="420" y="164" class="svg-small" style="fill:#94a3b8;">padding</text>
      <text x="420" y="184" class="svg-small" style="fill:#94a3b8;">unused</text>
      <!-- Total size bracket -->
      <path d="M72 214 H 528" stroke="#8338ec" stroke-width="3"></path>
      <text x="248" y="240" class="svg-small" style="fill:#c7a9ff;">total: 1 + max(variant data) + padding = 16 bytes</text>
      <!-- Example 2: Shape::Point -->
      <text x="72" y="286" class="svg-label" style="fill:#c7a9ff;">Shape::Point</text>
      <rect x="72" y="304" width="80" height="68" rx="12" fill="#2d1a4e" stroke="#8338ec" stroke-width="3"></rect>
      <text x="82" y="332" class="svg-small" style="fill:#e6dbff;">tag</text>
      <text x="82" y="352" class="svg-small" style="fill:#e6dbff;">3u8</text>
      <rect x="160" y="304" width="368" height="68" rx="12" fill="#1f2937" stroke="#475569" stroke-dasharray="8 6" stroke-width="2"></rect>
      <text x="180" y="332" class="svg-small" style="fill:#94a3b8;">no variant data — space still reserved</text>
      <text x="180" y="352" class="svg-small" style="fill:#94a3b8;">same allocation size as Circle</text>
      <!-- Right-side annotation -->
      <rect x="580" y="120" width="420" height="192" rx="20" fill="#16253c" stroke="rgba(255,255,255,0.08)"></rect>
      <text x="608" y="156" class="svg-label" style="fill:#f8fafc;">Key insight</text>
      <text x="608" y="184" class="svg-small" style="fill:#dbeafe;">Every variant of the same enum</text>
      <text x="608" y="206" class="svg-small" style="fill:#dbeafe;">occupies the same number of bytes.</text>
      <text x="608" y="236" class="svg-small" style="fill:#c7a9ff;">The discriminant (tag) tells the</text>
      <text x="608" y="258" class="svg-small" style="fill:#c7a9ff;">runtime which variant is active.</text>
      <text x="608" y="296" class="svg-small" style="fill:#94a3b8;">Layout similar to a tagged union in C.</text>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">The compiler stores an enum as a discriminant tag followed by data sized to the largest variant. Small variants waste some space, but the fixed layout makes pattern matching a constant-time tag check, not a search.</figcaption>
</figure>

## Step 1 - The Problem