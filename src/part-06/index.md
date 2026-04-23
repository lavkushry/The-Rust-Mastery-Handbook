# PART 6 - Advanced Systems Rust

<div class="ferris-says" data-variant="insight">
<p>Below the friendly surface of safe Rust lies <code>unsafe</code>, <code>Pin</code>, <code>NonNull</code>, manual <code>Drop</code>, FFI. Advanced Rust is not 'a different language' — it is the same language with more tools visible. This part shows you the machinery that library authors use to build the abstractions you take for granted. Read it once before you need it, and it will be there when you do.</p>
</div>

<section class="part-spread" style="--chapter-accent: var(--warning);">
  <div class="part-spread__grid">
    <div>
      <div class="part-spread__eyebrow">Part Opener</div>
      <h1 class="part-spread__title">Advanced Systems Rust</h1>
      <p class="part-spread__hook">The iceberg. Safe Rust is the tip — the part users see. Below the waterline: memory layout, unsafe blocks, FFI boundaries, pin machinery, atomics, custom allocators. This part surfaces the hidden mechanisms so that when you open <code>tokio</code> or <code>pin-project</code> or <code>libc</code>, the code reads instead of mystifies.</p>
      <div class="part-spread__meta">
        <span class="part-spread__pill">Unsafe</span>
        <span class="part-spread__pill">FFI</span>
        <span class="part-spread__pill">Memory Layout</span>
        <span class="part-spread__pill">Pin</span>
      </div>
    </div>
    <div aria-hidden="true">
      <svg class="svg-frame" viewBox="0 0 560 360" role="img" aria-label="An iceberg split by a waterline. Safe Rust is the small tip above water. Below are the much larger layers — unsafe, FFI, pin, layout — labelled and shaded in warm tones.">
        <defs>
          <linearGradient id="p6Glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.25)"></stop>
            <stop offset="100%" stop-color="rgba(255,255,255,0.02)"></stop>
          </linearGradient>
        </defs>
        <rect x="24" y="24" width="512" height="312" rx="30" fill="url(#p6Glow)" stroke="rgba(255,255,255,0.18)"></rect>
        <line x1="60" y1="140" x2="500" y2="140" stroke="rgba(96,165,250,0.6)" stroke-width="2" stroke-dasharray="6 4"></line>
        <text x="80" y="132" style="font-family:var(--font-display);font-size:11px;fill:#93c5fd">waterline (safe Rust)</text>
        <polygon points="240,60 320,60 340,140 220,140" fill="#fef3c7" opacity="0.95" stroke="#fbbf24" stroke-width="2"></polygon>
        <text x="280" y="108" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#92400e;font-weight:bold">safe Rust</text>
        <polygon points="220,140 340,140 380,220 180,220" fill="#fcd34d" opacity="0.95" stroke="#d97706" stroke-width="2"></polygon>
        <text x="280" y="188" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#78350f;font-weight:bold">unsafe</text>
        <polygon points="180,220 380,220 430,300 130,300" fill="#fbbf24" opacity="0.95" stroke="#b45309" stroke-width="2"></polygon>
        <text x="280" y="268" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#78350f;font-weight:bold">FFI · Pin · Layout</text>
        <g stroke="#f97316" stroke-width="2" stroke-dasharray="3 3" fill="none" opacity="0.6">
          <path d="M100 260 C 160 280, 220 260, 260 280"></path>
          <path d="M300 280 C 360 260, 420 280, 480 260"></path>
        </g>
      </svg>
    </div>
  </div>
</section>

This part is where Rust stops feeling like a safer application language and starts feeling like a systems language you can shape with intent.

The goal is not to memorize esoteric features. The goal is to understand how Rust represents data, where the compiler can optimize away abstraction, where it cannot, and what changes when you cross the line from fully verified safe code into code that relies on manually maintained invariants.

If Part 3 taught you how to think like the borrow checker, Part 6 teaches you how to think like a library implementor, FFI boundary owner, and performance engineer.

---

## Chapters in This Part

- [Chapter 36: Memory Layout and Zero-Cost Abstractions](chapter-36-memory-layout-and-zero-cost-abstractions.md)
- [Chapter 37: Unsafe Rust, Power and Responsibility](chapter-37-unsafe-rust-power-and-responsibility.md)
- [Chapter 38: FFI, Talking to C Without Lying](chapter-38-ffi-talking-to-c-without-lying.md)
- [Chapter 39: Lifetimes in Depth](chapter-39-lifetimes-in-depth.md)
- [Chapter 40: PhantomData, Atomics, and Profiling](chapter-40-phantomdata-atomics-and-profiling.md)
- [Chapter 41: Reading Compiler Errors Like a Pro](chapter-41-reading-compiler-errors-like-a-pro.md)

---

## Part 6 Summary

Advanced systems Rust is not one feature. It is one style of reasoning:

- understand representation before assuming cost
- use unsafe only where an invariant can be stated and defended
- treat FFI as a boundary translation problem, not just a linkage trick
- read advanced lifetime signatures as substitution rules
- use `PhantomData`, atomics, and profiling deliberately
- let compiler diagnostics guide design rather than provoke guesswork

When these ideas connect, Rust stops being a language you merely use and becomes a language you can engineer with at the representation boundary itself.
