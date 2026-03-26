# Appendix C — Trait Quick Reference

| Trait | What it means | Derivable? | When manual impl is necessary | Common mistake |
|---|---|---|---|---|
| `Debug` | Type can be formatted for debugging | Usually yes | Custom debug structure or redaction | Confusing debug output with user-facing formatting |
| `Display` | Type has a user-facing textual form | No | Almost always manual | Using `Debug` where `Display` is expected |
| `Clone` | Type can produce an explicit duplicate | Often yes | Custom deep-copy or handle semantics | Treating `clone()` as always cheap |
| `Copy` | Type can be duplicated by plain bit-copy | Often yes if eligible | Rarely, because rules are strict | Trying to make a type `Copy` when it has ownership or `Drop` |
| `Default` | Type has a canonical default constructor | Often yes | Defaults depend on invariants or smart constructors | Giving a meaningless default that violates domain clarity |
| `PartialEq` | Values can be compared for equality | Often yes | Floating rules or custom semantics | Deriving equality when identity semantics differ |
| `Eq` | Equality is total and reflexive | Often yes | Rare; usually paired with `PartialEq` | Implementing for NaN-like semantics where reflexivity fails |
| `PartialOrd` | Values have a partial ordering | Often yes | Domain-specific ordering logic | Assuming partial order is total |
| `Ord` | Values have a total ordering | Often yes | Manual canonical order needed | Implementing an order inconsistent with `Eq` |
| `Hash` | Type can be hashed consistently with equality | Often yes | Canonicalization or subset hashing | Hash not matching equality semantics |
| `From<T>` | Infallible conversion from `T` | No | Custom conversion rules | Putting fallible conversion here instead of `TryFrom` |
| `TryFrom<T>` | Fallible conversion from `T` | No | Validation is required | Hiding validation failure with panics |
| `AsRef<T>` | Cheap borrowed view into another type | No | Boundary APIs and adapters | Returning owned values instead of views |
| `Borrow<T>` | Hash/ordering-compatible borrowed form | No | Collections and map lookups | Implementing when borrowed and owned forms are not semantically identical |
| `Deref` | Smart-pointer-like transparent access | No | Pointer wrappers | Using `Deref` for unrelated convenience conversions |
| `Iterator` | Produces a sequence of items via `next()` | No | Custom iteration behavior | Forgetting that iterators are lazy until consumed |
| `IntoIterator` | Type can be turned into an iterator | Often indirectly | Collections and custom containers | Missing owned/reference iterator variants |
| `Error` | Standard error trait for failure types | No | Library/application error types | Exposing `String` where a structured error is needed |
| `Send` | Safe to transfer ownership across threads | Auto trait | Manual unsafe impl only for proven-safe abstractions | Assuming `Send` is about mutability instead of thread transfer |
| `Sync` | Safe for `&T` to be shared across threads | Auto trait | Manual unsafe impl only with strong invariants | Confusing `Sync` with "internally immutable" |
| `Unpin` | Safe to move after pinning contexts | Auto trait | Self-referential or movement-sensitive types | Treating Pin/Unpin as async-only instead of movement semantics |

### Traits You Will See Constantly

| Category | Traits you should recognize instantly |
|---|---|
| Formatting | `Debug`, `Display` |
| Ownership/value behavior | `Clone`, `Copy`, `Drop`, `Default` |
| Equality and ordering | `PartialEq`, `Eq`, `PartialOrd`, `Ord`, `Hash` |
| Conversion and borrowing | `From`, `TryFrom`, `AsRef`, `Borrow`, `Deref` |
| Iteration | `Iterator`, `IntoIterator` |
| Errors | `Error` |
| Concurrency | `Send`, `Sync` |
| Async movement | `Unpin` |

---
