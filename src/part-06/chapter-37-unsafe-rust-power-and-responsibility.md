# Chapter 37: Unsafe Rust, Power and Responsibility
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-03/chapter-17-borrowing-constrained-access.html">Ch 17: Borrow Rules</a><a href="../part-03/chapter-19-stack-vs-heap-where-data-lives.html">Ch 19: Stack/Heap</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>The 5 unsafe superpowers and nothing more</li><li>Safe abstraction over unsafe implementation</li><li>Sound wrappers: prove preconditions, expose safe API</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">40<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>
<div class="concept-link needed-for"><div class="concept-link-icon">→</div><div class="concept-link-body"><strong>You'll need this for Chapter 38</strong>FFI (Foreign Function Interface) requires <code>unsafe</code> to call into C code. This chapter's sound-wrapper patterns are essential for building safe abstractions over foreign libraries.<a href="../part-06/chapter-38-ffi-talking-to-c-without-lying.html">Preview Ch 38 →</a></div></div>

<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--unsafe);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Superpowers</div><h2 class="visual-figure__title">The Five Unsafe Capabilities</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Five unsafe superpowers arranged around an unsafe core">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fff7fb" stroke="rgba(255,0,110,0.18)"></rect>
        <circle cx="270" cy="210" r="62" fill="#ff006e"></circle>
        <text x="236" y="206" class="svg-subtitle" style="fill:#ffffff;">unsafe</text>
        <text x="214" y="228" class="svg-small" style="fill:#ffffff;">manual invariants</text>
        <g font-family="IBM Plex Sans, sans-serif">
          <rect x="198" y="56" width="144" height="36" rx="12" fill="#fce7f3" stroke="#ff006e"></rect>
          <text x="220" y="79" class="svg-small" style="fill:#9d174d;">raw pointer deref</text>
          <rect x="356" y="138" width="136" height="36" rx="12" fill="#fce7f3" stroke="#ff006e"></rect>
          <text x="374" y="161" class="svg-small" style="fill:#9d174d;">unsafe fn call</text>
          <rect x="340" y="290" width="152" height="36" rx="12" fill="#fce7f3" stroke="#ff006e"></rect>
          <text x="356" y="313" class="svg-small" style="fill:#9d174d;">unsafe trait impl</text>
          <rect x="52" y="290" width="160" height="36" rx="12" fill="#fce7f3" stroke="#ff006e"></rect>
          <text x="70" y="313" class="svg-small" style="fill:#9d174d;">access union field</text>
          <rect x="54" y="138" width="156" height="36" rx="12" fill="#fce7f3" stroke="#ff006e"></rect>
          <text x="70" y="161" class="svg-small" style="fill:#9d174d;">mutable static access</text>
        </g>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--unsafe);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Abstraction Boundary</div><h2 class="visual-figure__title">Small Unsafe Core, Safe Public API</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Safe wrapper pattern around a small unsafe block">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="74" y="78" width="392" height="82" rx="18" fill="#dcfce7" stroke="#52b788" stroke-width="3"></rect>
        <text x="178" y="114" class="svg-subtitle" style="fill:#2d6a4f;">safe public function</text>
        <text x="114" y="138" class="svg-small" style="fill:#2d6a4f;">validate bounds, nullability, alignment, ownership assumptions</text>
        <path d="M270 160 V 204" stroke="#52b788" stroke-width="6"></path>
        <rect x="144" y="204" width="252" height="72" rx="18" fill="#40161b" stroke="#ff006e" stroke-width="3"></rect>
        <text x="226" y="236" class="svg-subtitle" style="fill:#ffd9ec;">unsafe block</text>
        <text x="180" y="258" class="svg-small" style="fill:#ffd9ec;">perform operation after proving preconditions</text>
        <path d="M270 276 V 324" stroke="#ffbe0b" stroke-width="6"></path>
        <rect x="120" y="324" width="300" height="40" rx="12" fill="#fff8df" stroke="#ffbe0b"></rect>
        <text x="164" y="348" class="svg-small" style="fill:#6b3e00;">safe result returned; callers do not see raw hazards</text>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem

Safe Rust is intentionally incomplete as a systems implementation language.

Some tasks require operations the compiler cannot fully verify:

- implementing containers like `Vec<T>`
- FFI with foreign memory rules
- intrusive or self-referential structures
- lock-free structures
- raw OS or hardware interaction

If Rust simply banned these, the language could not implement its own standard library. If Rust allowed them without structure, it would lose its safety claim.

## Step 2 - Rust's Design Decision

Rust isolates these operations behind `unsafe`.

`unsafe` is not "turn off the borrow checker." It is "I am performing one of a small set of operations whose safety depends on extra invariants the compiler cannot prove."

Rust accepted:

- a visible escape hatch
- manual reasoning burden for low-level code
- audit requirements at abstraction boundaries

Rust refused:

- making low-level systems work impossible
- letting unchecked code silently infect the entire language

## Step 3 - The Mental Model

Plain English rule: `unsafe` means "the compiler is trusting me to uphold additional safety rules here."

The goal is not to write "unsafe code." The goal is to write safe abstractions that contain small, justified islands of unsafe implementation.

## Step 4 - Minimal Code Example

```rust
pub fn get_unchecked_safe<T>(slice: &[T], index: usize) -> Option<&T> {
    if index < slice.len() {
        unsafe { Some(slice.get_unchecked(index)) }
    } else {
        None
    }
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. The public function is safe to call.
2. It checks `index < slice.len()`.
3. Inside the `unsafe` block, it calls `get_unchecked`, which requires the caller to guarantee the index is in bounds.
4. The preceding `if` establishes that guarantee.
5. The function returns a safe reference because the unsafe precondition has been discharged locally.

This is the essence of sound unsafe Rust:

- identify the unsafe precondition
- prove it in a smaller local context
- expose only the safe result

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

`unsafe` means Rust cannot check everything for you in this block, so you must be extra precise.

### Level 2 - Engineer

Use unsafe sparingly and isolate it. Most application code should not need it. When unsafe is necessary:

- keep the block small
- document the preconditions with `# Safety`
- test and fuzz the safe wrapper
- make invariants obvious to reviewers

### Level 3 - Systems

Unsafe Rust still enforces most of the language:

- types still exist
- lifetimes still exist
- moves still exist
- aliasing rules still matter

The five unsafe superpowers are specific:

1. dereferencing raw pointers
2. calling unsafe functions
3. accessing mutable statics
4. implementing unsafe traits
5. accessing union fields

Everything else must still be correct under Rust's semantic model. Undefined behavior is the risk when your manual reasoning is wrong.

## Common UB Shapes

Important undefined-behavior risks include:

- dereferencing dangling or misaligned pointers
- violating aliasing assumptions through raw-pointer misuse
- reading uninitialized memory
- using invalid enum discriminants
- double-dropping or forgetting required drops
- creating references to memory that does not satisfy reference rules

`ManuallyDrop<T>` and `MaybeUninit<T>` exist because low-level code sometimes must control initialization and destruction explicitly. They are not performance toys. They are contract-carrying tools for representation-sensitive code.

## Safety Contracts and `# Safety`

Unsafe APIs should document:

- required pointer validity
- alignment expectations
- aliasing constraints
- initialization state
- ownership and drop responsibilities

Example:

```rust
/// # Safety
/// Caller must ensure `ptr` is non-null, aligned, and points to a live `T`.
unsafe fn as_ref<'a, T>(ptr: *const T) -> &'a T {
    &*ptr
}
```

The caller owns the obligation. The callee documents it. A safe wrapper may discharge it and hide the unsafe function from public callers.

## Miri and the Audit Mindset

Miri is valuable because it executes Rust under an interpreter that can catch classes of undefined behavior invisible to ordinary tests.

The audit mindset for unsafe code:

1. what invariant is this block relying on?
2. where is that invariant established?
3. can a future refactor accidentally violate it?
4. is the safe API narrower than the unsafe machinery beneath it?

## Step 7 - Common Misconceptions

Wrong model 1: "`unsafe` means Rust stops checking everything."

Correction: it enables only specific operations whose safety must be justified manually.

Wrong model 2: "Unsafe code is fine if tests pass."

Correction: UB can stay dormant across enormous test suites.

Wrong model 3: "Using `unsafe` makes code faster."

Correction: only if it enables a design or optimization the safe version could not express. Unsafe itself is not an optimization flag.

Wrong model 4: "Small unsafe blocks are automatically safe."

Correction: small scope helps review, but soundness still depends on invariants being correct.

## Step 8 - Real-World Pattern

Production Rust uses unsafe primarily in:

- collections and allocators
- synchronization internals
- FFI layers
- performance-sensitive parsing or buffer code

The important pattern is that the public API is usually safe. Unsafe lives in implementation modules with heavy comments, tests, and strict invariants.

## Step 9 - Practice Block

### Code Exercise

Write a safe wrapper around `slice::get_unchecked` that returns `Option<&T>`, then explain exactly which unsafe precondition your wrapper discharged.

### Code Reading Drill

Read this signature and list every obligation:

```rust
unsafe fn from_raw_parts<'a>(ptr: *const u8, len: usize) -> &'a [u8]
```

### Spot the Bug

What is wrong here?

```rust
unsafe {
    let x = 5u32;
    let ptr = &x as *const u32 as *const u8;
    let y = *(ptr as *const u64);
    println!("{y}");
}
```

### Refactoring Drill

Take a large unsafe function and redesign it into:

- one public safe wrapper
- one or more private unsafe helpers
- explicit documented invariants

### Compiler Error Interpretation

If a type requires `unsafe impl Send`, translate that as: "I am asserting a thread-safety property the compiler cannot prove automatically, so this is a soundness boundary."

## Step 10 - Contribution Connection

After this chapter, you can review:

- safety comments and contracts
- wrappers around raw-pointer APIs
- unsafe trait impls
- container and buffer internals

Approachable first PRs include:

- tightening safety docs
- shrinking unsafe regions
- replacing unnecessary unsafe with safe std APIs where equivalent

## In Plain English

Unsafe Rust exists because some low-level jobs cannot be fully checked by the compiler. Rust's deal is that these dangerous operations must be small, visible, and justified, so the rest of the code can stay safe. That matters because systems software still needs raw power, but raw power without boundaries becomes unmaintainable fast.

## What Invariant Is Rust Protecting Here?

Any value or reference created through unsafe code must still satisfy Rust's normal aliasing, lifetime, initialization, and ownership rules, even if the compiler could not verify them directly.

## If You Remember Only 3 Things

- `unsafe` is about additional obligations, not fewer semantics.
- The real goal is safe abstractions over unsafe implementation details.
- Documented invariants are part of the code, not optional prose.

## Memory Hook

Unsafe Rust is not taking the guardrails off the road. It is opening a maintenance hatch under the road and saying: if you go down there, you are now responsible for the support beams.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does `unsafe` actually mean? | The compiler is trusting you to uphold extra safety invariants for specific operations. |
| Name the five unsafe superpowers. | Raw pointer dereference, unsafe fn call, mutable static access, unsafe trait impl, union field access. |
| What should a safe wrapper around unsafe code do? | Discharge the unsafe preconditions internally and expose only a sound safe API. |
| Does unsafe disable the borrow checker? | No. Most Rust semantics still apply. |
| Why are tests alone insufficient for unsafe code? | Undefined behavior can remain latent and nondeterministic. |
| What is `ManuallyDrop` for? | Controlling destruction explicitly in low-level code. |
| What is `MaybeUninit` for? | Representing memory that may not yet hold a fully initialized value. |
| What should `# Safety` docs describe? | The precise obligations callers must uphold. |

## Chapter Cheat Sheet

| Need | Tool or practice | Why |
|---|---|---|
| Raw memory not fully initialized yet | `MaybeUninit<T>` | avoid UB from pretending it is initialized |
| Delay or control destruction | `ManuallyDrop<T>` | explicit drop management |
| Sound low-level boundary | safe wrapper over unsafe core | narrow public risk surface |
| Review unsafe code | invariant checklist | soundness depends on it |
| Catch UB during testing | Miri | interpreter-based checks |

---
