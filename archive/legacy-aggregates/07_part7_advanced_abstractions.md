# PART 7 - Advanced Abstractions and API Design

This part is about writing Rust that survives contact with other programmers.

Beginner Rust can be locally correct and still be a poor library. Intermediate Rust can be fast and still force downstream callers into awkward clones, giant type annotations, or semver traps. Advanced Rust API design is not about being clever. It is about making the correct path the easy path while keeping performance and invariants visible.

The central question of this part is:

How do you shape APIs so that callers can use powerful abstractions without being forced into undefined expectations, unstable contracts, or accidental misuse?

---

# Chapter 42: Advanced Traits, Trait Objects, and GATs

## Step 1 - The Problem

Abstraction in systems code has two common failure modes.

First, an interface is too concrete. Every caller becomes coupled to one type, one allocation strategy, one execution path.

Second, an interface is too loose. The API says "anything implementing this trait," but the trait was not designed for dynamic dispatch, borrowed outputs, or extension boundaries. The result is a pile of confusing errors about object safety, lifetime capture, or impl conflicts.

In C++, this often turns into inheritance hierarchies, virtual function costs where they were not intended, or templates that explode compile times and diagnostics. In Java or Go, interface-based designs are easy to write but can hide allocation, dynamic dispatch, or capability mismatches. Rust wants you to choose your abstraction cost model explicitly.

## Step 2 - Rust's Design Decision

Rust gives you several trait-based tools rather than one universal interface mechanism:

- generic parameters for static dispatch
- `impl Trait` for hiding concrete types while keeping static dispatch
- trait objects for runtime dispatch
- associated types for output families tied to a trait
- GATs for associated types that depend on lifetimes or other parameters

Rust also imposes coherence and object-safety rules so trait-based abstractions do not degenerate into ambiguous or unsound behavior.

Rust accepted:

- more concepts up front
- stricter rules around trait objects
- deliberate friction around downstream implementations

Rust refused:

- implicit virtual dispatch everywhere
- multiple overlapping implementations with unclear resolution
- dynamic object systems that erase too much compile-time structure

## Step 3 - The Mental Model

Plain English rule:

- use generics or `impl Trait` when you want one concrete implementation per caller at compile time
- use `dyn Trait` when you need heterogeneous values behind a uniform runtime interface

And for object safety:

a trait can become a trait object only if the compiler can build one meaningful vtable API for it.

For GATs:

use them when the type produced by a trait method must depend on the lifetime of the borrow used to call that method.

## Step 4 - Minimal Code Example

```rust
trait Render {
    fn render(&self) -> String;
}

struct Html;
struct Json;

impl Render for Html {
    fn render(&self) -> String {
        "<html>".to_string()
    }
}

impl Render for Json {
    fn render(&self) -> String {
        "{}".to_string()
    }
}

fn print_all(renderers: &[Box<dyn Render>]) {
    for renderer in renderers {
        println!("{}", renderer.render());
    }
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

The compiler interprets `Box<dyn Render>` as a fat pointer:

- one pointer to the concrete data
- one pointer to a vtable for the concrete type's `Render` implementation

That vtable contains function pointers for the object-safe methods of the trait plus metadata the compiler needs for dynamic dispatch.

When `renderer.render()` is called:

1. the concrete type is not known statically at the call site
2. the compiler emits an indirect call through the vtable
3. the data pointer is passed to the correct concrete implementation

This only works if the trait's method set can be represented uniformly for every implementor. That is why a trait with `fn clone_box(&self) -> Self` is not object-safe: the caller of a trait object does not know the concrete return type size.

You will often see error E0038 when you try to turn a non-object-safe trait into `dyn Trait`.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Traits describe capabilities. `dyn Trait` means "I do not know the exact type right here, but I know what behavior it supports."

### Level 2 - Engineer

Use generics for hot paths and strongly typed composition. Use trait objects when heterogeneity, plugin-like behavior, or reduced monomorphization matters more than static specialization.

`impl Trait` in argument position is mostly sugar for a generic parameter. `impl Trait` in return position hides a single concrete return type while preserving static dispatch.

### Level 3 - Systems

The real distinction is dispatch and representation.

- generics: many monomorphized copies, static dispatch, no vtable cost
- `impl Trait` return: one hidden concrete type, still static dispatch
- trait object: erased concrete type, fat pointer, vtable dispatch, usually one level of indirection

GATs matter because associated types alone cannot express borrow-dependent outputs. A trait like a lending iterator must tie its yielded item type to the borrow of `self`. That relationship is impossible to encode cleanly without a parameterized associated type.

## `dyn Trait` vs `impl Trait`

| Tool | Dispatch | Concrete type known to compiler? | Typical use |
|---|---|---|---|
| `T: Trait` generic | static | yes | zero-cost specialization |
| `impl Trait` arg | static | yes | ergonomic generic parameter |
| `impl Trait` return | static | yes, but hidden from caller | hide complex concrete type |
| `dyn Trait` | dynamic | no at call site | heterogeneity, plugins, trait objects |

If a function returns `impl Iterator<Item = u8>`, every branch of that function must still resolve to one concrete iterator type. If you need different concrete iterator types based on runtime conditions, you usually need boxing, enums, or another design.

## Object Safety Mechanically

The most important object-safety rules are not arbitrary style rules. They follow directly from how trait objects work.

| Rule | Why it exists |
|---|---|
| No returning `Self` | caller does not know runtime size of the concrete type |
| No generic methods | a single vtable entry cannot represent all monomorphized versions |
| Trait cannot require `Sized` | trait objects themselves are unsized |
| Methods needing concrete-specific layout may be unavailable | erased type means erased layout details |

This is why `Clone` is not directly object-safe and why trait-object-friendly APIs often add helper traits like `DynClone`.

## GATs

```rust
trait LendingIterator {
    type Item<'a>
    where
        Self: 'a;

    fn next<'a>(&'a mut self) -> Option<Self::Item<'a>>;
}
```

The important sentence is not "GATs are advanced." It is:

the output type can depend on the borrow that produced it.

That is a major unlock for:

- zero-copy parsers
- borrow-based iterators
- views into self-owned buffers

Without GATs, many APIs had to allocate, clone, or contort lifetimes to express something the design actually wanted to say directly.

## Sealed Traits and Marker Traits

Sometimes you want a public trait that downstream crates may use but not implement.

That is the sealed trait pattern:

```rust
mod sealed {
    pub trait Sealed {}
}

pub trait StableApi: sealed::Sealed {
    fn encode(&self) -> Vec<u8>;
}
```

Only types in your crate can implement `sealed::Sealed`, so only they can implement `StableApi`.

Why do this?

- preserve future evolution space
- keep unsafe invariants under crate control
- avoid downstream impls that would make later additions breaking

Marker traits are the other extreme: they carry meaning without methods. `Send`, `Sync`, and `Unpin` are the classic examples. Their value is in what they let the compiler and APIs infer about a type's allowed behavior.

## Step 7 - Common Misconceptions

Wrong model 1: "Traits are just interfaces."

Why it forms: that analogy is initially useful.

Why it is incomplete: Rust traits also participate in static dispatch, blanket impls, associated types, auto traits, coherence, and specialization-adjacent design constraints.

Wrong model 2: "`dyn Trait` is always more flexible."

Correction: it is more runtime-flexible, but less statically informative and usually less optimizable.

Wrong model 3: "`impl Trait` return means any implementing type."

Correction: return-position `impl Trait` still means one hidden concrete type chosen by the function implementation.

Wrong model 4: "GATs are mostly syntax."

Correction: they express a class of borrow-dependent abstractions that earlier Rust could not model cleanly.

## Step 8 - Real-World Pattern

You see associated types everywhere in serious Rust:

- `Iterator::Item`
- `Future::Output`
- `tower::Service::Response`
- serializer and deserializer traits in `serde`

Trait objects appear where heterogeneity is the point, for example `Box<dyn std::error::Error + Send + Sync>` in application boundaries or plugin-like registries.

Sealed traits show up in library APIs that need extension control. Marker traits shape async and concurrency APIs constantly. Once you start noticing these patterns, advanced libraries stop looking magical and start looking disciplined.

## Step 9 - Practice Block

### Code Exercise

Design an API for log sinks with two versions:

- generic over `W: Write`
- trait-object based with `Box<dyn Write + Send>`

Explain where each design wins.

### Code Reading Drill

Explain the dispatch model of this function:

```rust
fn run(handler: &dyn Fn(&str) -> usize) -> usize {
    handler("hello")
}
```

### Spot the Bug

Why is this trait not object-safe?

```rust
trait Factory {
    fn make(&self) -> Self;
}
```

### Refactoring Drill

Take a function returning `Box<dyn Iterator<Item = u8>>` and redesign it with `impl Iterator` if only one concrete type is actually returned. Explain the benefit.

### Compiler Error Interpretation

If you see E0038 about a trait not being dyn compatible, translate it as: "the erased-object form of this trait would not have one coherent runtime method table."

## Step 10 - Contribution Connection

After this chapter, you can read:

- library APIs built around associated types
- async trait-object boundaries
- `Box<dyn Error + Send + Sync>` style error plumbing
- sealed traits in public library internals

Safe first PRs include:

- replacing unnecessary trait objects with `impl Trait` or generics
- clarifying trait bounds and associated types in docs
- sealing traits that should not be implemented externally

## In Plain English

Traits are Rust's way of describing what a type can do, but Rust makes you choose whether that knowledge should stay fully known at compile time or be erased for runtime use. That matters to systems engineers because abstraction has real costs, and Rust wants those costs chosen rather than accidentally inherited.

## What Invariant Is Rust Protecting Here?

Trait-based abstraction must remain coherent and sound: dispatch must know what function to call, erased types must still have a valid runtime representation, and borrow-dependent outputs must be described precisely.

## If You Remember Only 3 Things

- `impl Trait` hides a concrete type while keeping static dispatch; `dyn Trait` erases the concrete type and uses runtime dispatch.
- Object safety is about whether one coherent vtable API exists for the trait.
- GATs let associated output types depend on the lifetime of the borrow that produced them.

## Memory Hook

Generics are custom-cut parts made in advance. Trait objects are universal sockets with adapters. Both are useful, but you pay for flexibility differently.

## Flashcard Deck

| Question | Answer |
|---|---|
| What are the two pointers inside a trait object fat pointer? | A data pointer and a vtable pointer. |
| Why is `fn clone(&self) -> Self` not object-safe? | The caller of a trait object does not know the concrete return type size. |
| What is the main difference between `impl Trait` return and `dyn Trait` return? | `impl Trait` keeps one hidden concrete type with static dispatch; `dyn Trait` erases the type and uses dynamic dispatch. |
| What problem do GATs solve? | They let associated types depend on lifetimes or other parameters, enabling borrow-dependent outputs. |
| What is the sealed trait pattern for? | Preventing downstream crates from implementing a public trait while still allowing them to use it. |
| What kind of trait is `Send`? | A marker auto trait describing cross-thread movement safety. |
| When is dynamic dispatch worth it? | When heterogeneity or binary-size/compile-time tradeoffs matter more than static specialization. |
| What does E0038 usually mean in practice? | The trait cannot be turned into a valid trait object. |

## Chapter Cheat Sheet

| Need | Use | Tradeoff |
|---|---|---|
| Fast static abstraction | generics | monomorphization and larger codegen surface |
| Hide ugly concrete type, keep speed | return `impl Trait` | one concrete type only |
| Heterogeneous collection | `Box<dyn Trait>` | dynamic dispatch and allocation/indirection |
| Borrow-dependent associated output | GATs | more advanced lifetime surface |
| Prevent downstream impls | sealed trait pattern | less external extensibility |

---

# Chapter 43: Macros, Declarative and Procedural

## Step 1 - The Problem

Some code duplication is accidental. Some is structural. Functions and generics remove a lot of repetition, but not all of it.

You need macros when the repeated thing is not just "do the same work for many types" but:

- accept variable syntax
- generate items or impls
- manipulate tokens before type checking
- remove boilerplate that the language cannot abstract with ordinary functions

Without macros, crates like `serde`, `clap`, `thiserror`, and `tracing` would be dramatically more verbose or much less ergonomic.

The danger is obvious too. Macros can make APIs delightful for users and miserable for maintainers if used without discipline.

## Step 2 - Rust's Design Decision

Rust has two macro systems because there are two different abstraction problems.

- `macro_rules!` for pattern-based token rewriting
- procedural macros for arbitrary token-stream transformations in Rust code

Rust accepted:

- a separate metaprogramming surface
- compile-time cost
- more complicated debugging when macros are overused

Rust refused:

- unrestricted textual substitution like the C preprocessor
- unhygienic macro systems by default
- giving up type-driven APIs just because some code generation is convenient

## Step 3 - The Mental Model

Plain English rule:

- use functions when ordinary values are the abstraction
- use generics when types are the abstraction
- use macros when syntax itself is the abstraction

For procedural macros:

they are compile-time programs that receive tokens and emit tokens.

## Step 4 - Minimal Code Example

```rust
macro_rules! hashmap_lite {
    ($( $key:expr => $value:expr ),* $(,)?) => {{
        let mut map = std::collections::HashMap::new();
        $( map.insert($key, $value); )*
        map
    }};
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

The compiler processes a `macro_rules!` invocation before normal type checking of the expanded code.

For:

```rust
let ports = hashmap_lite! {
    "http" => 80,
    "https" => 443,
};
```

the compiler roughly does this:

1. match the invocation tokens against the macro pattern
2. bind `$key` and `$value` for each repeated pair
3. emit the corresponding `HashMap` construction code
4. type-check the expanded Rust normally

This explains an important fact: macros do not replace the type system. They generate input for it.

Hygiene matters here too. Identifiers introduced by the macro are tracked so they do not accidentally capture or get captured by names in the caller's scope in surprising ways.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Macros write code for you at compile time. They are useful when normal functions cannot express the shape of what you want.

### Level 2 - Engineer

Prefer ordinary code first. Reach for `macro_rules!` when you need:

- repetition over syntax patterns
- a mini-DSL
- generated items
- ergonomics like `vec![]` or `format!()`

Reach for procedural macros when you need to inspect or generate Rust syntax trees, especially for derive-style APIs.

### Level 3 - Systems

Macros sit before or alongside later compiler phases. Declarative macros operate on token trees, not typed AST nodes. Procedural macros also operate before type checking, though they can parse tokens into richer syntax structures using crates like `syn`.

That placement explains both their power and their weakness:

- power: they can generate impls and syntax the language cannot abstract directly
- weakness: they know nothing about types unless they encode conventions themselves

## `macro_rules!`, Hygiene, and Repetition

Useful fragment specifiers include:

| Fragment | Meaning |
|---|---|
| `expr` | expression |
| `ident` | identifier |
| `ty` | type |
| `path` | path |
| `item` | item |
| `tt` | token tree |

And repetition patterns like:

```rust
$( ... ),*
$( ... );+
```

let you build flexible syntax surfaces without writing a parser.

Hygiene is why a temporary variable inside a macro usually does not collide with a variable of the same textual name at the call site. Rust chose this because predictable macro expansion matters more than preprocessor-like freedom.

## Procedural Macros

There are three families:

1. derive macros
2. attribute macros
3. function-like procedural macros

The typical implementation stack is:

- `proc_macro` for the compiler-facing token interface
- `syn` to parse tokens into syntax structures
- `quote` to emit Rust tokens back out

### A Derive Macro, Conceptually

Suppose you want `#[derive(CommandName)]` that generates a `command_name()` method.

The conceptual flow is:

1. the compiler passes the annotated item tokens to your derive macro
2. the macro parses the item, usually as a `syn::DeriveInput`
3. it extracts the type name and relevant fields or attributes
4. it emits an `impl CommandName for MyType { ... }`

This is why crates like `serde`, `clap`, and `thiserror` feel magical without being magical. They are compile-time code generators with carefully designed conventions.

## The Cost of Macros

Macros are not free. The costs are different from runtime costs:

- longer compile times
- harder expansion debugging
- more IDE work
- more opaque errors if the macro surface is poorly designed

The question is not "are macros good?" The question is "is this syntax-level abstraction paying for itself?"

## Step 7 - Common Misconceptions

Wrong model 1: "Macros are just fancy functions."

Correction: functions operate on values after parsing and type checking. Macros operate on syntax before those phases are complete.

Wrong model 2: "If code is repetitive, use a macro."

Correction: use a function or generic first unless syntax itself needs abstraction.

Wrong model 3: "Procedural macros understand types."

Correction: they see token streams. They can parse syntax, but full type information belongs to later compiler stages.

Wrong model 4: "Hygiene means macros cannot be confusing."

Correction: hygiene prevents one class of name bugs. Bad macro APIs can still be extremely confusing.

## Step 8 - Real-World Pattern

The ecosystem's most important ergonomic crates rely on macros:

- `serde` derives serialization and deserialization impls
- `clap` derives argument parsing from struct definitions
- `thiserror` derives `Error` impls
- `tracing` attribute macros instrument functions

Notice the pattern: the best macros turn repetitive structural code into readable declarations while keeping the generated behavior close to what a human would have written by hand.

## Step 9 - Practice Block

### Code Exercise

Write a `macro_rules!` macro that builds a `Vec<String>` from string-like inputs and accepts an optional trailing comma.

### Code Reading Drill

Explain what gets repeated here:

```rust
macro_rules! pairs {
    ($( $k:expr => $v:expr ),* $(,)?) => {{
        vec![$(($k, $v)),*]
    }};
}
```

### Spot the Bug

Why is a macro a poor choice for this?

```rust
macro_rules! add_one {
    ($x:expr) => {
        $x + 1
    };
}
```

Assume the only goal is to add one to a number.

### Refactoring Drill

Take a procedural macro idea and redesign it as a trait plus derive macro, rather than a large attribute macro doing too much hidden work.

### Compiler Error Interpretation

If macro expansion points to generated code you never wrote, translate that as: "the macro emitted invalid Rust, so I need to inspect the expansion or simplify the macro surface."

## Step 10 - Contribution Connection

After this chapter, you can read:

- derive macro crates
- DSL-style helper macros
- generated impl layers in ecosystem crates
- proc-macro support code using `syn` and `quote`

Good first PRs include:

- improving macro error messages
- replacing over-engineered macros with functions or traits
- documenting macro expansion behavior and constraints

## In Plain English

Macros are for the cases where the repeated thing is not just logic but code shape. Rust gives you strong macro tools, but it also expects you to use them carefully because metaprogramming can make code easier to use and harder to maintain at the same time.

## What Invariant Is Rust Protecting Here?

Generated code must still enter the normal compiler pipeline as valid, hygienic Rust, and macro abstractions must not bypass the type system's role in checking correctness.

## If You Remember Only 3 Things

- Use macros when syntax is the abstraction; use functions and generics otherwise.
- `macro_rules!` rewrites token patterns, while procedural macros run compile-time Rust code over token streams.
- The best macros remove boilerplate without hiding too much behavior from users and maintainers.

## Memory Hook

Functions are factory machines. Macros are molds for making new machines. Use a mold only when you truly need a new shape.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is the main difference between `macro_rules!` and procedural macros? | `macro_rules!` does pattern-based token rewriting; procedural macros run compile-time Rust code over token streams. |
| Why are macros not a substitute for the type system? | They generate Rust code, which is still type-checked afterward. |
| What does macro hygiene protect against? | Unintended name capture between macro-generated identifiers and caller scope identifiers. |
| What crates are commonly used for procedural macro implementation? | `syn` and `quote`. |
| Name the three families of procedural macros. | Derive, attribute, and function-like. |
| When is a function better than a macro? | When ordinary value-level abstraction is enough. |
| What common ergonomic crates depend heavily on macros? | `serde`, `clap`, `thiserror`, and `tracing`. |
| What is a common non-runtime cost of macros? | Higher compile-time and more opaque errors. |

## Chapter Cheat Sheet

| Need | Prefer | Why |
|---|---|---|
| Reuse runtime logic | function | simplest abstraction |
| Type-based specialization | generics/traits | type-checked and explicit |
| Syntax repetition or mini-DSL | `macro_rules!` | pattern-based expansion |
| Generate impls from declarations | derive proc macro | ergonomic compile-time codegen |
| Add cross-cutting code from attributes | attribute proc macro | syntax-level transformation |

---

# Chapter 44: Type-Driven API Design

## Step 1 - The Problem

Many APIs are technically usable but semantically sloppy.

They accept raw strings where only validated identifiers make sense. They expose constructors that allow missing required fields. They let methods be called in illegal orders. They return large unstructured bags of state that callers must interpret correctly by convention.

Other languages often solve this with runtime validation alone. That is necessary, but it leaves misuse discoverable only after the program is already running.

Rust pushes you to ask a better question:

which invalid states can be made unrepresentable before runtime?

## Step 2 - Rust's Design Decision

Rust leans on the type system as an API design tool, not only a memory-safety tool.

That leads to patterns like:

- newtypes for semantic distinction
- typestate for state transitions
- builders for staged construction
- enums for closed sets of valid cases
- hidden fields and smart constructors for validated invariants

Rust accepted:

- more types
- more explicit conversion points
- a little more verbosity in exchange for much less semantic ambiguity

Rust refused:

- "just pass strings everywhere"
- constructors that allow impossible or half-formed values by default
- public APIs whose real rules live only in README prose

## Step 3 - The Mental Model

Plain English rule: if misuse is predictable, try to make it impossible or awkward at the type level instead of merely warning about it in docs.

The goal is not maximal type cleverness. The goal is to put the invariant where the compiler can help enforce it.

## Step 4 - Minimal Code Example

```rust
use std::marker::PhantomData;

struct Draft;
struct Published;

struct Post<State> {
    title: String,
    _state: PhantomData<State>,
}

impl Post<Draft> {
    fn new(title: String) -> Self {
        Self {
            title,
            _state: PhantomData,
        }
    }

    fn publish(self) -> Post<Published> {
        Post {
            title: self.title,
            _state: PhantomData,
        }
    }
}

impl Post<Published> {
    fn slug(&self) -> String {
        self.title.to_lowercase().replace(' ', "-")
    }
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `Post<State>` encodes state in the type parameter, not in a runtime enum field.
2. `Post<Draft>::new` constructs only draft posts.
3. `publish(self)` consumes the draft, preventing reuse of the old state.
4. The returned value is `Post<Published>`, which has a different method set.
5. `slug()` exists only on published posts, so calling it on a draft is a compile error.

The invariant is simple and powerful:

a draft cannot accidentally be used as if publication already happened.

This is the essential typestate move. State transitions become type transitions.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

The type of the value tells you what stage it is in. If an operation is only valid in one stage, put that method only on that stage's type.

### Level 2 - Engineer

Type-driven APIs are most valuable when:

- bad inputs are common and costly
- operation order matters
- construction has required steps
- public libraries need clear contracts

But do not encode every business rule in the type system. Use types for durable, structural invariants. Use runtime validation for dynamic facts.

### Level 3 - Systems

Type-driven API design is about preserving invariants at module boundaries. Every public constructor, method, and trait impl either preserves or weakens those invariants.

Good libraries create narrow, explicit conversion points:

- parse and validate once
- represent the validated state distinctly
- make illegal transitions impossible through ownership and types

This reduces downstream branching, error handling, and misuse.

## Newtypes

Newtypes are the cheapest high-leverage move in API design.

```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct UserId(String);

impl UserId {
    pub fn parse(input: impl Into<String>) -> Result<Self, String> {
        let input = input.into();
        if input.is_empty() {
            return Err("user id cannot be empty".to_string());
        }
        Ok(Self(input))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

Why use a newtype instead of raw `String`?

- prevents argument confusion
- centralizes validation
- allows trait impls on your domain concept
- keeps future evolution space

## Builders and Typestate Builders

Ordinary builders improve ergonomics. Typestate builders improve ergonomics and validity.

```rust
use std::marker::PhantomData;

struct Missing;
struct Present;

struct ConfigBuilder<Host, Port> {
    host: Option<String>,
    port: Option<u16>,
    _host: PhantomData<Host>,
    _port: PhantomData<Port>,
}

impl ConfigBuilder<Missing, Missing> {
    fn new() -> Self {
        Self {
            host: None,
            port: None,
            _host: PhantomData,
            _port: PhantomData,
        }
    }
}

impl<Port> ConfigBuilder<Missing, Port> {
    fn host(self, host: String) -> ConfigBuilder<Present, Port> {
        ConfigBuilder {
            host: Some(host),
            port: self.port,
            _host: PhantomData,
            _port: PhantomData,
        }
    }
}

impl<Host> ConfigBuilder<Host, Missing> {
    fn port(self, port: u16) -> ConfigBuilder<Host, Present> {
        ConfigBuilder {
            host: self.host,
            port: Some(port),
            _host: PhantomData,
            _port: PhantomData,
        }
    }
}
```

The exact syntax can get heavy, so use this pattern where missing fields would be meaningfully dangerous or common. Not every config struct needs compile-time staged construction.

## API Surface and `impl Trait`

Strong APIs are also disciplined about what they expose.

Rules of thumb:

- accept flexible inputs: `impl AsRef<Path>`, `impl Into<String>`
- return specific or opaque outputs intentionally
- avoid exposing concrete iterator or future types unless callers benefit
- keep helper modules and extension traits private until you are ready to support them semantically

Return-position `impl Trait` is especially useful for hiding noisy concrete combinator types without paying for trait objects.

## Designing for Downstream Composability

A strong Rust library does not only enforce invariants. It composes.

That usually means:

- implementing standard traits where semantics fit
- borrowing where possible
- cloning only where justified
- exposing iterators instead of forcing collection allocation
- giving callers structured error types

The advanced insight is this:

an API is not "ergonomic" just because the call site is short. It is ergonomic when the downstream user can integrate it into real code without fighting ownership, typing, or semver surprises.

## Step 7 - Common Misconceptions

Wrong model 1: "More types always means better API design."

Correction: more types are good only when they represent real invariants or semantic distinctions.

Wrong model 2: "Builder pattern is always the ergonomic answer."

Correction: builders are great for many optional fields. For two required fields, a normal constructor may be clearer.

Wrong model 3: "Typestate is overkill in all application code."

Correction: sometimes yes, but when order and stage are central invariants, typestate is exactly the right tool.

Wrong model 4: "Returning `String` everywhere is flexible."

Correction: it is flexible for the API author and expensive for the API user, who now must remember meaning by convention.

## Step 8 - Real-World Pattern

You see type-driven API design all over the Rust ecosystem:

- `std::num::NonZeroUsize` encodes a numeric invariant
- HTTP crates distinguish methods, headers, and status codes with domain types
- builder APIs are common in clients and configuration-heavy libraries
- `clap` uses typed parsers and derive-driven declarations instead of raw argument maps

The pattern is consistent: strong libraries move recurring mistakes out of runtime branches and into types, constructors, and method availability.

## Step 9 - Practice Block

### Code Exercise

Wrap raw email strings in a validated `EmailAddress` newtype. Decide which traits to implement and why.

### Code Reading Drill

Explain what invariant this API is trying to encode:

```rust
enum Connection {
    Disconnected,
    Connected(SocketAddr),
}
```

Then explain when a typestate version would be better.

### Spot the Bug

Why is this API semantically weak?

```rust
fn create_user(id: String, role: String, active: bool) -> Result<(), String> {
    Ok(())
}
```

### Refactoring Drill

Take a config constructor with seven positional arguments and redesign it using either a builder or a validated input struct. Explain your choice.

### Compiler Error Interpretation

If a method is "not found" on `Post<Draft>`, translate it as: "this operation is intentionally not part of the draft state's API surface."

## Step 10 - Contribution Connection

After this chapter, you can read and shape:

- public constructors and builders
- domain newtypes and validation layers
- method sets that differ by state or capability
- ergonomic iterator- and error-returning APIs

Good first PRs include:

- replacing raw strings and booleans with domain types
- tightening constructors around required invariants
- reducing semantically vague public function signatures

## In Plain English

Good Rust APIs make the right thing natural and the wrong thing awkward or impossible. That matters to systems engineers because production bugs often come from valid-looking calls that should never have been valid in the first place.

## What Invariant Is Rust Protecting Here?

Public values and transitions should preserve domain meaning: invalid combinations, illegal orderings, and ambiguous raw representations should be blocked or isolated at construction boundaries.

## If You Remember Only 3 Things

- Newtypes are the cheapest way to add domain meaning and validation.
- Typestate is for APIs where stage and operation order are part of the invariant.
- Ergonomics is not only short syntax; it is downstream composability without ambiguity.

## Memory Hook

A good API is a hallway with the wrong doors bricked shut. Callers should not need a warning sign where a wall would do.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is the point of a newtype? | To add semantic distinction, validation boundaries, and trait control to an underlying representation. |
| What does typestate encode? | Valid states and transitions in the type system. |
| When is a builder preferable to a constructor? | When construction has many optional fields or named-step ergonomics matter. |
| What is a typestate builder for? | Enforcing required construction steps at compile time. |
| Why use `impl AsRef<Path>` or `impl Into<String>` in inputs? | To accept flexible caller inputs without forcing one concrete type. |
| Why might return-position `impl Trait` improve an API? | It hides a noisy concrete type while preserving static dispatch. |
| What is a sign that a public function signature is semantically weak? | It uses many raw primitives or booleans that rely on call-site convention. |
| What does "downstream composability" mean in API design? | Callers can integrate the API cleanly into real code without fighting ownership, allocation, or missing trait support. |

## Chapter Cheat Sheet

| Problem | Pattern | Benefit |
|---|---|---|
| Raw primitive has domain meaning | newtype | validation and semantic clarity |
| Method order matters | typestate | illegal transitions become compile errors |
| Many optional fields | builder | readable construction |
| Required steps in construction | typestate builder | compile-time completeness |
| Complex returned iterator/future type | return `impl Trait` | hide noise, keep performance |

---

# Chapter 45: Crate Architecture, Workspaces, and Semver

## Step 1 - The Problem

Writing good Rust inside one file is not the same as maintaining a crate other people depend on.

As soon as code becomes public, you inherit new failure modes:

- unstable module boundaries
- accidental public APIs
- breaking changes hidden inside innocent refactors
- feature flags that conflict across dependency graphs
- workspaces that split too early or too late

In less disciplined ecosystems, these problems are often handled by convention and hope. Rust's tooling nudges you toward stronger release hygiene because the ecosystem depends heavily on interoperable crates.

## Step 2 - Rust's Design Decision

Cargo and the crate system make package structure part of everyday development rather than an afterthought.

Rust also treats semver seriously because public APIs are encoded deeply in types, trait impls, and features. A "small" change can break many downstream crates if you do not reason carefully about what was part of the public contract.

Rust accepted:

- more deliberate package boundaries
- feature and visibility discipline
- explicit release hygiene

Rust refused:

- hand-wavy public API management
- feature flags that arbitrarily remove existing functionality
- pretending a type-level breaking change is minor because the README example still works

## Step 3 - The Mental Model

Plain English rule: your crate's public API is every promise downstream code can rely on, not just the functions you meant people to call.

That includes:

- public items
- visible fields
- trait impls
- feature behavior
- module paths you export
- error types and conversion behavior

Workspaces are about shared development and release structure. They are not automatically proof of better architecture.

## Step 4 - Minimal Code Example

```toml
[workspace]
members = ["crates/core", "crates/cli"]

[workspace.dependencies]
serde = { version = "1.0", features = ["derive"] }
```

```toml
[package]
name = "core"
version = "0.1.0"
edition = "2024"

[dependencies]
serde.workspace = true
```

## Step 5 - Line-by-Line Compiler and Tooling Walkthrough

Cargo reads the workspace manifest first:

1. it discovers member crates
2. it resolves shared dependencies and metadata
3. it builds a dependency graph across the workspace
4. it runs requested commands across members in graph-aware order

When you expose items from `lib.rs`, you are shaping the crate's stable face. Re-exporting an internal module path is not just convenience. It is a public commitment if downstream users adopt it.

That is why "just make it `pub` for now" is such a dangerous habit in library code.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

A crate is a package of Rust code. A workspace is a set of crates developed together. Public APIs need more care than internal code because other people may depend on them.

### Level 2 - Engineer

Split crates when there is a real boundary:

- different release cadence
- independent reuse value
- heavy optional dependencies
- clear architectural separation

Do not split purely for aesthetics. Too many crates create coordination overhead, duplicated concepts, and harder refactors.

Feature flags should be additive. If enabling a feature removes a type, changes meaning, or breaks existing callers, you have created feature-driven semver chaos.

### Level 3 - Systems

Semver in Rust is subtle because the public contract includes more than function signatures. Changing trait bounds, removing an impl, altering auto trait behavior, narrowing visibility, or changing feature-controlled item availability can all be breaking changes.

This is why tools like `cargo-semver-checks` exist. The goal is not ceremony. The goal is to catch type-level breaking changes that humans easily miss.

## Anatomy of a Strong Crate

```text
my_crate/
├── Cargo.toml
├── src/
│   ├── lib.rs
│   ├── error.rs
│   ├── config.rs
│   ├── parser.rs
│   └── internal/
├── tests/
├── examples/
├── benches/
├── README.md
└── CHANGELOG.md
```

Common architectural roles:

- `lib.rs`: curate the public API, re-export intentionally
- `error.rs`: centralize public error surface
- `internal/` or private modules: implementation details
- `tests/`: integration tests that use only the public API
- `examples/`: runnable user-facing patterns

## Feature Flags

Feature flags must be additive because dependencies are unified across the graph. If two downstream crates enable different features on your crate, Cargo combines them.

That means features are not build profiles. They are capability additions.

Good feature use:

- optional dependency integration
- extra formats or transports
- heavier convenience layers

Bad feature use:

- mutually incompatible behavior changes
- removing items under a feature
- changing semantics of existing items in surprising ways

## What Counts as a Breaking Change?

Typical breaking changes include:

- removing or renaming public items
- changing public function signatures
- adding required trait bounds
- changing enum variants available to users
- making public fields private
- removing trait impls
- changing feature behavior so previously compiling code fails
- changing auto trait behavior such as `Send` or `Sync`

Even "harmless" changes like swapping a returned concrete type can be breaking if that type was public and relied on by downstream code.

## `cargo-semver-checks`, CHANGELOG, and Publishing

For libraries, run semver validation before release. `cargo-semver-checks` helps compare the current crate against a prior release and surfaces API changes with semver meaning.

`CHANGELOG.md` matters because:

- contributors see what changed
- reviewers can track release intent
- users can assess upgrade impact

Publishing checklist:

1. run tests, clippy, and docs
2. audit public API changes
3. verify feature combinations
4. update changelog
5. check README examples
6. publish from a clean, intentional state

## Workspaces in Real Projects

Multi-crate workspaces are common in serious Rust repositories:

- `tokio` splits runtime pieces and supporting crates
- `serde` separates core pieces and derive support
- observability stacks split core types, subscribers, and integrations

The pattern to learn is not "many crates is better." It is:

split when the boundary is real, and keep the public surface of each crate intentionally small.

## Step 7 - Common Misconceptions

Wrong model 1: "If a module path is public, I can change it later as an internal refactor."

Correction: once downstream code imports it, it is part of the public contract unless you re-export compatibly.

Wrong model 2: "Feature flags can represent mutually exclusive modes."

Correction: Cargo unifies features, so mutually exclusive flags are fragile unless designed very carefully.

Wrong model 3: "A workspace is just a monorepo."

Correction: it is a Cargo-level coordination mechanism with dependency, command, and release implications.

Wrong model 4: "Semver is just version-number etiquette."

Correction: semver is an operational promise about what downstream code may keep relying on.

## Step 8 - Real-World Pattern

Well-shaped Rust libraries tend to:

- curate public exports from `lib.rs`
- keep implementation modules private
- isolate proc-macro crates when needed
- treat feature flags as additive integration points
- use integration tests to exercise the public API

That shape appears in major ecosystem projects because it scales maintenance, review, and release hygiene.

## Step 9 - Practice Block

### Code Exercise

Sketch a workspace for a project with:

- a reusable parsing library
- a CLI
- an async server

Decide which crates should exist and which dependencies belong at the workspace level.

### Code Reading Drill

Open a real `Cargo.toml` and explain:

- what features it exposes
- whether they are additive
- which dependencies are optional
- where the public API likely lives

### Spot the Bug

Why is this risky?

```toml
[features]
default = ["sqlite"]
postgres = []
sqlite = []
```

Assume enabling both changes runtime behavior in incompatible ways.

### Refactoring Drill

Take a crate with many `pub mod` exports and redesign `lib.rs` to expose only the intended high-level API.

### Compiler Error Interpretation

If a downstream crate breaks after you "only" added a trait bound, translate that as: "I tightened the public contract, so this may be a semver-breaking change."

## Step 10 - Contribution Connection

After this chapter, you can review and improve:

- `Cargo.toml` feature design
- workspace dependency sharing
- public re-export strategy
- changelog and release hygiene
- semver-sensitive public API changes

Strong first PRs include:

- tightening accidental public visibility
- making feature flags additive
- adding integration tests that pin public API behavior
- documenting release-impacting changes clearly

## In Plain English

A crate is not just code. It is a promise to other code. Rust's tooling pushes you to treat that promise seriously because once people depend on your types and features, changing them carelessly creates real upgrade pain.

## What Invariant Is Rust Protecting Here?

Public APIs, features, and crate boundaries should evolve in ways that preserve downstream correctness and expectations unless a deliberate breaking release says otherwise.

## If You Remember Only 3 Things

- Every public item, trait impl, and feature behavior is part of your crate's contract.
- Workspaces help coordinate related crates, but they do not replace real architectural boundaries.
- Semver in Rust is type-level and behavioral, not just cosmetic version numbering.

## Memory Hook

Publishing a crate is pouring concrete, not drawing chalk. Public API lines are easy to widen later and expensive to erase cleanly.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is a workspace for? | Coordinating multiple related crates under one Cargo graph and command surface. |
| Why must features usually be additive? | Because Cargo unifies enabled features across the dependency graph. |
| Name one subtle breaking change besides removing a function. | Removing a trait impl or adding a required trait bound. |
| What is `lib.rs` often responsible for? | Curating and presenting the public API surface intentionally. |
| When should you split a project into multiple crates? | When there is a real architectural, dependency, reuse, or release boundary. |
| What does `cargo-semver-checks` help detect? | Public API changes with semver implications. |
| Why do integration tests matter for libraries? | They exercise the public API the way downstream users do. |
| Why is `pub` a stronger commitment than it feels? | Because downstream code may begin depending on anything you expose. |

## Chapter Cheat Sheet

| Problem | Tool or practice | Benefit |
|---|---|---|
| Shared dependency versions across crates | `[workspace.dependencies]` | less duplication and drift |
| Accidental public API sprawl | curated `lib.rs` re-exports | smaller stable surface |
| Optional ecosystem integration | additive feature flags | composable dependency graph |
| Detect release-breaking API drift | `cargo-semver-checks` | semver-aware verification |
| Communicate user-facing release impact | `CHANGELOG.md` | upgrade clarity |

---

## Part 7 Summary

Advanced Rust abstractions are about controlled power:

- traits let you choose static or dynamic polymorphism deliberately
- macros let you abstract syntax when ordinary code is not enough
- type-driven APIs encode invariants where callers cannot accidentally ignore them
- crate architecture and semver turn local code into maintainable ecosystem code

Strong Rust libraries do not merely compile. They make correct use legible, efficient, and stable over time.
