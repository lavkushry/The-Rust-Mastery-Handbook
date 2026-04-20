# Chapter 25: Traits, Rust's Core Abstraction
<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href=\"../part-02/chapter-12-structs.md\">Ch 12: Structs</a>
      <a href=\"../part-02/chapter-13-enums-and-pattern-matching.md\">Ch 13: Enums</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>Traits as named capabilities, not interfaces</li>
      <li>Static dispatch via monomorphization</li>
      <li>When to use <code>impl Trait</code> vs <code>dyn Trait</code></li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">35<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapter 42</strong>
    Advanced traits (trait objects, GATs, supertraits) build directly on the capability model you learn here.
    <a href=\"../part-07/chapter-42-advanced-traits-trait-objects-and-gats.md\">Ch 42: Advanced Traits →</a>
  </div>
</div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--trait);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Capability Map</div><h2 class="visual-figure__title">Traits as Named Capabilities</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Central type with radial trait capability nodes">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(33,158,188,0.18)"></rect>
        <circle cx="270" cy="210" r="64" fill="#e63946"></circle>
        <text x="236" y="206" class="svg-subtitle" style="fill:#ffffff;">Vec</text>
        <text x="228" y="228" class="svg-small" style="fill:#ffffff;">&lt;i32&gt;</text>
        <g fill="none" stroke="#219ebc" stroke-width="4">
          <path d="M270 146 V 94"></path>
          <path d="M334 210 H 388"></path>
          <path d="M270 274 V 326"></path>
          <path d="M206 210 H 152"></path>
        </g>
        <g font-family="IBM Plex Sans, sans-serif">
          <rect x="206" y="54" width="128" height="40" rx="12" fill="#eef6fb" stroke="#219ebc"></rect>
          <text x="244" y="79" class="svg-small" style="fill:#0f5c70;">Debug</text>
          <rect x="390" y="190" width="104" height="40" rx="12" fill="#eef6fb" stroke="#219ebc"></rect>
          <text x="424" y="215" class="svg-small" style="fill:#0f5c70;">Clone</text>
          <rect x="204" y="326" width="132" height="40" rx="12" fill="#eef6fb" stroke="#219ebc"></rect>
          <text x="232" y="351" class="svg-small" style="fill:#0f5c70;">IntoIterator</text>
          <rect x="42" y="190" width="104" height="40" rx="12" fill="#eef6fb" stroke="#219ebc"></rect>
          <text x="78" y="215" class="svg-small" style="fill:#0f5c70;">Default</text>
        </g>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--trait);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Monomorphization</div><h2 class="visual-figure__title">One Generic Function, Many Concrete Instantiations</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Generic function splitting into several monomorphized specializations">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="152" y="54" width="236" height="60" rx="16" fill="#1f2937" stroke="#219ebc" stroke-width="3"></rect>
        <text x="190" y="90" class="svg-small" style="fill:#d6f4fb;">fn largest&lt;T: PartialOrd&gt;(...)</text>
        <path d="M270 114 V 172" stroke="#219ebc" stroke-width="6"></path>
        <path d="M270 172 L 118 244 M270 172 L 270 244 M270 172 L 422 244" stroke="#219ebc" stroke-width="6" fill="none"></path>
        <rect x="52" y="244" width="132" height="64" rx="14" fill="#123e2e" stroke="#52b788"></rect>
        <rect x="204" y="244" width="132" height="64" rx="14" fill="#1b314a" stroke="#3a86ff"></rect>
        <rect x="356" y="244" width="132" height="64" rx="14" fill="#3a1c17" stroke="#f4a261"></rect>
        <text x="88" y="282" class="svg-small" style="fill:#d9fbe9;">largest_i32</text>
        <text x="240" y="282" class="svg-small" style="fill:#dbeafe;">largest_f64</text>
        <text x="392" y="282" class="svg-small" style="fill:#ffd8cc;">largest_Point</text>
        <text x="114" y="346" class="svg-small" style="fill:#f8fafc;">static dispatch</text>
        <text x="212" y="368" class="svg-small" style="fill:#fff3c4;">specialize for the types actually used</text>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem