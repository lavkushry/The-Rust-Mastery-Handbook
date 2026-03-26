# PART 3 - The Heart of Rust

This part is the center of the handbook.

If you understand Part 3 deeply, the rest of Rust stops looking like a list of disconnected rules. Traits make sense. Async makes sense. Smart pointers make sense. Even many compiler errors stop feeling arbitrary. If you do not understand Part 3, the rest of the language becomes a series of local tricks and workarounds.

The core claim of this part is simple:

ownership, borrowing, lifetimes, moves, `Copy`, `Clone`, `Drop`, stack versus heap, and the borrow checker are not separate topics. They are one resource model seen from different angles.

---

# Chapter 16: Ownership as Resource Management

## Step 1 - The Problem

Every nontrivial program acquires resources:

- heap memory
- files
- sockets
- mutex guards
- database connections
- subprocess handles

Something must release those resources exactly once and at the right time.

In C, this burden falls directly on the programmer:

- forget cleanup and you leak
- clean up twice and you corrupt memory
- clean up too early and you dangle pointers

C++ improves the story with RAII, but the discipline is partly conventional and partly undermined by unsafe aliasing, surprising moves/copies, and undefined behavior when invariants are broken.

GC languages simplify memory cleanup, but they do not automatically solve every resource lifecycle problem. A file handle still needs closing. A transaction still needs ending. A lock still needs releasing.

Rust's answer is ownership.

## Step 2 - Rust's Design Decision

Rust makes ownership a type-system concept rather than a cultural convention.

The key decisions:

- each value has one owner at a time
- ownership can move
- when the owner goes out of scope, `Drop` runs automatically
- this applies not only to memory, but to any resource wrapped in a Rust type

Rust accepted:

- learning cost around moves and invalidation
- more visible resource boundaries in APIs

Rust refused:

- hidden garbage-collector ownership
- "just be careful" manual lifecycle discipline
- separate mental models for memory versus other resources

## Step 3 - The Mental Model

Plain English rule: ownership means one part of the program is responsible for cleaning up a value's resources.

If ownership moves, responsibility moves.

If the owner goes out of scope, cleanup runs automatically.

That is why ownership is bigger than memory management style. It is Rust's general model of responsibility.

## Step 4 - Minimal Code Example

```rust
fn main() {
    let name = String::from("rust");
    let other = name;

    println!("{other}");
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `String::from("rust")` allocates heap-backed UTF-8 data.
2. `name` becomes the owner of that `String` value.
3. `let other = name;` moves ownership from `name` to `other`.
4. `name` is invalidated because two live owners of the same heap allocation would violate the single-owner invariant.
5. At end of scope, `other` is dropped, and the string's resources are released once.

The invalidation is not punishment. It is how Rust proves the resource will be cleaned up exactly once.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Ownership answers one question: who is responsible for this value right now?

### Level 2 - Engineer

Function signatures are ownership contracts:

- `fn f(x: String)` takes ownership
- `fn f(x: &str)` borrows read-only access
- `fn f(x: &mut String)` borrows exclusive mutable access
- `fn f() -> String` hands ownership back to the caller

This makes resource flow visible in a way many languages hide.

### Level 3 - Systems

Ownership is RAII with compiler-enforced uniqueness. In C++, `std::unique_ptr` approaches this for heap memory, but Rust generalizes the model to ordinary values and uses move semantics as the default ownership transfer mechanism. That lets cleanup semantics compose across the language.

## RAII in Rust

RAII means resource acquisition is tied to initialization of a value, and release is tied to destruction of that value.

Rust applies RAII broadly:

- `String` frees memory when dropped
- `File` closes the descriptor when dropped
- `MutexGuard` unlocks when dropped
- custom types can implement `Drop`

This is why scope structure matters so much in Rust. Scopes are not just lexical organization. They are resource-lifetime boundaries.

## Drop Order and Explicit `drop`

Values are dropped in reverse order of declaration within a scope. That matters when one value's destructor depends on another still being available.

```rust
struct LogOnDrop(&'static str);

impl Drop for LogOnDrop {
    fn drop(&mut self) {
        println!("dropping {}", self.0);
    }
}

fn main() {
    let a = LogOnDrop("a");
    let b = LogOnDrop("b");
    let _ = (&a, &b);
}
```

This drops `b` before `a`.

Sometimes you want cleanup early:

```rust
use std::sync::Mutex;

let lock = Mutex::new(0);
let guard = lock.lock().unwrap();
drop(guard);
```

You cannot call a destructor method directly, but you can call `std::mem::drop` to move the value into a function and end its lifetime immediately.

## Custom `Drop`

```rust
struct TempFile {
    path: String,
}

impl Drop for TempFile {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.path);
    }
}
```

Custom `Drop` is powerful because it lets user-defined types participate in Rust's unified resource model. But it also means your type now has destructor semantics that affect movement, `Copy`, and panic behavior during cleanup.

## Step 7 - Common Misconceptions

Wrong model 1: "Ownership is about heap memory only."

Correction: ownership is about responsibility for any resource carried by a value.

Wrong model 2: "Move means bytes are always physically relocated."

Correction: a move is primarily a change in ownership semantics. The compiler may implement it as a bitwise copy plus invalidation.

Wrong model 3: "RAII means I never have to think about cleanup."

Correction: you no longer manually call free/close in most cases, but you absolutely do need to think about scope and ownership boundaries.

Wrong model 4: "Calling `drop()` is weird and unidiomatic."

Correction: explicit early drop is often the cleanest way to shorten a guard or resource lifetime.

## Step 8 - Real-World Pattern

You see ownership as resource management everywhere in strong Rust code:

- temporary locks released before expensive work
- scoped database transactions
- file buffers that close on scope exit
- helper types whose destructor records metrics or cleans up temp state

Once you see Rust types as resource owners instead of just data containers, those designs become straightforward.

## Step 9 - Practice Block

### Code Exercise

Write a wrapper type around a temporary file path that removes the file in `Drop`. Explain when cleanup happens.

### Code Reading Drill

Who owns the string after each line?

```rust
let a = String::from("hi");
let b = a;
let c = b;
```

### Spot the Bug

Why does this fail?

```rust
let path = String::from("out.txt");
let file = std::fs::File::create(path)?;
println!("{path}");
```

### Refactoring Drill

Take a function that manually closes or resets several resources near the bottom and redesign it so scope and ownership do more of the cleanup work.

### Compiler Error Interpretation

If the compiler says a value was moved, translate that as: "responsibility for this resource was transferred, so the old name cannot keep acting like an owner."

## Step 10 - Contribution Connection

After this chapter, you can read:

- guard-based cleanup code
- transaction and lock lifetimes
- resource wrappers with `Drop`
- APIs whose signatures encode responsibility transfer

Good first PRs include:

- narrowing resource scope so cleanup happens earlier
- improving RAII wrappers around external resources
- replacing manual cleanup sequences with scope-based ownership

## In Plain English

Ownership is Rust's way of deciding who is responsible for cleaning something up. That matters because systems code is full of resources that must be released exactly once, and bugs around that rule are some of the hardest and most dangerous bugs to debug later.

## What Invariant Is Rust Protecting Here?

Every resource must have exactly one active cleanup responsibility at a time, and that responsibility must end in exactly one cleanup event.

## If You Remember Only 3 Things

- Ownership is responsibility, not merely a memory concept.
- Moves transfer responsibility; they do not create two live owners.
- Scope exit is a resource boundary because `Drop` runs there automatically.

## Memory Hook

Ownership is a signed custody form. One person holds the form at a time. Whoever holds it when the item leaves the building is responsible for checking it back in.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does ownership answer in Rust? | Who is responsible for a value and its cleanup right now. |
| Why does moving invalidate the old binding? | To prevent two active owners from both cleaning up the same resource. |
| What does RAII mean in Rust practice? | Resource lifetime is tied to value lifetime and scope. |
| When are values usually dropped? | When their owner goes out of scope. |
| In what order are locals dropped? | Reverse order of declaration. |
| How do you release a resource before scope end? | Move it into `std::mem::drop`. |
| Can user-defined types participate in automatic cleanup? | Yes, by implementing `Drop`. |
| Is ownership only about heap allocations? | No. It applies to any resource encoded by a type. |

## Chapter Cheat Sheet

| Situation | Ownership reading | Consequence |
|---|---|---|
| `let b = a;` for non-`Copy` type | ownership moved | `a` invalidated |
| function takes `T` | caller transfers ownership | callee controls cleanup |
| function takes `&T` | caller keeps ownership | read-only borrow |
| guard goes out of scope | `Drop` runs | resource released |
| explicit `drop(x)` | lifetime ends now | cleanup happens early |

---

# Chapter 17: Borrowing, Constrained Access

## Step 1 - The Problem

If every function had to take ownership, useful code would become awkward quickly:

- you would need to return values just so callers could keep using them
- you would clone far too often
- temporary read access would look like transfer of responsibility

But allowing free aliasing is dangerous. In C and C++, multiple pointers can read and write the same memory with almost no language-level discipline. That causes:

- data races
- iterator invalidation
- use-after-free
- stale cached views

Rust wants access without ownership transfer, but only under rules strong enough to preserve safety.

## Step 2 - Rust's Design Decision

Rust introduced references with borrowing rules:

- many shared references or one exclusive mutable reference
- references must remain valid
- references cannot outlive the data they point to

This is often summarized as:

aliasing XOR mutation

Rust accepted:

- stricter mutation discipline
- temporary frustration when access patterns are unclear

Rust refused:

- unrestricted shared mutable state
- making references morally equivalent to raw pointers

## Step 3 - The Mental Model

Plain English rule: borrowing means temporarily using a value without taking over responsibility for it.

There are two kinds:

- `&T` means many readers may coexist
- `&mut T` means one exclusive accessor may mutate

## Step 4 - Minimal Code Example

```rust
fn len_of(text: &str) -> usize {
    text.len()
}

fn main() {
    let name = String::from("rust");
    let n = len_of(&name);
    println!("{name} {n}");
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `name` owns the string.
2. `&name` creates a shared borrow of the string contents.
3. `len_of` receives borrowed access, not ownership.
4. The borrow is used to compute length.
5. After the borrow's last use, `name` remains the owner and can still be used.

This is the simplest case, but the same principles scale to complex code:

- the owner stays responsible
- the borrow gives limited access
- the borrow cannot conflict with stronger access at the same time

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Borrowing lets you use a value without taking it away from the current owner.

### Level 2 - Engineer

Shared borrows are ideal for read-only inspection. Mutable borrows are ideal for local, exclusive modification. The key engineering move is to keep borrows as short and local as possible so code stays flexible.

### Level 3 - Systems

Borrowing is Rust's access-control system on top of ownership. The owner answers "who cleans this up?" Borrowing answers "who may touch this right now?" The aliasing XOR mutation rule is what prevents whole categories of memory and concurrency bugs without a runtime borrow tracker in ordinary safe code.

## Aliasing XOR Mutation

This is the deepest single design insight in Rust:

you may have either:

- aliasing without mutation
- mutation without aliasing

But not both at once.

Example:

```rust
let mut data = vec![1, 2, 3];

let a = &data;
let b = &data;
println!("{a:?} {b:?}");

let c = &mut data;
c.push(4);
```

This is fine because the shared borrows end before the mutable borrow begins.

Why is the rule necessary?

Because if one part of the program can assume a view stays stable while another part can mutate behind its back, the compiler loses its ability to reason safely about references. That shows up as:

- invalidated iterators
- reallocation behind stale pointers
- races between readers and writers
- broken logical assumptions even if memory stays allocated

## Iterator Invalidation

One of Rust's most practical wins is preventing iterator invalidation at compile time.

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];
// v.push(4); // would be rejected if `first` is still live
println!("{first}");
```

Why reject the push?

Because `push` may reallocate the vector's buffer. If `first` pointed into the old buffer, it would dangle after reallocation. Rust blocks the pattern before runtime.

## NLL: Non-Lexical Lifetimes

Older descriptions of borrowing sometimes say a borrow lives until the end of the scope. In modern Rust, the compiler usually tracks borrows until their last use, not merely until the end of the lexical block.

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];
println!("{first}");
v.push(4); // okay, the shared borrow ended at its last use
```

This is called non-lexical lifetimes. It made Rust significantly more expressive without weakening the underlying invariants.

## Borrowing and Threads

Part 5 develops this fully, but the connection is already visible:

the same aliasing XOR mutation rule that prevents shared mutable bugs in one thread is the conceptual basis for preventing data races across threads.

Rust does not have one memory-safety model for local code and another for concurrent code. It has one rule expressed through different abstractions.

## Step 7 - Common Misconceptions

Wrong model 1: "Borrowing is the same as passing by reference in C++."

Correction: Rust references are validity- and aliasing-tracked, not just alternate syntax for pointers.

Wrong model 2: "The borrow checker hates mutation."

Correction: Rust permits mutation freely when exclusivity is clear.

Wrong model 3: "Cloning is the normal fix for borrow errors."

Correction: cloning can hide a design problem. First ask whether the borrow shape should be shorter or the ownership boundary clearer.

Wrong model 4: "Shared references are always harmless."

Correction: they are safe because mutation is disallowed while they are live.

## Step 8 - Real-World Pattern

Borrowing shows up everywhere in strong Rust APIs:

- `&str` input instead of taking `String`
- borrowed slices for parsing and scanning
- short mutable borrows inside update helpers
- APIs that return borrowed views when ownership transfer would be wasteful

The best Rust code often feels lightweight precisely because it borrows aggressively but locally.

## Step 9 - Practice Block

### Code Exercise

Write one function that takes `Vec<i32>` by value and one that takes `&[i32]` by borrow. Explain how the caller's ownership changes.

### Code Reading Drill

What borrows exist at each line?

```rust
let mut values = vec![1, 2, 3];
let first = &values[0];
println!("{first}");
values.push(4);
```

### Spot the Bug

Why does this fail?

```rust
let mut s = String::from("hi");
let r1 = &s;
let r2 = &mut s;
println!("{r1} {r2}");
```

### Refactoring Drill

Take a function with a long-lived mutable borrow and rewrite it so the mutable access occurs in a smaller block.

### Compiler Error Interpretation

If the compiler says you cannot borrow as mutable because it is already borrowed as immutable, translate that as: "I tried to mix aliasing and mutation in the same live region."

## Step 10 - Contribution Connection

After this chapter, you can read:

- borrowed-input APIs
- slice-based parsers
- mutating helper functions with short exclusive borrows
- code reorganized around last-use rather than whole-scope borrowing

Good first PRs include:

- changing `&String` inputs to `&str`
- shrinking mutable borrow scopes
- removing unnecessary clones caused by unclear ownership flow

## In Plain English

Borrowing lets code use a value temporarily without taking it away from its owner. Rust then adds strict rules about when that borrowed access can coexist with mutation. That matters because many dangerous bugs are really just "someone changed the thing while someone else still trusted their view of it."

## What Invariant Is Rust Protecting Here?

While shared references are live, the referenced value must not be mutated through another path; while an exclusive mutable reference is live, no other access path may observe or modify the same value.

## If You Remember Only 3 Things

- Ownership answers cleanup responsibility; borrowing answers temporary access.
- `&T` means shared read access; `&mut T` means exclusive mutable access.
- Aliasing XOR mutation is the rule beneath iterator safety, race prevention, and many borrow-checker errors.

## Memory Hook

Borrowing is signing out a reading-room copy. Many people can read the same copy, or one editor can mark it up privately, but not both at once.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is borrowing for? | Temporary access without taking ownership. |
| What does `&T` permit? | Shared read-only access. |
| What does `&mut T` permit? | Exclusive mutable access. |
| What is aliasing XOR mutation? | You may have many aliases or one mutator, but not both at once. |
| Why can vector mutation conflict with a borrowed element reference? | Reallocation can invalidate the borrowed element's address. |
| What did non-lexical lifetimes improve? | Borrows usually end at last use rather than the end of the enclosing block. |
| Is cloning the default fix for borrow errors? | No. Restructuring ownership or borrow scope is often better. |
| How does borrowing connect to concurrency? | The same exclusivity logic underlies Rust's prevention of data races. |

## Chapter Cheat Sheet

| Need | Borrow kind | Constraint |
|---|---|---|
| read without ownership transfer | `&T` | many may coexist |
| mutate in place | `&mut T` | must be exclusive |
| parse borrowed text | `&str` | caller keeps ownership |
| inspect contiguous data | `&[T]` | borrowed slice view |
| shorten borrow pain | use smaller scope / last use | improves flexibility |

---

# Chapter 18: Lifetimes, Relationships Not Durations

## Step 1 - The Problem

References are powerful only if they stay valid. The compiler must answer questions like:

- does this returned reference come from input A or input B?
- can this struct outlive the thing it borrows?
- is this reference pointing at a temporary that disappears too soon?

In C, these questions are mostly left to discipline and testing. In Rust, they are part of type checking.

## Step 2 - Rust's Design Decision

Rust represents borrowed validity relationships with lifetimes.

The crucial decision is what lifetimes mean:

not countdown timers on values, but relationships among references.

Rust accepted:

- lifetime syntax when inference is not enough
- more explicit signatures in advanced borrowed APIs

Rust refused:

- leaving returned-reference validity to convention
- pretending all references can be reasoned about locally without caller context

## Step 3 - The Mental Model

Plain English rule: a lifetime annotation says how references are related, not how long a value physically exists.

When you see:

```rust
fn pick<'a>(x: &'a str, y: &'a str) -> &'a str
```

read it as:

the returned reference is valid for a lifetime tied to both inputs, specifically no longer than the shorter relevant valid region at the call site.

## Step 4 - Minimal Code Example

```rust
fn first<'a>(text: &'a str) -> &'a str {
    &text[..1]
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. The input is `&'a str`.
2. The output is also `&'a str`.
3. The compiler reads this as "the output borrow is derived from the input borrow."
4. Therefore any call site must ensure the input borrow stays valid for as long as the returned borrow is used.

The annotation does not make the input live longer. It merely exposes the relationship the function already relies on.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Lifetimes tell the compiler which borrowed data a returned reference depends on.

### Level 2 - Engineer

Most code does not need explicit lifetime annotations because elision rules cover common cases. You usually write them when:

- multiple input references exist
- a struct stores borrowed data
- generic abstractions need precise borrow relationships

### Level 3 - Systems

Lifetimes are part of the type system. `&'a T` and `&'b T` are not interchangeable without a valid relationship. The borrow checker builds constraints over these relationships and checks that every use site satisfies them. This is why lifetime errors often point to both the origin and the use: the contradiction is relational.

## Lifetime Elision Rules

Rust elides many common annotations. The most important practical consequence:

- a single input reference and one output reference often imply "output tied to input"
- methods with `&self` often tie elided output borrows to `self`

You do not need to memorize the full formal rule set to write good Rust, but you do need to know why some signatures infer cleanly and others do not.

## Multiple Inputs

```rust
fn longer<'a>(left: &'a str, right: &'a str) -> &'a str {
    if left.len() > right.len() { left } else { right }
}
```

The annotation says the result is valid no longer than both inputs allow.

That is why this fails conceptually:

```rust
let result;
let long = String::from("long");
{
    let short = String::from("x");
    result = longer(&long, &short);
}
// result might point at short, which is gone here
```

Rust is not being overly cautious here. It is refusing to let a reference escape a context where one of its possible sources has died.

## Lifetimes in Structs

```rust
struct Excerpt<'a> {
    text: &'a str,
}
```

This says an `Excerpt<'a>` contains a reference valid for `'a`, so the struct itself cannot outlive that borrowed source.

Borrowing structs are common and useful, especially in:

- parsers
- views into larger buffers
- zero-copy data access

But they require you to think honestly about where the data actually lives.

## `'static`

`'static` is one of the most misunderstood concepts in Rust.

It does not mean "lives forever" in the naive sense. It means:

- a reference truly valid for the program's duration, like a string literal
- or, in bounds, a type containing no non-`'static` borrows

So when an API asks for `T: 'static`, it often means:

"this value must own its data or only borrow things that are genuinely static."

That is why thread and task boundaries often require `'static`: the work may outlive the current stack frame.

## Common Lifetime Errors

### Returning a reference to local data

```rust
fn bad() -> &str {
    let s = String::from("hi");
    &s
}
```

This is rejected because the local owner dies at function exit.

### Borrow from temporary

```rust
let r = String::from("hi").as_str();
```

The temporary `String` is dropped too soon for `r` to remain valid.

### Over-constraining with one lifetime

Sometimes a function uses one lifetime parameter for values that do not truly need the same relationship, making the API less usable than necessary.

## Step 7 - Common Misconceptions

Wrong model 1: "Lifetimes make values live longer."

Correction: owners determine value lifetime. Lifetime annotations only describe borrow relationships.

Wrong model 2: "`'static` means heap allocated."

Correction: `'static` is about borrow validity, not storage location.

Wrong model 3: "I should add `'a` everywhere until it compiles."

Correction: annotations should express real relationships. Randomly adding them does not fix a broken ownership design.

Wrong model 4: "Lifetime errors mean the compiler is confused."

Correction: they usually mean the code promised a borrow relationship that the actual value lifetimes cannot support.

## Step 8 - Real-World Pattern

Lifetimes are central in:

- slice- and `&str`-based parsers
- zero-copy APIs
- borrowed view structs
- iterators and callbacks that preserve borrowed relationships

Once you stop thinking of lifetimes as timers, these APIs become much more readable.

## Step 9 - Practice Block

### Code Exercise

Write one function that returns a borrowed slice of its input and one function that must return an owned `String` instead. Explain why the difference exists.

### Code Reading Drill

Explain what this struct promises:

```rust
struct View<'a> {
    text: &'a str,
}
```

### Spot the Bug

Why does this fail?

```rust
fn choose<'a>(left: &'a str, right: &str) -> &'a str {
    right
}
```

### Refactoring Drill

Take code returning borrowed data from a temporary and redesign it to return owned data or to borrow from caller-owned input instead.

### Compiler Error Interpretation

If the compiler says a borrowed value does not live long enough, translate that as: "the relationship I promised for this reference outlasts the real owner of the underlying data."

## Step 10 - Contribution Connection

After this chapter, you can read:

- borrowed parser APIs
- structs storing borrowed data
- callbacks and signatures with explicit lifetimes
- zero-copy slices and views

Good first PRs include:

- replacing accidental temporary borrows with owned results
- simplifying lifetime-heavy APIs where borrowed relationships are overcomplicated
- improving docs on what a returned reference is tied to

## In Plain English

Lifetimes are Rust's way of keeping borrowed values honest. They do not make data live longer. They say which data a reference depends on, so the compiler can reject references that would outlive the real thing they point to.

## What Invariant Is Rust Protecting Here?

Every reference must remain valid for its advertised use region and must not outlive the owner of the underlying data it borrows from.

## If You Remember Only 3 Things

- Lifetimes describe relationships among references, not durations of values.
- Most annotations exist to connect output borrows to the correct input borrows.
- `'static` usually means "contains no short-lived borrows," not "magically immortal."

## Memory Hook

Lifetimes are not hourglasses. They are labeled strings connecting borrowed tags to the objects they came from. If the object leaves, the tag is no longer valid.

## Flashcard Deck

| Question | Answer |
|---|---|
| What do lifetime annotations describe? | Relationships among references and the data they borrow from. |
| Do lifetimes extend value lifetime? | No. Ownership and scope determine that. |
| When are explicit lifetime annotations often needed? | With multiple input references, borrowed structs, and advanced generic borrowed APIs. |
| What does `T: 'static` usually mean in bounds? | The type contains no non-`'static` borrows. |
| Why can returning a reference to a local variable never work? | The local owner is dropped at function exit. |
| What is lifetime elision? | Compiler inference for common borrow relationships. |
| Why is borrowing from a temporary often rejected? | The temporary owner dies too soon for the reference's use. |
| What is a common beginner mistake with lifetimes? | Treating them as timers instead of relationships. |

## Chapter Cheat Sheet

| Situation | Lifetime reading | Outcome |
|---|---|---|
| `fn f<'a>(x: &'a T) -> &'a U` | output tied to input `x` | caller must keep `x`'s borrow valid |
| borrowed struct field | struct lifetime tied to source | struct cannot outlive borrowed data |
| `'static` string literal | valid for full program | safe global borrow |
| temporary borrowed too long | owner dies too soon | compile error |
| multiple input references | relation must be explicit or inferred | output cannot outlive shortest valid source |

---

# Chapter 19: Stack vs Heap, Where Data Lives

## Step 1 - The Problem

The ownership model is easier to understand when you know where values actually live.

Systems programmers care about:

- stack allocation versus heap allocation
- indirection cost
- cache locality
- fixed-size versus dynamically sized data

If you treat every value as if it "just exists somewhere," performance and borrowing behavior stay blurry.

## Step 2 - Rust's Design Decision

Rust exposes stack versus heap choices through types:

- plain values and fixed-size arrays often live inline
- `Box<T>`, `Vec<T>`, and `String` use heap allocation
- references and slices describe borrowed views into data elsewhere

Rust accepted:

- more visible allocation patterns
- some extra syntax for indirection and borrowing

Rust refused:

- hiding all allocation behind one universal object model
- making layout and ownership impossible to reason about

## Step 3 - The Mental Model

Plain English rule:

- stack storage is fast, scoped, and size-known
- heap storage is flexible, owned, and accessed indirectly

Many Rust types are hybrids: small metadata on the stack, backing storage on the heap.

## Step 4 - Minimal Code Example

```rust
let x = 42i32;
let s = String::from("hi");
```

## Step 5 - Line-by-Line Compiler Walkthrough

For `x`:

- the `i32` value is stored inline
- size is known at compile time
- no heap allocation is needed

For `s`:

- the `String` value itself is a small fixed-size struct
- that struct contains pointer, length, and capacity metadata
- the actual UTF-8 bytes live in a heap allocation

So "a String lives on the heap" is only partially true. More accurately:

the owned buffer lives on the heap; the owner metadata is an ordinary value.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

The stack is good for small fixed-size values. The heap is for data whose size may change or be known only at runtime.

### Level 2 - Engineer

Understanding stack versus heap helps explain:

- why moving a `String` usually does not copy the whole text buffer
- why `Vec` reallocation can invalidate element references
- why `Box<T>` is useful for recursive types and indirection

### Level 3 - Systems

Layout and indirection are performance facts:

- stack allocation is cheap because it often means pointer adjustment in a stack frame
- heap allocation needs allocator interaction
- indirect access can harm locality
- fat pointers exist for dynamically sized types like slices and trait objects because metadata is required

## `Vec<T>`, `String`, `Box<T>`

Common shapes:

- `Vec<T>`: stack metadata plus heap buffer of elements
- `String`: stack metadata plus heap buffer of UTF-8 bytes
- `Box<T>`: owning pointer to one heap-allocated `T`

`Box<T>` matters because some types need indirection:

- recursive enums
- large values you do not want copied inline in certain contexts
- trait objects

## Slices and Fat Pointers

`&[T]` and `&str` are fat pointers:

- data pointer
- length

Trait objects are also fat pointers:

- data pointer
- vtable pointer

This is why unsized types require indirection. The compiler needs metadata to know how to interpret the borrowed value.

## `Sized` and `?Sized`

Most types are `Sized`: their size is known at compile time.

Unsized examples:

- `[T]`
- `str`
- `dyn Trait`

You cannot store such values directly by value in ordinary locals or struct fields without indirection. That is why you usually see them behind `&`, `Box`, or other pointer-like wrappers.

## Allocation and Performance

Do not reduce this to "stack good, heap bad."

Better questions:

- does this need dynamic size?
- does this need stable ownership beyond the current stack frame?
- is allocation frequency actually a bottleneck?
- would a borrowed view avoid copying?

Systems maturity means measuring real bottlenecks, not worshipping one storage region.

## Step 7 - Common Misconceptions

Wrong model 1: "A `String` is just a heap blob."

Correction: it is an owned value with inline metadata pointing to heap data.

Wrong model 2: "Moves copy the whole heap allocation."

Correction: moving the owner typically transfers metadata, not the heap contents.

Wrong model 3: "Stack allocation is always better."

Correction: fixed-size and scope-limited values fit well on the stack, but many real problems need owned heap storage.

Wrong model 4: "Unsized types are weird edge cases."

Correction: slices, strings, and trait objects depend on unsized reasoning constantly.

## Step 8 - Real-World Pattern

Once you understand stack and heap layout, you can read:

- why parsers prefer borrowed slices
- why builders own strings and vectors
- why iterators often borrow input data
- why trait objects and recursive structures use `Box`

These are not arbitrary patterns. They are consequences of representation.

## Step 9 - Practice Block

### Code Exercise

List which part of each lives on the stack and which part lives on the heap:

- `i64`
- `String`
- `Vec<u8>`
- `Box<[u8; 16]>`

### Code Reading Drill

What does this value actually contain?

```rust
let words: &str = "hello";
```

### Spot the Bug

Why is borrowing from a vector element before a possible `push` dangerous conceptually?

```rust
let mut v = vec![1, 2, 3];
let x = &v[0];
// v.push(4);
println!("{x}");
```

### Refactoring Drill

Take an API that allocates a `String` for every formatted fragment and redesign one layer to use borrowed `&str` or slices where ownership is unnecessary.

### Compiler Error Interpretation

If the compiler complains about unsized values in a place expecting `Sized`, translate that as: "this value needs an indirection plus metadata, not direct inline storage here."

## Step 10 - Contribution Connection

After this chapter, you can read:

- allocation-sensitive code
- recursive enum designs
- parser and slicing APIs
- trait-object storage choices

Good first PRs include:

- avoiding unnecessary allocations in hot paths
- documenting borrowed versus owned return choices
- replacing wasteful owned intermediates with slice-based logic

## In Plain English

Some values fit directly where they are used. Others need a separately allocated region that the value points to. Rust makes that difference visible because speed, safety, and borrowing behavior all depend on it.

## What Invariant Is Rust Protecting Here?

The compiler must know enough about value size and storage structure to move, borrow, and clean up data safely and efficiently.

## If You Remember Only 3 Things

- Stack versus heap is really about representation and indirection, not a morality tale.
- `String` and `Vec` are small owners of larger heap buffers.
- Unsized types like slices and trait objects require pointers plus metadata.

## Memory Hook

Think of the stack as a desk drawer for fixed-size forms and the heap as a warehouse for variable-size inventory. A `String` is the clipboard in your hand pointing to a pallet in the warehouse.

## Flashcard Deck

| Question | Answer |
|---|---|
| What usually lives inline for a `String` value? | Pointer, length, and capacity metadata. |
| Where do a string's bytes usually live? | In a heap allocation. |
| Why are `&str` and `&[T]` fat pointers? | They need both a data pointer and a length. |
| What problem does `Box<T>` solve? | Owning heap allocation for one value, including recursive and erased forms. |
| What does `Sized` mean? | The compiler knows the type's size at compile time. |
| Name three unsized forms. | `str`, `[T]`, and `dyn Trait`. |
| Why can vector growth invalidate element references? | Reallocation can move the backing buffer. |
| Is heap allocation always bad? | No. It is often necessary and correct; the real question is whether the allocation is justified. |

## Chapter Cheat Sheet

| Type shape | Representation intuition | Common use |
|---|---|---|
| plain scalar | inline stack/local data | counters, small values |
| `String` | owner metadata + heap bytes | owned text |
| `Vec<T>` | owner metadata + heap elements | growable collection |
| `Box<T>` | owning heap pointer | indirection / recursive types |
| `&[T]`, `&str`, `&dyn Trait` | fat pointer with metadata | borrowed DST view |

---

# Chapter 20: Move Semantics, `Copy`, `Clone`, and `Drop`

## Step 1 - The Problem

Once you know that ownership can move, the next questions are:

- when is assignment a move?
- when is assignment a copy?
- when should duplication be explicit?
- how does cleanup interact with all of this?

Many languages blur these differences. Rust does not, because resource safety depends on them.

## Step 2 - Rust's Design Decision

Rust split value transfer into distinct semantic categories:

- move for ownership transfer
- `Copy` for cheap implicit duplication
- `Clone` for explicit duplication
- `Drop` for cleanup logic

Rust accepted:

- more traits and explicitness
- friction when trying to "just duplicate" resource-owning values

Rust refused:

- implicit deep copies
- ambiguous destructor behavior
- accidental duplication of resource owners

## Step 3 - The Mental Model

Plain English rule:

- move transfers ownership
- `Copy` duplicates implicitly because duplication is cheap and safe
- `Clone` duplicates explicitly because the cost or semantics matter
- `Drop` runs when ownership finally ends

## Step 4 - Minimal Code Example

```rust
let x = 5i32;
let y = x;
println!("{x} {y}");
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `i32` is `Copy`.
2. `let y = x;` duplicates the bits.
3. Both bindings remain valid because duplicating an `i32` does not create resource-ownership ambiguity.

Now compare:

```rust
let s1 = String::from("hi");
let s2 = s1;
```

1. `String` is not `Copy`.
2. `s2 = s1` is a move.
3. `s1` is invalidated because two live `String` owners would double-drop the same heap buffer.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Small simple values like integers get copied automatically. Resource-owning values like `String` get moved by default.

### Level 2 - Engineer

Choose `Copy` only for types where implicit duplication is cheap and semantically unsurprising. Use `Clone` when duplication is meaningful enough that callers should opt in visibly. That is why `String` is `Clone` but not `Copy`.

### Level 3 - Systems

`Copy` is a semantic promise:

- bitwise duplication preserves correctness
- implicit duplication is acceptable
- there is no destructor logic requiring unique ownership

This is why `Copy` and `Drop` are incompatible. A type with destructor semantics cannot be safely or meaningfully duplicated implicitly without changing cleanup behavior.

## What Can Be `Copy`?

Usually:

- integers
- floats
- bool
- char
- plain references
- small structs/enums whose fields are all `Copy`

Usually not:

- `String`
- `Vec<T>`
- `Box<T>`
- file handles
- mutex guards
- anything implementing `Drop`

## `Clone`

`Clone` is explicit:

```rust
let a = String::from("hello");
let b = a.clone();
```

That explicitness matters because:

- duplication may allocate
- duplication may be expensive
- duplication may reflect a design choice the reader should notice

In good Rust code, `clone()` is not shameful. It is shameful only when used to avoid understanding ownership or when sprayed blindly through hot paths.

## `Drop`

`Drop` ties cleanup to ownership end. It completes the model:

- move changes who will be dropped
- `Copy` makes extra identical values that each need no special cleanup
- `Clone` creates a fresh owned value with its own later drop
- `Drop` closes the lifecycle

`ManuallyDrop<T>` exists for advanced low-level code that must suppress automatic destruction temporarily, but that belongs mostly in systems internals rather than ordinary application logic.

## Step 7 - Common Misconceptions

Wrong model 1: "`Copy` is just a performance optimization."

Correction: it is also a semantic choice about ownership behavior.

Wrong model 2: "If cloning makes the code compile, it must be the right fix."

Correction: it may be the right ownership model, or it may be papering over poor structure.

Wrong model 3: "Moves are expensive because data is moved."

Correction: moves often transfer small owner metadata, not the whole heap allocation.

Wrong model 4: "`Copy` and `Drop` could work together if the compiler were smarter."

Correction: they encode conflicting semantics around implicit duplication and destruction.

## Step 8 - Real-World Pattern

Reading strong Rust code means noticing:

- when an API returns owned versus borrowed data
- whether a type derives `Copy` for ergonomic value semantics
- whether `clone()` is deliberate or suspicious
- where destructor-bearing values are scoped tightly

These choices signal both performance intent and API taste.

## Step 9 - Practice Block

### Code Exercise

Define one small plain-data struct that can derive `Copy` and one heap-owning struct that should only derive `Clone`. Explain why.

### Code Reading Drill

What ownership events happen here?

```rust
let a = String::from("x");
let b = a.clone();
let c = b;
```

### Spot the Bug

Why can this type not be `Copy`?

```rust
struct Temp {
    path: String,
}

impl Drop for Temp {
    fn drop(&mut self) {}
}
```

### Refactoring Drill

Take code with repeated `.clone()` calls and redesign one layer so a borrow or ownership transfer expresses the same intent more clearly.

### Compiler Error Interpretation

If the compiler says use of moved value, translate that as: "this value was non-`Copy`, so assignment or passing consumed the old owner."

## Step 10 - Contribution Connection

After this chapter, you can read:

- ownership-sensitive APIs
- derive choices around `Copy` and `Clone`
- code review comments about accidental cloning
- destructor-bearing helper types

Good first PRs include:

- removing unjustified `Copy` derives
- replacing clone-heavy code with borrowing or moves
- documenting why a type is `Clone` but intentionally not `Copy`

## In Plain English

Rust separates moving, implicit copying, explicit copying, and cleanup because those actions mean different things for real resources. That matters because software breaks when ownership changes are invisible or when expensive duplication happens casually.

## What Invariant Is Rust Protecting Here?

Implicit duplication must only exist when it cannot create resource-ownership ambiguity, and cleanup must still happen exactly once for each distinct owned resource.

## If You Remember Only 3 Things

- Move is ownership transfer.
- `Copy` is implicit duplication for cheap, destructor-free value semantics.
- `Clone` is explicit duplication because the cost or meaning matters.

## Memory Hook

Move is handing over the only house key. `Copy` is photocopying a public handout. `Clone` is ordering a second handcrafted item from the workshop.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does move mean? | Ownership transfers to a new binding or callee. |
| What does `Copy` mean? | The value may be duplicated implicitly because that is cheap and semantically safe. |
| Why is `String` not `Copy`? | It owns heap data and implicit duplication would create double-drop ambiguity. |
| Why is `Clone` explicit? | Duplication may allocate or carry semantic cost. |
| Can a `Drop` type also be `Copy`? | No. Destructor semantics conflict with implicit duplication. |
| Are references `Copy`? | Yes, shared references are cheap, non-owning values. |
| What is a common smell involving `clone()`? | Using it as a reflex to silence ownership confusion. |
| What does `ManuallyDrop` do conceptually? | It suppresses automatic destruction until low-level code chooses otherwise. |

## Chapter Cheat Sheet

| Operation | Meaning | Typical cost story |
|---|---|---|
| assignment of `Copy` type | implicit duplicate | cheap value copy |
| assignment of non-`Copy` type | move | ownership transfer |
| `.clone()` | explicit duplicate | may allocate or do real work |
| scope exit | `Drop` runs | cleanup of owned resources |
| `Drop` + implicit copy | forbidden | would break destructor semantics |

---

# Chapter 21: The Borrow Checker, How the Compiler Thinks

## Step 1 - The Problem

The borrow checker often feels like one feature from the outside, but internally it is the compiler enforcing several related invariants over program control flow:

- values are moved only once unless copied or cloned
- references never dangle
- shared and mutable access do not conflict
- returned borrows are tied to valid sources

If you only read borrow-checker errors textually, you stay reactive. To become fluent, you need to simulate what the compiler is tracking.

## Step 2 - Rust's Design Decision

Rust performs borrow checking on MIR, the compiler's mid-level representation, not directly on raw surface syntax.

That matters because MIR makes control flow, temporary values, drops, and last uses explicit. Borrow checking then becomes reasoning over actual program state transitions rather than over pretty syntax.

Rust accepted:

- diagnostics that sometimes seem one step removed from the source
- a stricter model than many programmers are used to

Rust refused:

- runtime borrow checking as the default for all references
- unsound aliasing for convenience

## Step 3 - The Mental Model

Plain English rule: the borrow checker is tracking when ownership changes, when references come into existence, when they are last used, and whether those live regions conflict.

To predict borrow-checker behavior, ask:

1. who owns the value now?
2. what references are live right now?
3. when is each one last used?
4. does any move or mutation overlap with a conflicting live borrow?

## Step 4 - Minimal Code Example

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];
println!("{first}");
v.push(4);
```

## Step 5 - Line-by-Line Compiler Walkthrough

Conceptually on MIR-like reasoning:

1. `v` is initialized.
2. `first` becomes a shared borrow tied to `v`'s buffer.
3. `println!` uses `first`.
4. After that last use, the shared borrow is dead.
5. `v.push(4)` now takes a mutable borrow of `v`.
6. Because the earlier shared borrow is no longer live, the mutation is accepted.

Change the order:

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];
v.push(4);
println!("{first}");
```

Now the shared borrow is still live when the push tries to mutably borrow `v`, so the compiler rejects it.

That is not arbitrary. It is liveness analysis plus aliasing rules.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

The borrow checker cares about whether a borrow is still being used, not just whether its name still exists in the code.

### Level 2 - Engineer

Most borrow-checker fixes fall into one of these categories:

- shorten the borrow
- separate read and write phases
- move ownership instead of borrowing
- return owned data instead of borrowed data
- restructure temporary values so they live long enough

### Level 3 - Systems

Borrow checking on MIR is one reason Rust can accept code that earlier scope-based reasoning would reject. It also explains features like two-phase borrows: certain patterns reserve a mutable borrow and then activate it only when the mutation actually happens, allowing method-call ergonomics that would otherwise be too strict.

## Two-Phase Borrows

One famous example:

```rust
let mut v = vec![1, 2, 3];
v.push(v.len());
```

At first glance, this seems impossible: `push` needs mutable access to `v`, while `len()` needs shared access to `v`.

Rust permits it through two-phase borrowing:

- reserve the mutable borrow for the method call
- evaluate arguments like `v.len()`
- activate the mutable borrow when the actual mutation occurs

This is a specific ergonomic relaxation, not a weakening of the overall aliasing model.

## Mental Simulation Technique

When stuck, make a four-column table:

| Line | Owner | Live borrows | Next action |
|---|---|---|---|
| `let s = String::from("x");` | `s` | none | maybe borrow/move later |
| `let r = &s;` | `s` | shared `r` | cannot mutably borrow `s` yet |
| `println!("{r}");` | `s` | `r` last used here | borrow ends after line |

This sounds simple because it is. The trick is doing it consistently.

## Error Code Reading

### E0382 - Use of moved value

Meaning: ownership already transferred, old binding cannot be used.

### E0502 - Cannot borrow as mutable because already borrowed as immutable

Meaning: aliasing and mutation overlap in one live region.

### E0505 - Cannot move out because value is borrowed

Meaning: a borrow still depends on the current owner, so moving the owner would invalidate it.

### E0515 - Cannot return reference to local variable

Meaning: the referenced owner dies at function exit.

### E0521 - Borrowed data escapes outside of closure

Meaning: a closure or returned value is trying to preserve a borrow beyond the region the compiler can validate.

These are not separate mysteries. They are all forms of the same ownership-and-liveness story.

## When to Fight the Borrow Checker vs Restructure

Fight the borrow checker only when:

- you know the code is sound
- the borrow regions are clear
- a small rewrite or scoping change will expose that to the compiler

Restructure when:

- you are relying on long-lived mutable state across many phases
- you are returning borrows from temporary constructions
- you are cloning repeatedly to escape design confusion

The compiler is often telling you something important about phase separation and ownership structure, not merely asking for syntax tweaks.

## Step 7 - Common Misconceptions

Wrong model 1: "The borrow checker reasons only in terms of source-code scopes."

Correction: modern borrow checking uses liveness and MIR-based reasoning.

Wrong model 2: "If the compiler rejects code that I know is logically safe, the checker is just dumb."

Correction: sometimes the code truly obscures the invariant. Sometimes the compiler has a limitation. Distinguishing those is part of maturity.

Wrong model 3: "Two-phase borrows mean aliasing rules are inconsistent."

Correction: they are a carefully bounded ergonomic feature preserving the same underlying rules.

Wrong model 4: "Clone until it compiles" is a professional strategy.

Correction: it is sometimes a tactical patch, but often a signal you are not modeling ownership clearly yet.

## Step 8 - Real-World Pattern

Strong Rust codebases often look simpler than expected because they were designed with the borrow checker in mind:

- read phase, then mutate phase
- small local scopes
- owned intermediate values where borrowing would become tangled
- APIs that return owned results at complexity boundaries

That is not "coding for the compiler" in a bad sense. It is coding with explicit invariants.

## Step 9 - Practice Block

### Code Exercise

Take one borrow error you remember and write a line-by-line owner/borrow table for it before fixing it.

### Code Reading Drill

Explain why this works:

```rust
let mut s = String::from("hi");
let len = s.len();
s.push('!');
println!("{len} {s}");
```

### Spot the Bug

Why does this fail?

```rust
let s = String::from("hi");
let r = &s;
let moved = s;
println!("{r} {moved}");
```

### Refactoring Drill

Take a function that holds a mutable borrow while also needing later read-only access and split it into phases.

### Compiler Error Interpretation

If the compiler rejects returning a reference to data created inside the function, translate that as: "the output borrow has no owner outside this function to remain attached to."

## Step 10 - Contribution Connection

After this chapter, you can read:

- borrow-heavy refactors
- compiler-error-driven bug fixes
- phase-separated mutation logic
- API reviews discussing owned versus borrowed returns

Good first PRs include:

- simplifying borrow-heavy functions into clearer phases
- reducing confusing temporary-value lifetimes
- improving comments around ownership-sensitive code paths

## In Plain English

The borrow checker is not guessing. It is tracking who owns what, who is borrowing what, and whether those facts conflict as the program flows forward. That matters because once you can think in those terms, compiler errors stop feeling like random obstacles and start feeling like evidence.

## What Invariant Is Rust Protecting Here?

Across all control-flow paths, ownership transfers, borrow lifetimes, and mutation access must remain mutually consistent so no reference can outlive valid data or observe conflicting mutation.

## If You Remember Only 3 Things

- Borrow-checker errors are ownership-and-liveness stories, not isolated slogans.
- MIR-based reasoning is why last use matters more than just lexical scope.
- Most fixes come from clarifying phases and ownership boundaries, not from sprinkling clones.

## Memory Hook

The borrow checker is an air-traffic controller. It does not hate planes. It tracks which runway each plane is using and prevents two incompatible movements from happening in the same space at the same time.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does the borrow checker track conceptually? | Ownership changes, live borrows, last uses, and conflicting access. |
| Why does MIR matter for borrow checking? | It makes control flow and liveness explicit for the analysis. |
| What is two-phase borrowing? | Reserving a mutable borrow before activating it, enabling some method-call patterns like `v.push(v.len())`. |
| What does E0382 usually indicate? | A value was used after ownership moved elsewhere. |
| What does E0502 usually indicate? | A mutable borrow conflicts with a live immutable borrow. |
| What does E0505 usually indicate? | A move was attempted while a borrow still depended on the owner. |
| What does E0515 usually indicate? | A function tried to return a reference to data owned locally inside the function. |
| What is the best first debugging move for a borrow error? | Write down owner, live borrows, and last uses line by line. |

## Chapter Cheat Sheet

| Symptom | Likely cause | Common fix |
|---|---|---|
| E0382 | move already happened | borrow, clone, or redesign ownership |
| E0502 / E0499 | overlapping access | shorten borrow or separate phases |
| E0505 | move while borrowed | end borrow before moving |
| E0515 | returning local borrow | return owned data or borrow caller input |
| confusing borrow error | unclear liveness | simulate owners and live borrows line by line |

---

## Part 3 Summary

Ownership is Rust's resource model.
Borrowing is Rust's access model.
Lifetimes are Rust's borrowed-relationship model.
Moves, `Copy`, `Clone`, and `Drop` are lifecycle events inside that model.
Stack versus heap explains the physical representation underneath it.
The borrow checker is the compiler enforcing all of it over control flow.

These are not six topics. They are one coherent design. Once you see that coherence, Rust stops feeling like a language of special cases and starts feeling like a language with one deep rule taught through many surfaces.
