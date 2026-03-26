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
