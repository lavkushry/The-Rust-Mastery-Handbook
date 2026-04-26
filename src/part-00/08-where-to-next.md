# Where to Next

<div class="ferris-says" data-variant="insight">
<p>You started this book never having written a line of Rust. A couple of hours later you have shipped a real command-line tool, understood ownership, and read your first compiler errors like an adult. That is not a small thing. Most people who try to learn Rust from scratch on the internet give up around ownership — you blew past it. You earned this chapter.</p>
</div>

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

<div class="ferris-says">
<p>One last thing. Keep the <code>wordc</code> project open. In Part 1 we will take the same idea — a file-processing CLI — and push on it harder. More flags, better error handling, tests, release-mode optimisations, property-based testing. Same program, just gradually better. That is how Rust actually feels: you build small things, you extend them, and somewhere along the way the language gets out of your way.</p>
<p>Go build something.</p>
</div>

<a href="../part-01/index.md">Continue to Part 1 — Why Rust Exists →</a>
