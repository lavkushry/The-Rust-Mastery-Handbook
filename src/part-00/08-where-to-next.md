# Where to Next

<div class="one-sentence">
  If you only remember one thing: <strong>you now know enough Rust to read almost any Rust code in the wild. The rest of this book is depth on top of the ideas you already have.</strong>
</div>

## What you know now

Look at everything Part 0 just covered:

- `cargo new`, `cargo run`, `cargo build --release` — the whole daily workflow
- `let`, `let mut`, shadowing, and why Rust defaults to immutable
- `struct` for "and", `enum` for "or", and the `match` that makes enums honest
- Ownership: one owner, scope-bound drop, moves
- Borrowing: `&T` (many readers) vs `&mut T` (one exclusive writer)
- `Option<T>` for "might be absent" and `Result<T, E>` for "might have failed"
- The `?` operator for propagating errors idiomatically
- A real CLI program, compiled to a native binary

That is roughly eighty percent of the Rust you will use in the first year on the job. The remaining twenty percent — iterators, traits, generics, async, smart pointers, concurrency, unsafe — are refinements and power features. You do not need them to be useful.


Proof, before you pick a path: step through this snippet. A week ago it was hieroglyphics; now you can narrate every line.

<div class="rust-viz" data-eyebrow="Part 0 Capstone" data-title="Read This Like You Built It" data-accent="var(--valid)">
<script type="application/json">
{
  "code": [
    "struct Note { text: String }",
    "let note = Note { text: String::from(\"learn Rust\") };",
    "let view = &note.text;",
    "match view.is_empty() {",
    "    true => println!(\"empty note\"),",
    "    false => println!(\"{view}\"),",
    "}"
  ],
  "steps": [
    {
      "line": 2,
      "caption": "A struct with an owned String field: note sits on the stack, its text bytes on the heap, and note owns them. You know this picture from Chapter 3 and Chapter 4.",
      "stack": [{"frame": "main", "vars": [{"name": "note", "value": "text: ptr · len 10 · cap 10", "points": "h1", "state": "owner"}]}],
      "heap": [{"id": "h1", "label": "note.text buffer", "value": "\"learn Rust\"", "state": "alive"}]
    },
    {
      "line": 3,
      "caption": "A borrow of the field — reading without taking. note remains the owner; view is a temporary lens. Chapter 5, working exactly as promised.",
      "stack": [{"frame": "main", "vars": [{"name": "note", "value": "text: ptr · len 10 · cap 10", "points": "h1", "state": "owner"}, {"name": "view", "value": "&note.text", "points": "h1", "state": "borrow"}]}],
      "heap": [{"id": "h1", "label": "note.text buffer", "value": "\"learn Rust\"", "state": "alive"}]
    },
    {
      "line": 6,
      "caption": "A match with both cases handled — the Chapter 6 discipline, applied to a plain bool. The text is not empty, so this arm prints it. That is the whole of Part 0 in one breath: data has a shape, one owner, borrowed views, and every case handled. Now pick your path below.",
      "note": {"kind": "ok", "text": "you can now read the vast majority of Rust code in the wild — the rest of this book is depth, not difficulty"},
      "stack": [{"frame": "main", "vars": [{"name": "note", "value": "text: ptr · len 10 · cap 10", "points": "h1", "state": "owner"}, {"name": "view", "value": "&note.text", "points": "h1", "state": "borrow"}]}],
      "heap": [{"id": "h1", "label": "note.text buffer", "value": "\"learn Rust\"", "state": "alive"}]
    }
  ]
}
</script>
<p class="rust-viz__fallback">Interactive simulation (requires JavaScript): a capstone walkthrough of a struct with an owned String field, a borrowed view of it, and an exhaustive match — every concept from Part 0 in one short program.</p>
</div>
## Pick your path

<div class="analogy-card">
  <div class="analogy-card__head">Three routes</div>
  <div class="analogy-card__body">
    <ol>
      <li><strong>Slow and thorough.</strong> Continue straight into <a href="../part-01/index.md">Part 1</a> and read the book in order. Parts 1 and 2 re-teach everything in Part 0 with the details Part 0 skipped. This is the path if you want to really own the language.</li>
      <li><strong>Ownership deep-dive.</strong> Jump to <a href="../part-03/index.md">Part 3 — The Heart of Rust</a>. If "ownership in one page" left you wanting the full picture with lifetimes, moves, and the borrow checker's reasoning, this is the part for you.</li>
      <li><strong>I want to build things now.</strong> Pick a small real problem and build it. The best next projects for Part 0 graduates are: a CLI that processes a log file, a small HTTP server with <a href="https://crates.io/crates/axum">axum</a>, a <a href="https://crates.io/crates/tokio">tokio</a>-based async task, or a tiny game with <a href="https://crates.io/crates/bevy">bevy</a>. Use <a href="../appendices/appendix-d-recommended-crates-by-category.md">Appendix D</a> to pick a crate.</li>
    </ol>
  </div>
</div>

## The reference card

Bookmark these pages. You will come back to them:

- <a href="../appendices/appendix-a-cargo-command-cheat-sheet.md">Appendix A — Cargo command cheat sheet</a>
- <a href="../appendices/appendix-b-compiler-errors-decoded.md">Appendix B — Compiler errors decoded</a>
- <a href="../appendices/appendix-c-trait-quick-reference.md">Appendix C — Trait quick reference</a>
- <a href="../appendices/appendix-f-glossary.md">Appendix F — Glossary</a>

## A note on the rest of the book

The tone changes a little after Part 0. The book is a real handbook — when we introduce lifetimes or `Pin` or `unsafe`, we give you the full machinery, not a simplification. The analogies and pictures stay, but the chapters get longer and the material gets denser, because the material itself is denser. That is fine. You are ready for it now.

## A note from the author

<div class="eli5">
  <div class="eli5__head">Straight talk</div>
  <p>Rust's reputation as "hard" comes from one thing: most books teach the syntax and assume you will <em>figure out</em> the mental model. You don't. You absorb it.</p>
  <p>This book tries to flip that. Part 0 was the mental model first. The syntax was just the notation we used to write down what we already understood. If you felt like "oh, that was fine" — that's the feeling we were aiming for. It wasn't luck. It was the order of teaching.</p>
  <p>Go build something.</p>
</div>

<a href="../part-01/index.md">Continue to Part 1 — Why Rust Exists →</a>
