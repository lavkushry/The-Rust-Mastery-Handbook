# Chapter 16: Ownership as Resource Management

<figure class="visual-figure" style="--chapter-accent: var(--ownership);">
  <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">RAII Lifecycle</div><h2 class="visual-figure__title">Resource Acquisition, Use, and Automatic Cleanup</h2></div></div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 560" role="img" aria-label="Vertical lifecycle of a resource in Rust compared to manual cleanup in C">
      <rect x="28" y="24" width="924" height="512" rx="28" fill="#fffdf8" stroke="rgba(230,57,70,0.18)"></rect>
      <rect x="78" y="74" width="366" height="412" rx="20" fill="#fff5f5" stroke="#d62828" stroke-width="3"></rect>
      <rect x="532" y="74" width="366" height="412" rx="20" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
      <text x="208" y="110" class="svg-subtitle" style="fill:#d62828;">Manual C lifecycle</text>
      <text x="660" y="110" class="svg-subtitle" style="fill:#2d6a4f;">Rust RAII lifecycle</text>
      <g font-family="JetBrains Mono, monospace" font-size="14">
        <rect x="122" y="144" width="278" height="52" rx="12" fill="#ffffff"></rect>
        <text x="156" y="176" class="svg-small" style="fill:#d62828;">conn = open();</text>
        <rect x="122" y="234" width="278" height="52" rx="12" fill="#ffffff"></rect>
        <text x="148" y="266" class="svg-small" style="fill:#d62828;">use(conn);</text>
        <rect x="122" y="324" width="278" height="76" rx="12" fill="#fee2e2" stroke="#d62828" stroke-width="2"></rect>
        <text x="146" y="352" class="svg-small" style="fill:#d62828;">did we close on every path?</text>
        <text x="154" y="374" class="svg-small" style="fill:#d62828;">leak / double-close / early-close risk</text>
        <path d="M260 196 v32 M260 286 v32" stroke="#d62828" stroke-width="6" marker-end="url(#raiicArrow)"></path>
        <rect x="576" y="144" width="278" height="52" rx="12" fill="#ffffff"></rect>
        <text x="620" y="176" class="svg-small" style="fill:#2d6a4f;">let conn = Connection::new();</text>
        <rect x="576" y="234" width="278" height="52" rx="12" fill="#ffffff"></rect>
        <text x="654" y="266" class="svg-small" style="fill:#2d6a4f;">use(&amp;conn);</text>
        <rect x="576" y="324" width="278" height="76" rx="12" fill="#dcfce7" stroke="#52b788" stroke-width="2"></rect>
        <text x="616" y="352" class="svg-small" style="fill:#2d6a4f;">scope ends → Drop::drop()</text>
        <text x="642" y="374" class="svg-small" style="fill:#2d6a4f;">resource closed exactly once</text>
        <path d="M714 196 v32 M714 286 v32" stroke="#52b788" stroke-width="6" marker-end="url(#raiigArrow)"></path>
      </g>
      <defs>
        <marker id="raiicArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#d62828"></path></marker>
        <marker id="raiigArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#52b788"></path></marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">RAII matters because it ties cleanup to ownership instead of to developer memory. The scope boundary becomes a lifecycle boundary.</figcaption>
</figure>
<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--drop);">
  <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Drop Order</div><h2 class="visual-figure__title">Fields Drop in Reverse Declaration Order</h2></div></div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 420" role="img" aria-label="Stacked struct fields showing reverse declaration drop order">
      <rect x="24" y="24" width="932" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
      <rect x="116" y="76" width="308" height="268" rx="20" fill="#1f2937" stroke="#6d6875" stroke-width="3"></rect>
      <text x="188" y="112" class="svg-subtitle" style="fill:#e9e4ef;">struct Server</text>
      <rect x="156" y="140" width="228" height="48" rx="12" fill="#334155"></rect>
      <text x="176" y="170" class="svg-small" style="fill:#f8fafc;">listener: TcpListener</text>
      <rect x="156" y="202" width="228" height="48" rx="12" fill="#334155"></rect>
      <text x="176" y="232" class="svg-small" style="fill:#f8fafc;">cache: HashMap</text>
      <rect x="156" y="264" width="228" height="48" rx="12" fill="#334155"></rect>
      <text x="176" y="294" class="svg-small" style="fill:#f8fafc;">logger: Logger</text>
      <path d="M488 284 H 618" stroke="#ffbe0b" stroke-width="6" marker-end="url(#drop1)"></path>
      <path d="M488 222 H 674" stroke="#fb8500" stroke-width="6" marker-end="url(#drop2)"></path>
      <path d="M488 160 H 730" stroke="#e63946" stroke-width="6" marker-end="url(#drop3)"></path>
      <text x="636" y="290" class="svg-label" style="fill:#ffbe0b;">1. logger</text>
      <text x="692" y="228" class="svg-label" style="fill:#fb8500;">2. cache</text>
      <text x="748" y="166" class="svg-label" style="fill:#ffd9dc;">3. listener</text>
      <defs>
        <marker id="drop1" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#ffbe0b"></path></marker>
        <marker id="drop2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#fb8500"></path></marker>
        <marker id="drop3" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#e63946"></path></marker>
      </defs>
    </svg>
  </div>
</figure>

### If You Remember Only 3 Things

- Variables in Rust are not just names for data; they are deterministic resource managers.
- When an owning variable goes out of scope, Rust automatically calls the `Drop` trait, instantly freeing the memory or closing the file.
- This pattern is called RAII (Resource Acquisition Is Initialization), and it is why Rust rarely leaks resources even without a garbage collector.

### Recommended Reading

- [Rustonomicon: Ownership and Lifetimes](https://doc.rust-lang.org/nomicon/ownership.html)
- [Rust Book: The Drop Trait](https://doc.rust-lang.org/book/ch15-03-drop.html)
- Codebase study: Look at how `std::fs::File` implements `Drop` to automatically close file handles.

## Step 1 - The Problem