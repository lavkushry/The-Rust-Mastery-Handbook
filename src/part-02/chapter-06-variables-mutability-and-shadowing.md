# Chapter 6: Variables, Mutability, and Shadowing

<div class="ferris-says" data-variant="insight">
<p>You met <code>let</code> and <code>let mut</code> in Part 0. Here we go one level deeper — shadowing rules, const vs static, type annotations you choose vs ones the compiler infers. Small surface, a lot of hidden depth.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-02/chapter-05-cargo-and-project-structure.md">Ch 5: Cargo</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li><code>let</code> vs <code>let mut</code> — immutable by default</li><li>Shadowing is rebinding, not mutation</li><li>Why Rust defaults to immutability</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">20<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 15 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--borrow-exclusive);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Binding Cards</div><h2 class="visual-figure__title">`let` vs `let mut`</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Side-by-side cards comparing immutable let and mutable let mut bindings">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(244,162,97,0.18)"></rect>
        <rect x="56" y="76" width="186" height="270" rx="18" fill="#f8fafc" stroke="#94a3b8" stroke-width="3"></rect>
        <text x="126" y="114" class="svg-subtitle" style="fill:#475569;">let</text>
        <circle cx="150" cy="160" r="26" fill="#cbd5e1"></circle>
        <rect x="92" y="210" width="112" height="48" rx="12" fill="#e2e8f0"></rect>
        <text x="120" y="239" class="svg-label" style="fill:#475569;">x = 5</text>
        <path d="M92 290 H 206" stroke="#d62828" stroke-width="6" stroke-linecap="round"></path>
        <path d="M112 272 L 186 308" stroke="#d62828" stroke-width="6" stroke-linecap="round"></path>
        <text x="88" y="330" class="svg-small" style="fill:#4b5563;">binding promised stability</text>
        <rect x="298" y="76" width="186" height="270" rx="18" fill="#fff5eb" stroke="#f4a261" stroke-width="3"></rect>
        <text x="346" y="114" class="svg-subtitle" style="fill:#f4a261;">let mut</text>
        <circle cx="392" cy="160" r="26" fill="#f4a261"></circle>
        <rect x="334" y="210" width="112" height="48" rx="12" fill="#fde8d2"></rect>
        <text x="362" y="239" class="svg-label" style="fill:#8a4b08;">x = 5</text>
        <path d="M336 292 H 448" stroke="#52b788" stroke-width="6" stroke-linecap="round" marker-end="url(#mutArrow)"></path>
        <text x="340" y="330" class="svg-small" style="fill:#4b5563;">reassignment authority is explicit</text>
        <defs><marker id="mutArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#52b788"></path></marker></defs>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure" style="--chapter-accent: var(--compiler);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Scope Diagram</div><h2 class="visual-figure__title">Shadowing Creates New Bindings</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Nested scope diagram showing x shadowed to 5, 6, then 12">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#eef2ff" stroke="#023e8a" stroke-width="2"></rect>
        <rect x="56" y="64" width="428" height="292" rx="20" fill="#dbeafe" fill-opacity="0.4" stroke="#457b9d" stroke-width="3"></rect>
        <rect x="118" y="118" width="304" height="184" rx="18" fill="#c7d2fe" fill-opacity="0.4" stroke="#6366f1" stroke-width="3"></rect>
        <rect x="176" y="166" width="188" height="88" rx="16" fill="#e9d5ff" fill-opacity="0.55" stroke="#8338ec" stroke-width="3"></rect>
        <g font-family="JetBrains Mono, monospace" font-size="14">
          <rect x="88" y="90" width="120" height="42" rx="12" fill="#ffffff"></rect>
          <text x="112" y="116" class="svg-small" style="fill:#023e8a;">x = 5</text>
          <rect x="210" y="144" width="120" height="42" rx="12" fill="#ffffff"></rect>
          <text x="234" y="170" class="svg-small" style="fill:#6366f1;">x = 6</text>
          <rect x="210" y="192" width="120" height="42" rx="12" fill="#ffffff"></rect>
          <text x="228" y="218" class="svg-small" style="fill:#8338ec;">x = 12</text>
        </g>
        <path d="M388 210 v76" stroke="#6b7280" stroke-width="4" marker-end="url(#scopeArrow)"></path>
        <text x="342" y="312" class="svg-small" style="fill:#4b5563;">exit inner scope → outer binding becomes visible again</text>
        <defs><marker id="scopeArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#6b7280"></path></marker></defs>
      </svg>
    </div>
  </figure>
</div>
<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--borrow-exclusive);">
  <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Comparison</div><h2 class="visual-figure__title">Shadowing vs Mutation Are Different Mechanisms</h2></div></div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 420" role="img" aria-label="Side-by-side comparison of shadowing pipeline versus mutation pipeline">
      <rect x="24" y="24" width="932" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
      <rect x="64" y="64" width="384" height="292" rx="20" fill="#16253c" stroke="#457b9d" stroke-width="3"></rect>
      <rect x="532" y="64" width="384" height="292" rx="20" fill="#3a1c17" stroke="#f4a261" stroke-width="3"></rect>
      <text x="176" y="102" class="svg-subtitle" style="fill:#dbeafe;">Shadowing pipeline</text>
      <text x="670" y="102" class="svg-subtitle" style="fill:#ffd8cc;">Mutation attempt</text>
      <g font-family="JetBrains Mono, monospace" font-size="14">
        <rect x="104" y="136" width="120" height="38" rx="10" fill="#ffffff"></rect>
        <text x="128" y="160" class="svg-small" style="fill:#023e8a;">port = "8080"</text>
        <rect x="104" y="194" width="120" height="38" rx="10" fill="#ffffff"></rect>
        <text x="132" y="218" class="svg-small" style="fill:#457b9d;">port = 8080</text>
        <rect x="104" y="252" width="148" height="38" rx="10" fill="#ffffff"></rect>
        <text x="126" y="276" class="svg-small" style="fill:#8338ec;">port = ValidPort</text>
        <path d="M240 154 v24 M240 212 v24" stroke="#52b788" stroke-width="5" marker-end="url(#shadowArrow)"></path>
        <text x="282" y="196" class="svg-small" style="fill:#dbeafe;">same concept, refined representation</text>
        <rect x="572" y="136" width="120" height="38" rx="10" fill="#ffffff"></rect>
        <text x="596" y="160" class="svg-small" style="fill:#8a4b08;">mut port = "8080"</text>
        <rect x="572" y="194" width="120" height="38" rx="10" fill="#fee2e2" stroke="#d62828" stroke-width="2"></rect>
        <text x="596" y="218" class="svg-small" style="fill:#d62828;">port = 8080</text>
        <text x="716" y="220" class="svg-small" style="fill:#ffd9dc;">type mismatch if binding type must stay `&str`</text>
        <path d="M606 246 L 664 300 M664 246 L 606 300" stroke="#d62828" stroke-width="8" stroke-linecap="round"></path>
      </g>
      <defs><marker id="shadowArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#52b788"></path></marker></defs>
    </svg>
  </div>
</figure>

## Step 1 - The Problem