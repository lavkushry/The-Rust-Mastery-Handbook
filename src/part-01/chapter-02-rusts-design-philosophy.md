# Chapter 2: Rust's Design Philosophy
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href=\"../part-01/chapter-01-the-systems-programming-problem.md\">Ch 1: Systems Problem</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Zero-cost abstractions as a design principle</li><li>Correctness, performance, and productivity tradeoffs</li><li>Why Rust chose ownership over GC</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">25<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 10 min exercises</div></div>
</div>
<figure class="visual-figure" style="--chapter-accent: var(--borrow-shared);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Mental Model Illustration</div>
      <h2 class="visual-figure__title">Aliasing XOR Mutation</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 500" role="img" aria-label="Illustrated whiteboard scene showing many readers or one writer, but never both simultaneously">
      <rect x="36" y="44" width="908" height="412" rx="26" fill="#fffaf6" stroke="rgba(2,62,138,0.14)"></rect>
      <g>
        <rect x="96" y="106" width="272" height="182" rx="22" fill="#eef6fb" stroke="#457b9d" stroke-width="4"></rect>
        <rect x="172" y="126" width="124" height="96" rx="12" fill="#ffffff" stroke="#457b9d" stroke-width="3"></rect>
        <text x="196" y="178" class="svg-subtitle" style="fill:#457b9d;">Shared View</text>
        <circle cx="142" cy="248" r="28" fill="#457b9d"></circle>
        <circle cx="232" cy="248" r="28" fill="#457b9d"></circle>
        <circle cx="322" cy="248" r="28" fill="#457b9d"></circle>
        <path d="M142 280 v44 M130 298 h24" stroke="#457b9d" stroke-width="6" stroke-linecap="round"></path>
        <path d="M232 280 v44 M220 298 h24" stroke="#457b9d" stroke-width="6" stroke-linecap="round"></path>
        <path d="M322 280 v44 M310 298 h24" stroke="#457b9d" stroke-width="6" stroke-linecap="round"></path>
        <text x="150" y="356" class="svg-subtitle" style="fill:#457b9d;">&amp;T</text>
        <text x="108" y="382" class="svg-small" style="fill:#4b5563;">Many readers observe the same value.</text>
      </g>
      <text x="446" y="248" class="svg-title" style="fill:#8338ec;">XOR</text>
      <text x="402" y="286" class="svg-small" style="fill:#8338ec;">never both simultaneously</text>
      <g>
        <rect x="600" y="106" width="272" height="182" rx="22" fill="#fff4e8" stroke="#f4a261" stroke-width="4"></rect>
        <rect x="676" y="126" width="124" height="96" rx="12" fill="#ffffff" stroke="#f4a261" stroke-width="3"></rect>
        <text x="710" y="178" class="svg-subtitle" style="fill:#f4a261;">Editable</text>
        <circle cx="736" cy="248" r="30" fill="#f4a261"></circle>
        <path d="M736 278 v44 M724 296 h24" stroke="#f4a261" stroke-width="6" stroke-linecap="round"></path>
        <path d="M782 246 l36 -34" stroke="#f4a261" stroke-width="8" stroke-linecap="round"></path>
        <path d="M816 212 l20 18" stroke="#f4a261" stroke-width="8" stroke-linecap="round"></path>
        <text x="724" y="356" class="svg-subtitle" style="fill:#f4a261;">&amp;mut T</text>
        <text x="626" y="382" class="svg-small" style="fill:#4b5563;">One writer gets exclusive authority.</text>
      </g>
      <text x="278" y="434" class="svg-label" style="fill:#023e8a;">Rule: shared reading is calm, exclusive mutation is controlled.</text>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">This is the deepest visual in Chapter 2 because it compresses a large part of Rust’s philosophy into one rule. If you preserve “many readers or one writer,” several later safety guarantees fall out of it.</figcaption>
</figure>
<figure class="visual-figure" style="--chapter-accent: var(--compiler);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Principles Map</div>
      <h2 class="visual-figure__title">Six Design Principles Around a Rust Core</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 560" role="img" aria-label="Honeycomb map of six Rust design principles">
      <rect x="42" y="38" width="896" height="484" rx="28" fill="#fffdf8" stroke="rgba(2,62,138,0.12)"></rect>
      <g font-family="IBM Plex Sans, sans-serif">
        <polygon points="490,124 560,164 560,244 490,284 420,244 420,164" fill="#023e8a"></polygon>
        <text x="455" y="192" class="svg-subtitle" style="fill:#ffffff;">RUST</text>
        <text x="448" y="216" class="svg-small" style="fill:#dbeafe;">compiler-enforced</text>
        <text x="456" y="236" class="svg-small" style="fill:#dbeafe;">systems contracts</text>
        <polygon points="490,30 560,70 560,150 490,190 420,150 420,70" fill="#ffbe0b"></polygon>
        <text x="447" y="96" class="svg-label" style="fill:#6b3e00;">Zero-cost</text>
        <text x="443" y="118" class="svg-small" style="fill:#6b3e00;">Abstraction without</text>
        <text x="455" y="136" class="svg-small" style="fill:#6b3e00;">runtime tax.</text>
        <polygon points="330,124 400,164 400,244 330,284 260,244 260,164" fill="#e63946"></polygon>
        <text x="288" y="192" class="svg-label" style="fill:#ffffff;">Ownership</text>
        <text x="290" y="214" class="svg-small" style="fill:#ffe3e6;">Responsibility lives</text>
        <text x="300" y="232" class="svg-small" style="fill:#ffe3e6;">in the type.</text>
        <polygon points="650,124 720,164 720,244 650,284 580,244 580,164" fill="#219ebc"></polygon>
        <text x="618" y="192" class="svg-label" style="fill:#ffffff;">Illegal States</text>
        <text x="608" y="214" class="svg-small" style="fill:#d6f4fb;">Make them not fit</text>
        <text x="622" y="232" class="svg-small" style="fill:#d6f4fb;">the type.</text>
        <polygon points="330,290 400,330 400,410 330,450 260,410 260,330" fill="#f4a261"></polygon>
        <text x="304" y="358" class="svg-label" style="fill:#5e3a07;">Explicitness</text>
        <text x="284" y="380" class="svg-small" style="fill:#5e3a07;">Costs and transitions</text>
        <text x="298" y="398" class="svg-small" style="fill:#5e3a07;">stay visible.</text>
        <polygon points="650,290 720,330 720,410 650,450 580,410 580,330" fill="#8338ec"></polygon>
        <text x="622" y="356" class="svg-label" style="fill:#ffffff;">Compile Time</text>
        <text x="612" y="378" class="svg-small" style="fill:#f1e8ff;">Pay in reasoning now,</text>
        <text x="616" y="396" class="svg-small" style="fill:#f1e8ff;">not surprise later.</text>
        <polygon points="490,384 560,424 560,504 490,544 420,504 420,424" fill="#457b9d"></polygon>
        <text x="446" y="454" class="svg-label" style="fill:#ffffff;">Aliasing XOR</text>
        <text x="453" y="476" class="svg-small" style="fill:#dcebf4;">Many readers or</text>
        <text x="456" y="494" class="svg-small" style="fill:#dcebf4;">one writer.</text>
      </g>
      <g fill="none" stroke="rgba(2,62,138,0.16)" stroke-width="4">
        <path d="M490 190 V 124"></path>
        <path d="M420 204 H 400"></path>
        <path d="M560 204 H 580"></path>
        <path d="M430 242 L 388 330"></path>
        <path d="M550 242 L 592 330"></path>
        <path d="M490 284 V 424"></path>
      </g>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">These are not independent slogans. They reinforce one another. Ownership makes resource responsibility explicit; explicitness gives the compiler something to check; zero-cost abstractions keep those checks compatible with systems-level performance.</figcaption>
</figure>
<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--perf);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Zero Cost Proof</div>
      <h2 class="visual-figure__title">High-Level Rust vs Runtime-Heavy Alternatives</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1080 500" role="img" aria-label="Three-column proof comparing Python generator style, Rust iterator style, and lower-level output">
      <rect x="30" y="36" width="1020" height="430" rx="28" fill="#0f172a" stroke="rgba(255,255,255,0.08)"></rect>
      <g font-family="JetBrains Mono, monospace" font-size="13">
        <rect x="68" y="86" width="280" height="288" rx="18" fill="#1f2937" stroke="#d62828" stroke-width="3"></rect>
        <text x="92" y="122" class="svg-subtitle" style="fill:#ffb4b4;">Python generator</text>
        <text x="92" y="154" fill="#d1d5db">total = sum(x * 2</text>
        <text x="92" y="178" fill="#d1d5db">    for x in values</text>
        <text x="92" y="202" fill="#d1d5db">    if x % 2 == 0)</text>
        <text x="92" y="264" class="svg-small" style="fill:#fecaca;">runtime iterator objects</text>
        <text x="92" y="286" class="svg-small" style="fill:#fecaca;">boxing / frame state</text>
        <text x="92" y="308" class="svg-small" style="fill:#fecaca;">interpreter dispatch</text>
        <rect x="400" y="86" width="280" height="288" rx="18" fill="#1f2937" stroke="#52b788" stroke-width="3"></rect>
        <text x="426" y="122" class="svg-subtitle" style="fill:#9ae6b4;">Rust iterator chain</text>
        <text x="426" y="154" fill="#d1d5db">let total: i32 = values</text>
        <text x="426" y="178" fill="#d1d5db">    .iter()</text>
        <text x="426" y="202" fill="#d1d5db">    .filter(|x| *x % 2 == 0)</text>
        <text x="426" y="226" fill="#d1d5db">    .map(|x| x * 2)</text>
        <text x="426" y="250" fill="#d1d5db">    .sum();</text>
        <rect x="426" y="286" width="152" height="32" rx="16" fill="#ffbe0b"></rect>
        <text x="452" y="307" class="svg-small" style="fill:#6b3e00;">ZERO OVERHEAD</text>
        <text x="426" y="344" class="svg-small" style="fill:#bbf7d0;">monomorphized</text>
        <text x="426" y="364" class="svg-small" style="fill:#bbf7d0;">fused pipeline</text>
        <rect x="732" y="86" width="280" height="288" rx="18" fill="#111827" stroke="#ffbe0b" stroke-width="3"></rect>
        <text x="764" y="122" class="svg-subtitle" style="fill:#ffe08a;">Lowered machine view</text>
        <text x="764" y="154" fill="#d1d5db">mov eax, 0</text>
        <text x="764" y="178" fill="#d1d5db">.Lloop:</text>
        <text x="764" y="202" fill="#d1d5db">  test edi, 1</text>
        <text x="764" y="226" fill="#d1d5db">  jne .Lnext</text>
        <text x="764" y="250" fill="#d1d5db">  lea eax, [eax + edi*2]</text>
        <text x="764" y="274" fill="#d1d5db">.Lnext:</text>
        <text x="764" y="298" fill="#d1d5db">  ...</text>
        <text x="764" y="344" class="svg-small" style="fill:#fff0ae;">Abstraction disappears;</text>
        <text x="764" y="364" class="svg-small" style="fill:#fff0ae;">the loop remains.</text>
      </g>
      <path d="M348 230 H 400" stroke="#d62828" stroke-width="6" marker-end="url(#zcArrow)"></path>
      <path d="M680 230 H 732" stroke="#52b788" stroke-width="6" marker-end="url(#zcArrow2)"></path>
      <defs>
        <marker id="zcArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#d62828"></path>
        </marker>
        <marker id="zcArrow2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#52b788"></path>
        </marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">“Zero-cost” is not magic language marketing. It is a demand that expressive, generic code should still compile to machine behavior competitive with the hand-written low-level equivalent.</figcaption>
</figure>

## Step 1 - The Problem