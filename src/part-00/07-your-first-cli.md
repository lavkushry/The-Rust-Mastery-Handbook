# Your First CLI

<div class="ferris-says">
<p>Six chapters. Six pieces of a program. Today we snap them together. <code>wordc</code> becomes a real CLI — one you could ship to a teammate. Every line you write in this chapter uses something you already know: <code>let</code>, <code>fn</code>, <code>struct</code>, ownership, borrowing, <code>Result</code>. This is the "oh, I actually know this" chapter. Enjoy it.</p>
</div>

<div class="one-sentence">
  If you only remember one thing: <strong>you already know enough Rust to write a real program that reads a file, counts something useful, and prints a result. This chapter is you doing it.</strong>
</div>

## What we are building

A tiny command-line program called `wordc`. You give it a file path; it tells you how many words are in that file. This is three hundred lines of Python in a week-two bootcamp. It is thirty lines of Rust, and the end result is a standalone native binary you can hand to a colleague who does not have Rust installed.

```
$ cargo run -- Cargo.toml
Cargo.toml has 12 words.
```

## Make the project

```bash
cargo new wordc
cd wordc
```

Open `src/main.rs` and replace its contents with this:

```rust
use std::env;
use std::fs;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("usage: wordc <path>");
        process::exit(1);
    }

    let path = &args[1];

    let text = match fs::read_to_string(path) {
        Ok(t)  => t,
        Err(e) => {
            eprintln!("could not read {path}: {e}");
            process::exit(1);
        }
    };

    let count = text.split_whitespace().count();
    println!("{path} has {count} words.");
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=use%20std%3A%3Aenv%3B%0Ause%20std%3A%3Afs%3B%0Ause%20std%3A%3Aprocess%3B%0A%0Afn%20main%28%29%20%7B%0A%20%20%20%20let%20args%3A%20Vec%3CString%3E%20%3D%20env%3A%3Aargs%28%29.collect%28%29%3B%0A%0A%20%20%20%20if%20args.len%28%29%20%3C%202%20%7B%0A%20%20%20%20%20%20%20%20eprintln%21%28%22usage%3A%20wordc%20%3Cpath%3E%22%29%3B%0A%20%20%20%20%20%20%20%20process%3A%3Aexit%281%29%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20let%20path%20%3D%20%26args%5B1%5D%3B%0A%0A%20%20%20%20let%20text%20%3D%20match%20fs%3A%3Aread_to_string%28path%29%20%7B%0A%20%20%20%20%20%20%20%20Ok%28t%29%20%20%3D%3E%20t%2C%0A%20%20%20%20%20%20%20%20Err%28e%29%20%3D%3E%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20eprintln%21%28%22could%20not%20read%20%7Bpath%7D%3A%20%7Be%7D%22%29%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20process%3A%3Aexit%281%29%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20let%20count%20%3D%20text.split_whitespace%28%29.count%28%29%3B%0A%20%20%20%20println%21%28%22%7Bpath%7D%20has%20%7Bcount%7D%20words.%22%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

Then run it against the project's own manifest:

```bash
cargo run -- Cargo.toml
```

You should see `Cargo.toml has 12 words.` (the exact number will differ).

## Let's walk through the thirty lines

<figure class="visual-figure" style="--chapter-accent: var(--compiler);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Shape of the program</div>
      <h2 class="visual-figure__title">Every idea from Part 0, in one file</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 960 360" role="img" aria-label="Flow diagram. Arguments come in from the OS, a Vec of String is collected, the path is borrowed, read_to_string returns a Result, match extracts the text, split_whitespace and count produce a number, which is printed.">
      <rect x="20" y="20" width="920" height="320" rx="24" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <rect x="40" y="140" width="140" height="80" rx="12" fill="#e6f0ff" stroke="#457b9d" stroke-width="3"></rect>
      <text x="110" y="180" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#1a1a2e">OS args</text>
      <text x="110" y="200" text-anchor="middle" style="font-family:var(--font-code);font-size:12px;fill:#475569">env::args()</text>
      <path d="M180 180 H 230" stroke="#457b9d" stroke-width="3" marker-end="url(#a1)"></path>
      <defs>
        <marker id="a1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0 L 10 5 L 0 10 z" fill="#457b9d"></path>
        </marker>
      </defs>
      <rect x="230" y="140" width="160" height="80" rx="12" fill="#eef6ff" stroke="#457b9d" stroke-width="3"></rect>
      <text x="310" y="180" text-anchor="middle" style="font-family:var(--font-code);font-size:12px;fill:#1a1a2e">Vec&lt;String&gt;</text>
      <text x="310" y="200" text-anchor="middle" style="font-family:var(--font-display);font-size:11px;fill:#475569">args.len() &gt;= 2?</text>
      <path d="M390 180 H 440" stroke="#457b9d" stroke-width="3" marker-end="url(#a1)"></path>
      <rect x="440" y="140" width="160" height="80" rx="12" fill="#fff5eb" stroke="#f4a261" stroke-width="3"></rect>
      <text x="520" y="180" text-anchor="middle" style="font-family:var(--font-code);font-size:12px;fill:#1a1a2e">Result&lt;String, _&gt;</text>
      <text x="520" y="200" text-anchor="middle" style="font-family:var(--font-display);font-size:11px;fill:#b45309">fs::read_to_string</text>
      <path d="M600 180 H 650" stroke="#f4a261" stroke-width="3" marker-end="url(#a2)"></path>
      <defs>
        <marker id="a2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0 L 10 5 L 0 10 z" fill="#f4a261"></path>
        </marker>
      </defs>
      <rect x="650" y="140" width="150" height="80" rx="12" fill="#e0fbe0" stroke="#2d6a4f" stroke-width="3"></rect>
      <text x="725" y="180" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#1a1a2e">count words</text>
      <text x="725" y="200" text-anchor="middle" style="font-family:var(--font-code);font-size:11px;fill:#2d6a4f">split_whitespace</text>
      <path d="M800 180 H 850" stroke="#2d6a4f" stroke-width="3" marker-end="url(#a3)"></path>
      <defs>
        <marker id="a3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0 L 10 5 L 0 10 z" fill="#2d6a4f"></path>
        </marker>
      </defs>
      <text x="895" y="185" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#2d6a4f">stdout</text>
      <text x="530" y="290" text-anchor="middle" style="font-family:var(--font-display);font-size:12px;fill:#475569">Every arrow carries a type. Every branch is handled.</text>
    </svg>
  </div>
</figure>

Line by line:

- `use std::env;` pulls in the `env` module so we can write `env::args()` instead of `std::env::args()`.
- `let args: Vec<String> = env::args().collect();` collects the command-line arguments into a growable list. `Vec<T>` is Rust's `Array`/`list`. `.collect()` turns an iterator into a collection.
- `if args.len() < 2 { ... }` is a plain guard. `process::exit(1)` ends the program with a non-zero status, the Unix convention for "something went wrong".
- `let path = &args[1];` **borrows** the path. We do not move it. We just look at it. (Chapter 5.)
- `fs::read_to_string(path)` returns a `Result<String, io::Error>`. We cannot touch the string until we have said what to do on error. The `match` does exactly that. (Chapter 6.)
- `text.split_whitespace().count()` is Rust's iterator pattern in action. `split_whitespace` does not allocate a vector of words — it returns an iterator, which `count` walks once. Zero allocations, one pass, fast.
- `println!` prints to stdout; `eprintln!` prints to stderr (where errors belong).

## A smaller, nicer version with `?`

Once we have a function that can return a `Result`, we can use `?` to remove the `match` and let errors bubble up:

```rust
use std::env;
use std::fs;
use std::process;

fn run() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    let path = args.get(1).ok_or("usage: wordc <path>")?;

    let text = fs::read_to_string(path)?;
    let count = text.split_whitespace().count();

    println!("{path} has {count} words.");
    Ok(())
}

fn main() {
    if let Err(e) = run() {
        eprintln!("{e}");
        process::exit(1);
    }
}
```

This is the shape most production Rust programs end up in: a `run()` that returns `Result`, and a `main()` that is just error formatting and exit-code plumbing.

## Ship it

Make the release binary:

```bash
cargo build --release
./target/release/wordc Cargo.toml
```

That file — `target/release/wordc` — is a native, statically-compiled binary. You can `scp` it to another Linux machine without Rust installed and it will work. That is the end state of every Rust program.

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>You just wrote a real program, using every idea in Part 0: variables, bindings, borrowing, <code>Option</code>, <code>Result</code>, <code>match</code>. You compiled it to a native binary. If you stopped reading here, you could already use Rust at work for small tools.</p>
</div>

## Try this

<div class="try-this">
  <div class="try-this__head">Extend <code>wordc</code></div>
  <ol>
    <li>Add a <code>--lines</code> flag (check <code>args.contains(&amp;"--lines".to_string())</code>) that prints the line count instead of the word count.</li>
    <li>Support <em>multiple</em> file paths: print one line per file.</li>
    <li>Replace the argument parsing with the <a href="https://crates.io/crates/clap">clap</a> crate. Look at the <code>Cargo.toml</code> to see how dependencies are added.</li>
  </ol>
</div>

## Check yourself

<div class="quiz" data-answer="1">
  <div class="quiz__head"><span>Quiz — 1 of 1</span><span>Capstone</span></div>
  <p class="quiz__q">In the <code>wordc</code> program, what does the <code>?</code> at the end of <code>fs::read_to_string(path)?</code> do?</p>
  <ul class="quiz__options">
    <li>It is a typo that Rust accepts silently.</li>
    <li>If the call returns <code>Err(e)</code>, the current function returns <code>Err(e)</code>; if it returns <code>Ok(v)</code>, the value <code>v</code> is unwrapped and the function continues.</li>
    <li>It converts the <code>Result</code> into a boolean: <code>true</code> for <code>Ok</code>, <code>false</code> for <code>Err</code>.</li>
    <li>It silently panics if the result is an error.</li>
  </ul>
  <div class="quiz__explain">Correct. <code>?</code> is the "unwrap the <code>Ok</code>, or propagate the <code>Err</code>" operator. It is arguably Rust's single most quoted-from-memory feature. It replaces what would be try/catch in other languages with a one-character inline annotation — no stack-unwinding, no hidden control flow, no exceptions. Just data out or error up.</div>
  <div class="quiz__explain quiz__explain--wrong">Re-read the <code>read_file</code> function. Notice what happens when the file is missing — the error is <em>returned</em>, not caught.</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

You are done with the Part 0 core. Let's talk about where to go next.

<a href="08-where-to-next.md">Where to next →</a>
