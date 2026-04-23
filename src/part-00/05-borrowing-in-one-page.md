# Borrowing in One Page

<div class="ferris-says">
<p>Ownership, you now know, is strict: one value, one owner. If every function took ownership, you would have to clone everything — expensive and tedious. <strong>Borrowing</strong> is the pressure-release valve. A borrow says: "you may look, but do not take; I will want it back." And because the compiler knows exactly how long a borrow lives, you get the speed of C-style pointers with none of the bugs.</p>
</div>

<div class="one-sentence">
  If you only remember one thing: <strong>a borrow lets a function look at your value without taking it over, and the compiler guarantees the value will still be valid while the borrow lives.</strong>
</div>

## The problem borrowing solves

We want this to work:

```rust
fn main() {
    let name = String::from("Ada");
    print_name(name);
    println!("{name}");   // we'd like to still use name here
}

fn print_name(n: String) {
    println!("hello, {n}");
}
```

It does not work. `print_name(name)` *moves* `name` into the function. By the time `println!` on the next line runs, `name` is gone.

We could fix it by cloning, but cloning a string means copying the bytes, which we do not need. What we actually want is "let the function *look* at the value, but keep ownership here."

That is a borrow. You write it with `&`:

```rust
fn main() {
    let name = String::from("Ada");
    print_name(&name);
    println!("{name}");   // still valid — we only lent the name out
}

fn print_name(n: &String) {
    println!("hello, {n}");
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20main%28%29%20%7B%0A%20%20%20%20let%20name%20%3D%20String%3A%3Afrom%28%22Ada%22%29%3B%0A%20%20%20%20print_name%28%26name%29%3B%0A%20%20%20%20println%21%28%22%7Bname%7D%22%29%3B%0A%7D%0A%0Afn%20print_name%28n%3A%20%26String%29%20%7B%0A%20%20%20%20println%21%28%22hello%2C%20%7Bn%7D%22%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>A borrow is "please read this, do not take it". The <code>&amp;</code> is the way you hand the thing over to someone to <em>look at</em>, not to <em>keep</em>.</p>
</div>

## Two kinds of borrow

There are two borrow shapes in Rust, and they follow one rule between them.

<figure class="visual-figure" style="--chapter-accent: var(--borrow-shared);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">The aliasing rule</div>
      <h2 class="visual-figure__title">Many readers OR one writer. Never both at once.</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 960 360" role="img" aria-label="Two panels. Left panel shows three readers all pointing arrows at a shared value — this is allowed. Right panel shows one writer pointing a thick arrow at a value with a lock icon — this is allowed alone, and other readers are blocked out.">
      <rect x="20" y="20" width="920" height="320" rx="24" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <text x="240" y="60" text-anchor="middle" style="font-family:var(--font-display);font-size:18px;fill:#457b9d;font-weight:bold">&amp;T — shared (read-only)</text>
      <rect x="60" y="80" width="360" height="240" rx="16" fill="#eef6ff" stroke="#457b9d" stroke-width="3"></rect>
      <rect x="200" y="180" width="100" height="60" rx="8" fill="#ffffff" stroke="#457b9d" stroke-width="3"></rect>
      <text x="250" y="216" text-anchor="middle" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">value</text>
      <circle cx="100" cy="140" r="20" fill="#457b9d"></circle>
      <circle cx="100" cy="200" r="20" fill="#457b9d"></circle>
      <circle cx="100" cy="260" r="20" fill="#457b9d"></circle>
      <path d="M120 140 L 200 205" stroke="#457b9d" stroke-width="2"></path>
      <path d="M120 200 L 200 210" stroke="#457b9d" stroke-width="2"></path>
      <path d="M120 260 L 200 215" stroke="#457b9d" stroke-width="2"></path>
      <text x="240" y="290" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#457b9d">many readers, all at once, all fine.</text>
      <text x="720" y="60" text-anchor="middle" style="font-family:var(--font-display);font-size:18px;fill:#f4a261;font-weight:bold">&amp;mut T — exclusive (read &amp; write)</text>
      <rect x="540" y="80" width="360" height="240" rx="16" fill="#fff5eb" stroke="#f4a261" stroke-width="3"></rect>
      <rect x="680" y="180" width="100" height="60" rx="8" fill="#ffffff" stroke="#f4a261" stroke-width="3"></rect>
      <text x="730" y="216" text-anchor="middle" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">value</text>
      <circle cx="580" cy="200" r="24" fill="#f4a261"></circle>
      <path d="M610 200 L 680 210" stroke="#f4a261" stroke-width="5"></path>
      <circle cx="580" cy="140" r="20" fill="#e5e7eb" stroke="#94a3b8"></circle>
      <path d="M570 130 L 590 150 M590 130 L 570 150" stroke="#d62828" stroke-width="3"></path>
      <circle cx="580" cy="260" r="20" fill="#e5e7eb" stroke="#94a3b8"></circle>
      <path d="M570 250 L 590 270 M590 250 L 570 270" stroke="#d62828" stroke-width="3"></path>
      <text x="720" y="290" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#b45309">one writer, alone, only while writing.</text>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">At any moment you can have many <code>&amp;T</code> readers <em>or</em> exactly one <code>&amp;mut T</code> writer. This is the borrow rule.</figcaption>
</figure>

- `&T` — a **shared** borrow. Read-only. Many allowed at once.
- `&mut T` — an **exclusive** borrow. Read and write. Exactly one allowed at a time, and no `&T` readers can exist while it does.

That rule is the whole borrow checker. Everything else follows from it.

## The rule in code

This compiles. Many readers, no writers:

```rust
fn main() {
    let s = String::from("rust");
    let a = &s;
    let b = &s;
    println!("{a} {b} {s}");
}
```

This also compiles. One writer, no readers:

```rust
fn main() {
    let mut s = String::from("rust");
    let w = &mut s;
    w.push_str("!");
    println!("{w}");
}
```

This does **not** compile. A reader and a writer at the same time:

```rust
fn main() {
    let mut s = String::from("rust");
    let r = &s;
    let w = &mut s;   // error: cannot borrow `s` as mutable because it is also borrowed as immutable
    println!("{r} {w}");
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20main%28%29%20%7B%0A%20%20%20%20let%20mut%20s%20%3D%20String%3A%3Afrom%28%22rust%22%29%3B%0A%20%20%20%20let%20r%20%3D%20%26s%3B%0A%20%20%20%20let%20w%20%3D%20%26mut%20s%3B%20%20%20%2F%2F%20this%20line%20is%20the%20problem%0A%20%20%20%20println%21%28%22%7Br%7D%20%7Bw%7D%22%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

Read the error when it shouts at you. It will tell you, to the character, which borrow was already live and what you tried to do.

<div class="analogy-card">
  <div class="analogy-card__head">Why the rule</div>
  <div class="analogy-card__body">
    <p>If one person is reading your notebook and another person starts <em>erasing and rewriting</em> it, what the first person sees is nonsense. Rust catches that at compile time for every single piece of data you own. Data races — the bug category that eats entire engineering quarters — simply cannot compile.</p>
  </div>
</div>

## A passing note on lifetimes

Every borrow lives for a certain slice of time — from the moment it is taken to the last moment it is used. Rust tracks these slices automatically. You will not usually annotate them. When you do need to, the notation looks like `&'a str` and it is covered in Part 3.

For now, take the following on faith: if the value you borrowed from is dropped, any borrow of it stops being valid, and the compiler will refuse to let you use it. That is another bug class — *use after free* — quietly removed.

## String vs &str — the first consequence

This is where Rust's two string types finally make sense.

- `String` — an **owning** string. A heap-allocated, growable buffer that you own. Like `std::string` in C++ or `StringBuilder`.
- `&str` — a **borrowed view** into some text that lives elsewhere. Pronounced "string slice". Like a read-only window.

When you write `"hello"` in Rust source, you get a `&str` — a borrowed view of a literal baked into the program. When you call `String::from("hello")`, you allocate your own owned copy. Any function that just wants to read some text should take `&str`.

```rust
fn greet(name: &str) {
    println!("hello, {name}");
}

fn main() {
    greet("Ada");                       // passes a &str directly
    let name = String::from("Ben");
    greet(&name);                       // &String auto-coerces to &str
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20greet%28name%3A%20%26str%29%20%7B%0A%20%20%20%20println%21%28%22hello%2C%20%7Bname%7D%22%29%3B%0A%7D%0A%0Afn%20main%28%29%20%7B%0A%20%20%20%20greet%28%22Ada%22%29%3B%0A%20%20%20%20let%20name%20%3D%20String%3A%3Afrom%28%22Ben%22%29%3B%0A%20%20%20%20greet%28%26name%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p><strong>Default habit:</strong> your functions take <code>&amp;str</code>, not <code>String</code>. Callers can pass either — Rust will do the coercion for you. You keep the flexibility, they keep ownership of their data.</p>
</div>

## wordc, step 4

Our through-line needs a function that counts words in a block of text. It should *borrow* the text — the caller keeps the String, we just peek at it.

```rust
fn count_words(text: &str) -> u32 {
    text.split_whitespace().count() as u32
}

fn main() {
    let sample = String::from("ferris loves rust very much");
    let n = count_words(&sample);       // pass a borrow, not the String
    println!("{sample} → {n} words");   // sample is still usable!
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20count_words%28text%3A%20%26str%29%20-%3E%20u32%20%7B%0A%20%20%20%20text.split_whitespace%28%29.count%28%29%20as%20u32%0A%7D%0A%0Afn%20main%28%29%20%7B%0A%20%20%20%20let%20sample%20%3D%20String%3A%3Afrom%28%22ferris%20loves%20rust%20very%20much%22%29%3B%0A%20%20%20%20let%20n%20%3D%20count_words%28%26sample%29%3B%0A%20%20%20%20println%21%28%22%7Bsample%7D%20%E2%86%92%20%7Bn%7D%20words%22%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

Two small but huge details: `count_words` takes `&str` (a borrowed slice), and `main` passes `&sample` (a borrow of the String). No ownership changes hands. That is the whole idea.

<div class="ferris-says" data-variant="insight">
<p>You have now seen <em>the</em> idiom you will write on every Rust function for the rest of your career. Functions take <code>&amp;str</code> or <code>&amp;[T]</code> or <code>&amp;T</code> by default; they take <code>String</code> or <code>Vec&lt;T&gt;</code> or <code>T</code> only when they genuinely need to <em>own</em> the value (to store it somewhere, to consume it, to hand it to a thread). If you can remember only one rule from Part 0: <strong>borrow by default, own only when needed</strong>.</p>
</div>

## Try this

<div class="try-this">
  <div class="try-this__head">Five-minute exercises</div>
  <ol>
    <li>Write a function <code>fn length(s: &amp;str) -&gt; usize</code> that returns the number of bytes in the string. Call it from <code>main</code>.</li>
    <li>Write a function <code>fn shout(s: &amp;mut String)</code> that appends <code>"!"</code> to its argument. Call it on a <code>let mut msg = String::from("hi");</code> and print the result.</li>
    <li>Write a program that holds both an <code>&amp;s</code> and an <code>&amp;mut s</code> at the same time. Read the error. It will tell you exactly which line to move.</li>
  </ol>
</div>

## Check yourself

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quiz — 1 of 1</span><span>Borrowing</span></div>
  <p class="quiz__q">Which set of references is <em>legal</em> to hold at the same time on a single <code>String</code>?</p>
  <ul class="quiz__options">
    <li>Two <code>&amp;mut</code> references</li>
    <li>One <code>&amp;mut</code> reference and one <code>&amp;</code> reference</li>
    <li>Three <code>&amp;</code> references (no <code>&amp;mut</code>)</li>
    <li>Any combination — references are cheap and don't conflict</li>
  </ul>
  <div class="quiz__explain">Correct. The aliasing rule: <strong>many readers <em>or</em> one writer, never both</strong>. Three shared borrows is fine because nobody is writing. Two <code>&amp;mut</code> is not. Mixing them is not. This one rule is the reason Rust eliminates entire classes of data-race bugs at compile time.</div>
  <div class="quiz__explain quiz__explain--wrong">Look at the "aliasing rule" section. Read it out loud. Many readers OR one writer — never both.</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

Now for the other idea Rust is famous for — how errors and missing values are just ordinary data.

<a href="06-option-and-result.md">Option and Result →</a>
