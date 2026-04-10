# Compiler Error Playbook

Use this playbook to turn compiler errors into fast learning loops instead of random
trial-and-error edits.

## Fast Triage Loop

1. Copy the first compiler error code, for example `E0502`.
2. Run `rustc --explain E0502`.
3. Identify which invariant was violated: ownership transfer, borrow overlap, or
   lifetime relationship.
4. Apply one structural fix only, then recompile.
5. Repeat with the next top-most error.

## Chapter-to-Error Map

| Chapter | Main errors         | Why they appear                              |
| ------- | ------------------- | -------------------------------------------- |
| Ch 10   | E0382, E0507, E0716 | Values move, temp lifetimes easily misread   |
| Ch 11   | E0502, E0499, E0596 | Shared/mutable rules overlap in refactoring  |
| Ch 16   | E0382, E0509, E0040 | Resource cleanup exposes ownership bugs      |
| Ch 17   | E0502, E0499, E0506 | Overlapping mutation rejected                |
| Ch 18   | E0597, E0515, E0621 | Returned references/outlives constraints     |

## Recommended Debugging Order

Fix in this order for cleaner progress:

1. Ownership moves (`E0382`, `E0507`)
2. Borrow conflicts (`E0499`, `E0502`, `E0506`, `E0596`)
3. Lifetime relationship errors (`E0597`, `E0515`, `E0621`)

Why: lifetime diagnostics often become clearer once ownership and borrow shape are
correct.

## Team Rule of Thumb

- Prefer changing data flow over adding clones by default.
- Use `clone()` only when ownership separation is truly needed.
- If references become tangled, return an owned value and simplify first.

## Practice Prompt

For each chapter exercise, answer this after every fix:

"What invariant did this error protect?"

If you can answer that consistently, your Rust debugging speed will rise quickly.
