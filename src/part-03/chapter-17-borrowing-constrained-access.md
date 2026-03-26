# Chapter 17: Borrowing, Constrained Access
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

## Step 1 - The Problem