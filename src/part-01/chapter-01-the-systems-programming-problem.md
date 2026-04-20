# Chapter 1: The Systems Programming Problem
<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq" style="opacity:0.5;font-size:0.78rem">None — start here</div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>The five bug classes Rust prevents</li>
      <li>Why C/C++ failed at memory safety</li>
      <li>What problem Rust was designed to solve</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">40<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 15 min exercises</div>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapter 10</strong>
    The five bug classes you learn here are exactly what ownership prevents. Ch 10 shows the mechanism; this chapter explains the motivation.
    <a href=\"../part-02/chapter-10-ownership-first-contact.md\">Ch 10: Ownership →</a>
  </div>
</div>

<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--error);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Bug Poster</div>
      <h2 class="visual-figure__title">The Five Catastrophic Bug Classes</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 1180 560" role="img" aria-label="Poster showing five catastrophic systems programming bug classes with minimal code and consequences">
      <rect x="22" y="24" width="1136" height="512" rx="28" fill="#0b1220" stroke="rgba(255,255,255,0.08)"></rect>
      <g font-family="JetBrains Mono, monospace" font-size="13" fill="#d1d5db">
        <rect x="52" y="72" width="196" height="390" rx="20" fill="#181f32" stroke="#e63946" stroke-width="2"></rect>
        <text x="72" y="110" class="svg-subtitle" style="fill:#ff7b86;">USE-AFTER-FREE</text>
        <text x="72" y="142">char *p = malloc(16);</text>
        <text x="72" y="166">free(p);</text>
        <text x="72" y="190">puts(p);</text>
        <circle cx="150" cy="258" r="42" fill="#2b1120" stroke="#e63946" stroke-width="3"></circle>
        <path d="M124 284 l26 -60 26 60 z" fill="#e63946"></path>
        <text x="72" y="330" class="svg-label" style="fill:#ffffff;">Consequence</text>
        <text x="72" y="356">Stale pointer still exists,</text>
        <text x="72" y="378">ownership does not.</text>
        <text x="72" y="418" class="svg-note" style="fill:#ffb3ba;">CVE Pattern</text>
        <text x="72" y="442">Heap corruption,</text>
        <text x="72" y="462">secret disclosure.</text>
        <rect x="270" y="72" width="196" height="390" rx="20" fill="#181f32" stroke="#d94a53" stroke-width="2"></rect>
        <text x="290" y="110" class="svg-subtitle" style="fill:#ff8f97;">DOUBLE-FREE</text>
        <text x="290" y="142">char *p = malloc(64);</text>
        <text x="290" y="166">free(p);</text>
        <text x="290" y="190">free(p);</text>
        <circle cx="368" cy="258" r="42" fill="#2b1120" stroke="#d94a53" stroke-width="3"></circle>
        <path d="M344 238 h48 v40 h-48 z" fill="#d94a53"></path>
        <path d="M344 258 h48" stroke="#2b1120" stroke-width="6"></path>
        <text x="290" y="330" class="svg-label" style="fill:#ffffff;">Consequence</text>
        <text x="290" y="356">Two cleanup claims on</text>
        <text x="290" y="378">the same resource.</text>
        <text x="290" y="418" class="svg-note" style="fill:#ffb3ba;">CVE Pattern</text>
        <text x="290" y="442">Allocator metadata</text>
        <text x="290" y="462">corruption.</text>
        <rect x="488" y="72" width="196" height="390" rx="20" fill="#181f32" stroke="#cc5960" stroke-width="2"></rect>
        <text x="508" y="110" class="svg-subtitle" style="fill:#ff9fa6;">DATA RACE</text>
        <text x="508" y="142">counter++ // thread A</text>
        <text x="508" y="166">counter++ // thread B</text>
        <circle cx="586" cy="258" r="42" fill="#2b1120" stroke="#cc5960" stroke-width="3"></circle>
        <path d="M560 234 l18 18 -18 18" fill="none" stroke="#cc5960" stroke-width="8"></path>
        <path d="M612 234 l-18 18 18 18" fill="none" stroke="#cc5960" stroke-width="8"></path>
        <text x="508" y="330" class="svg-label" style="fill:#ffffff;">Consequence</text>
        <text x="508" y="356">Unsynchronized mutation</text>
        <text x="508" y="378">breaks the memory model.</text>
        <text x="508" y="418" class="svg-note" style="fill:#ffb3ba;">CVE Pattern</text>
        <text x="508" y="442">Kernel races,</text>
        <text x="508" y="462">privilege escalation.</text>
        <rect x="706" y="72" width="196" height="390" rx="20" fill="#181f32" stroke="#c06a6b" stroke-width="2"></rect>
        <text x="726" y="110" class="svg-subtitle" style="fill:#ffafb5;">NULL DEREFERENCE</text>
        <text x="726" y="142">Node *n = find();</text>
        <text x="726" y="166">n-&gt;value;</text>
        <circle cx="804" cy="258" r="42" fill="#2b1120" stroke="#c06a6b" stroke-width="3"></circle>
        <text x="787" y="269" font-family="JetBrains Mono, monospace" font-size="42" fill="#c06a6b">0</text>
        <text x="726" y="330" class="svg-label" style="fill:#ffffff;">Consequence</text>
        <text x="726" y="356">Reference-shaped variable</text>
        <text x="726" y="378">holds invalidity inside it.</text>
        <text x="726" y="418" class="svg-note" style="fill:#ffb3ba;">CVE Pattern</text>
        <text x="726" y="442">Crash or undefined</text>
        <text x="726" y="462">control flow.</text>
        <rect x="924" y="72" width="196" height="390" rx="20" fill="#181f32" stroke="#b47876" stroke-width="2"></rect>
        <text x="944" y="110" class="svg-subtitle" style="fill:#ffc0c4;">ITERATOR INVALIDATION</text>
        <text x="944" y="142">for (it = v.begin();</text>
        <text x="944" y="166">     it != v.end();</text>
        <text x="944" y="190">     ++it) v.push_back();</text>
        <circle cx="1022" cy="258" r="42" fill="#2b1120" stroke="#b47876" stroke-width="3"></circle>
        <path d="M994 258 h56" stroke="#b47876" stroke-width="8" stroke-linecap="round"></path>
        <circle cx="994" cy="258" r="8" fill="#b47876"></circle>
        <text x="944" y="330" class="svg-label" style="fill:#ffffff;">Consequence</text>
        <text x="944" y="356">View assumes storage</text>
        <text x="944" y="378">stability after mutation.</text>
        <text x="944" y="418" class="svg-note" style="fill:#ffb3ba;">CVE Pattern</text>
        <text x="944" y="442">Dangling iterator,</text>
        <text x="944" y="462">silent corruption.</text>
      </g>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">These five bug classes are not rare corner cases. They are recurring expressions of the same deeper problem: the program allows invalid memory or concurrency states to exist as ordinary states.</figcaption>
</figure>
<figure class="visual-figure" style="--chapter-accent: var(--perf);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Landscape Diagram</div>
      <h2 class="visual-figure__title">The False Dichotomy: Fast and Unsafe vs Safe and Slow</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 520" role="img" aria-label="Safety spectrum chart plotting languages by safety and speed with Rust in the fast and safe quadrant">
      <rect x="54" y="42" width="870" height="416" rx="24" fill="#fffaf0" stroke="rgba(2,62,138,0.15)"></rect>
      <line x1="120" y1="400" x2="860" y2="400" stroke="#023e8a" stroke-width="4"></line>
      <line x1="120" y1="400" x2="120" y2="90" stroke="#023e8a" stroke-width="4"></line>
      <text x="820" y="438" class="svg-subtitle" style="fill:#023e8a;">Safer</text>
      <text x="122" y="74" class="svg-subtitle" style="fill:#023e8a;">Faster</text>
      <text x="94" y="438" class="svg-note" style="fill:#6b7280;">Unsafe</text>
      <text x="88" y="418" class="svg-note" style="fill:#6b7280;">Slow</text>
      <line x1="160" y1="360" x2="820" y2="126" stroke="#d62828" stroke-width="5" stroke-dasharray="14 10"></line>
      <text x="506" y="180" class="svg-label" style="fill:#d62828;">False dichotomy line</text>
      <g>
        <circle cx="214" cy="126" r="30" fill="#d62828"></circle>
        <text x="200" y="133" class="svg-label" style="fill:#ffffff;">C</text>
        <circle cx="306" cy="150" r="30" fill="#a25155"></circle>
        <text x="279" y="157" class="svg-label" style="fill:#ffffff;">C++</text>
        <circle cx="650" cy="314" r="30" fill="#74c69d"></circle>
        <text x="633" y="321" class="svg-label" style="fill:#073b1d;">Go</text>
        <circle cx="758" cy="350" r="32" fill="#8ecae6"></circle>
        <text x="720" y="357" class="svg-label" style="fill:#023047;">Python</text>
        <circle cx="680" cy="122" r="42" fill="#ffbe0b" stroke="#fb8500" stroke-width="6"></circle>
        <circle cx="680" cy="122" r="58" fill="none" stroke="rgba(255,190,11,0.38)" stroke-width="14"></circle>
        <text x="640" y="129" class="svg-label" style="fill:#6b3e00;">RUST</text>
      </g>
      <g font-family="IBM Plex Sans, sans-serif" font-size="13" fill="#4b5563">
        <text x="172" y="172">Top-left: fast,</text>
        <text x="172" y="190">little protection.</text>
        <text x="598" y="94">Rust's claim:</text>
        <text x="598" y="112">compile-time safety</text>
        <text x="598" y="130">without a GC tax.</text>
        <text x="706" y="392">Managed runtimes or simpler</text>
        <text x="706" y="410">models reduce bug classes,</text>
        <text x="706" y="428">but change control surfaces.</text>
      </g>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">Rust matters because it challenges the old tradeoff itself. The point is not that other languages are wrong; the point is that a systems language can pursue safety without giving up performance-class control.</figcaption>
</figure>
<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--error);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Incident Diagram</div>
      <h2 class="visual-figure__title">Heartbleed as a Memory Disclosure Map</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 460" role="img" aria-label="Memory map explaining how Heartbleed overread adjacent memory and leaked secrets">
      <rect x="40" y="52" width="900" height="328" rx="26" fill="#08111f" stroke="rgba(255,255,255,0.08)"></rect>
      <text x="72" y="98" class="svg-subtitle" style="fill:#f8fafc;">Server process memory</text>
      <g>
        <rect x="92" y="146" width="126" height="132" rx="14" fill="#16324f" stroke="#457b9d" stroke-width="3"></rect>
        <text x="118" y="188" class="svg-label" style="fill:#dbeafe;">Heartbeat request</text>
        <text x="120" y="214" class="svg-small" style="fill:#dbeafe;">payload = 18 bytes</text>
        <text x="108" y="240" class="svg-small" style="fill:#dbeafe;">claimed = 64 KB</text>
      </g>
      <g>
        <rect x="236" y="146" width="168" height="132" rx="14" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect>
        <text x="274" y="188" class="svg-label" style="fill:#d9fbe9;">Intended echo buffer</text>
        <text x="286" y="214" class="svg-small" style="fill:#d9fbe9;">Safe response zone</text>
      </g>
      <g>
        <rect x="422" y="146" width="206" height="132" rx="14" fill="#40161b" stroke="#d62828" stroke-width="4"></rect>
        <text x="466" y="186" class="svg-label" style="fill:#ffd9dc;">Overread zone</text>
        <text x="456" y="212" class="svg-small" style="fill:#ffd9dc;">Process memory beyond</text>
        <text x="470" y="232" class="svg-small" style="fill:#ffd9dc;">the requested payload</text>
        <text x="454" y="260" class="svg-small" style="fill:#ffd9dc;">cookies, keys, user data</text>
      </g>
      <g>
        <rect x="648" y="146" width="242" height="132" rx="14" fill="#22263d" stroke="#ffbe0b" stroke-width="3"></rect>
        <text x="684" y="188" class="svg-label" style="fill:#fff3c4;">Attacker receives</text>
        <text x="684" y="214" class="svg-small" style="fill:#fff3c4;">requested bytes +</text>
        <text x="684" y="234" class="svg-small" style="fill:#fff3c4;">adjacent secrets in reply</text>
      </g>
      <path d="M208 214 H 236" stroke="#52b788" stroke-width="7" marker-end="url(#hbArrow)"></path>
      <path d="M404 214 H 422" stroke="#d62828" stroke-width="7" marker-end="url(#hbArrow)"></path>
      <path d="M628 214 H 648" stroke="#ffbe0b" stroke-width="7" marker-end="url(#hbArrow)"></path>
      <defs>
        <marker id="hbArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor"></path>
        </marker>
      </defs>
      <text x="92" y="332" class="svg-note" style="fill:#f8fafc;">The failure was not “a bad packet.” The failure was a violated bounds invariant in memory-unsafe code.</text>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">Heartbleed is the right kind of case study because it makes the risk physical. The process did not “throw an exception.” It copied bytes from the wrong region of memory and sent them back across the network.</figcaption>
</figure>

## Step 1 - The Problem