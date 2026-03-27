# Chapter 20: Move Semantics, `Copy`, `Clone`, and `Drop`

<div class="chapter-snapshot">
  <div class="snapshot-cell">
    <h4>Prerequisites</h4>
    <div class="snapshot-prereq">
      <a href="../part-02/chapter-10-ownership-first-contact.html">Ch 10: Ownership</a>
      <a href="../part-03/chapter-16-ownership-as-resource-management.html">Ch 16: RAII</a>
    </div>
  </div>
  <div class="snapshot-cell">
    <h4>You will understand</h4>
    <ul>
      <li>Move vs Copy vs Clone — three distinct events</li>
      <li>Why <code>Copy</code> and <code>Drop</code> cannot coexist</li>
      <li>When <code>.clone()</code> is deliberate vs a code smell</li>
    </ul>
  </div>
  <div class="snapshot-cell">
    <h4>Reading time</h4>
    <div class="snapshot-time">40<span class="snapshot-time-unit"> min</span></div>
    <div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 25 min exercises</div>
  </div>
</div>
<div class="concept-link builds-on">
  <div class="concept-link-icon">←</div>
  <div class="concept-link-body">
    <strong>Builds on Chapter 16</strong>
    RAII showed that scope exit triggers cleanup. This chapter explains the four transfer events (move, copy, clone, drop) that express ownership at each step.
    <a href="../part-03/chapter-16-ownership-as-resource-management.html">Revisit Ch 16 →</a>
  </div>
</div>
<div class="concept-link needed-for">
  <div class="concept-link-icon">→</div>
  <div class="concept-link-body">
    <strong>You'll need this for Chapter 30</strong>
    Smart pointers (<code>Box</code>, <code>Rc</code>, <code>RefCell</code>) change the ownership shape — they are the engineered alternatives to default move/drop semantics.
    <a href="../part-04/chapter-30-smart-pointers-and-interior-mutability.html">Ch 30: Smart Pointers →</a>
  </div>
</div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--move);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Transfer Semantics</div><h2 class="visual-figure__title">Move, Copy, Clone, and Drop Are Different Events</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Comparison between move, copy, clone, and drop lifecycle events"><rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(251,133,0,0.16)"></rect><rect x="56" y="74" width="186" height="114" rx="18" fill="#fff5eb" stroke="#fb8500" stroke-width="3"></rect><text x="124" y="108" class="svg-small" style="fill:#8a4b08;">move</text><rect x="86" y="128" width="48" height="34" fill="#fb8500"></rect><path d="M142 145 H 214" stroke="#fb8500" stroke-width="6" marker-end="url(#moveArrow20)"></path><rect x="214" y="128" width="48" height="34" fill="#fb8500"></rect><rect x="56" y="214" width="186" height="114" rx="18" fill="#edf8f1" stroke="#74c69d" stroke-width="3"></rect><text x="126" y="248" class="svg-small" style="fill:#1f6f4d;">copy</text><rect x="84" y="268" width="40" height="28" fill="#74c69d"></rect><rect x="144" y="268" width="40" height="28" fill="#74c69d"></rect><path d="M124 282 H 144" stroke="#74c69d" stroke-width="4"></path><rect x="300" y="74" width="186" height="114" rx="18" fill="#eef2ff" stroke="#3a86ff" stroke-width="3"></rect><text x="366" y="108" class="svg-small" style="fill:#1e40af;">clone</text><rect x="326" y="128" width="44" height="34" fill="#3a86ff"></rect><rect x="414" y="128" width="44" height="34" fill="#8ecae6"></rect><text x="320" y="180" class="svg-small" style="fill:#1e40af;">explicit duplicate</text><rect x="300" y="214" width="186" height="114" rx="18" fill="#f3f0ff" stroke="#6d6875" stroke-width="3"></rect><text x="372" y="248" class="svg-small" style="fill:#514b5a;">drop</text><rect x="360" y="268" width="64" height="28" fill="#6d6875"></rect><path d="M392 268 V 316" stroke="#6d6875" stroke-width="6"></path><text x="344" y="342" class="svg-small" style="fill:#6b7280;">cleanup runs when the final owner ends</text><defs><marker id="moveArrow20" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#fb8500"></path></marker></defs></svg></div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--move);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Eligibility</div><h2 class="visual-figure__title">Why <code>Copy</code> and <code>Drop</code> Cannot Coexist</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Eligibility diagram showing copy-safe plain data versus drop-bearing resource owners"><rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect><rect x="52" y="94" width="180" height="204" rx="18" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect><text x="98" y="128" class="svg-small" style="fill:#d9fbe9;">can be Copy</text><text x="82" y="164" class="svg-small" style="fill:#d9fbe9;">i32 bool char &amp;T</text><text x="82" y="194" class="svg-small" style="fill:#d9fbe9;">small structs of Copy fields</text><rect x="308" y="94" width="180" height="204" rx="18" fill="#3a1c17" stroke="#e63946" stroke-width="3"></rect><text x="352" y="128" class="svg-small" style="fill:#ffd8cc;">not Copy</text><text x="330" y="164" class="svg-small" style="fill:#ffd8cc;">String Vec Box file handle</text><text x="330" y="194" class="svg-small" style="fill:#ffd8cc;">anything with Drop</text><path d="M232 196 H 308" stroke="#ffbe0b" stroke-width="5"></path><text x="244" y="184" class="svg-small" style="fill:#fff3c4;">implicit duplication and unique destruction conflict</text></svg></div>
  </figure>
</div>

<div class="annotated-code" style="--chapter-accent: var(--ownership);">

```rust
let a: i32 = 42;
let b = a;           // Copy — a is still valid
println!("{a}");

let s1 = String::from("hello");
let s2 = s1;         // Move — s1 invalidated
// println!("{s1}");  // E0382

let s3 = s2.clone(); // Clone — explicit deep copy
println!("{s2} {s3}");
```

<div class="ann-col">
  <div class="ann-item ann-valid">
    <strong>Copy (implicit)</strong>
    <code>i32</code> implements <code>Copy</code>. Stack-only, bitwise copy. Both valid.
  </div>
  <div class="ann-item ann-move">
    <strong>Move (implicit)</strong>
    <code>String</code> is not <code>Copy</code>. Assignment transfers ownership. <code>s1</code> dead.
  </div>
  <div class="ann-item ann-own">
    <strong>Clone (explicit)</strong>
    <code>.clone()</code> duplicates heap data. Now two independent owners with separate allocations.
  </div>
</div>
</div>

### In Your Language: Move vs Copy

<div class="lang-compare">
<div class="lang-panel">
<span class="lang-label lang-label--rust">Rust — explicit</span>

```rust
let a = 42;             // Copy (i32 is Copy)
let b = a;              // both valid

let s = String::from("x");
let t = s;              // Move — s is dead
let u = t.clone();      // Clone — explicit copy
```

</div>
<div class="lang-panel">
<span class="lang-label lang-label--go">Go — implicit</span>

```go
a := 42
b := a           // value copy (always)

s := "hello"
t := s           // both valid (GC manages)
// No move concept — everything is copied or ref-counted
```

</div>
</div>

### Three-Level Explanation

<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

**Beginner:** When you assign a `String` to another variable, the original becomes invalid. Think of it like passing a physical key — only one person can hold it. For simple numbers (`i32`, `bool`), Rust copies them automatically because they're cheap.

</div>
<div class="level-panel" data-level="Engineer">

**Engineer:** Types that are `Copy` (all scalar types, `&T`) are bitwise-copied on assignment. Non-`Copy` types (anything owning heap data: `String`, `Vec`, `Box`) are moved — the source is invalidated. `.clone()` performs a deep copy by calling the `Clone` trait implementation, allocating new heap memory.

</div>
<div class="level-panel" data-level="Deep Dive">

**Deep Dive:** At the MIR level, a move is a `memcpy` of the stack representation followed by marking the source as *uninitialized*. The compiler inserts drop flags (`bool`) to track whether a binding is live. `Copy` is a marker trait with no methods — it simply tells the compiler "bitwise copy is semantically correct for this type." `Clone` is a regular trait with `fn clone(&self) -> Self`. Types can be `Clone` without being `Copy` when they need custom duplication logic (e.g., allocating new heap memory).

</div>
</div>

## Readiness Check - Transfer Semantics Mastery

| Skill                       | Level 0                            | Level 1                          | Level 2                                                         | Level 3                                                |
| --------------------------- | ---------------------------------- | -------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| Distinguish move/copy/clone | I mix them up                      | I can name each one              | I can predict which event happens at assignment/call sites      | I can design APIs that express transfer intent clearly |
| Use clone intentionally     | I add clone to silence errors      | I know clone creates a duplicate | I can justify each clone by ownership need or boundary crossing | I can remove unnecessary clones in hot paths           |
| Reason about drop safety    | I treat cleanup as hidden behavior | I know drop runs at scope end    | I can explain why `Copy` and `Drop` conflict                    | I can model teardown order in composed types           |

Target Level 2+ before moving to borrow-checker internals.

## Compiler Error Decoder - Move and Drop Semantics

| Error code | What it usually means                                       | Typical fix direction                                                       |
| ---------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| E0382      | Used value after it moved                                   | Borrow instead, reorder usage before move, or clone intentionally           |
| E0505      | Tried to move a value while references to it are still live | End borrows first, then move; or clone for independent ownership            |
| E0509      | Tried to move out of a type that implements `Drop`          | Borrow fields, use explicit extraction patterns, or redesign data ownership |

First diagnose the transfer event, then decide whether ownership should move, be borrowed, or be duplicated.

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

| Question                                    | Answer                                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| What does move mean?                        | Ownership transfers to a new binding or callee.                                     |
| What does `Copy` mean?                      | The value may be duplicated implicitly because that is cheap and semantically safe. |
| Why is `String` not `Copy`?                 | It owns heap data and implicit duplication would create double-drop ambiguity.      |
| Why is `Clone` explicit?                    | Duplication may allocate or carry semantic cost.                                    |
| Can a `Drop` type also be `Copy`?           | No. Destructor semantics conflict with implicit duplication.                        |
| Are references `Copy`?                      | Yes, shared references are cheap, non-owning values.                                |
| What is a common smell involving `clone()`? | Using it as a reflex to silence ownership confusion.                                |
| What does `ManuallyDrop` do conceptually?   | It suppresses automatic destruction until low-level code chooses otherwise.         |

## Chapter Cheat Sheet

| Operation                     | Meaning            | Typical cost story               |
| ----------------------------- | ------------------ | -------------------------------- |
| assignment of `Copy` type     | implicit duplicate | cheap value copy                 |
| assignment of non-`Copy` type | move               | ownership transfer               |
| `.clone()`                    | explicit duplicate | may allocate or do real work     |
| scope exit                    | `Drop` runs        | cleanup of owned resources       |
| `Drop` + implicit copy        | forbidden          | would break destructor semantics |

---
