# The Shape of Data

<div class="one-sentence">
  If you only remember one thing: <strong>Rust has two ways to hold data together — a <code>struct</code> when you need "all of these at once", and an <code>enum</code> when you need "exactly one of these".</strong>
</div>

## Structs: one record with named fields

A struct is a named bag of fields.

```rust
struct User {
    name: String,
    age: u32,
    active: bool,
}

fn main() {
    let ada = User {
        name: String::from("Ada"),
        age: 36,
        active: true,
    };

    println!("{} is {}", ada.name, ada.age);
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=struct%20User%20%7B%0A%20%20%20%20name%3A%20String%2C%0A%20%20%20%20age%3A%20u32%2C%0A%20%20%20%20active%3A%20bool%2C%0A%7D%0A%0Afn%20main%28%29%20%7B%0A%20%20%20%20let%20ada%20%3D%20User%20%7B%0A%20%20%20%20%20%20%20%20name%3A%20String%3A%3Afrom%28%22Ada%22%29%2C%0A%20%20%20%20%20%20%20%20age%3A%2036%2C%0A%20%20%20%20%20%20%20%20active%3A%20true%2C%0A%20%20%20%20%7D%3B%0A%0A%20%20%20%20println%21%28%22%7B%7D%20is%20%7B%7D%22%2C%20ada.name%2C%20ada.age%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

<div class="eli5">
  <div class="eli5__head">Plain English</div>
  <p>A struct is a Python dict with the keys decided up front and the compiler enforcing that you did not forget one or misspell one. It is a TypeScript <code>interface</code> but the fields actually exist in memory.</p>
</div>

A struct lays out its fields contiguously in memory. Fast to access, zero hidden allocations, exactly the size of its parts plus any padding the CPU needs.

## Enums: exactly one of the listed options

```rust
enum Status {
    Online,
    Offline,
    Busy,
}
```

That enum says: a `Status` is one of those three, and the compiler will never let it be anything else.

Rust enums go further than C enums — each variant can carry data of its own:

```rust
enum Event {
    Click { x: i32, y: i32 },
    KeyPress(char),
    Disconnect,
}
```

A `Click` carries two coordinates. A `KeyPress` carries one character. A `Disconnect` carries nothing. But an `Event` is always one of those three, never two of them, never none.

<figure class="visual-figure" style="--chapter-accent: var(--trait);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">Two shapes</div>
      <h2 class="visual-figure__title">struct = "and". enum = "or".</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 860 360" role="img" aria-label="Two diagrams. Left diagram shows a struct as one box with three stacked fields: name AND age AND active. Right diagram shows an enum as three alternative boxes: Online OR Offline OR Busy, with only one selected at a time.">
      <rect x="20" y="20" width="820" height="320" rx="24" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <text x="160" y="60" text-anchor="middle" style="font-family:var(--font-display);font-size:18px;fill:#023e8a;font-weight:bold">struct User</text>
      <rect x="60" y="80" width="200" height="220" rx="14" fill="#e6f0ff" stroke="#457b9d" stroke-width="3"></rect>
      <rect x="80" y="100" width="160" height="50" rx="8" fill="#ffffff" stroke="#457b9d"></rect>
      <text x="160" y="132" text-anchor="middle" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">name</text>
      <rect x="80" y="160" width="160" height="50" rx="8" fill="#ffffff" stroke="#457b9d"></rect>
      <text x="160" y="192" text-anchor="middle" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">age</text>
      <rect x="80" y="220" width="160" height="50" rx="8" fill="#ffffff" stroke="#457b9d"></rect>
      <text x="160" y="252" text-anchor="middle" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">active</text>
      <text x="160" y="292" text-anchor="middle" style="font-family:var(--font-display);font-size:12px;fill:#457b9d">all at once</text>
      <text x="600" y="60" text-anchor="middle" style="font-family:var(--font-display);font-size:18px;fill:#219ebc;font-weight:bold">enum Status</text>
      <rect x="400" y="80" width="140" height="70" rx="12" fill="#e0f7fa" stroke="#219ebc" stroke-width="3"></rect>
      <text x="470" y="124" text-anchor="middle" style="font-family:var(--font-code);font-size:16px;fill:#1a1a2e">Online</text>
      <rect x="560" y="80" width="140" height="70" rx="12" fill="#ffffff" stroke="#94a3b8" stroke-width="2"></rect>
      <text x="630" y="124" text-anchor="middle" style="font-family:var(--font-code);font-size:16px;fill:#94a3b8">Offline</text>
      <rect x="720" y="80" width="120" height="70" rx="12" fill="#ffffff" stroke="#94a3b8" stroke-width="2"></rect>
      <text x="780" y="124" text-anchor="middle" style="font-family:var(--font-code);font-size:16px;fill:#94a3b8">Busy</text>
      <text x="620" y="200" text-anchor="middle" style="font-family:var(--font-display);font-size:12px;fill:#219ebc">exactly one at a time</text>
      <path d="M470 165 V 200" stroke="#219ebc" stroke-width="3" fill="none"></path>
      <circle cx="470" cy="210" r="6" fill="#219ebc"></circle>
      <text x="620" y="282" text-anchor="middle" style="font-family:var(--font-code);font-size:14px;fill:#1a1a2e">let s: Status = Status::Online;</text>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">A <code>User</code> has a name <em>and</em> an age <em>and</em> a flag. A <code>Status</code> is online <em>or</em> offline <em>or</em> busy.</figcaption>
</figure>

## Matching on an enum

Once you have an enum, Rust wants you to handle every case. You do that with `match`:

```rust
enum Status {
    Online,
    Offline,
    Busy,
}

fn greet(s: Status) -> &'static str {
    match s {
        Status::Online  => "welcome back",
        Status::Offline => "see you soon",
        Status::Busy    => "do not disturb",
    }
}

fn main() {
    println!("{}", greet(Status::Online));
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=enum%20Status%20%7B%0A%20%20%20%20Online%2C%0A%20%20%20%20Offline%2C%0A%20%20%20%20Busy%2C%0A%7D%0A%0Afn%20greet%28s%3A%20Status%29%20-%3E%20%26%27static%20str%20%7B%0A%20%20%20%20match%20s%20%7B%0A%20%20%20%20%20%20%20%20Status%3A%3AOnline%20%20%3D%3E%20%22welcome%20back%22%2C%0A%20%20%20%20%20%20%20%20Status%3A%3AOffline%20%3D%3E%20%22see%20you%20soon%22%2C%0A%20%20%20%20%20%20%20%20Status%3A%3ABusy%20%20%20%20%3D%3E%20%22do%20not%20disturb%22%2C%0A%20%20%20%20%7D%0A%7D%0A%0Afn%20main%28%29%20%7B%0A%20%20%20%20println%21%28%22%7B%7D%22%2C%20greet%28Status%3A%3AOnline%29%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

If you delete a branch — say, `Busy` — Rust will refuse to compile until you handle it:

```
error[E0004]: non-exhaustive patterns: `Busy` not covered
```

That is the feature. You cannot forget a case.

<div class="analogy-card">
  <div class="analogy-card__head">Analogy</div>
  <div class="analogy-card__body">
    <p>Pattern matching on an enum is a multiple-choice question where the compiler refuses to let you turn in the test with blanks. It will tell you which blanks you left, by name.</p>
  </div>
</div>

## Tuples and arrays: the two lightweight containers

When you need a small, fixed group of values and do not want to bother naming fields, use a tuple:

```rust
let point = (3, 4);
let (x, y) = point;
println!("{x}, {y}");
```

When you need a fixed-size collection of values of the same type, use an array:

```rust
let week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
println!("{}", week[0]);
```

For a growable list, you want `Vec<T>`. We will meet `Vec` in Chapter 7.

## Methods on a struct

You attach behavior to a struct with `impl`:

```rust
struct Rect { width: f64, height: f64 }

impl Rect {
    fn area(&self) -> f64 {
        self.width * self.height
    }
}

fn main() {
    let r = Rect { width: 3.0, height: 4.0 };
    println!("{}", r.area());
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=struct%20Rect%20%7B%20width%3A%20f64%2C%20height%3A%20f64%20%7D%0A%0Aimpl%20Rect%20%7B%0A%20%20%20%20fn%20area%28%26self%29%20-%3E%20f64%20%7B%0A%20%20%20%20%20%20%20%20self.width%20*%20self.height%0A%20%20%20%20%7D%0A%7D%0A%0Afn%20main%28%29%20%7B%0A%20%20%20%20let%20r%20%3D%20Rect%20%7B%20width%3A%203.0%2C%20height%3A%204.0%20%7D%3B%0A%20%20%20%20println%21%28%22%7B%7D%22%2C%20r.area%28%29%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

`&self` is the method's way of saying "I will *look* at the struct but not take it over." You will see `&self` on almost every method you ever write. Its meaning will be the subject of the next two chapters.

## Try this

<div class="try-this">
  <div class="try-this__head">Five-minute exercises</div>
  <ol>
    <li>Define a <code>struct Book { title: String, pages: u32 }</code> and print one.</li>
    <li>Define an <code>enum Shape</code> with variants <code>Circle(f64)</code> and <code>Square(f64)</code>. Write a function <code>area(s: Shape) -&gt; f64</code> using <code>match</code>.</li>
    <li>Delete one of the <code>match</code> branches in that function. Read the error.</li>
  </ol>
</div>

Next, the idea that makes Rust Rust.

<a href="04-ownership-in-one-page.md">Ownership in one page →</a>
