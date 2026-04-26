# Part 0: Rust in One Hour

<div class="ferris-says" data-variant="insight">
<p>Welcome! I am <strong>Ferris</strong>, and I will be your guide for the next nine chapters. Part 0 is the whole of "daily Rust" compressed into about an hour of reading. No lifetimes, no <code>unsafe</code>, no generics — just the ideas you will use every day. We build one program together (<code>wordc</code>, a small file-counting CLI) and ship it by the end. Take your time; click every <strong>Run</strong> button; try every quiz. Ready?</p>
</div>

<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Who this part is for</h4>
    <div class="snapshot-prereq">
      <span>Python / JavaScript / TypeScript developers</span>
      <span>Anyone who has heard "Rust is hard"</span>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will walk away with</h4>
    <ul>
      <li>Every concept a working Rust program uses day to day</li>
      <li>A real mental model of ownership &amp; borrowing</li>
      <li>A small CLI program you wrote and ran yourself</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">60<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">8 short chapters</div>
  </div>
</div>

<div class="one-sentence">
  If you only remember one thing: <strong>Rust is a language that refuses to let two people hold the only pen at the same time.</strong> Everything else in this book explains why that rule, consistently applied, is a superpower.
</div>

## Why this part exists

Most Rust books start with syntax. Syntax is the least interesting thing about Rust. The interesting thing is the *idea* — the one rule the compiler enforces about who is allowed to touch what, and when.

Part 0 teaches that idea in plain English, with pictures, before you meet a single semicolon you have to take seriously. Eight short chapters. A reader who goes no further can still write small useful Rust programs. A reader who goes further has a foundation the rest of the book can build on without rushing.

## The eight stops

<div class="analogy-card">
  <div class="analogy-card__head">The route</div>
  <div class="analogy-card__body">
    <ol>
      <li><a href="00-preface-why-this-book.md">Why you will actually like Rust</a></li>
      <li><a href="01-hello-rust.md">Hello, Rust</a> — install, compile, run in five minutes</li>
      <li><a href="02-values-bindings-and-mutability.md">Values, names, and the "let" word</a></li>
      <li><a href="03-the-shape-of-data.md">The shape of data</a> — structs, enums, and tuples in pictures</li>
      <li><a href="04-ownership-in-one-page.md">Ownership in one page</a></li>
      <li><a href="05-borrowing-in-one-page.md">Borrowing in one page</a></li>
      <li><a href="06-option-and-result.md">Option and Result</a> — Rust's answer to "what if it failed?"</li>
      <li><a href="07-your-first-cli.md">Your first CLI</a> — put it all together in a real program</li>
    </ol>
    <p>Then: <a href="08-where-to-next.md">Where to next</a>.</p>
  </div>
</div>

## How to read Part 0

Read it in order, top to bottom. Each chapter is short on purpose. Every code block has a "Run in Playground" link — click it, let the code run in your browser, then come back. You will not absorb Rust by reading alone. You will absorb it by running six-line programs and watching what happens.

When you finish Part 0, choose your next stop from <a href="08-where-to-next.md">Where to next</a>.

## A small promise

We will never use the phrases "it's simple" or "it's easy" in this book. If something is hard, we will say it is hard, and we will stand next to you until it is not hard anymore. The promise is not that Rust is easy. The promise is that the way we teach it here is the gentlest path up the mountain you will find on the internet.

Let's begin.
