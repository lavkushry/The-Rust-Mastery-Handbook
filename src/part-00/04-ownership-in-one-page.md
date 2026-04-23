# Ownership in One Page

<div class="one-sentence">
  If you only remember one thing: <strong>every value in Rust has exactly one owner, and when the owner goes out of scope the value is freed — automatically, at a time you can predict.</strong>
</div>

## The rule

Rust has exactly three ownership rules. You will read them in twenty seconds and spend the rest of the week getting used to them.

<div class="analogy-card">
  <div class="analogy-card__head">The three rules</div>
  <div class="analogy-card__body">
    <ol>
      <li>Every value has exactly one owner.</li>
      <li>When the owner goes out of scope, the value is dropped (memory freed, file closed, lock released).</li>
      <li>Ownership can be <em>moved</em> from one name to another, but it cannot be in two places at once.</li>
    </ol>
  </div>
</div>

## The library card analogy

<figure class="visual-figure" style="--chapter-accent: var(--ownership);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">The mental model</div>
      <h2 class="visual-figure__title">One library card. One holder. At all times.</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 960 360" role="img" aria-label="Three panels. Panel one: Ada holds a library card labeled Book. Panel two: Ada hands the card to Ben, Ada no longer has it. Panel three: Ben leaves the library, the card is destroyed, the book returns to the shelf.">
      <rect x="20" y="20" width="920" height="320" rx="24" fill="#fffdf8" stroke="rgba(230,57,70,0.16)"></rect>
      <rect x="40" y="60" width="280" height="260" rx="18" fill="#fff1f2" stroke="#e63946" stroke-width="3"></rect>
      <text x="180" y="94" text-anchor="middle" style="font-family:var(--font-display);font-size:16px;fill:#e63946;font-weight:bold">1. OWN</text>
      <circle cx="110" cy="180" r="32" fill="#e63946"></circle>
      <text x="110" y="186" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#ffffff">Ada</text>
      <rect x="170" y="150" width="120" height="72" rx="10" fill="#ffffff" stroke="#e63946" stroke-width="3"></rect>
      <text x="230" y="194" text-anchor="middle" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">book</text>
      <text x="180" y="272" text-anchor="middle" style="font-family:var(--font-display);font-size:12px;fill:#475569">let ada = String::from("book");</text>
      <text x="180" y="290" text-anchor="middle" style="font-family:var(--font-display);font-size:12px;fill:#475569">Ada holds it.</text>
      <rect x="340" y="60" width="280" height="260" rx="18" fill="#fff5eb" stroke="#fb8500" stroke-width="3"></rect>
      <text x="480" y="94" text-anchor="middle" style="font-family:var(--font-display);font-size:16px;fill:#fb8500;font-weight:bold">2. MOVE</text>
      <circle cx="400" cy="180" r="32" fill="#cbd5e1"></circle>
      <text x="400" y="186" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#475569">Ada</text>
      <path d="M440 180 H 520" stroke="#fb8500" stroke-width="6" marker-end="url(#arrowOrange)"></path>
      <defs>
        <marker id="arrowOrange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 0 L 10 5 L 0 10 z" fill="#fb8500"></path>
        </marker>
      </defs>
      <circle cx="560" cy="180" r="32" fill="#fb8500"></circle>
      <text x="560" y="186" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#ffffff">Ben</text>
      <text x="480" y="272" text-anchor="middle" style="font-family:var(--font-display);font-size:12px;fill:#475569">let ben = ada;</text>
      <text x="480" y="290" text-anchor="middle" style="font-family:var(--font-display);font-size:12px;fill:#475569">Ada no longer has it.</text>
      <rect x="640" y="60" width="280" height="260" rx="18" fill="#fff5f5" stroke="#d62828" stroke-width="3"></rect>
      <text x="780" y="94" text-anchor="middle" style="font-family:var(--font-display);font-size:16px;fill:#d62828;font-weight:bold">3. DROP</text>
      <circle cx="780" cy="180" r="32" fill="#cbd5e1"></circle>
      <text x="780" y="186" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#475569">Ben</text>
      <path d="M756 212 l 48 48 M804 212 l -48 48" stroke="#d62828" stroke-width="4" stroke-linecap="round"></path>
      <text x="780" y="272" text-anchor="middle" style="font-family:var(--font-display);font-size:12px;fill:#475569">} // end of scope</text>
      <text x="780" y="290" text-anchor="middle" style="font-family:var(--font-display);font-size:12px;fill:#475569">value is dropped.</text>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">Ownership is a library card. Exactly one person holds it. When they leave, the book goes back to the shelf.</figcaption>
</figure>

## The code that shows move

```rust
fn main() {
    let ada = String::from("book");
    let ben = ada;          // ownership moves to ben
    println!("{ben}");      // fine
    // println!("{ada}");   // would not compile
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20main%28%29%20%7B%0A%20%20%20%20let%20ada%20%3D%20String%3A%3Afrom%28%22book%22%29%3B%0A%20%20%20%20let%20ben%20%3D%20ada%3B%20%20%20%20%20%20%20%20%20%2F%2F%20ownership%20moves%20to%20ben%0A%20%20%20%20println%21%28%22%7Bben%7D%22%29%3B%20%20%20%20%20%20%2F%2F%20fine%0A%20%20%20%20%2F%2F%20println%21%28%22%7Bada%7D%22%29%3B%20%20%20%2F%2F%20would%20not%20compile%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

If you uncomment the last line, Rust says:

```
error[E0382]: borrow of moved value: `ada`
```

That is the whole behavior. Read it as "Ada gave the card to Ben. She does not have it anymore."

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>If this feels restrictive — good, you're reading it right. It is restrictive. In exchange, you get a language where "use after free", "double free", and "data race" are <em>compile errors</em>, not 3 a.m. pages. That is the deal.</p>
</div>

## Why some values "copy" instead of "move"

Try this and it works fine:

```rust
fn main() {
    let a = 5;
    let b = a;
    println!("{a} {b}");  // both are valid
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20main%28%29%20%7B%0A%20%20%20%20let%20a%20%3D%205%3B%0A%20%20%20%20let%20b%20%3D%20a%3B%0A%20%20%20%20println%21%28%22%7Ba%7D%20%7Bb%7D%22%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

Integers, booleans, floats, and a few other small types are `Copy`. Copying them is cheap and has no cleanup cost. Rust doesn't move them — it duplicates them bit-for-bit and everyone is happy.

`String`, `Vec<T>`, `HashMap`, file handles, locks — none of these are `Copy`. They own a resource (heap memory, a file descriptor, a lock) that has cleanup cost. Rust refuses to silently duplicate them.

<div class="analogy-card">
  <div class="analogy-card__head">Rule of thumb</div>
  <div class="analogy-card__body">
    <p>If it's a plain number or a small fixed-size value, it <em>copies</em>. If it owns memory on the heap, a file, or a connection, it <em>moves</em>. When in doubt, assume move.</p>
  </div>
</div>

## What "scope" means

A value's scope is the region of code where its owner is visible. Usually that is a block — the `{ ... }` it was declared in. When that block ends, Rust calls `drop` on the value.

```rust
fn main() {
    {
        let msg = String::from("hello");
        println!("{msg}");
    } // msg is dropped here. its memory is freed, right now, for sure.

    // println!("{msg}"); // would not compile; msg is out of scope
}
```

`drop` is deterministic. Not garbage-collected. Not "sometime later". The moment the block ends — that is when the cleanup happens.

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>Rust does not have a garbage collector. It does not need one. The compiler already knows exactly when to free every value — at the end of the scope that owns it.</p>
</div>

## Try this

<div class="try-this">
  <div class="try-this__head">Five-minute exercises</div>
  <ol>
    <li>Write <code>let s1 = String::from("hi"); let s2 = s1;</code> and try to print <code>s1</code>. Read the error.</li>
    <li>Change <code>let s1 = String::from("hi");</code> to <code>let s1 = 42;</code> and rerun. Why does it work now?</li>
    <li>Put a <code>String</code> inside a block <code>{ }</code> and try to use it after the block ends. Read the error.</li>
  </ol>
</div>

Ownership says "only one owner at a time". But often we need to *look* at a value without taking it over. That is borrowing — the next chapter.

<a href="05-borrowing-in-one-page.md">Borrowing in one page →</a>
