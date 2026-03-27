# Compiler Error Playbook

Use this playbook to turn compiler errors into fast learning loops instead of random trial-and-error edits.

## Fast Triage Loop

1. Copy the first compiler error code, for example `E0502`.
2. Run `rustc --explain E0502`.
3. Identify which invariant was violated: ownership transfer, borrow overlap, or lifetime relationship.
4. Apply one structural fix only, then recompile.
5. Repeat with the next top-most error.

## Chapter-to-Error Map

| Chapter                                   | Main error families | Why they appear                                                   |
| ----------------------------------------- | ------------------- | ----------------------------------------------------------------- |
| Chapter 10 (Ownership First Contact)      | E0382, E0507, E0716 | Values move, and temporary lifetimes are easy to misread early on |
| Chapter 11 (Borrowing First Contact)      | E0502, E0499, E0596 | Shared vs mutable borrow rules overlap during refactors           |
| Chapter 16 (Ownership as RAII)            | E0382, E0509, E0040 | Resource cleanup and `Drop` boundaries expose ownership mistakes  |
| Chapter 17 (Borrowing Constrained Access) | E0502, E0499, E0506 | Iterator invalidation and overlapping mutation are rejected       |
| Chapter 18 (Lifetimes Relationships)      | E0597, E0515, E0621 | Returned references and outlives constraints must align           |

## Recommended Debugging Order

Fix in this order for cleaner progress:

1. Ownership moves (`E0382`, `E0507`)
2. Borrow conflicts (`E0499`, `E0502`, `E0506`, `E0596`)
3. Lifetime relationship errors (`E0597`, `E0515`, `E0621`)

Why: lifetime diagnostics often become clearer once ownership and borrow shape are correct.

## Team Rule of Thumb

- Prefer changing data flow over adding clones by default.
- Use `clone()` only when ownership separation is truly needed.
- If references become tangled, return an owned value and simplify first.

## Practice Prompt

For each chapter exercise, answer this after every fix:

"What invariant did this error protect?"

If you can answer that consistently, your Rust debugging speed will rise quickly.
