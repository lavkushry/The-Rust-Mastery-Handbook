# Retention and Mastery Drills

This supplement exists for one reason: deep understanding fades unless it is rehearsed.

Do not treat these as optional extras. This is the part of the handbook that turns "I understood that chapter when I read it" into "I can still use that idea under pressure."

---

## Drill Deck 1 - Ownership and Borrowing

### In Plain English

Ownership answers: "Who is responsible for cleaning this up?"

Borrowing answers: "Who may use it without taking responsibility away from the owner?"

### What problem is Rust solving here?

It is solving the class of bugs caused by unclear responsibility:

- leaks
- double frees
- use-after-free
- accidental aliasing
- data races

### What invariant is being protected?

At any moment, a value has one cleanup story and one safe-access story.

### Common mistake

Thinking "the compiler hates sharing data." It does not. Rust allows sharing. It forbids ambiguous sharing.

### Why the compiler rejects this

When you see move or borrow errors, Rust is usually saying:

- you already transferred responsibility
- you created two incompatible access modes
- you tried to keep a reference alive longer than the owner

### How an expert thinks about this

An expert reads function signatures as ownership contracts:

- `T` means transfer
- `&T` means observe
- `&mut T` means exclusive mutation

### If you remember only 3 things

1. Ownership is resource management, not syntax trivia.
2. Borrowing is about safe access, not convenience only.
3. Many readers or one writer is the heart of the model.

### Memory hooks / mnemonics

- **Own, lend, return nothing dangling**
- **Many readers or one writer**
- **Move means old name is done**

### Flashcards

| Front | Back |
|---|---|
| Why does `String` move by default? | Because it owns heap data and must have one cleanup path |
| Why can `i32` be `Copy`? | No destructor, cheap duplication, no ownership ambiguity |
| Why can shared and mutable borrows not overlap? | To prevent aliasing-plus-mutation bugs |

### Cheat sheet

- Accept `&str` over `&String`
- Accept `&[T]` over `&Vec<T>`
- Use ownership transfer only when the callee should truly take over
- Clone late, rarely, and consciously

### Code reading drills

1. Open a crate and mark each public function as `takes ownership`, `borrows`, or `mutably borrows`.
2. Find one place where a `clone()` happens and ask whether borrowing could have worked.
3. Find one type with a `Drop` impl and explain who owns it at every step.

### Spot the bug

```rust
fn append_world(s: String) {
    let view = &s;
    println!("{}", view);
    // pretend more work happens here
}
```

Question: what is the ownership smell?

Answer: the function takes ownership even though it only reads. It should likely accept `&str` or `&String`.

### Compiler-error interpretation practice

- `E0382`: you used the old owner after a move
- `E0502`: your read and write stories overlap
- `E0596`: you are trying to mutate through a non-mutable access path

---

## Drill Deck 2 - Lifetimes and Slices

### In Plain English

Lifetimes are how Rust proves references stay valid. Slices are borrowed views whose validity depends on that proof.

### What problem is Rust solving here?

Dangling references and invalid views into memory.

### What invariant is being protected?

A reference must never outlive the data it points to.

### Common mistake

Treating lifetimes as timers instead of relationships.

### Why the compiler rejects this

The compiler is not saying "your code runs too long." It is saying "I cannot prove the returned reference is tied to a still-valid owner."

### How an expert thinks about this

An expert asks: "What data owns this memory, and what references are logically derived from it?"

### If you remember only 3 things

1. Lifetimes are relationships, not durations on a clock.
2. `&str` and `&[T]` are borrowed views.
3. Borrowed output must be connected to borrowed input.

### Memory hooks / mnemonics

- **No owner, no reference**
- **Slices are views, not containers**
- **Returned borrow must come from an input borrow**

### Flashcards

| Front | Back |
|---|---|
| What does `fn f<'a>(x: &'a str) -> &'a str` mean? | Output is valid no longer than `x` |
| What is `&str`? | A borrowed UTF-8 slice |
| Why is `s[0]` not allowed on strings? | UTF-8 indexing by byte is unsafe for text |

### Cheat sheet

- Prefer returned owned values when relationships are genuinely complex
- Use slices for borrowed contiguous data
- Annotate lifetimes only when inference cannot express the relationship

### Code reading drills

1. Find one function returning `&str` and identify which input it borrows from.
2. Find one parser that walks slices and explain how it avoids allocation.
3. Find one struct with lifetime parameters and explain what it borrows.

### Spot the bug

```rust
fn first_piece() -> &str {
    let text = String::from("a,b,c");
    text.split(',').next().unwrap()
}
```

Why it fails:

- the returned slice points into `text`
- `text` is dropped at function end
- the borrow cannot outlive the owner

### Compiler-error interpretation practice

- `E0106`: you declared a borrowed relationship but did not spell it out
- `E0515`: you returned a reference to local data that will be dropped
- "does not live long enough": the owner disappears before the borrow ends

---

## Drill Deck 3 - Traits, Generics, and Error Design

### In Plain English

Traits describe capabilities. Generics let one algorithm work for many types. Error design tells callers what can go wrong without hiding the story.

### What problem is Rust solving here?

Rust wants abstraction without giving up performance or type clarity.

### What invariant is being protected?

Generic code should only assume the capabilities it explicitly asks for.

### Common mistake

Using trait bounds like cargo cult boilerplate instead of as precise capability contracts.

### Why the compiler rejects this

If a trait bound is missing, Rust is saying: "you are asking for behavior your type contract never promised."

### How an expert thinks about this

Experts design APIs around capabilities and failure surfaces:

- what methods must exist?
- who owns the error vocabulary?
- is this dynamic dispatch or static dispatch?

### If you remember only 3 things

1. Trait bounds are promises about behavior.
2. `impl Trait` and generics are usually static-dispatch tools.
3. Library errors should be explicit; application errors can be aggregated.

### Memory hooks / mnemonics

- **Traits say can, not is**
- **Bounds are promises**
- **Library errors name causes; app errors collect context**

### Flashcards

| Front | Back |
|---|---|
| When use `thiserror`? | In libraries with explicit error types |
| When use `anyhow`? | In applications where ergonomic error propagation matters |
| `dyn Trait` or `impl Trait`? | `dyn` for runtime polymorphism, `impl` for static dispatch |

### Cheat sheet

- Prefer minimal trait bounds
- Prefer associated types when the output type is conceptually tied to the trait
- Use `From` to make error conversion clean
- Avoid exposing `anyhow::Error` from library APIs

### Code reading drills

1. Find one `where` clause in a real crate and translate it into plain English.
2. Find one error enum and map which modules produce each variant.
3. Find one trait with an associated type and explain why a generic type parameter was not used instead.

### Spot the bug

```rust
pub fn parse<T>(input: &str) -> T {
    input.parse().unwrap()
}
```

Problems:

- missing trait bound
- panics instead of exposing failure
- poor library API shape

### Compiler-error interpretation practice

- `E0277`: your type does not satisfy the promised capability
- `E0599`: the method exists conceptually, but the trait is not available in this context
- object-safety errors: your trait design does not fit runtime dispatch

---

## Drill Deck 4 - Concurrency, Async, and Pin

### In Plain English

Threads let work happen in parallel. Async lets one thread manage many waiting tasks. Pin exists because async state machines can contain self-references that must not move after polling begins.

### What problem is Rust solving here?

It is trying to give you concurrency and async I/O without silently giving you races, use-after-free, or hidden scheduler magic.

### What invariant is being protected?

Shared state across threads or tasks must remain valid, synchronized, and movable only when moving is safe.

### Common mistake

Thinking async is "just lighter threads." In Rust, async is an explicit state machine model with explicit runtime boundaries.

### Why the compiler rejects this

Rust rejects async and concurrency code when:

- a future is not `Send` across task boundaries
- mutable state is shared unsafely
- a value must not move after pinning assumptions begin

### How an expert thinks about this

An expert asks:

- is this CPU-bound or I/O-bound?
- who owns cancellation?
- where does backpressure happen?
- does this future cross threads?

### If you remember only 3 things

1. Async in Rust is explicit because hidden lifetime and movement bugs are unacceptable.
2. `Send` and `Sync` are about cross-thread safety guarantees.
3. Pin matters because some futures become movement-sensitive state machines.

### Memory hooks / mnemonics

- **Async is a state machine**
- **`Send` crosses threads, `Sync` shares refs**
- **Pin means stay put**

### Flashcards

| Front | Back |
|---|---|
| Does calling an `async fn` run it? | No, it creates a future |
| Why can `Rc<T>` break async task spawning? | It is not `Send` |
| Why does Pin matter for futures? | Polling may create self-referential state assumptions |

### Cheat sheet

- prefer channels when ownership transfer is clearer than locking
- prefer `Arc<T>` only when ownership truly must be shared
- prefer `tokio::sync::Mutex` for async-held locks
- design cancellation deliberately

### Code reading drills

1. Trace one request from Tokio runtime startup to handler completion.
2. Find one `select!` and explain what happens to losing branches.
3. Find one `spawn` call and verify whether captured state must be `Send + 'static`.

### Spot the bug

```rust
let state = std::rc::Rc::new(String::from("hello"));
tokio::spawn(async move {
    println!("{}", state);
});
```

Why it fails: `Rc<T>` is not thread-safe, and spawned tasks may need `Send`.

### Compiler-error interpretation practice

- "`future cannot be sent between threads safely`": a captured value is not `Send`
- borrow-across-`await` errors: a borrow lives through a suspension point in an invalid way
- pinning errors: movement assumptions conflict with the future's internal structure

---

## Drill Deck 5 - Unsafe, FFI, and Memory Layout

### In Plain English

Unsafe Rust exists so safe Rust can be powerful. It is not "turning off the compiler." It is taking manual responsibility for a narrower set of promises.

### What problem is Rust solving here?

Some jobs require operations the compiler cannot verify directly:

- raw pointers
- foreign code boundaries
- custom memory management
- lock-free primitives

### What invariant is being protected?

Unsafe code must uphold the same safety guarantees that safe callers expect.

### Common mistake

Thinking unsafe is acceptable because "I know what this code does." The real question is whether you can state and uphold the invariants for every caller.

### Why the compiler rejects this

Safe Rust rejects code when it cannot prove memory validity. Unsafe lets you proceed only if you manually guarantee:

- pointer validity
- aliasing discipline
- initialization
- lifetime correctness
- thread-safety where required

### How an expert thinks about this

Experts isolate unsafe into tiny, documented blocks surrounded by safe APIs.

### If you remember only 3 things

1. Unsafe is a proof obligation, not a performance badge.
2. FFI boundaries need explicit layout and ownership rules.
3. Small unsafe cores with safe wrappers are the right pattern.

### Memory hooks / mnemonics

- **Unsafe means: now you are the borrow checker**
- **Document the invariant before the block**
- **Safe outside, unsafe inside**

### Flashcards

| Front | Back |
|---|---|
| What does `unsafe` permit? | Operations the compiler cannot prove safe, not arbitrary correctness |
| Why use `#[repr(C)]` in FFI? | To make layout compatible with C expectations |
| Should unsafe APIs stay unsafe at the boundary? | Usually no; expose a safe wrapper when you can uphold invariants internally |

### Cheat sheet

- state `SAFETY:` comments in plain English
- validate pointer provenance and alignment
- keep ownership rules explicit across FFI
- benchmark before using unsafe for "performance"

### Code reading drills

1. Find one `unsafe` block in a crate and write down the exact invariant it assumes.
2. Find one `#[repr(C)]` type and explain who depends on that layout.
3. Find one safe wrapper around raw pointers and explain how it contains risk.

### Spot the bug

```rust
unsafe fn get(ptr: *const i32) -> i32 {
    *ptr
}
```

What is missing:

- null validity assumptions
- alignment assumptions
- lifetime/provenance expectations
- caller contract

### Compiler-error interpretation practice

- alignment and raw pointer issues mean the compiler cannot prove valid access
- atomics/orderings are rarely compiler errors but often logic bugs; read them as invariant design problems
- FFI bugs often compile cleanly and fail at runtime, so your documentation burden is higher

---

## Drill Deck 6 - Repo Reading and Contribution

### In Plain English

Reading a Rust repo is not about reading every file. It is about finding the code paths and invariants that matter.

### What problem is Rust solving here?

Large codebases are hard because intent is distributed. Rust helps by making ownership, types, feature flags, and error boundaries more explicit.

### What invariant is being protected?

A good first contribution changes behavior while preserving the repo's existing contracts.

### Common mistake

Starting from random internal files instead of README, `Cargo.toml`, tests, and entry points.

### Why the compiler rejects this

In repo work, compiler errors are often telling you that your change crossed a crate boundary, ownership boundary, or feature-gated assumption you did not notice.

### How an expert thinks about this

Experts work from outside in:

- what is the public behavior?
- where does input enter?
- where are errors defined?
- what tests already describe the invariant?

### If you remember only 3 things

1. Read tests earlier.
2. Shrink the bug before fixing it.
3. Keep first PRs boring and correct.

### Memory hooks / mnemonics

- **README, Cargo, tests, entry point**
- **Reproduce, reduce, repair**
- **One invariant, one PR**

### Flashcards

| Front | Back |
|---|---|
| First file after README? | Usually `Cargo.toml` |
| Best first PRs? | Docs, tests, diagnostics, focused bug fixes |
| What should a PR description explain? | Problem, approach, tests, and scope |

### Cheat sheet

- run `cargo check`, `cargo test`, `cargo fmt`, `cargo clippy`
- inspect feature flags before changing behavior
- read error enums and integration tests before editing handlers
- avoid unrelated formatting churn

### Code reading drills

1. Pick one CLI crate and trace a subcommand from argument parsing to output.
2. Pick one async service and map request entry, business logic, and error conversion.
3. Pick one multi-crate workspace and explain why each crate boundary exists.

### Spot the bug

You found an issue and changed three modules, renamed types, and reformatted half the repo in the same PR.

Bug: your fix is now hard to review, risky to merge, and difficult to revert.

### Compiler-error interpretation practice

- feature-gated missing items: your build configuration differs from the issue report
- trait-bound failures across crates: the public API contract changed
- lifetime and ownership failures during refactors: your "small cleanup" was not actually ownership-neutral

---

## Drill Deck 7 - Compiler Thinking and rustc

### In Plain English

Rust is easier once you stop treating the compiler as a wall and start treating it as a structured pipeline with specific jobs.

### What problem is Rust solving here?

Modern systems languages need strong guarantees, but those guarantees must come from a compiler architecture that can reason about syntax, types, control flow, and ownership.

### What invariant is being protected?

Each compiler phase should transform the program while preserving meaning and making later checks more precise.

### Common mistake

Assuming borrow checking operates on your original source exactly as written. In reality, later compiler representations matter.

### Why the compiler rejects this

Different classes of errors come from different phases:

- parse errors from syntax
- type errors from HIR-level checking
- borrow errors from MIR reasoning
- trait-system errors from obligation solving

### How an expert thinks about this

Experts ask: "Which compiler phase is complaining, and what representation is it likely using?"

### If you remember only 3 things

1. HIR is where high-level structure is normalized for type reasoning.
2. MIR is where control flow and borrow logic become clearer.
3. Monomorphization is why generics are fast but code size grows.

### Memory hooks / mnemonics

- **Parse, lower, reason, generate**
- **HIR for types, MIR for borrows**
- **Generics specialize late**

### Flashcards

| Front | Back |
|---|---|
| Where does borrow checking happen conceptually? | On MIR-like control-flow reasoning |
| Why does monomorphization matter? | It gives zero-cost generics and larger binaries |
| Why read RFCs? | They reveal the tradeoff logic behind language features |

### Cheat sheet

- parse/AST: syntax structure
- HIR: desugared high-level meaning
- MIR: control-flow and ownership reasoning
- codegen: machine-specific lowering

### Code reading drills

1. Read one `rustc` blog post or compiler-team article and summarize the phase it discusses.
2. Read one RFC and list the tradeoffs it accepted.
3. Take one confusing borrow error from your own code and ask which MIR-level control-flow fact caused it.

### Spot the bug

Mistake: "The compiler rejected my code, so Rust cannot express what I want."

Correction: first ask whether the model is wrong, then whether the current compiler is conservative, then whether a different ownership shape expresses the idea more clearly.

### Compiler-error interpretation practice

- syntax errors: you told the parser an incomplete story
- type errors: your value-level story is inconsistent
- borrow errors: your ownership and access story is inconsistent
- trait errors: your capability story is inconsistent

---

## How to Use This Appendix

Repeat this cycle:

1. Read one chapter
2. Do the matching drill deck
3. Read real code using the same concept
4. Return one week later and do the flashcards and spot-the-bug section again

That repetition is how the material becomes durable.
