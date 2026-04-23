# Ownership in One Page

<div class="chapter-scene">
<svg viewBox="0 0 960 360" role="img" aria-label="Scene: a library counter. Ada holds a single library book. Ben stands to the side, not yet holding the book. A librarian behind the counter watches. Three labelled doors above: OWN, MOVE, DROP.">
  <defs>
    <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fef7e6"></stop>
      <stop offset="1" stop-color="#f4e4b2"></stop>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="960" height="360" fill="url(#floor)"></rect>
  <!-- three framed scene captions -->
  <g font-family="Georgia, serif" font-weight="700">
    <rect x="40" y="20" width="260" height="40" rx="8" fill="#023e8a"></rect>
    <text x="170" y="46" text-anchor="middle" fill="#fff" font-size="16">1. OWN — Ada has the book</text>
    <rect x="350" y="20" width="260" height="40" rx="8" fill="#f4a261"></rect>
    <text x="480" y="46" text-anchor="middle" fill="#fff" font-size="16">2. MOVE — Ada hands it to Ben</text>
    <rect x="660" y="20" width="260" height="40" rx="8" fill="#2d6a4f"></rect>
    <text x="790" y="46" text-anchor="middle" fill="#fff" font-size="16">3. DROP — Ben leaves, book returned</text>
  </g>
  <!-- counter line -->
  <rect x="40" y="300" width="880" height="12" fill="#c2a36f"></rect>
  <!-- scene 1: Ada holds the book -->
  <g transform="translate(120,150)">
    <circle cx="0" cy="0" r="28" fill="#f4c7a3" stroke="#8a4b2a" stroke-width="2"></circle>
    <text x="0" y="5" text-anchor="middle" font-family="Georgia" font-weight="700" font-size="16" fill="#1a1a2e">Ada</text>
    <rect x="-55" y="40" width="40" height="55" rx="3" fill="#d62828" stroke="#1a1a2e" stroke-width="2"></rect>
    <text x="-35" y="70" text-anchor="middle" font-family="Georgia" font-size="9" fill="#fff">book</text>
    <text x="0" y="130" text-anchor="middle" font-family="Menlo, monospace" font-size="12" fill="#023e8a">let ada = book;</text>
  </g>
  <!-- scene 2: arrow moving book -->
  <g transform="translate(430,150)">
    <circle cx="0" cy="0" r="28" fill="#f4c7a3" stroke="#8a4b2a" stroke-width="2" opacity="0.55"></circle>
    <text x="0" y="5" text-anchor="middle" font-family="Georgia" font-size="16" fill="#1a1a2e" opacity="0.55">Ada</text>
    <text x="0" y="32" text-anchor="middle" font-family="Georgia" font-size="10" fill="#b91c1c">(no book)</text>
    <path d="M 40 60 Q 80 20 130 60" fill="none" stroke="#f4a261" stroke-width="4" stroke-linecap="round" marker-end="url(#arr)"></path>
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
        <path d="M0 0 L 10 5 L 0 10 z" fill="#f4a261"></path>
      </marker>
    </defs>
    <rect x="65" y="30" width="30" height="42" rx="3" fill="#d62828" stroke="#1a1a2e" stroke-width="2"></rect>
    <circle cx="160" cy="0" r="28" fill="#f4c7a3" stroke="#8a4b2a" stroke-width="2"></circle>
    <text x="160" y="5" text-anchor="middle" font-family="Georgia" font-weight="700" font-size="16" fill="#1a1a2e">Ben</text>
    <text x="80" y="130" text-anchor="middle" font-family="Menlo, monospace" font-size="12" fill="#023e8a">let ben = ada;</text>
  </g>
  <!-- scene 3: book dropped -->
  <g transform="translate(770,150)">
    <circle cx="0" cy="0" r="28" fill="#f4c7a3" stroke="#8a4b2a" stroke-width="2" opacity="0.35"></circle>
    <text x="0" y="5" text-anchor="middle" font-family="Georgia" font-size="13" fill="#1a1a2e" opacity="0.5">Ben left</text>
    <rect x="-20" y="40" width="40" height="55" rx="3" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"></rect>
    <line x1="-25" y1="40" x2="25" y2="95" stroke="#94a3b8" stroke-width="2.5"></line>
    <line x1="25" y1="40" x2="-25" y2="95" stroke="#94a3b8" stroke-width="2.5"></line>
    <text x="0" y="130" text-anchor="middle" font-family="Menlo, monospace" font-size="12" fill="#2d6a4f">// end of scope → drop(ben)</text>
  </g>
</svg>
<p class="chapter-scene__caption">The whole of Rust ownership in one picture. We are about to earn that picture.</p>
</div>

<div class="one-sentence">
  If you only remember one thing: <strong>every value in Rust has exactly one owner, and when the owner leaves scope the value is freed — automatically, at a time you can predict.</strong>
</div>

<div class="ferris-says" data-variant="insight">
<p>This is the chapter that gave Rust its reputation as "hard". It is not hard. It is <em>different</em>. You are about to learn the one idea that separates Rust from Python, JavaScript, Java, Go, and basically every other language you have touched. Read slowly. I will be here.</p>
</div>

## The three rules

<div class="analogy-card">
  <div class="analogy-card__head">Ownership, three lines</div>
  <div class="analogy-card__body">
    <ol>
      <li><strong>Every value has exactly one owner.</strong></li>
      <li><strong>When the owner goes out of scope, the value is dropped.</strong></li>
      <li><strong>Ownership can be moved, not duplicated.</strong></li>
    </ol>
    <p>Three rules. Infinite consequences. The rest of this chapter is just re-explaining the same three rules four different ways until they feel obvious.</p>
  </div>
</div>

## The library-card analogy

A library in our town has exactly one physical copy of *The Rust Book*. Ada checks it out — now Ada owns the loan. Ada bumps into Ben, who also wants to read it. There are three things Ada can do:

1. Refuse. Ben waits.
2. Hand her loan to Ben. Now Ben is the borrower of record. Ada can no longer claim the book — the librarian has it in Ben's name.
3. Photocopy the book. Now each of them has their own copy. (Expensive. The library charges per page.)

<div class="ferris-says">
<p>Keep this picture close. Rust's "move" is option 2. Rust's "clone" is option 3. Rust <em>never</em> silently does option 3 for you, because photocopies are expensive — and pretending they are free is how other languages end up slow. You always choose.</p>
</div>

## The rules in code

```rust
fn main() {
    let ada = String::from("The Rust Book"); // Ada checks out the book
    let ben = ada;                            // Ada hands it to Ben
    println!("{ben}");                        // Ben reads it — fine
    // println!("{ada}");                     // ERROR: Ada no longer has the book
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20main%28%29%20%7B%0A%20%20%20%20let%20ada%20%3D%20String%3A%3Afrom%28%22The%20Rust%20Book%22%29%3B%0A%20%20%20%20let%20ben%20%3D%20ada%3B%0A%20%20%20%20println%21%28%22%7Bben%7D%22%29%3B%0A%20%20%20%20%2F%2F%20println%21%28%22%7Bada%7D%22%29%3B%20%20%20%20%2F%2F%20uncomment%20to%20see%20the%20error%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

Uncomment the last `println!` and the compiler will say, to your face:

```text
error[E0382]: borrow of moved value: `ada`
 --> src/main.rs:5:15
  |
2 |     let ada = String::from("The Rust Book");
  |         --- move occurs because `ada` has type `String`, which does not implement the `Copy` trait
3 |     let ben = ada;
  |               --- value moved here
4 |     println!("{ben}");
5 |     println!("{ada}");
  |               ^^^ value borrowed here after move
```

<div class="ferris-says" data-variant="insight">
<p>Look at that error. It is a short novel. It tells you the line where the move happened, the line that broke the rule, and <em>why</em> — <code>String</code> does not implement <code>Copy</code>, so it moved. The Rust compiler is the most patient, explicit teacher you will ever have. Read the errors out loud. They tell you exactly what is going on.</p>
</div>

## Move, step by step

<div class="step-through" tabindex="0">
  <div class="step-through__stage">

<div class="step-through__frame is-active" aria-label="Frame 1 of 4">
<svg viewBox="0 0 640 200" role="img" aria-label="Frame 1. A single slot labelled ada holds a pointer to heap data containing the string 'rustbook'.">
<rect x="0" y="0" width="640" height="200" fill="#fffdf8"></rect>
<rect x="60" y="60" width="160" height="80" rx="6" fill="#e6f0ff" stroke="#023e8a" stroke-width="2"></rect>
<text x="140" y="48" text-anchor="middle" font-family="Menlo, monospace" font-size="14" fill="#023e8a">stack</text>
<text x="140" y="90" text-anchor="middle" font-family="Menlo, monospace" font-size="16" fill="#1a1a2e">ada:</text>
<text x="140" y="118" text-anchor="middle" font-family="Menlo, monospace" font-size="13" fill="#023e8a">ptr, len=8, cap=8</text>
<rect x="380" y="60" width="200" height="80" rx="6" fill="#fff5eb" stroke="#c2410c" stroke-width="2"></rect>
<text x="480" y="48" text-anchor="middle" font-family="Menlo, monospace" font-size="14" fill="#c2410c">heap</text>
<text x="480" y="105" text-anchor="middle" font-family="Menlo, monospace" font-size="17" fill="#1a1a2e">"rustbook"</text>
<path d="M 220 100 L 380 100" stroke="#023e8a" stroke-width="2.5" marker-end="url(#arr1)"></path>
<defs><marker id="arr1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L 10 5 L 0 10 z" fill="#023e8a"></path></marker></defs>
<text x="320" y="180" text-anchor="middle" font-family="Georgia" font-size="13" fill="#475569">let ada = String::from("rustbook");</text>
</svg>
</div>

<div class="step-through__frame" aria-label="Frame 2 of 4">
<svg viewBox="0 0 640 200" role="img" aria-label="Frame 2. A second slot labelled ben is added next to ada. Both point at the same heap data, but a red dashed line crosses out ada.">
<rect x="0" y="0" width="640" height="200" fill="#fffdf8"></rect>
<rect x="40" y="60" width="150" height="80" rx="6" fill="#e6f0ff" stroke="#023e8a" stroke-width="2" opacity="0.4"></rect>
<text x="115" y="48" text-anchor="middle" font-family="Menlo, monospace" font-size="14" fill="#023e8a" opacity="0.5">stack (ada)</text>
<text x="115" y="90" text-anchor="middle" font-family="Menlo, monospace" font-size="16" fill="#1a1a2e" opacity="0.45">ada:</text>
<text x="115" y="118" text-anchor="middle" font-family="Menlo, monospace" font-size="12" fill="#023e8a" opacity="0.45">ptr, len=8, cap=8</text>
<line x1="40" y1="60" x2="190" y2="140" stroke="#b91c1c" stroke-width="3"></line>
<line x1="190" y1="60" x2="40" y2="140" stroke="#b91c1c" stroke-width="3"></line>
<rect x="210" y="60" width="150" height="80" rx="6" fill="#e6f0ff" stroke="#023e8a" stroke-width="2.5"></rect>
<text x="285" y="48" text-anchor="middle" font-family="Menlo, monospace" font-size="14" fill="#023e8a">stack (ben)</text>
<text x="285" y="90" text-anchor="middle" font-family="Menlo, monospace" font-size="16" fill="#1a1a2e">ben:</text>
<text x="285" y="118" text-anchor="middle" font-family="Menlo, monospace" font-size="12" fill="#023e8a">ptr, len=8, cap=8</text>
<rect x="410" y="60" width="180" height="80" rx="6" fill="#fff5eb" stroke="#c2410c" stroke-width="2"></rect>
<text x="500" y="48" text-anchor="middle" font-family="Menlo, monospace" font-size="14" fill="#c2410c">heap</text>
<text x="500" y="105" text-anchor="middle" font-family="Menlo, monospace" font-size="17" fill="#1a1a2e">"rustbook"</text>
<path d="M 360 100 L 410 100" stroke="#023e8a" stroke-width="2.5" marker-end="url(#arr2)"></path>
<defs><marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L 10 5 L 0 10 z" fill="#023e8a"></path></marker></defs>
<text x="320" y="180" text-anchor="middle" font-family="Georgia" font-size="13" fill="#475569">let ben = ada;   // pointer copied. ada is now dead.</text>
</svg>
</div>

<div class="step-through__frame" aria-label="Frame 3 of 4">
<svg viewBox="0 0 640 200" role="img" aria-label="Frame 3. Only ben remains, pointing at the heap data unchanged. The string is printed.">
<rect x="0" y="0" width="640" height="200" fill="#fffdf8"></rect>
<rect x="120" y="60" width="160" height="80" rx="6" fill="#e6f0ff" stroke="#023e8a" stroke-width="2.5"></rect>
<text x="200" y="48" text-anchor="middle" font-family="Menlo, monospace" font-size="14" fill="#023e8a">stack</text>
<text x="200" y="90" text-anchor="middle" font-family="Menlo, monospace" font-size="16" fill="#1a1a2e">ben:</text>
<text x="200" y="118" text-anchor="middle" font-family="Menlo, monospace" font-size="13" fill="#023e8a">ptr, len=8, cap=8</text>
<rect x="380" y="60" width="200" height="80" rx="6" fill="#fff5eb" stroke="#c2410c" stroke-width="2"></rect>
<text x="480" y="48" text-anchor="middle" font-family="Menlo, monospace" font-size="14" fill="#c2410c">heap</text>
<text x="480" y="105" text-anchor="middle" font-family="Menlo, monospace" font-size="17" fill="#1a1a2e">"rustbook"</text>
<path d="M 280 100 L 380 100" stroke="#023e8a" stroke-width="2.5" marker-end="url(#arr3)"></path>
<defs><marker id="arr3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L 10 5 L 0 10 z" fill="#023e8a"></path></marker></defs>
<text x="320" y="180" text-anchor="middle" font-family="Georgia" font-size="13" fill="#475569">println!("{ben}");   // prints: rustbook</text>
</svg>
</div>

<div class="step-through__frame" aria-label="Frame 4 of 4">
<svg viewBox="0 0 640 200" role="img" aria-label="Frame 4. End of scope. The stack slot is gone; the heap data is gone; memory is freed automatically.">
<rect x="0" y="0" width="640" height="200" fill="#fffdf8"></rect>
<rect x="120" y="60" width="160" height="80" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 5"></rect>
<text x="200" y="105" text-anchor="middle" font-family="Georgia" font-size="14" fill="#94a3b8">(gone)</text>
<rect x="380" y="60" width="200" height="80" rx="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 5"></rect>
<text x="480" y="105" text-anchor="middle" font-family="Georgia" font-size="14" fill="#94a3b8">(freed)</text>
<text x="320" y="180" text-anchor="middle" font-family="Georgia" font-size="13" fill="#2d6a4f">} // end of scope → drop(ben) → free heap. no GC involved.</text>
</svg>
</div>

  </div>
  <div class="step-through__controls">
    <button type="button" data-step-prev aria-label="Previous step">◀ prev</button>
    <span class="step-through__progress" aria-live="polite">1 / 4</span>
    <button type="button" data-step-next aria-label="Next step">next ▶</button>
  </div>
</div>

<div class="ferris-says">
<p>Tap <strong>next</strong>. Walk through the four frames. Notice that in frame 2, <em>only the pointer got copied</em> — not the "rustbook" bytes on the heap. That is why Rust's move is cheap. That is also why it is a move and not a copy: if both <code>ada</code> and <code>ben</code> pointed at the same heap, and then both tried to free it at end of scope, you would have a double-free bug. Rust makes that impossible by declaring <code>ada</code> dead the instant <code>ben</code> takes over.</p>
</div>

## Copy vs Move — which does what?

Not every value moves on assignment. Some values are so cheap that Rust just copies the bits and moves on. These types implement the `Copy` trait.

<figure class="visual-figure" style="--chapter-accent: var(--ownership);">
  <div class="visual-figure__header">
    <div>
      <div class="visual-figure__eyebrow">A rule of thumb</div>
      <h2 class="visual-figure__title">Plain numbers <em>copy</em>. Anything that owns memory <em>moves</em>.</h2>
    </div>
  </div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 960 280" role="img" aria-label="Two columns. Left column labelled Copy lists: i32, u64, f64, bool, char, small fixed tuples. Right column labelled Move lists: String, Vec, HashMap, File, TcpStream, anything that owns a resource.">
      <rect x="0" y="0" width="960" height="280" rx="18" fill="#fffdf8" stroke="rgba(2,62,138,0.16)"></rect>
      <rect x="30" y="30" width="440" height="220" rx="14" fill="#e0fbe0" stroke="#2d6a4f" stroke-width="2.5"></rect>
      <text x="250" y="70" text-anchor="middle" font-family="Georgia" font-weight="700" font-size="22" fill="#14532d">Copy — bits duplicated</text>
      <text x="250" y="100" text-anchor="middle" font-family="Georgia" font-size="15" fill="#166534">"small, self-contained, no heap"</text>
      <text x="250" y="145" text-anchor="middle" font-family="Menlo, monospace" font-size="16" fill="#14532d">i8 i16 i32 i64 i128 isize</text>
      <text x="250" y="170" text-anchor="middle" font-family="Menlo, monospace" font-size="16" fill="#14532d">u8 u16 u32 u64 u128 usize</text>
      <text x="250" y="195" text-anchor="middle" font-family="Menlo, monospace" font-size="16" fill="#14532d">f32 f64  bool  char</text>
      <text x="250" y="220" text-anchor="middle" font-family="Menlo, monospace" font-size="14" fill="#14532d">&amp;T  (a shared reference)</text>
      <rect x="490" y="30" width="440" height="220" rx="14" fill="#fff5eb" stroke="#c2410c" stroke-width="2.5"></rect>
      <text x="710" y="70" text-anchor="middle" font-family="Georgia" font-weight="700" font-size="22" fill="#9a3412">Move — ownership transferred</text>
      <text x="710" y="100" text-anchor="middle" font-family="Georgia" font-size="15" fill="#b45309">"owns memory / file / socket"</text>
      <text x="710" y="145" text-anchor="middle" font-family="Menlo, monospace" font-size="16" fill="#9a3412">String   Vec&lt;T&gt;   Box&lt;T&gt;</text>
      <text x="710" y="170" text-anchor="middle" font-family="Menlo, monospace" font-size="16" fill="#9a3412">HashMap&lt;K,V&gt;   BTreeMap&lt;K,V&gt;</text>
      <text x="710" y="195" text-anchor="middle" font-family="Menlo, monospace" font-size="16" fill="#9a3412">File   TcpStream   Mutex&lt;T&gt;</text>
      <text x="710" y="220" text-anchor="middle" font-family="Menlo, monospace" font-size="14" fill="#9a3412">any type you define by default</text>
    </svg>
  </div>
</figure>

```rust
fn main() {
    let a: i32 = 7;   // plain integer
    let b = a;        // a was copied. both a and b are usable.
    println!("{a} {b}");   // prints: 7 7

    let x = String::from("rust");
    let y = x;        // x was moved. only y is usable.
    println!("{y}");
    // println!("{x}");  // ERROR: borrow of moved value
}
```

<p class="playground-run"><a href="https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&code=fn%20main%28%29%20%7B%0A%20%20%20%20let%20a%3A%20i32%20%3D%207%3B%0A%20%20%20%20let%20b%20%3D%20a%3B%0A%20%20%20%20println%21%28%22%7Ba%7D%20%7Bb%7D%22%29%3B%0A%0A%20%20%20%20let%20x%20%3D%20String%3A%3Afrom%28%22rust%22%29%3B%0A%20%20%20%20let%20y%20%3D%20x%3B%0A%20%20%20%20println%21%28%22%7By%7D%22%29%3B%0A%7D" target="_blank" rel="noopener">▶ Run this in the Rust Playground</a></p>

<div class="ferris-says" data-variant="warning">
<p>"Copy" in Rust is <em>not</em> the same as "copy" in Python or Java. In Python, <code>b = a</code> when <code>a</code> is a list gives you two names for the same list — mutations via <code>b</code> show up in <code>a</code>. In Rust, <code>b = a</code> on a <code>Copy</code> type gives you two independent values. On a non-<code>Copy</code> type, Rust refuses to give you two names for the same value at all — it moves ownership instead. No aliasing by accident. Ever.</p>
</div>

## Scope: where "the owner leaves" means

Every `{ ... }` block is a scope. When execution exits the block, every owner declared inside gets dropped in reverse order. "Dropped" means:

- stack memory reclaimed (free, always)
- `drop(self)` runs if the type has a destructor — which for `String`, `Vec`, `File`, etc. means "release the heap / file / socket you own"

```rust
fn main() {
    {
        let note = String::from("temporary");
        println!("{note}");
    }   // note is dropped HERE. Heap bytes freed. Deterministic.
    // println!("{note}");   // ERROR: note is not in scope
}
```

<div class="ferris-says" data-variant="insight">
<p>This is the biggest difference between Rust and garbage-collected languages. In Python or Java, you never know <em>when</em> a value is freed — the garbage collector decides, usually "whenever it feels like it". In Rust the lifetime of a value is <strong>visible in the source code</strong>. You can look at a function and know, to the line, when each value dies. That is what makes Rust predictable under load.</p>
</div>

## Check yourself

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quiz — 1 of 1</span><span>Ownership</span></div>
  <p class="quiz__q">Given this code, which line is the <em>first</em> the Rust compiler will reject?</p>

```text
1.  let a = String::from("rust");
2.  let b = a;
3.  println!("{b}");
4.  println!("{a}");
```

  <ul class="quiz__options">
    <li>Line 1 — you cannot create a <code>String</code> with <code>String::from</code>.</li>
    <li>Line 2 — you cannot assign a <code>String</code> to another binding.</li>
    <li>Line 4 — <code>a</code> was moved into <code>b</code> on line 2, so <code>a</code> no longer holds a value.</li>
    <li>None of them — the program compiles and runs.</li>
  </ul>
  <div class="quiz__explain">Correct. Line 2 is the <em>move</em>. The compiler does not complain about the move itself — moves are legal. It only complains when you try to <em>use</em> the moved-from binding, which is what line 4 does. The error: <code>borrow of moved value: &lsquo;a&rsquo;</code>.</div>
  <div class="quiz__explain quiz__explain--wrong">Not quite. Remember: moves are legal, <em>using a moved-from binding</em> is not. Look for the first line that tries to use <code>a</code> after it was handed to <code>b</code>.</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

## Try this

<div class="try-this">
  <div class="try-this__head">Five-minute exercises</div>
  <ol>
    <li>Write a program that creates a <code>String</code>, moves it into a second binding, then tries to print the first. Read the error. Write down, in your own words, what the compiler is saying.</li>
    <li>Replace the <code>String</code> with an <code>i32</code>. The program compiles. Why? (Hint: re-read the Copy vs Move section.)</li>
    <li>Define your own struct <code>struct Note(String)</code> and pass an instance into a function that takes <code>Note</code>. Then try to use it after the call. Does it move? What does the error say?</li>
  </ol>
</div>

<div class="ferris-says">
<p>You now understand ownership. Seriously. If you followed the library-card analogy, watched the four-frame animation, and read one real compiler error, you have it. The rest of the book is reinforcement and edge cases. Onward — to borrowing, the half of the story where we stop moving values and start <em>lending</em> them.</p>
</div>

<a href="05-borrowing-in-one-page.md">Borrowing in One Page →</a>
