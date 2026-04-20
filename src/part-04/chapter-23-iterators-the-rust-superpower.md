# Chapter 23: Iterators, the Rust Superpower
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href=\"../part-04/chapter-22-collections-vec-string-and-hashmap.md\">Ch 22: Collections</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Lazy evaluation — nothing runs until a consumer pulls</li><li>Zero-cost: iterator chains compile to the same code as hand-written loops</li><li>Key adapters: <code>filter</code>, <code>map</code>, <code>collect</code>, <code>fold</code></li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">35<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div></div>
</div>
<div class="concept-link needed-for"><div class="concept-link-icon">→</div><div class="concept-link-body"><strong>You'll need this for Chapter 25</strong>Every iterator chain relies on the <code>Iterator</code> trait and its <code>next()</code> method. Chapter 25 shows how traits like Iterator are defined, implemented, and composed.<a href=\"../part-04/chapter-25-traits-rusts-core-abstraction.md\">Preview Ch 25 →</a></div></div>

<figure class="visual-figure" style="--chapter-accent: var(--perf);">
  <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Lazy Evaluation</div><h2 class="visual-figure__title">Iterator Pipelines Do Nothing Until a Consumer Pulls</h2></div></div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 420" role="img" aria-label="Pipe-style iterator diagram showing lazy adapters and collect triggering execution">
      <rect x="28" y="28" width="924" height="364" rx="24" fill="#fffdf8" stroke="rgba(255,190,11,0.18)"></rect>
      <rect x="72" y="158" width="110" height="92" rx="18" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect>
      <text x="104" y="196" class="svg-subtitle" style="fill:#023e8a;">Vec</text>
      <rect x="238" y="176" width="126" height="56" rx="18" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect>
      <text x="276" y="209" class="svg-label" style="fill:#8a5d00;">filter</text>
      <rect x="418" y="176" width="126" height="56" rx="18" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect>
      <text x="466" y="209" class="svg-label" style="fill:#8a5d00;">map</text>
      <rect x="598" y="176" width="126" height="56" rx="18" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect>
      <text x="646" y="209" class="svg-label" style="fill:#8a5d00;">take</text>
      <rect x="786" y="148" width="118" height="112" rx="18" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
      <text x="814" y="206" class="svg-subtitle" style="fill:#2d6a4f;">collect</text>
      <path d="M182 204 H 238 M364 204 H 418 M544 204 H 598 M724 204 H 786" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"></path>
      <g fill="#94a3b8">
        <circle cx="290" cy="204" r="10"></circle>
        <circle cx="470" cy="204" r="10"></circle>
        <circle cx="650" cy="204" r="10"></circle>
      </g>
      <text x="208" y="286" class="svg-small" style="fill:#6b7280;">before consumer: pipeline description only</text>
      <path d="M180 336 H 784" stroke="#3a86ff" stroke-width="8" stroke-linecap="round"></path>
      <circle cx="280" cy="336" r="10" fill="#3a86ff"></circle>
      <circle cx="420" cy="336" r="10" fill="#3a86ff"></circle>
      <circle cx="560" cy="336" r="10" fill="#3a86ff"></circle>
      <circle cx="700" cy="336" r="10" fill="#3a86ff"></circle>
      <text x="226" y="366" class="svg-small" style="fill:#3a86ff;">after `collect()`: values are pulled through every adapter</text>
    </svg>
  </div>
</figure>
<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--perf);">
  <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Zero Cost</div><h2 class="visual-figure__title">Iterator Chain vs Hand-Written Loop</h2></div></div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 460" role="img" aria-label="Comparison of Rust iterator chain, manual loop, and identical lower-level output">
      <rect x="24" y="24" width="932" height="412" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
      <rect x="56" y="68" width="256" height="248" rx="18" fill="#1f2937" stroke="#52b788" stroke-width="3"></rect>
      <rect x="362" y="68" width="256" height="248" rx="18" fill="#1f2937" stroke="#8ecae6" stroke-width="3"></rect>
      <rect x="668" y="68" width="250" height="248" rx="18" fill="#111827" stroke="#ffbe0b" stroke-width="3"></rect>
      <text x="98" y="104" class="svg-subtitle" style="fill:#9ae6b4;">Iterator chain</text>
      <text x="398" y="104" class="svg-subtitle" style="fill:#dbeafe;">Manual loop</text>
      <text x="730" y="104" class="svg-subtitle" style="fill:#fff3c4;">Lowered result</text>
      <g font-family="JetBrains Mono, monospace" font-size="13" fill="#d1d5db">
        <text x="82" y="142">values.iter()</text>
        <text x="82" y="166">  .filter(...)</text>
        <text x="82" y="190">  .map(...)</text>
        <text x="82" y="214">  .sum()</text>
        <text x="392" y="142">let mut acc = 0;</text>
        <text x="392" y="166">for x in values {</text>
        <text x="392" y="190">  if x % 2 == 0 {</text>
        <text x="392" y="214">    acc += x * 2;</text>
        <text x="708" y="142">test edi, 1</text>
        <text x="708" y="166">jne .next</text>
        <text x="708" y="190">lea eax, [eax + edi*2]</text>
      </g>
      <rect x="354" y="344" width="280" height="48" rx="24" fill="#ffbe0b"></rect>
      <text x="400" y="374" class="svg-label" style="fill:#6b3e00;">ZERO-COST ABSTRACTION ⚡</text>
    </svg>
  </div>
</figure>

## Readiness Check - Iterator Pipeline Reasoning

| Skill                             | Level 0                                 | Level 1                                    | Level 2                                                | Level 3                                                       |
| --------------------------------- | --------------------------------------- | ------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------- |
| Understand laziness               | I assume each adapter runs immediately  | I know consumers trigger execution         | I can explain when and why work is deferred            | I can predict runtime behavior of complex chains confidently  |
| Track ownership through iteration | I confuse `iter`/`iter_mut`/`into_iter` | I can name borrow vs move differences      | I can select iteration mode intentionally per use case | I can refactor loops and chains without ownership regressions |
| Diagnose type flow in chains      | I patch until compile passes            | I can read one adapter signature at a time | I can locate exact type mismatch stage in a long chain | I can design reusable iterator-based APIs with clean bounds   |

Target Level 2+ before trait-heavy iterator implementation work.

## Compiler Error Decoder - Iterator Chains

| Error code | What it usually means                                  | Typical fix direction                                                               |
| ---------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| E0282      | Type inference is ambiguous (often around `collect`)   | Add target type annotation (`Vec<_>`, `HashMap<_, _>`, etc.) at collection boundary |
| E0599      | Adapter/consumer not available on current type         | Confirm you are on an iterator (call `iter()`/`into_iter()` when needed)            |
| E0382      | Value moved unexpectedly by ownership-taking iteration | Borrow with `iter()` or clone intentionally if ownership must be retained           |

Debug chain failures by splitting the pipeline into named intermediate variables and checking each type.

## Step 1 - The Problem
