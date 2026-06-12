# Interactive Platform Roadmap

This document maps the "Ultimate Rust Learning Platform" vision onto this repository in
shippable phases. The guiding constraint: the handbook is an mdBook site deployed to
GitHub Pages with no build step for its interactivity layer. Every interactive feature
must be a progressive enhancement — the book stays fully readable (and printable as a
PDF) with JavaScript disabled.

## Architecture Decision: Scenario Engine, Not a Framework Rewrite

The vision names React Three Fiber, GSAP, WebGPU, and similar stacks. Those are tools,
not goals. The goal is that learners *see* ownership move, borrows conflict, and drops
fire. We get there fastest with a **declarative scenario engine** that lives inside the
existing mdBook theme:

- Authors describe a simulation as JSON (code lines + per-step memory snapshots) directly
  in a chapter's Markdown.
- A single vanilla-JS engine (`theme/rust-viz.js` + `theme/rust-viz.css`) renders it as a
  steppable, animated code/stack/heap view with pointer arrows, compiler verdicts, play
  mode, keyboard navigation, and screen-reader announcements.
- No bundler, no framework, no hydration. One `<div class="rust-viz">` per simulation.

This keeps authoring friction near zero (any contributor who can write Markdown can add a
simulation), keeps CI simple, and leaves the door open to heavier renderers later: the
scenario JSON is renderer-agnostic, so a future WebGL/Canvas front-end can consume the
same data.

## Phase 1 — Memory Simulation Engine (shipped)

| Vision feature | Status | Where |
| --- | --- | --- |
| Ownership Visualizer (creation, allocation, move, drop, scope destruction) | ✅ Shipped | Ch 16 (RAII/drop), Ch 20 (Copy vs Move), Part 0 Ch 4, Ch 10 |
| Borrow Checker Simulator (shared/mut borrows, conflicts, NLL) | ✅ Shipped | Ch 17 (E0502), Ch 21 (E0499 + liveness), Ch 11, Part 0 Ch 5 |
| Lifetime Explorer (regions, E0597, HRTB) | ✅ Shipped | Ch 18 (dangling reference), Ch 39 (for<'a> bounds) |
| Stack & Heap Engine (frames, allocations, owner triples, pointers) | ✅ Shipped | Ch 19, Ch 7/8/9 (frames, layout), Ch 36 (niche optimization) |
| Std Library Explorer (Vec growth, iterators, Rc/RefCell, slices) | ✅ Shipped | Ch 22 (reallocation), Ch 23 (cursor), Ch 30 (refcount), Ch 11a |
| Trait System Visualizer (vtables, dynamic vs static dispatch, monomorphization) | ✅ Shipped | Ch 25, Ch 42 (vtables), Ch 26 (monomorphization), Ch 24 (closures) |
| Concurrency Laboratory (threads, Arc/Mutex, ownership transfer) | ✅ Shipped | Ch 31 (spawn + move), Ch 32 (lock states) |
| Async Runtime Simulator (inert futures, poll, select/cancel, Pin) | ✅ Shipped | Ch 33, Ch 34, Ch 35 |
| Unsafe Rust Laboratory (UB, FFI boundary, invariants) | ✅ Shipped | Ch 1 (C use-after-free), Ch 37, Ch 38 |
| Type-driven patterns (builder moves, PhantomData, typestate) | ✅ Shipped | Ch 29, Ch 40, Ch 44 |
| Compiler Visualization Engine (tokens → AST → HIR → MIR → LLVM → binary) | ✅ Shipped | Ch 49 |
| Cargo Universe (toolchain, build pipeline, lockfile, workspaces, modules) | ✅ Shipped | Ch 4, Ch 5, Ch 15, Ch 45 |
| Macro Expansion Engine (pattern match → template stamping → call-site code) | ✅ Shipped | Ch 43 |
| Process simulations (test harness, diagnostics anatomy, repo recon, PR flow, RFC lifecycle, study plan) | ✅ Shipped | Ch 28, Ch 41, Ch 46–48, Ch 50, Ch 51 |
| Hooks and capstones (four-bugs preface, hello-world pipeline, CLI memory, Part 0 recap, zero-cost proof, ecosystem seam) | ✅ Shipped | Part 0 Ch 0/1/7/8, Ch 2, Ch 3 |
| Engine itself (steps, arrows, play mode, a11y, reduced motion, print fallback, custom column labels) | ✅ Shipped | `theme/rust-viz.js`, `theme/rust-viz.css` |
| Scenario validation in CI (61 scenarios — every chapter of the book) | ✅ Shipped | `scripts/rust-viz.test.mjs` |

Every numbered chapter (Part 0 Ch 0–8 and Ch 1–51) now carries a simulation. Memory
chapters use the default Stack/Heap columns; tooling, compiler, and process chapters use
the `"columns"` override (e.g. `["Compiler stage", "Representation"]`) to repurpose the
same engine as a pipeline/process visualizer. Only part-opener index pages, the
retention-drill deck, and the appendices (reference material) have none.

### Scenario format (for authors)

```html
<div class="rust-viz" data-eyebrow="Ownership Visualizer"
     data-title="Title shown on the panel" data-accent="var(--ownership)">
<script type="application/json">
{
  "code": ["let s = String::from(\"hi\");", "let t = s;"],
  "steps": [
    {
      "line": 1,
      "caption": "What the learner should understand at this step.",
      "note": {"kind": "error|ok|info", "text": "optional compiler verdict"},
      "stack": [{"frame": "main", "vars": [
        {"name": "s", "value": "ptr · len 2 · cap 2", "points": "h1",
         "state": "owner|copy|moved|borrow|borrow-mut|dropped|error"}
      ]}],
      "heap": [{"id": "h1", "label": "String buffer", "value": "\"hi\"",
                "state": "alive|freed"}]
    }
  ]
}
</script>
<p class="rust-viz__fallback">One-paragraph static description for no-JS and PDF readers.</p>
</div>
```

Authoring rules:

- **No blank lines** anywhere inside the `<div>` — mdBook ends raw HTML blocks at blank
  lines.
- Every `points` value must name an `id` declared in the same step (tests enforce this).
- Always include the `rust-viz__fallback` paragraph (tests enforce this too).
- `frame.state: "closing"` renders a dashed, fading frame for scope-exit steps.
- Optional top-level `"columns": ["Left", "Right"]` relabels the two memory columns —
  used to turn the engine into a pipeline/process visualizer (e.g. `["Compiler stage",
  "Representation"]` in Ch 49). Defaults to `["Stack", "Heap"]`.
- `"state": "plain"` on a variable renders it without a state tag — for process
  simulations where owner/borrow tags would be noise. `"shadowed"` dims a binding that
  is still alive but no longer reachable by name.

## Phase 2 — Cover the Ownership Spine (shipped)

Done: every ownership-spine chapter (Part 0 Ch 2–6, Ch 10/11/11a, Ch 16–21) now carries
a scenario. Remaining stretch ideas:

- Render lifetimes additionally as horizontal timeline bars per binding — an engine
  extension (`"timeline"` step field), useful for Ch 18/39.
- Loop-carried borrow and reborrowing scenarios for Ch 21.

## Phase 3 — Smart Pointers and Std Explorer (shipped)

Done: Vec reallocation (Ch 22), iterator cursor (Ch 23), Rc/RefCell with visible
refcount and borrow flag (Ch 30), slice fat pointers (Ch 11a), niche optimization
(Ch 36). Remaining stretch: `Box` deref chains, `String`/`&str` conversion anatomy,
HashMap bucket probing.

## Phase 4 — Concurrency and Async Simulators (shipped, first wave)

Done: thread spawn with ownership transfer (Ch 31), Arc count + Mutex lock state
(Ch 32), inert futures and poll (Ch 33), select/cancellation-as-drop (Ch 34),
Pin and self-references (Ch 35). Remaining stretch:

- Deadlock scenario: two mutexes, two threads, learner steps into the cycle.
- Channel sends animating values across thread columns (mpsc).
- A dedicated executor visualizer with task queue and wakers as first-class objects.

## Phase 5 — Compiler Pipeline and Knowledge Graph (partially shipped)

- ✅ Compiler Visualization Engine: tokens → AST → HIR → MIR → LLVM IR → binary, shipped
  as the Ch 49 simulation using custom columns.
- Knowledge graph: the cross-chapter "builds on / needed for" links already in the
  chapters become a D3 force graph on a dedicated page.

## Phase 6 — Progression and Projects

- The existing localStorage progress tracker grows into the 12-level mastery ladder
  (levels map to Parts; completing a Part's chapters + drills unlocks the badge).
- Production project tracks land as appendices with repo templates.

## Phase 7 — Immersive 3D Layer (vision)

The long-term ambition: a 3D "Rust Universe" where concepts are explorable worlds —
Ownership Planet (energy cores moving between containers), Borrowing City (green/red
roads locking down on conflicts), Memory World (Stack Mountains, Heap Ocean, Pointer
Bridges), Compiler Megacity (code traveling through Lexer District to the Binary Launch
Facility), Async Galaxy (futures as spacecraft, wakers as signals), and a Standard
Library Megaverse (walk inside a Vec, traverse a living BTreeMap).

The path there is deliberately staged, and the work shipped in Phases 1–5 is the
foundation, not a detour:

1. **The scenario corpus is the asset.** All 61 simulations are declarative JSON
   (code + per-step state + captions), fully renderer-agnostic. A Three.js/React Three
   Fiber front-end consumes the same scenarios the 2D engine renders today — Ownership
   Planet is the Ch 16/20 scenarios with energy-core models instead of DOM rows.
2. **Stage 1 (WebGL within mdBook):** an opt-in `data-renderer="3d"` flag on a
   `rust-viz` block lazy-loads a Three.js renderer for that scenario; the 2D engine
   remains the default and the no-JS/PDF fallback. Pilot on the three flagship
   scenarios (Ch 20 move, Ch 17 borrow conflict, Ch 49 pipeline).
3. **Stage 2 (dedicated experience):** a separate R3F app — the actual Universe with
   galaxy navigation, cinematic cameras, GPU particles, post-processing — importing the
   scenario corpus as its content layer and deep-linking back into the handbook for
   text depth. Built in its own repo/workspace so the book's PDF, no-JS, and
   contributor stories stay intact.
4. **Stage 3 (frontier tech):** WebGPU compute for large particle simulations (memory
   visualizations at address scale), Rust-compiled-to-WASM driving the simulations
   (the platform itself becomes a Rust showcase), spatial audio, physics.

## Out of Scope (deliberately, for the book itself)

- Replacing the mdBook with a SPA. The 3D experience (Phase 7) is additive and lives
  alongside the book, consuming its scenario corpus — it never forks the content base
  or breaks the PDF/no-JS/contributor stories.
- In-browser Rust compilation. The Rust Playground links already give every snippet a
  one-click run; embedding wasm rustc is not worth the payload.
