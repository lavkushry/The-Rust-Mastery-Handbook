# Chapter 14: `Option`, `Result`, and Rust's Error Philosophy
<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href=\"../part-02/chapter-13-enums-and-pattern-matching.md\">Ch 13: Enums</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>Why Rust has no <code>null</code></li>
      <li>The <code>?</code> operator as early-return sugar</li>
      <li>When to <code>unwrap</code> vs propagate errors</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">30<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div>
  </div>
</div>
<div class="concept-link builds-on">
  <div class="concept-link-icon">←</div>
  <div class="concept-link-body">
    <strong>Builds on Chapter 13</strong>
    <code>Option&lt;T&gt;</code> and <code>Result&lt;T, E&gt;</code> are enums. Pattern matching is how you extract the success or failure value — there is no null to check.
    <a href=\"../part-02/chapter-13-enums-and-pattern-matching.md\">Revisit Ch 13 →</a>
  </div>
</div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--valid);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Null vs Type</div>
        <h2 class="visual-figure__title">Hidden Nullability vs Explicit Absence</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Comparison between hidden null and Option">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(82,183,136,0.18)"></rect>
        <rect x="56" y="74" width="178" height="272" rx="18" fill="#fff5f5" stroke="#d62828" stroke-width="3"></rect>
        <text x="118" y="108" class="svg-subtitle" style="fill:#d62828;">Null</text>
        <circle cx="146" cy="188" r="44" fill="#d62828" fill-opacity="0.16" stroke="#d62828" stroke-width="3"></circle>
        <text x="122" y="196" class="svg-label" style="fill:#d62828;">NULL</text>
        <text x="88" y="282" class="svg-small" style="fill:#4b5563;">ordinary reference-shaped</text>
        <text x="86" y="300" class="svg-small" style="fill:#4b5563;">variable may secretly be invalid</text>
        <rect x="306" y="74" width="178" height="272" rx="18" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
        <text x="360" y="108" class="svg-subtitle" style="fill:#2d6a4f;">Option</text>
        <rect x="340" y="154" width="110" height="40" rx="12" fill="#52b788"></rect>
        <rect x="340" y="212" width="110" height="40" rx="12" fill="#94d3b2"></rect>
        <text x="374" y="179" class="svg-small" style="fill:#ffffff;">Some</text>
        <text x="378" y="237" class="svg-small" style="fill:#073b1d;">None</text>
        <text x="334" y="282" class="svg-small" style="fill:#4b5563;">caller must handle the two</text>
        <text x="342" y="300" class="svg-small" style="fill:#4b5563;">states explicitly</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--error);">
    <div class="visual-figure__header">
      <div>
        <div class="visual-figure__eyebrow">Error Flow</div>
        <h2 class="visual-figure__title">What `?` Expands Into</h2>
      </div>
    </div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Flow diagram of question mark operator desugaring">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="178" y="56" width="184" height="54" rx="14" fill="#1f2937" stroke="#3a86ff" stroke-width="3"></rect>
        <text x="202" y="88" class="svg-small" style="fill:#dbeafe;">let v = parse()?;</text>
        <path d="M270 110 v54" stroke="#f8fafc" stroke-width="5"></path>
        <path d="M270 164 L170 228" stroke="#52b788" stroke-width="5"></path>
        <path d="M270 164 L370 228" stroke="#d62828" stroke-width="5"></path>
        <rect x="84" y="228" width="170" height="76" rx="16" fill="#123e2e" stroke="#52b788"></rect>
        <text x="148" y="260" class="svg-label" style="fill:#d9fbe9;">Ok(v)</text>
        <text x="118" y="286" class="svg-small" style="fill:#d9fbe9;">unwrap and continue</text>
        <rect x="286" y="228" width="170" height="102" rx="16" fill="#40161b" stroke="#d62828"></rect>
        <text x="346" y="260" class="svg-label" style="fill:#ffd9dc;">Err(e)</text>
        <text x="316" y="286" class="svg-small" style="fill:#ffd9dc;">From::from(e)</text>
        <text x="308" y="306" class="svg-small" style="fill:#ffd9dc;">return Err(converted)</text>
        <text x="146" y="354" class="svg-small" style="fill:#52b788;">happy path stays linear</text>
        <text x="300" y="354" class="svg-small" style="fill:#d62828;">error path exits early</text>
      </svg>
    </div>
  </figure>
</div>
<figure class="visual-figure" style="--chapter-accent: var(--valid);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Decision Flow</div>
      <h2 class="visual-figure__title">Choosing How to Handle a Result or Option</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1080 540" role="img" aria-label="Decision tree flowchart for handling Result and Option values in Rust">
      <rect x="30" y="28" width="1020" height="484" rx="28" fill="#fffdf8" stroke="rgba(82,183,136,0.18)"></rect>
      <!-- Start node -->
      <rect x="400" y="56" width="280" height="50" rx="25" fill="#023e8a"></rect>
      <text x="454" y="86" class="svg-label" style="fill:#ffffff;">Got a Result / Option?</text>
      <path d="M540 106 v30" stroke="#023e8a" stroke-width="4"></path>
      <!-- Decision 1: Can you handle it here? -->
      <polygon points="540,136 680,186 540,236 400,186" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></polygon>
      <text x="468" y="190" class="svg-small" style="fill:#023e8a;">Can you handle it here?</text>
      <!-- Yes → match / if let -->
      <path d="M680 186 H 780" stroke="#52b788" stroke-width="4" marker-end="url(#ch14YesArrow)"></path>
      <text x="704" y="176" class="svg-small" style="fill:#52b788;">Yes</text>
      <rect x="780" y="166" width="180" height="40" rx="14" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
      <text x="810" y="191" class="svg-label" style="fill:#2d6a4f;">match / if let</text>
      <!-- No → Decision 2 -->
      <path d="M540 236 v30" stroke="#d62828" stroke-width="4"></path>
      <text x="548" y="256" class="svg-small" style="fill:#d62828;">No</text>
      <!-- Decision 2: Should it propagate? -->
      <polygon points="540,266 680,316 540,366 400,316" fill="#f3f0ff" stroke="#8338ec" stroke-width="3"></polygon>
      <text x="470" y="320" class="svg-small" style="fill:#8338ec;">Should it propagate?</text>
      <!-- Yes → ? operator -->
      <path d="M680 316 H 780" stroke="#52b788" stroke-width="4" marker-end="url(#ch14YesArrow)"></path>
      <text x="704" y="306" class="svg-small" style="fill:#52b788;">Yes</text>
      <rect x="780" y="296" width="180" height="40" rx="14" fill="#f3f0ff" stroke="#8338ec" stroke-width="3"></rect>
      <text x="830" y="321" class="svg-label" style="fill:#8338ec;">? operator</text>
      <!-- No → Decision 3 -->
      <path d="M540 366 v28" stroke="#d62828" stroke-width="4"></path>
      <text x="548" y="384" class="svg-small" style="fill:#d62828;">No</text>
      <!-- Decision 3: Need a default? -->
      <polygon points="540,394 660,432 540,470 420,432" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></polygon>
      <text x="476" y="436" class="svg-small" style="fill:#8a5d00;">Need a default?</text>
      <!-- Yes → unwrap_or -->
      <path d="M660 432 H 780" stroke="#52b788" stroke-width="4" marker-end="url(#ch14YesArrow)"></path>
      <text x="688" y="422" class="svg-small" style="fill:#52b788;">Yes</text>
      <rect x="780" y="412" width="220" height="40" rx="14" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect>
      <text x="798" y="437" class="svg-label" style="fill:#8a5d00;">unwrap_or(_else)</text>
      <!-- No → unwrap (prototype only) -->
      <path d="M420 432 H 300" stroke="#d62828" stroke-width="4" marker-end="url(#ch14NoArrow)"></path>
      <text x="380" y="422" class="svg-small" style="fill:#d62828;">No</text>
      <rect x="84" y="412" width="216" height="56" rx="14" fill="#fff5f5" stroke="#d62828" stroke-width="3"></rect>
      <text x="108" y="436" class="svg-label" style="fill:#d62828;">.unwrap()</text>
      <text x="108" y="456" class="svg-small" style="fill:#d62828;">prototype / provably safe</text>
      <defs>
        <marker id="ch14YesArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#52b788"></path>
        </marker>
        <marker id="ch14NoArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#d62828"></path>
        </marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">Reach for <code>?</code> first in production code — it keeps the happy path linear and makes errors the caller's problem. Use <code>match</code> when you need local recovery. Use <code>.unwrap()</code> only when you can prove the value is always present, or in tests.</figcaption>
</figure>

## Step 1 - The Problem