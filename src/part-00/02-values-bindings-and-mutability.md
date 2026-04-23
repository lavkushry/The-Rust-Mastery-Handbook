# Values, Names, and the "let" Word

<div class="ferris-says">
<p>In Python, <code>x = 3</code> is a variable. In Rust, <code>let x = 3;</code> is a <em>binding</em>. Different word, and the difference matters. A "variable" implies something that will vary. A "binding" is a name attached to a value — and by default that value will not change. Rust flipped the default on purpose. I will show you why in a minute.</p>
</div>

<div class="one-sentence">
  If you only remember one thing: <strong>in Rust, a name points at a value, and that value does not change unless you wrote <code>mut</code> on purpose.</strong>
</div>

## Naming a value

You give a value a name with `let`:

```rust
fn main() {
    let age = 30;
    println!("age is {age}");
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20main%28%29%20%7B%0A%20%20%20%20let%20age%20%3D%2030%3B%0A%20%20%20%20println%21%28%22age%20is%20%7Bage%7D%22%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

Reading: "let `age` be `30`". The arrow only goes one way. `age` is *bound to* `30`. The binding is the important word.

Now try to change it:

```rust
fn main() {
    let age = 30;
    age = 31; // won't compile
    println!("age is {age}");
}
```

Rust will refuse to compile this. The error is short and clear:

```
error[E0384]: cannot assign twice to immutable variable `age`
```

## Why "immutable by default"

<figure class="visual-figure" style="--chapter-accent: var(--borrow-shared);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">The binding card</div>
      <h2 class="visual-figure__title"><code>let</code> vs <code>let mut</code></h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 720 320" role="img" aria-label="Two cards. Left card titled let showing a locked padlock over a value. Right card titled let mut showing an unlocked padlock over a value that can be rewritten.">
      <rect x="20" y="20" width="680" height="280" rx="24" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <rect x="60" y="60" width="280" height="200" rx="16" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3"></rect>
      <text x="200" y="100" text-anchor="middle" style="font-family:var(--font-code);font-size:20px;fill:#475569">let age = 30;</text>
      <path d="M175 140 h 50 v -12 a 25 25 0 1 0 -50 0 v 12" stroke="#d62828" stroke-width="3" fill="none"></path>
      <rect x="170" y="140" width="60" height="40" rx="6" fill="#d62828"></rect>
      <text x="200" y="220" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#475569">locked. you cannot write to it.</text>
      <rect x="380" y="60" width="280" height="200" rx="16" fill="#fff5eb" stroke="#f4a261" stroke-width="3"></rect>
      <text x="520" y="100" text-anchor="middle" style="font-family:var(--font-code);font-size:20px;fill:#b45309">let mut age = 30;</text>
      <path d="M495 140 h 50 v -12 a 25 25 0 1 0 -50 0" stroke="#f4a261" stroke-width="3" fill="none"></path>
      <rect x="490" y="140" width="60" height="40" rx="6" fill="#f4a261"></rect>
      <text x="520" y="220" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#b45309">unlocked. <tspan style="font-weight:bold">age = 31;</tspan> will work.</text>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">Immutable is the default. Mutability is something you have to ask for, in writing.</figcaption>
</figure>

Every language eventually learns the same lesson: the bugs that are hardest to find are the ones where a value changed somewhere you were not looking. Rust's answer is "fine, then values do not change unless you explicitly say so." You opt in with `mut`:

```rust
fn main() {
    let mut age = 30;
    age = 31;
    println!("age is {age}");
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20main%28%29%20%7B%0A%20%20%20%20let%20mut%20age%20%3D%2030%3B%0A%20%20%20%20age%20%3D%2031%3B%0A%20%20%20%20println%21%28%22age%20is%20%7Bage%7D%22%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>In JavaScript <code>const</code> and <code>let</code>, it's the <em>exception</em> that something should not change. In Rust, it's the <em>rule</em>. You write <code>mut</code> only when you actually need to change the value, which turns out to be less often than you think.</p>
</div>

## Types are usually inferred

Notice we did not write a type for `age`. Rust looked at `30` and decided `age` is an `i32` — a 32-bit signed integer. You can spell it out when you want:

```rust
let age: u8 = 30;       // 0..=255
let price: f64 = 9.99;  // a double-precision float
let name: &str = "Ada"; // borrowed string slice
let ok: bool = true;
```

The types you will see in the first month:

- **Integers:** `i8 i16 i32 i64 i128` (signed), `u8 u16 u32 u64 u128` (unsigned). Default: `i32`.
- **Floats:** `f32`, `f64`. Default: `f64`.
- **Booleans:** `bool`.
- **Characters:** `char` — one Unicode scalar, written `'a'`.
- **Strings:** `&str` (a borrowed view of text) and `String` (an owned, growable string). We will make this distinction real in Chapter 5.

## Shadowing: a reused name, not a changed value

This compiles, and it is a common Rust pattern:

```rust
fn main() {
    let spaces = "   ";
    let spaces = spaces.len();
    println!("{spaces}");
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20main%28%29%20%7B%0A%20%20%20%20let%20spaces%20%3D%20%22%20%20%20%22%3B%0A%20%20%20%20let%20spaces%20%3D%20spaces.len%28%29%3B%0A%20%20%20%20println%21%28%22%7Bspaces%7D%22%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

`spaces` was a string. Now, by a second `let`, it is a number. The old binding is shadowed by the new one. No value was mutated — a new binding just took the name.

<div class="analogy-card">
  <div class="analogy-card__head">Analogy</div>
  <div class="analogy-card__body">
    <p>Imagine a whiteboard label. <code>let mut</code> is a label on a <em>slot</em>: you can replace what is in the slot. Shadowing is the label itself moving to a <em>new slot</em>. The old slot is still there, you just stopped caring about it.</p>
  </div>
</div>

## wordc, step 2

Back to our through-line. Open `wordc/src/main.rs` and add a binding for the file we will eventually read:

```rust
fn main() {
    let path = "sample.txt";
    println!("wordc will count words in: {path}");
}
```

Run it. The point is small — you have used `let` for real code, not a toy example.

<div class="ferris-says" data-variant="insight">
<p>Did you notice? <code>path</code> is a <code>&str</code> (a "string slice"), not a <code>String</code>. String literals in Rust are always <code>&str</code>. We will meet the difference in chapter 5. For now just see that Rust inferred the type — you did not have to declare it.</p>
</div>

## Try this

<div class="try-this">
  <div class="try-this__head">Three-minute exercises</div>
  <ol>
    <li>Make a <code>let mut counter = 0;</code>, then increment it three times, then print it.</li>
    <li>Make an immutable <code>let pi: f64 = 3.14;</code> and try to change it. Read the error carefully.</li>
    <li>Use shadowing to change <code>let age = "30";</code> into a number, using <code>let age: u32 = age.parse().unwrap();</code> Run it.</li>
  </ol>
</div>

## Check yourself

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quiz — 1 of 1</span><span>Bindings</span></div>
  <p class="quiz__q">Which of these compiles and runs without error?</p>
  <ul class="quiz__options">
    <li><code>let x = 5; x = 6; println!("{x}");</code></li>
    <li><code>let mut x = 5; x = 5; println!("{x}");</code> (yes, the second <code>=</code> is a no-op but still legal)</li>
    <li><code>let mut x = 5; x = 6; println!("{x}");</code></li>
    <li>Both B and C.</li>
  </ul>
  <div class="quiz__explain">Correct — both B and C compile. Rust's rule is: you can reassign to a binding <em>only</em> if it was declared with <code>let mut</code>. Reassigning the same value back to itself is pointless but legal. Option A fails because <code>let x = 5</code> without <code>mut</code> is immutable — the second line is a compile error.</div>
  <div class="quiz__explain quiz__explain--wrong">Re-read the first code block in the chapter. Which version allows reassignment?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

Next: the four shapes every Rust program uses to organize data — struct, enum, tuple, array.

<a href="03-the-shape-of-data.md">The shape of data →</a>
