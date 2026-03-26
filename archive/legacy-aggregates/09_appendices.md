# Appendices A-E

These appendices are designed for real working use, not decorative completeness. Keep them open while reading, coding, reviewing, or contributing.

---

## Appendix A — Cargo Command Cheat Sheet

### Development

| Command | What it does | When to use it |
|---|---|---|
| `cargo new app` | Create a new binary crate | Starting a CLI or service |
| `cargo new --lib crate_name` | Create a new library crate | Starting reusable code |
| `cargo init` | Turn an existing directory into a Cargo project | Bootstrapping inside an existing repo |
| `cargo check` | Type-check and borrow-check without final codegen | Your default inner loop |
| `cargo build` | Compile a debug build | When you need an actual binary |
| `cargo build --release` | Compile with optimizations | Benchmarking, shipping, profiling |
| `cargo run` | Build and run the default binary | Quick execution during development |
| `cargo run -- arg1 arg2` | Pass CLI arguments after `--` | Testing CLI paths |
| `cargo clean` | Remove build artifacts | Resolving stale artifact confusion |
| `cargo fmt` | Format the workspace | Before commit |
| `cargo fmt --check` | Check formatting without changing files | CI |
| `cargo clippy` | Run lints | Before every PR |
| `cargo clippy -- -D warnings` | Treat all warnings as errors | CI and strict local checks |

### Testing

| Command | What it does | When to use it |
|---|---|---|
| `cargo test` | Run unit, integration, and doc tests | General verification |
| `cargo test name_filter` | Run tests matching a substring | Narrowing failures |
| `cargo test -- --nocapture` | Show test stdout/stderr | Debugging test output |
| `cargo test --test api` | Run one integration test target | Large repos with many test files |
| `cargo test -p crate_name` | Test one workspace member | Faster workspace iteration |
| `cargo test --features foo` | Test feature-specific behavior | Verifying gated code |
| `cargo test --all-features` | Test with all features enabled | Release validation |
| `cargo test --no-default-features` | Test minimal feature set | Library compatibility work |
| `cargo bench` | Run benchmarks (when configured) | Performance comparison |
| `cargo doc --open` | Build docs and open them locally | Reviewing public API docs |
| `cargo test --doc` | Run doctests only | API doc verification |

### Publishing and Dependency Management

| Command | What it does | When to use it |
|---|---|---|
| `cargo add serde` | Add a dependency | Day-to-day dependency management |
| `cargo add tokio --features full` | Add a dependency with features | Async/service setup |
| `cargo remove serde` | Remove a dependency | Pruning unused crates |
| `cargo update` | Update lockfile-resolved versions | Refreshing dependencies |
| `cargo update -p serde` | Update one package selectively | Targeted dependency bump |
| `cargo tree` | Show dependency tree | Auditing transitive dependencies |
| `cargo tree -d` | Show duplicates in dependency graph | Size and compile-time cleanup |
| `cargo publish --dry-run` | Validate crate packaging | Before release |
| `cargo package` | Build the publishable tarball | Inspecting release contents |
| `cargo yank --vers 1.2.3` | Yank a published version | Preventing new downloads of a bad release |

### Debugging and Inspection

| Command | What it does | When to use it |
|---|---|---|
| `rustc --explain E0382` | Explain an error code in detail | Reading compiler intent |
| `cargo expand` | Show macro-expanded code | Derive/macros/debugging |
| `cargo metadata --format-version 1` | Output machine-readable project metadata | Tooling and repo inspection |
| `cargo locate-project` | Show current manifest path | Scripts/tooling |
| `cargo bloat` | Inspect binary size contributors | Release-size investigation |
| `cargo flamegraph` | Generate a profiling flamegraph | CPU performance work |
| `cargo miri test` | Interpret code under Miri | Undefined-behavior hunting |
| `cargo llvm-lines` | Inspect LLVM IR line growth | Monomorphization/code-size analysis |

### Workspace and CI

| Command | What it does | When to use it |
|---|---|---|
| `cargo build --workspace` | Build all workspace members | CI and release checks |
| `cargo test --workspace` | Test the full workspace | CI and local full validation |
| `cargo check -p crate_name` | Check one workspace member | Focused iteration |
| `cargo build --features "foo,bar"` | Build specific feature combinations | Compatibility testing |
| `cargo build --target x86_64-unknown-linux-musl` | Cross-compile | Release engineering |
| `cargo audit` | Check for vulnerable dependencies | Security hygiene |
| `cargo semver-checks check-release` | Detect public semver breaks | Library release review |

### Practical Workflow

| Situation | Best first command |
|---|---|
| Editing logic in a crate | `cargo check` |
| Finishing a change for review | `cargo fmt && cargo clippy -- -D warnings && cargo test` |
| Debugging macro output | `cargo expand` |
| Inspecting repo structure | `cargo tree` and `cargo metadata` |
| Verifying a library release | `cargo test --all-features && cargo semver-checks check-release` |

---

## Appendix B — Compiler Errors Decoded

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

## Appendix C — Trait Quick Reference

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

## Appendix D — Recommended Crates by Category

| Category | Crate | Why it matters |
|---|---|---|
| CLI | `clap` | Industrial-strength argument parsing and help generation |
| CLI | `argh` | Smaller, simpler CLI parsing when `clap` would be heavy |
| CLI | `indicatif` | Progress bars and human-friendly terminal feedback |
| CLI | `ratatui` | Modern terminal UI development |
| Web | `axum` | Tower-based web framework with strong extractor model |
| Web | `hyper` | Lower-level HTTP building blocks |
| Web | `tower` | Middleware and service abstractions that shape much of async Rust |
| Web | `reqwest` | Ergonomic HTTP client for services and tools |
| Async | `tokio` | The dominant async runtime and ecosystem foundation |
| Async | `futures` | Core future combinators and traits |
| Async | `async-channel` | Useful channels outside Tokio-specific code |
| Serialization | `serde` | The central serialization framework |
| Serialization | `serde_json` | JSON support built on serde |
| Serialization | `toml` | TOML parsing and config handling |
| Serialization | `bincode` | Compact binary serialization when appropriate |
| Error handling | `thiserror` | Clean library error types |
| Error handling | `anyhow` | Ergonomic application-level error aggregation |
| Error handling | `eyre` | Alternative report-focused app error handling |
| Testing | `proptest` | Property-based testing |
| Testing | `insta` | Snapshot testing for output-heavy code |
| Testing | `criterion` | Real benchmarking and statistically meaningful comparisons |
| Logging/observability | `tracing` | Structured logs, spans, instrumentation |
| Logging/observability | `tracing-subscriber` | Subscriber and formatting ecosystem for tracing |
| Logging/observability | `metrics` | Metrics instrumentation with pluggable backends |
| Databases | `sqlx` | Async SQL with compile-time query checking options |
| Databases | `diesel` | Strongly typed ORM/query builder |
| Databases | `sea-query` | Flexible SQL query construction |
| FFI | `bindgen` | Generate Rust bindings from C headers |
| FFI | `cbindgen` | Generate C headers from Rust APIs |
| FFI | `libloading` | Dynamic library loading |
| Parsing | `nom` | Byte/string parsing via combinators |
| Parsing | `winnow` | Parser combinator library with modern ergonomics |
| Parsing | `pest` | Grammar-driven parser generation |
| Crypto | `ring` | Production-grade crypto primitives |
| Crypto | `rustls` | Modern TLS implementation in Rust |
| Crypto | `sha2` | Standard SHA-2 hashing primitives |
| Data structures | `indexmap` | Hash map with stable iteration order |
| Data structures | `smallvec` | Inline-small-vector optimization |
| Data structures | `bytes` | Efficient shared byte buffers for networking |
| Data structures | `dashmap` | Concurrent map with tradeoffs worth understanding |
| Utilities | `uuid` | UUID generation and parsing |
| Utilities | `chrono` | Date/time handling |
| Utilities | `regex` | Mature regular-expression engine |
| Utilities | `rayon` | Data parallelism with work-stealing |

### Crate Selection Rules

- Prefer boring, battle-tested crates over novelty.
- Prefer ecosystem-standard crates when joining an existing codebase.
- Prefer fewer dependencies when a standard-library solution is enough.
- Evaluate crate APIs through semver behavior, maintenance quality, docs, and unsafe surface area.

---

## Appendix E — Master Flashcard Deck

The goal of these cards is reasoning, not slogan memorization. Read the answer aloud and make sure you can explain why it is true.

### Part 1 — Why Rust Exists

| Question | Answer |
|---|---|
| What false dichotomy does Rust challenge? | That systems programmers must choose between low-level control and strong safety guarantees |
| Why is use-after-free more dangerous than an ordinary crash? | It can expose stale memory, corrupt logic, or become an exploit primitive |
| What does double-free violate conceptually? | Unique cleanup responsibility for a resource |
| Why are data races treated as undefined behavior in low-level models? | Because unsynchronized concurrent mutation destroys reliable reasoning about program state |
| Why is iterator invalidation really an aliasing bug? | A borrowed view assumes storage stability while mutation may reallocate or reorder it |
| Why did Rust reject a GC-first design? | It would give up latency predictability, layout control, and the compile-time nature of ownership proofs |
| What does "pay at compile time" mean in practice? | Accepting stricter modeling and slower learning in exchange for fewer runtime failures |
| What is zero-cost abstraction trying to preserve? | The ability to write expressive high-level code without paying hidden runtime penalties |
| Why is "explicit over implicit" a safety principle in Rust? | Hidden ownership, allocation, and failure paths make systems harder to reason about |
| Why is Rust relevant to security, not just performance? | Memory safety failures are a dominant source of severe vulnerabilities |
| Why is "no null" more than a syntactic choice? | It removes an invalid state from ordinary reference-like values |
| What makes Rust feel strict to beginners? | It exposes invariants other languages often leave implicit until runtime |

### Part 2 — Core Foundations

| Question | Answer |
|---|---|
| Why is `cargo check` the best default command during development? | It validates types and borrowing quickly without full code generation |
| Why pin a toolchain with `rust-toolchain.toml` in teams? | To reduce "works on my machine" drift in compiler behavior and lint/tool versions |
| Why does Cargo have both `Cargo.toml` and `Cargo.lock`? | One describes intent and semver ranges; the other records the exact resolved dependency graph |
| What is the semantic difference between `let` and `let mut`? | `let` promises stable binding value; `let mut` permits reassignment/mutation through that binding |
| Why is shadowing useful despite looking redundant? | It can express type/value transformation while preserving a coherent variable name |
| Why does Rust distinguish `const` from `static`? | `const` is inlined compile-time data; `static` is a single memory location with address identity |
| Why is `()` not the same thing as null? | It is a real zero-sized type representing "no meaningful value," not an invalid reference |
| Why do semicolons matter so much in Rust? | They determine whether an expression's value flows onward or is discarded into `()` |
| Why is `if` more powerful in Rust than in C-like languages? | It is an expression, so branches must agree on type and produce values |
| Why does `match` matter beyond convenience? | Exhaustiveness checking makes unhandled states a compile-time error |
| Why does `Option<T>` improve API honesty? | It forces absence to be modeled explicitly instead of smuggled through null-like values |
| Why is module visibility important early? | Rust's public API surface is deliberate and privacy-by-default shapes crate architecture |

### Part 3 — The Heart of Rust

| Question | Answer |
|---|---|
| What is ownership really modeling? | Responsibility for a resource and its cleanup |
| Why is borrowing necessary if ownership already exists? | Because code often needs access without transferring cleanup responsibility |
| What is the shortest accurate statement of the borrow rule? | Many shared borrows or one mutable borrow, but not both at once |
| Why are lifetimes relationships rather than durations? | They express which references must not outlive which owners or other borrows |
| Why does stack vs heap matter to Rust reasoning? | Because value size, movement, indirection, and ownership behavior often depend on storage strategy |
| Why can `Copy` types be duplicated implicitly? | Their bitwise duplication is safe and they carry no custom destruction semantics |
| Why can't a type be both `Copy` and `Drop`? | Implicit duplication would make deterministic destruction ambiguous or duplicated |
| Why does borrow checking happen after desugaring/MIR-style reasoning? | Control flow and real use sites are clearer there than in raw source syntax |
| What does NLL change for the programmer? | Borrows end at last use rather than only at lexical scope end, reducing unnecessary conflicts |
| What is the beginner trap with lifetimes? | Treating them like timers rather than proofs about reference relationships |
| Why is `String` versus `&str` foundational? | It captures the split between owned text and borrowed text views |
| When should you restructure instead of fighting the borrow checker? | When the current code expresses an unclear or conflicting ownership story |

### Part 4 — Idiomatic Engineering

| Question | Answer |
|---|---|
| Why does `Vec<T>` expose both length and capacity? | Because growth strategy and allocation planning matter to performance-sensitive code |
| Why prefer `&str` in function parameters over `&String`? | It accepts more callers and expresses that only a borrowed string slice is needed |
| Why is the `HashMap` entry API so important? | It lets you modify-or-initialize in one ownership-safe pass |
| What is the central performance virtue of iterators? | They compose lazily and usually compile down to tight loops |
| When is a manual loop clearer than an iterator chain? | When the control flow is stateful or the chain obscures intent |
| What determines whether a closure is `Fn`, `FnMut`, or `FnOnce`? | How it captures and uses its environment |
| Why do blanket impls matter? | They let capabilities propagate across many types without repetitive manual code |
| When are associated types better than generic parameters on a trait? | When the output type is conceptually part of the trait's contract |
| Why use `thiserror` in libraries? | It preserves structured, explicit error vocabularies for downstream users |
| Why use `anyhow` in applications? | It prioritizes ergonomic propagation and contextual reporting at the top level |
| What is the biggest risk of `Rc<RefCell<T>>`? | It can turn design problems into runtime borrow failures and tangled ownership |
| Why do builders fit Rust well? | They make staged, validated construction explicit without telescoping constructors |

### Part 5 — Concurrency and Async

| Question | Answer |
|---|---|
| Why is `thread::spawn` usually associated with `Send + 'static` requirements? | Spawned work may outlive the current stack frame and move to another thread |
| What does `thread::scope` relax? | It allows threads to borrow from the surrounding stack safely within the scope |
| Why prefer message passing in many designs? | Ownership transfer often clarifies concurrency more than shared mutable state |
| What does `Send` guarantee? | That ownership can move safely across threads |
| What does `Sync` guarantee? | That shared references can be used across threads safely |
| Why is `Rc<T>` not `Send`? | Its reference count is not updated atomically |
| Why is `Arc<Mutex<T>>` common but not free? | It buys shared mutable state with contention, locking, and API complexity costs |
| What is a future in Rust mechanically? | A state machine that can be polled toward completion |
| Why doesn't Rust standardize a single async runtime in the language? | Runtime policy, scheduling, timers, and I/O backends are ecosystem choices rather than core language semantics |
| What does `select!` fundamentally do? | It races branches and cancels or drops the losers according to their semantics |
| What is cancellation safety? | The property that dropping a future partway through does not violate program invariants |
| Why does Pin show up around async code? | Some futures become movement-sensitive after polling because of their internal state layout |

### Part 6 — Advanced Systems Rust

| Question | Answer |
|---|---|
| Why does struct padding matter? | It changes size, cache behavior, and FFI layout expectations |
| What is niche optimization in simple terms? | Using invalid bit patterns of one representation to store enum discriminants for free |
| Why is `Option<Box<T>>` often the same size as `Box<T>`? | The null pointer niche can encode `None` without extra storage |
| What does `unsafe` not turn off? | Most of the type system and all ordinary syntax/type checking outside unsafe operations |
| What are the "unsafe superpowers" really about? | Performing actions the compiler cannot prove safe, such as dereferencing raw pointers or calling foreign code |
| Why should unsafe code be hidden behind safe wrappers when possible? | So the proof obligation is localized and downstream callers keep ordinary safety guarantees |
| Why do FFI boundaries need `#[repr(C)]` or careful layout thinking? | Foreign code expects stable ABI/layout rules that Rust's default layout does not promise |
| Why is variance relevant to advanced lifetime work? | It determines how lifetimes and type parameters can be substituted safely |
| What is `PhantomData` used for? | Encoding ownership, variance, or drop semantics that are not otherwise visible in fields |
| Why are atomics hard even in Rust? | The type system helps with data races, but memory ordering is still a correctness proof you must make |
| Why benchmark with tools like `criterion` instead of ad hoc timing? | Noise and measurement bias can make naive benchmarks lie |
| Why can compiler errors feel harder around advanced code? | The abstractions encode more invariants, so the error often reflects a deeper modeling problem |

### Part 7 — Abstractions and API Design

| Question | Answer |
|---|---|
| What does a trait object contain conceptually? | A data pointer plus metadata/vtable pointer |
| Why do object-safety rules exist? | Dynamic dispatch needs a stable, runtime-usable method interface |
| What problem do GATs solve? | They let associated types depend on lifetimes or generic parameters in more expressive ways |
| Why use a sealed trait? | To prevent downstream crates from implementing a trait you need to evolve safely |
| When are macros the right tool? | When the abstraction must transform syntax or generate repetitive type-aware code that functions cannot express |
| Why is macro hygiene important? | It prevents generated code from accidentally capturing or colliding with surrounding names |
| What is the core idea of typestate? | Encode valid states in types so invalid transitions fail at compile time |
| Why are newtypes so common in strong Rust APIs? | They add domain meaning and prevent primitive-type confusion |
| What makes a semver break in Rust larger than many people expect? | Type changes, trait impl changes, feature behavior, and visibility shifts can all alter downstream compilation |
| Why must feature flags usually be additive? | Downstream dependency resolution assumes features unify rather than conflict destructively |
| When should a workspace split into multiple crates? | When boundaries, compilation, publishability, or public API concerns justify real separation |
| Why is downstream composability a design goal? | Good Rust libraries work with borrowing, traits, and error conversion instead of trapping users in one style |

### Part 8 — Reading and Contributing

| Question | Answer |
|---|---|
| Why read `Cargo.toml` early in an unfamiliar repo? | Dependencies reveal architecture, async/runtime choices, and likely entry points |
| Why are tests often better than docs for learning repo behavior? | They show the intended API usage and the edge cases maintainers care about |
| Why should first PRs usually be boring? | Small, focused changes are easier to review, safer to merge, and teach the repo's norms faster |
| What makes a good first issue? | Clear reproduction or scope, limited blast radius, and existing maintainers willing to guide |
| Why should you comment on an issue before coding? | It avoids duplicate work and signals your proposed approach |
| What does a high-signal PR description contain? | The problem, the approach, the changed files or behavior, and the verification steps |
| Why do unrelated refactors harm beginner PRs? | They widen review scope and hide the actual behavior change |
| How do you trace a Rust code path effectively? | Start at entry points, follow trait boundaries, inspect error types, and use tests to anchor behavior |
| Why are feature flags a repo-reading priority? | They change which code exists and can explain "cannot find item" style confusion |
| What is the safest kind of first technical contribution after docs? | A regression test or focused error-message improvement |
| Why do maintainers care so much about reproducible bug reports? | Clear reproduction reduces reviewer load and increases trust in the fix |
| What does "read the invariant first" mean in repo work? | Figure out what the codebase is trying to preserve before editing mechanics |

### Part 9 — Compiler and Language Design

| Question | Answer |
|---|---|
| Why distinguish AST, HIR, and MIR mentally? | Different compiler phases reason about different normalized forms of the program |
| What does HIR buy the compiler? | A desugared, high-level representation suitable for type and trait reasoning |
| What does MIR buy the compiler? | Explicit control flow and value lifetimes for borrow checking and optimization |
| Why is monomorphization both good and costly? | It yields zero-cost generic specialization but increases compile time and binary size |
| What is trait solving trying to answer? | Whether the required capabilities can be proven from impls and bounds |
| Why does LLVM matter but not define Rust's entire semantics? | Rust lowers to LLVM, but ownership, borrowing, and many language rules are decided earlier |
| What is incremental compilation optimizing for? | Faster rebuilds when only part of the crate graph changes |
| Why read RFCs as a learner? | They reveal problem statements, rejected alternatives, and tradeoffs behind stable features |
| What is the purpose of nightly features? | To experiment before stabilization and collect real-world feedback |
| Why does Rust stabilize carefully? | The language promises long-term compatibility, so rushed design costs everyone |
| What makes async/await a useful RFC case study? | It shows ergonomics, zero-cost goals, and compiler/runtime boundary tradeoffs colliding in public |
| Why does participating in discussions help even before you propose anything? | It trains you to think in terms of constraints and tradeoffs instead of personal preference |

### Part 10 — Mastery and Practice

| Question | Answer |
|---|---|
| Why is daily repetition more valuable than occasional marathons? | Rust skill is largely pattern recognition and invariant recall under pressure |
| What should the first three months optimize for? | Ownership fluency, reading compiler errors, and finishing small complete projects |
| Why build both a CLI and a service early? | They exercise different API, error, and runtime patterns |
| Why read real repos before you feel ready? | Real code is where abstractions become memorable and contextual |
| What is a strong sign you're ready for deeper async work? | You can explain `Send`, ownership across tasks, and basic cancellation without cargo-culting |
| Why publish a crate before aiming at compiler work? | Library design and semver discipline teach habits that matter everywhere in Rust |
| What does "contribute regularly to a few repos" teach better than drive-by PRs? | It teaches architecture, social norms, and long-term API consequences |
| Why should flashcards test reasoning rather than slogans? | Rust problems are usually about choosing the right model, not recalling vocabulary |
| What is the most important self-question after any compiler error? | "What ownership, capability, or lifetime story did I tell badly?" |
| Why is reviewer trust part of Rust mastery? | Strong Rust engineers are judged by how safely and clearly they change real systems |
| What does genuine mastery look like? | Predicting invariants, navigating unfamiliar code, and making correct changes with low drama |
| What is the long-term payoff of learning Rust deeply? | The ability to build and review systems code with unusually strong correctness intuition |

---

These appendices are reference tools, not substitutes for the chapters. Use them to compress the material after you have worked through the ideas in context.
