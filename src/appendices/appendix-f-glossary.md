# Appendix F — Glossary
<figure class="visual-figure" style="--chapter-accent: var(--compiler);"><div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Term Clusters</div><h2 class="visual-figure__title">Group Vocabulary by the Invariant It Helps You See</h2></div></div><div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 980 360" role="img" aria-label="Glossary concept clusters for ownership, compiler internals, traits and APIs, concurrency and async, and systems work"><rect x="24" y="24" width="932" height="312" rx="28" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect><rect x="52" y="84" width="150" height="180" rx="22" fill="#fff1eb" stroke="#e63946" stroke-width="3"></rect><text x="86" y="118" class="svg-small" style="fill:#8f2430;">ownership</text><text x="70" y="150" class="svg-small" style="fill:#8f2430;">move borrow drop</text><text x="70" y="176" class="svg-small" style="fill:#8f2430;">lifetime slice pin</text><rect x="228" y="84" width="150" height="180" rx="22" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect><text x="262" y="118" class="svg-small" style="fill:#023e8a;">compiler</text><text x="246" y="150" class="svg-small" style="fill:#023e8a;">AST HIR MIR</text><text x="246" y="176" class="svg-small" style="fill:#023e8a;">trait solver CFG</text><rect x="404" y="84" width="150" height="180" rx="22" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect><text x="446" y="118" class="svg-small" style="fill:#0b5e73;">API</text><text x="422" y="150" class="svg-small" style="fill:#0b5e73;">trait object GAT</text><text x="422" y="176" class="svg-small" style="fill:#0b5e73;">typestate semver</text><rect x="580" y="84" width="150" height="180" rx="22" fill="#edf8f1" stroke="#52b788" stroke-width="3"></rect><text x="612" y="118" class="svg-small" style="fill:#1f6f4d;">async</text><text x="598" y="150" class="svg-small" style="fill:#1f6f4d;">future send sync</text><text x="598" y="176" class="svg-small" style="fill:#1f6f4d;">cancellation</text><rect x="756" y="84" width="150" height="180" rx="22" fill="#f3f0ff" stroke="#8338ec" stroke-width="3"></rect><text x="790" y="118" class="svg-small" style="fill:#5c2bb1;">systems</text><text x="774" y="150" class="svg-small" style="fill:#5c2bb1;">unsafe FFI atomics</text><text x="774" y="176" class="svg-small" style="fill:#5c2bb1;">repr(C) niche UB</text></svg></div></figure>

This glossary defines the Rust-specific terms most likely to appear in compiler errors, RFCs, code review comments, and serious codebases.

| Term | Meaning |
|---|---|
| aliasing | Multiple references or access paths pointing at the same underlying data |
| API surface | The set of public items and behaviors downstream users depend on |
| auto trait | A trait the compiler can automatically determine, such as `Send`, `Sync`, or `Unpin` |
| borrow | A non-owning reference to a value, either shared (`&T`) or mutable (`&mut T`) |
| borrow checker | The compiler analysis that enforces ownership, borrowing, and lifetime invariants |
| cancellation safety | The property that dropping an in-flight future does not violate invariants or lose required state updates |
| coherence | The rule system that ensures trait impl selection remains unambiguous across crates |
| combinator | A method like `map`, `and_then`, or `filter` that transforms structured values such as iterators or results |
| const generic | A generic parameter whose value is a compile-time constant, such as an array length |
| control-flow graph | A graph of basic blocks and branches used for compiler analyses like borrow checking |
| crate | A compilation unit in Rust; a binary crate produces an executable, a library crate produces reusable code |
| derive | A macro-generated implementation for traits like `Debug`, `Clone`, or `Serialize` |
| discriminant | The tag that identifies which variant of an enum is currently present |
| doctest | A test extracted from documentation examples |
| drop | The destructor phase that runs when an owned value goes out of scope |
| dyn trait | A trait object used for runtime polymorphism through a vtable |
| elision | Compiler rules that infer omitted lifetime annotations in common patterns |
| enum | A type with multiple named variants, often carrying different data |
| FFI | Foreign Function Interface; the boundary between Rust and other languages such as C |
| fat pointer | A pointer plus extra metadata, such as a length for slices or vtable for trait objects |
| feature flag | A Cargo-controlled conditional compilation switch |
| future | A value representing work that may complete later and can be polled toward completion |
| GAT | Generic Associated Type; an associated type that itself takes generic or lifetime parameters |
| HIR | High-level Intermediate Representation; a desugared compiler representation used in semantic analysis |
| hygiene | The macro property that prevents accidental name capture or leakage between generated code and surrounding code |
| impl block | A block that defines methods or associated functions for a type or trait implementation |
| impl trait | Syntax for opaque return types or generic-like argument constraints with static dispatch |
| interior mutability | Mutation that occurs through shared references using types like `Cell`, `RefCell`, `Mutex`, or atomics |
| invariant | A property that must always remain true for a program or abstraction to stay correct |
| iterator invalidation | A bug where a collection mutation makes an existing iterator or reference invalid |
| lifetime | A compile-time relationship constraining how long references may remain valid relative to owners and other borrows |
| liveness | The compiler notion of whether a value or borrow may still be used in future control flow |
| macro_rules! | Rust's declarative macro system based on token-tree pattern matching |
| MIR | Mid-level Intermediate Representation; a control-flow-oriented compiler representation used for borrow checking and optimizations |
| monomorphization | Generating concrete versions of generic code for each used type |
| move | Ownership transfer from one binding or scope to another |
| NLL | Non-Lexical Lifetimes; a borrow analysis improvement that ends borrows at last use rather than only at scope end |
| object safety | The set of rules that determine whether a trait can be used as a trait object |
| orphan rule | A coherence rule preventing you from implementing external traits for external types unless one side is local |
| owned value | A value responsible for its own cleanup or the cleanup of resources it controls |
| pinning | Preventing a value from being moved in memory after certain invariants depend on its address |
| prelude | A set of standard items automatically imported into most Rust modules |
| procedural macro | A macro implemented as Rust code that transforms token streams during compilation |
| RAII | Resource Acquisition Is Initialization; tying resource cleanup to object lifetime |
| reference | A safe pointer-like borrow tracked by the compiler |
| repr(C) | A layout attribute used to request C-compatible field ordering and ABI expectations |
| semver | Semantic versioning; the compatibility model used by Cargo and crates.io |
| slice | A borrowed view into contiguous data, such as `&[T]` or `&str` |
| smart pointer | A type like `Box`, `Rc`, or `Arc` that manages ownership semantics beyond raw values |
| state machine | A representation of computation as a set of states and transitions; futures are compiled this way |
| struct | A named aggregate type with fields |
| trait | A named set of capabilities or required behavior |
| trait object | A runtime-polymorphic value accessed through `dyn Trait` |
| trait solver | Compiler machinery that proves whether required trait obligations hold |
| typestate | An API pattern encoding valid object states in the type system |
| unsafe | A Rust escape hatch for operations the compiler cannot prove safe, with the proof burden shifted to the programmer |
| vtable | A table of function pointers and metadata used by trait objects for dynamic dispatch |
| workspace | A set of related crates managed together by Cargo |
| zero-cost abstraction | An abstraction that does not impose unavoidable runtime cost compared with a hand-written low-level equivalent |

## How to Use the Glossary

- When a compiler message uses unfamiliar vocabulary, check the term here before guessing.
- When reading RFCs, map new concepts back to glossary terms you already understand.
- When reviewing code, ask which glossary terms describe the abstraction's core invariant.
