# Chapter 16: Ownership as Resource Management

<div class="ferris-says" data-variant="insight">
<p>Ownership is not just about memory. <em>Ownership is about every resource</em> — files, locks, network connections, GPU handles, database transactions. When you understand that, the pattern RAII (resource-acquisition-is-initialisation) stops being an acronym and starts feeling obvious. This is the chapter where Rust's design philosophy finally reveals itself.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-02/chapter-10-ownership-first-contact.md">Ch 10: Ownership</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>RAII — resource cleanup tied to scope exit</li>
      <li>Drop order (reverse declaration) and why it matters</li>
      <li>Why Rust rarely leaks resources without GC</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">35<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div>
  </div>
</div>
<div class="concept-link builds-on">
  <div class="concept-link-icon">←</div>
  <div class="concept-link-body">
    <strong>Builds on Chapter 10</strong>
    Ch 10 taught the three ownership rules. This chapter shows the engineering consequence: ownership IS resource management. Scope end IS cleanup.
    <a href="../part-02/chapter-10-ownership-first-contact.md">Revisit Ch 10 →</a>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapter 20</strong>
    Move semantics, Copy, Clone, and Drop are the four transfer events that express what ownership means at each step.
    <a href="../part-03/chapter-20-move-semantics-copy-clone-and-drop.md">Ch 20: Move/Copy/Clone/Drop →</a>
  </div>
</div>

<figure class="visual-figure" style="--chapter-accent: var(--ownership);">
  <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">RAII Lifecycle</div><h2 class="visual-figure__title">Resource Acquisition, Use, and Automatic Cleanup</h2></div></div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 560" role="img" aria-label="Vertical lifecycle of a resource in Rust compared to manual cleanup in C">
      <rect x="28" y="24" width="924" height="512" rx="28" fill="#fffdf8" stroke="rgba(230,57,70,0.18)"></rect>
      <rect x="78" y="74" width="366" height="412" rx="20" fill="#fff5f5" stroke="#d62828" stroke-width="3"></rect>
      <rect x="532" y="74" width="366" height="412" rx="20" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
      <text x="208" y="110" class="svg-subtitle" style="fill:#d62828;">Manual C lifecycle</text>
      <text x="660" y="110" class="svg-subtitle" style="fill:#2d6a4f;">Rust RAII lifecycle</text>
      <g font-family="JetBrains Mono, monospace" font-size="14">
        <rect x="122" y="144" width="278" height="52" rx="12" fill="#ffffff"></rect>
        <text x="156" y="176" class="svg-small" style="fill:#d62828;">conn = open();</text>
        <rect x="122" y="234" width="278" height="52" rx="12" fill="#ffffff"></rect>
        <text x="148" y="266" class="svg-small" style="fill:#d62828;">use(conn);</text>
        <rect x="122" y="324" width="278" height="76" rx="12" fill="#fee2e2" stroke="#d62828" stroke-width="2"></rect>
        <text x="146" y="352" class="svg-small" style="fill:#d62828;">did we close on every path?</text>
        <text x="154" y="374" class="svg-small" style="fill:#d62828;">leak / double-close / early-close risk</text>
        <path d="M260 196 v32 M260 286 v32" stroke="#d62828" stroke-width="6" marker-end="url(#raiicArrow)"></path>
        <rect x="576" y="144" width="278" height="52" rx="12" fill="#ffffff"></rect>
        <text x="620" y="176" class="svg-small" style="fill:#2d6a4f;">let conn = Connection::new();</text>
        <rect x="576" y="234" width="278" height="52" rx="12" fill="#ffffff"></rect>
        <text x="654" y="266" class="svg-small" style="fill:#2d6a4f;">use(&amp;conn);</text>
        <rect x="576" y="324" width="278" height="76" rx="12" fill="#dcfce7" stroke="#52b788" stroke-width="2"></rect>
        <text x="616" y="352" class="svg-small" style="fill:#2d6a4f;">scope ends → Drop::drop()</text>
        <text x="642" y="374" class="svg-small" style="fill:#2d6a4f;">resource closed exactly once</text>
        <path d="M714 196 v32 M714 286 v32" stroke="#52b788" stroke-width="6" marker-end="url(#raiigArrow)"></path>
      </g>
      <defs>
        <marker id="raiicArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#d62828"></path></marker>
        <marker id="raiigArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#52b788"></path></marker>
      </defs>
    </svg>
  </div>
  <figcaption class="visual-figure__caption">RAII matters because it ties cleanup to ownership instead of to developer memory. The scope boundary becomes a lifecycle boundary.</figcaption>
</figure>
<figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--drop);">
  <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Drop Order</div><h2 class="visual-figure__title">Fields Drop in Reverse Declaration Order</h2></div></div>
  <div class="visual-figure__body">
    <svg class="svg-frame" viewBox="0 0 980 420" role="img" aria-label="Stacked struct fields showing reverse declaration drop order">
      <rect x="24" y="24" width="932" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
      <rect x="116" y="76" width="308" height="268" rx="20" fill="#1f2937" stroke="#6d6875" stroke-width="3"></rect>
      <text x="188" y="112" class="svg-subtitle" style="fill:#e9e4ef;">struct Server</text>
      <rect x="156" y="140" width="228" height="48" rx="12" fill="#334155"></rect>
      <text x="176" y="170" class="svg-small" style="fill:#f8fafc;">listener: TcpListener</text>
      <rect x="156" y="202" width="228" height="48" rx="12" fill="#334155"></rect>
      <text x="176" y="232" class="svg-small" style="fill:#f8fafc;">cache: HashMap</text>
      <rect x="156" y="264" width="228" height="48" rx="12" fill="#334155"></rect>
      <text x="176" y="294" class="svg-small" style="fill:#f8fafc;">logger: Logger</text>
      <path d="M488 284 H 618" stroke="#ffbe0b" stroke-width="6" marker-end="url(#drop1)"></path>
      <path d="M488 222 H 674" stroke="#fb8500" stroke-width="6" marker-end="url(#drop2)"></path>
      <path d="M488 160 H 730" stroke="#e63946" stroke-width="6" marker-end="url(#drop3)"></path>
      <text x="636" y="290" class="svg-label" style="fill:#ffbe0b;">1. logger</text>
      <text x="692" y="228" class="svg-label" style="fill:#fb8500;">2. cache</text>
      <text x="748" y="166" class="svg-label" style="fill:#ffd9dc;">3. listener</text>
      <defs>
        <marker id="drop1" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#ffbe0b"></path></marker>
        <marker id="drop2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#fb8500"></path></marker>
        <marker id="drop3" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#e63946"></path></marker>
      </defs>
    </svg>
  </div>
</figure>

### If You Remember Only 3 Things

- Variables in Rust are not just names for data; they are deterministic resource managers.
- When an owning variable goes out of scope, Rust automatically calls the `Drop` trait, instantly freeing the memory or closing the file.
- This pattern is called RAII (Resource Acquisition Is Initialization), and it is why Rust rarely leaks resources even without a garbage collector.

## In plain English first

<div class="ferris-says" data-variant="insight">
<p>Before the systems-engineer track below, here is the same idea in three sentences. If you grok these, the rest of this chapter is just consequences.</p>
</div>

Ownership in Rust is the same idea as your library card. You check a book out (you *own* it). You can lend it to a friend who reads it (you *borrow* it out). When the loan period ends, the book goes back to the library — automatically — whether you remembered or not.

Now substitute "book" with anything that needs cleaning up: a heap allocation, an open file, a network connection, a database transaction, a GPU buffer, a held mutex. *Every* one of those resources has the same shape: acquired, used, released. Rust's word for "the binding that releases it" is **ownership**, and the language guarantees the release happens — once, deterministically, at end of scope, even if your code panics on the way out.

The acronym for this is **RAII** ("Resource Acquisition Is Initialization"). Two ways to read it: "I acquired the resource the moment I initialized the variable" (its name); or, more usefully, "the variable's lifetime *is* the resource's lifetime". The rest of this chapter shows you how that single rule lets Rust skip garbage collection and still leak nothing.

<div class="ferris-says">
<p>If you are coming from a language with <code>try { … } finally { close(); }</code> blocks, Rust does not need <code>finally</code>. Scope <em>is</em> finally — and the compiler writes the cleanup for you on every exit path.</p>
</div>

## Beginner walkthrough — every idea in this chapter, plain English

<div class="ferris-says" data-variant="insight">
<p>The "In plain English first" section gave you the three-sentence summary. This section is the full guided tour — the same content the depth track covers, only in everyday words. Read this whole section before the structured material below; it makes the depth feel like a refinement instead of a wall.</p>
</div>

### 1. Ownership is one rule, applied to everything that needs cleanup

Every value in your Rust program lives somewhere. A small one (a `u32`, a `bool`) lives directly on the stack — the chunk of memory the CPU uses for local variables. A bigger one (a `String`, a `Vec`, a network socket, a file handle) has *two* parts: a small "handle" on the stack, and the actual data somewhere else (heap memory, an open file descriptor, a port).

The rule is: **whichever variable is the most-recent name for that handle is the *owner*.** When the owner goes out of scope (the function returns, the block ends, an early `return` fires, even a `panic!`), Rust runs cleanup automatically — frees the heap memory, closes the file, releases the socket, releases the lock. *Without* you writing the cleanup, *on every exit path*, even ones you didn't think of.

That's it. That single rule does the work of a garbage collector, a `try { } finally { }` block, a destructor, a connection pool's "release on close" — all of them — without runtime cost. The compiler emits the cleanup code at every exit point at compile time.

### 2. Why this is bigger than memory

Memory is the easy case because every program has it. The deeper insight is that the *exact same pattern* applies to every resource your program manages.

A `File` value, when it goes out of scope, calls `close()` on the underlying file descriptor. A `MutexGuard` value, when it goes out of scope, releases the mutex lock. A `tokio::sync::Semaphore::acquire()` permit, when it goes out of scope, returns the permit to the pool. A `rusqlite::Transaction`, when it goes out of scope, *rolls itself back* unless you called `.commit()`.

The acronym for this is **RAII** — "Resource Acquisition Is Initialization." Two ways to read it: "I acquired the resource when I initialized the variable" (literal); or, more useful, "the variable's lifetime *is* the resource's lifetime" (operational).

Once you have RAII, you stop needing `try`/`finally`. Scope *is* finally. You stop needing connection-pool wrapper functions. You stop needing "close in the error path or the success path?" code reviews. The resource is released when the variable holding it ends. Period.

### 3. What the code looks like in practice

You almost never *write* `Drop::drop` by hand. The standard library has already implemented `Drop` for everything you need — `String`, `Vec`, `Box`, `File`, `Mutex`, `Arc`, `Rc`, `TcpStream`. When you write `let s = String::from("hello");`, you're already opting into RAII. When `s` ends its scope, the heap buffer holding `"hello"` is freed. You did nothing extra.

When you do write a `Drop` impl, it's almost always for a custom resource — a database connection, a hardware handle, a temp directory cleanup, a metrics flush. The pattern is:

```rust,ignore
struct TempDir { path: PathBuf }

impl Drop for TempDir {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.path);
    }
}
```

That's three lines, and it guarantees the directory is removed even if the function holding the `TempDir` panics on the way out.

### 4. The drop order rule

When several owned values end at the same scope, they drop in **reverse order of declaration**:

```rust,ignore
fn run() {
    let listener = TcpListener::bind(...);
    let cache = Cache::new(...);
    let logger = Logger::new(...);

    do_work(&listener, &cache, &logger);
    // ↓ scope ends; drop order:
    //   1. logger
    //   2. cache
    //   3. listener
}
```

This is not a quirk; it's a guarantee you can rely on. If `cache` has a reference to `logger`, you write the code as above and let scope end. The logger drops *after* the cache, so the cache can flush logs on its own way out.

### 5. The single trap most beginners hit: trying to move out of a `Drop` type

Once a struct implements `Drop`, you cannot destructure it to move its fields out — the compiler refuses (E0509). The reason is that `Drop` runs as a single atomic step on the whole value; the compiler can't let you take a piece of it away and then run `Drop` on the rest. The fix is one of:

- Borrow the field instead of moving it (`&self.field` or `&mut self.field`).
- Wrap the field in `Option<T>` and use `Option::take()` to leave a `None` behind on the way out.
- Reorganise the struct so the `Drop` impl is on a smaller helper type that owns only what genuinely needs cleanup.

When you internalise this rule, your structs naturally start owning *only* what they're responsible for cleaning up — which is the deepest design lesson of the whole chapter.

<div class="ferris-says">
<p>If you got this far, you understand <em>most</em> of what makes Rust feel different from other languages. The depth content below adds the formal edges: drop-order trade-offs, the <code>ManuallyDrop</code> escape hatch, recursive type design. None of it is mysterious from here.</p>
</div>

## wordc, step 11 — packaging owned state into a `WordcSession`

<div class="ferris-says" data-variant="insight">
Up to now, <code>wordc</code>'s <code>main</code> juggled four loose values: the parsed CLI, the path, the bytes, and the count. Now we'll bundle them into a single owning struct. When the struct goes out of scope, every owned field's <code>Drop</code> runs in declaration order — for free.
</div>

So far our <code>main</code> shuffled `cli`, `bytes`, `text`, `count` around as separate locals. That's fine, but it scales poorly: when wordc grows (caching the file size, tracking how long the read took, recording the line count, building a histogram), every one of those becomes another loose binding. Ownership lets us roll the whole *session* into one struct that owns its data and cleans up on its own.

```rust
use std::fs;
use std::path::PathBuf;
use std::time::Instant;

/// Everything one invocation of wordc owns.
///
/// When the value is dropped, every owned field is dropped in
/// declaration order: started_at first (trivial), then bytes, then path.
struct WordcSession {
    path: PathBuf,
    bytes: Vec<u8>,
    started_at: Instant,
}

impl WordcSession {
    fn open(path: PathBuf) -> std::io::Result<Self> {
        let started_at = Instant::now();
        let bytes = fs::read(&path)?;
        Ok(Self { path, bytes, started_at })
    }

    fn count_words(&self, min_len: usize) -> usize {
        let text = std::str::from_utf8(&self.bytes).unwrap_or("");
        text.split_whitespace()
            .filter(|w| w.chars().count() >= min_len)
            .count()
    }
}

impl Drop for WordcSession {
    fn drop(&mut self) {
        let elapsed = self.started_at.elapsed();
        eprintln!(
            "wordc: {} closed after {:.3?}",
            self.path.display(),
            elapsed,
        );
    }
}
```

`WordcSession` is now a *resource* in the RAII sense: constructing one acquires the file's bytes; dropping one prints a trace and frees them. Notice we never wrote a `close()` method — the language has one already, spelled "end of scope".

```rust
fn main() -> std::io::Result<()> {
    let session = WordcSession::open(PathBuf::from("notes.txt"))?;
    println!("{} has {} words.", session.path.display(), session.count_words(1));
    Ok(())
    // <-- session dropped here; bytes freed; trace printed.
}
```

<div class="ferris-says">
Try this: add a second <code>WordcSession</code> below the first inside <code>main</code>. Run it. The drop messages print in <em>reverse</em> order — last constructed, first dropped. That's a stack of owned resources, automatically unwound.
</div>

### What ownership bought us

- `bytes: Vec<u8>` is owned by the session. When the session ends, the heap allocation goes back to the allocator. No `free()`, no `drop_bytes()` method.
- `path: PathBuf` is owned. We could pass `&Path` everywhere instead, but owning it inside the session means callers don't need to keep their own copy alive.
- `Drop` runs *every* time the session ends — early return on `?`, panic, normal flow. There is no path through the function where the file's bytes leak.

This is why Rust does not need `try`/`finally`. The compiler emits the cleanup code at every exit, so you can't forget it.

### Recommended Reading

- [Rustonomicon: Ownership and Lifetimes](https://doc.rust-lang.org/nomicon/ownership.html)
- [Rust Book: The Drop Trait](https://doc.rust-lang.org/book/ch15-03-drop.html)
- Codebase study: Look at how `std::fs::File` implements `Drop` to automatically close file handles.

## Readiness Check - Ownership Mastery

Use this quick rubric before moving on. Aim for at least Level 2 in each row.

| Skill                              | Level 0                          | Level 1                             | Level 2                                                | Level 3                                                    |
| ---------------------------------- | -------------------------------- | ----------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- |
| Explain ownership in plain English | I repeat rules only              | I explain one-owner cleanup         | I connect ownership to resource lifecycle              | I can predict cleanup/transfer behavior in unfamiliar code |
| Spot ownership bugs in code        | I rely on compiler messages only | I can identify moved-value mistakes | I can refactor to remove accidental moves              | I can redesign APIs to avoid ownership friction            |
| Reason about Drop and scope end    | I treat Drop as magic            | I know scope end triggers cleanup   | I can explain reverse drop order and RAII implications | I can design deterministic teardown for complex structs    |

If you are below Level 2 in any row, revisit the code reading drills in this chapter and Drill Deck 1.

## Compiler Error Decoder - RAII and Drop

| Error code | What it usually means                              | Typical fix direction                                         |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------- |
| E0382      | Value used after move during resource flow         | Pass by reference when ownership transfer is not intended     |
| E0509      | Tried to move out of a type that implements `Drop` | Borrow fields or redesign ownership boundaries for extraction |
| E0040      | Attempted to call `Drop::drop` directly            | Use `drop(value)` and let Rust enforce one-time teardown      |

If your cleanup logic feels complicated, model it as ownership transitions first, then encode it in API boundaries.

## Check yourself

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quiz — 1 of 2</span><span>RAII</span></div>
  <p class="quiz__q">In Rust, what is the relationship between a <code>File</code> value and the underlying OS file descriptor?</p>
  <ul class="quiz__options">
    <li>The file descriptor is leaked unless you call <code>file.close()</code> manually.</li>
    <li>A background thread polls unused <code>File</code>s and closes them periodically.</li>
    <li>When the <code>File</code> goes out of scope, its <code>Drop</code> impl automatically closes the descriptor. No <code>close()</code> method exists — scope owns cleanup.</li>
    <li><code>File</code> is just a number; you close it with <code>libc::close</code> directly.</li>
  </ul>
  <div class="quiz__explain">Correct. This is RAII: the <em>lifetime</em> of the <code>File</code> value <em>is</em> the lifetime of the resource. Drop runs at the end of scope. No close(), no try-with-resources, no finally block — just ownership. The same pattern applies to <code>Mutex</code> locks, TCP sockets, database connections, GPU handles, everything.</div>
  <div class="quiz__explain quiz__explain--wrong">Look at the chapter's definition of RAII. What runs when the owner goes out of scope?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

<div class="quiz" data-answer="1">
  <div class="quiz__head"><span>Quiz — 2 of 2</span><span>Resource flow</span></div>
  <p class="quiz__q">Which of these API designs <em>best</em> encodes "this function takes responsibility for closing the stream"?</p>
  <ul class="quiz__options">
    <li><code>fn write_payload(stream: &amp;mut Stream, data: &amp;[u8])</code></li>
    <li><code>fn send_and_close(stream: Stream, data: &amp;[u8])</code></li>
    <li><code>fn send_with_callback(stream: Stream, cb: fn(&amp;mut Stream))</code></li>
    <li><code>fn write_payload(data: &amp;[u8], close_stream: bool)</code></li>
  </ul>
  <div class="quiz__explain">Correct. Taking <code>stream: Stream</code> (by value, not by reference) <em>moves ownership into the function</em>. The caller cannot use it again. At the end of the function, the <code>Stream</code> is dropped — closing it. The signature itself documents the contract; no comment needed.</div>
  <div class="quiz__explain quiz__explain--wrong">Think about ownership transfer. Which signature <em>takes</em> the stream rather than borrowing it?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>
