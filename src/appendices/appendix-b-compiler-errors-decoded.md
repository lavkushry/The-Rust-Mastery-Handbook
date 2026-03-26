# Appendix B — Compiler Errors Decoded

| Code | Plain English | Invariant being violated | Common root cause | Canonical fix |
|---|---|---|---|---|
| `E0106` | A borrowed relationship was not spelled out | Returned or stored references must be tied to valid owners | Multiple input references or borrowed structs without explicit lifetimes | Add lifetime parameters that describe the relationship |
| `E0277` | A type does not satisfy a required capability | Generic code may only assume declared trait bounds | Missing impl, wrong bound, or wrong type | Add the trait bound, use a compatible type, or implement the trait |
| `E0282` | Type inference cannot determine a concrete type | The compiler needs one unambiguous type story | `collect()`, `parse()`, or generic constructors without enough context | Add a type annotation or turbofish |
| `E0283` | Multiple type choices are equally valid | Ambiguous trait/type resolution must be resolved explicitly | Conversion or generic APIs with several candidates | Provide an explicit target type |
| `E0308` | The expression does not evaluate to the type you claimed | Each expression path must agree on type | Missing semicolon understanding, wrong branch types, wrong return type | Convert values or change the function/variable type |
| `E0038` | A trait cannot be turned into a trait object | Runtime dispatch needs object-safe traits | Returning `Self`, generic methods, or `Sized` assumptions in a dyn trait | Redesign the trait or use generics instead of trait objects |
| `E0373` | A closure may outlive borrowed data it captures | Escaping closures must not carry dangling borrows | Spawning threads/tasks with non-`'static` captures | Use `move`, clone owned data, or use scoped threads |
| `E0382` | You used a value after moving it | A moved owner is no longer valid | Passing ownership into a function or assignment, then reusing original binding | Borrow instead, return ownership back, or clone intentionally |
| `E0432` | Import path not found | Module paths must resolve to actual items | Wrong module path or forgotten `pub` | Fix `use` path or visibility |
| `E0433` | Name or module cannot be resolved | Names must exist in scope and dependency graph | Missing crate/module declaration or typo | Add dependency/import/module declaration |
| `E0499` | Multiple mutable borrows overlap | There may be only one active mutable reference | Holding one `&mut` while creating another | Shorten borrow scope or restructure data access |
| `E0502` | Shared and mutable borrows overlap | Aliasing and mutation cannot coexist | Reading from a value while also mutably borrowing it | End the shared borrow earlier or split operations |
| `E0505` | Value moved while still borrowed | A borrow must remain valid until its last use | Moving a value into a function/container while a reference to it still exists | Reorder operations or clone/borrow differently |
| `E0507` | Tried to move out of borrowed content | Borrowed containers may not lose owned fields implicitly | Pattern-matching or method calls that move from `&T` or `&mut T` | Clone, use `mem::take`, or change ownership structure |
| `E0515` | Returned reference points to local data | Returned borrows must outlive the function | Returning `&str`/`&T` derived from a local `String`/`Vec` | Return owned data or tie the borrow to an input |
| `E0521` | Borrowed data escapes its allowed scope | A closure/body cannot leak a shorter borrow outward | Capturing short-lived refs into spawned work or returned closures | Own the data or widen the source lifetime correctly |
| `E0596` | Tried to mutate through an immutable path | Mutation requires a mutable binding or mutable borrow | Missing `mut` or using `&T` instead of `&mut T` | Add mutability at the right layer |
| `E0597` | Borrowed value does not live long enough | The owner disappears before the borrow ends | Referencing locals that die before use completes | Extend owner lifetime or reduce borrow lifetime |
| `E0599` | No method found for type in current context | Methods require the type or trait to actually provide them | Missing trait import or wrong receiver type | Import the trait, adjust the type, or call the right method |
| `E0716` | Temporary value dropped while borrowed | References to temporaries cannot outlive the temporary expression | Borrowing from chained temporary values | Bind the temporary to a named local before borrowing |

### Error Reading Habits

1. Read the first sentence of the error for the category.
2. Read the labeled spans for the actual conflicting operations.
3. Ask which invariant is broken: ownership, lifetime, trait capability, or type agreement.
4. Use `rustc --explain CODE` when the category is new to you.

---
