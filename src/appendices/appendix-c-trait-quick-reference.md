# Appendix C — Trait Quick Reference
<figure class="visual-figure" style="--chapter-accent: var(--trait);"><div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Trait Map</div><h2 class="visual-figure__title">Standard Traits by Capability Family</h2></div></div><div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 980 360" role="img" aria-label="Trait capability map grouped into formatting, value behavior, ordering, conversion, iteration, errors, and concurrency"><rect x="24" y="24" width="932" height="312" rx="28" fill="#fffdf8" stroke="rgba(33,158,188,0.14)"></rect><circle cx="490" cy="178" r="54" fill="#e63946"></circle><text x="468" y="184" class="svg-small" style="fill:#ffffff;">Type</text><g fill="none" stroke="#219ebc" stroke-width="4"><path d="M490 124 V 72"></path><path d="M544 178 H 622"></path><path d="M490 232 V 284"></path><path d="M436 178 H 358"></path></g><rect x="416" y="42" width="148" height="34" rx="12" fill="#eef6fb" stroke="#219ebc"></rect><text x="440" y="64" class="svg-small" style="fill:#0b5e73;">Debug / Display</text><rect x="622" y="160" width="172" height="36" rx="12" fill="#eef6fb" stroke="#219ebc"></rect><text x="646" y="183" class="svg-small" style="fill:#0b5e73;">Clone / Copy / Default</text><rect x="398" y="284" width="184" height="36" rx="12" fill="#eef6fb" stroke="#219ebc"></rect><text x="420" y="307" class="svg-small" style="fill:#0b5e73;">Iterator / IntoIterator</text><rect x="178" y="160" width="180" height="36" rx="12" fill="#eef6fb" stroke="#219ebc"></rect><text x="196" y="183" class="svg-small" style="fill:#0b5e73;">From / TryFrom / AsRef</text><rect x="676" y="244" width="150" height="36" rx="12" fill="#f3f0ff" stroke="#8338ec"></rect><text x="704" y="267" class="svg-small" style="fill:#5c2bb1;">Send / Sync / Unpin</text><rect x="142" y="244" width="134" height="36" rx="12" fill="#fff8df" stroke="#ffbe0b"></rect><text x="170" y="267" class="svg-small" style="fill:#8f5d00;">Eq / Ord / Hash</text></svg></div></figure>

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
