# Chapter 37: Unsafe Rust, Power and Responsibility

<div class="ferris-says" data-variant="insight">
<p>Performance is not "write fast code". It is a discipline: measure, hypothesise, change one thing, measure again. Rust gives you every tool you need to measure well — <code>criterion</code>, <code>perf</code>, flamegraphs, <code>cargo-asm</code>. Today we learn the loop.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-03/chapter-17-borrowing-constrained-access.md">Ch 17: Borrow Rules</a><a href="../part-03/chapter-19-stack-vs-heap-where-data-lives.md">Ch 19: Stack/Heap</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>The 5 unsafe superpowers and nothing more</li><li>Safe abstraction over unsafe implementation</li><li>Sound wrappers: prove preconditions, expose safe API</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">40<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>
<div class="concept-link needed-for"><div class="concept-link-icon">→</div><div class="concept-link-body"><strong>You'll need this for Chapter 38</strong>FFI (Foreign Function Interface) requires <code>unsafe</code> to call into C code. This chapter's sound-wrapper patterns are essential for building safe abstractions over foreign libraries.<a href="../part-06/chapter-38-ffi-talking-to-c-without-lying.md">Preview Ch 38 →</a></div></div>

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

## In plain English first

<div class="ferris-says" data-variant="warning">
<p>The single most-misunderstood word in Rust. Read this first.</p>
</div>

`unsafe` does **not** turn off Rust's safety checks. Inside an `unsafe { … }` block, Rust unlocks exactly **four** extra operations:

1. Dereference a raw pointer (`*const T` / `*mut T`).
2. Call a function declared `unsafe fn`.
3. Read or write a `static mut`.
4. Implement an `unsafe trait` (`Send`, `Sync`, `Pin`-related, …).

That's it. That's the whole list.

Type checking, borrow checking on safe references, ownership, `Drop`, and lifetime checking on `&T` and `&mut T` all stay on. What changes is that you, the programmer, take responsibility for the **safety preconditions** of those four operations — for example, "this raw pointer points at valid, properly aligned memory of the right type, and is not aliased by a `&mut` of the same type."

The reason `unsafe` exists at all is to write the *implementation* of the safe abstractions everyone else uses. `Vec`, `String`, `HashMap`, `Mutex`, `Box` all contain a small unsafe core wrapped in a much larger, hand-audited safe API. The discipline is: **shrink unsafe blocks, expose a safe wrapper, comment every unsafe with a `// SAFETY:` justification.**

<div class="ferris-says">
<p>The mental model that helps: <code>unsafe</code> is a permission, not a release. The compiler is still your co-pilot for the whole flight; it's just that for this one stretch you're flying low.</p>
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


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

`unsafe` means Rust cannot check everything for you in this block, so you must be extra precise.

</div>
<div class="level-panel" data-level="Engineer">

Use unsafe sparingly and isolate it. Most application code should not need it. When unsafe is necessary:

- keep the block small
- document the preconditions with `# Safety`
- test and fuzz the safe wrapper
- make invariants obvious to reviewers

</div>
<div class="level-panel" data-level="Deep Dive">

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

</div>
</div>


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

## What `unsafe` does and doesn't disable — a step-through

<div class="ferris-says" data-variant="warning">
<p>The single biggest myth about <code>unsafe</code> is that it "turns off safety". It does not. It unlocks four operations and asks you to <em>uphold</em> their preconditions. Step through to see exactly what the compiler still checks for you and exactly what it stops checking.</p>
</div>

<div class="step-through" data-title="What unsafe blocks change in the compiler">
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 1: a list labelled 'safe Rust' showing five compiler checks: type checking, borrow checking, ownership and Drop, lifetime checking, no null and no dangling pointers. All five are green checkmarks.">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#1d3557;font-weight:bold">Frame 1 — safe Rust: five checks the compiler enforces</text>
      <g font-family="var(--font-display)" font-size="15">
        <text x="80" y="90" fill="#047857">✓</text><text x="110" y="90" fill="#1a1a2e">Type checking — every value has a type and operations are typed</text>
        <text x="80" y="124" fill="#047857">✓</text><text x="110" y="124" fill="#1a1a2e">Borrow checking — aliasing XOR mutation</text>
        <text x="80" y="158" fill="#047857">✓</text><text x="110" y="158" fill="#1a1a2e">Ownership &amp; Drop — every value has exactly one owner; Drop runs at end of scope</text>
        <text x="80" y="192" fill="#047857">✓</text><text x="110" y="192" fill="#1a1a2e">Lifetimes — references cannot outlive their referents</text>
        <text x="80" y="226" fill="#047857">✓</text><text x="110" y="226" fill="#1a1a2e">No null, no dangling references — references are always valid</text>
      </g>
      <text x="360" y="280" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#457b9d">In safe Rust, all five are guaranteed by the compiler.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 2: the same five checks, but now four small unsafe operations are highlighted as the only things unsafe blocks let you do: dereference a raw pointer, call an unsafe fn, read or write a mutable static, implement an unsafe trait.">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#fef9c3" stroke="#ca8a04"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#1d3557;font-weight:bold">Frame 2 — <code>unsafe { … }</code>: four extra operations unlocked</text>
      <g font-family="var(--font-code)" font-size="14">
        <text x="60" y="84" fill="#1a1a2e">1. Dereference a <tspan fill="#ca8a04">*const T</tspan> or <tspan fill="#ca8a04">*mut T</tspan> raw pointer</text>
        <text x="60" y="116" fill="#1a1a2e">2. Call an <tspan fill="#ca8a04">unsafe fn</tspan> (FFI, intrinsics, hand-audited APIs)</text>
        <text x="60" y="148" fill="#1a1a2e">3. Read or write a <tspan fill="#ca8a04">static mut</tspan></text>
        <text x="60" y="180" fill="#1a1a2e">4. Implement an <tspan fill="#ca8a04">unsafe trait</tspan> (e.g. <tspan fill="#ca8a04">Send</tspan>, <tspan fill="#ca8a04">Sync</tspan>)</text>
      </g>
      <text x="60" y="232" style="font-family:var(--font-display);font-size:14px;fill:#1a1a2e;font-weight:bold">That's it. That's the whole list.</text>
      <text x="60" y="258" style="font-family:var(--font-display);font-size:14px;fill:#457b9d">An <code>unsafe</code> block is a <em>scope</em> in which the four operations</text>
      <text x="60" y="278" style="font-family:var(--font-display);font-size:14px;fill:#457b9d">become legal. Outside the block they remain illegal as before.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 3: the same five compiler checks. Type checking, borrow checking, ownership/drop, lifetimes are still enforced and shown in green. No null and no dangling references is now amber, with a label saying YOU enforce this.">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#fffdf8" stroke="rgba(2,62,138,0.14)"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#1d3557;font-weight:bold">Frame 3 — what the compiler still checks <em>inside</em> <code>unsafe { … }</code></text>
      <g font-family="var(--font-display)" font-size="15">
        <text x="80" y="90" fill="#047857">✓</text><text x="110" y="90" fill="#1a1a2e">Type checking — still on. <code>i32</code> is not assignable to <code>String</code>.</text>
        <text x="80" y="124" fill="#047857">✓</text><text x="110" y="124" fill="#1a1a2e">Borrow checking on <em>safe</em> references — still on.</text>
        <text x="80" y="158" fill="#047857">✓</text><text x="110" y="158" fill="#1a1a2e">Ownership &amp; Drop — still on. RAII still cleans up.</text>
        <text x="80" y="192" fill="#047857">✓</text><text x="110" y="192" fill="#1a1a2e">Lifetimes — still on for <code>&amp;T</code> and <code>&amp;mut T</code>.</text>
        <text x="80" y="226" fill="#ca8a04">!</text><text x="110" y="226" fill="#1a1a2e">No null, no dangling — <em>YOU</em> uphold for raw pointers you deref.</text>
      </g>
      <text x="360" y="280" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#457b9d"><code>unsafe</code> is a <em>permission</em>, not a <em>release</em>. The other four checks remain.</text>
    </svg>
  </div>
  <div class="step-through__frame">
    <svg viewBox="0 0 720 320" role="img" aria-label="Frame 4: the discipline. A box labelled 'unsafe block' contains a small set of carefully audited lines, surrounded by a much larger box labelled 'safe Rust'. An arrow says: wrap unsafe in a safe API, audit it once, use it everywhere.">
      <rect x="10" y="10" width="700" height="300" rx="16" fill="#ecfdf5" stroke="#047857"></rect>
      <text x="360" y="40" text-anchor="middle" style="font-family:var(--font-display);font-size:17px;fill:#047857;font-weight:bold">Frame 4 — the discipline: shrink unsafe; expose a safe wrapper</text>
      <rect x="80" y="80" width="560" height="180" rx="14" fill="#fff" stroke="#047857" stroke-width="2"></rect>
      <text x="360" y="108" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#047857">safe Rust API surface — used by the rest of the crate</text>
      <rect x="220" y="130" width="280" height="100" rx="10" fill="#fef9c3" stroke="#ca8a04" stroke-width="2"></rect>
      <text x="360" y="156" text-anchor="middle" style="font-family:var(--font-code);font-size:13px;fill:#1a1a2e">unsafe { … }</text>
      <text x="360" y="178" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#1a1a2e">audited once,</text>
      <text x="360" y="196" text-anchor="middle" style="font-family:var(--font-display);font-size:13px;fill:#1a1a2e">documented with</text>
      <text x="360" y="214" text-anchor="middle" style="font-family:var(--font-code);font-size:13px;fill:#1a1a2e">// SAFETY: …</text>
      <text x="360" y="282" text-anchor="middle" style="font-family:var(--font-display);font-size:14px;fill:#1a1a2e"><code>Vec</code>, <code>String</code>, <code>HashMap</code>, <code>Mutex</code> all do this. Tiny unsafe core, broad safe API.</text>
    </svg>
  </div>
</div>

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

## wordc, step 18 — using `unsafe` only at the seam

<div class="ferris-says" data-variant="warning">
<p>If <code>wordc</code> is ingesting megabytes of text, the UTF-8 validation in <code>std::str::from_utf8</code> shows up in profiles — it touches every byte. <code>std::str::from_utf8_unchecked</code> skips it but is <code>unsafe</code> because it constructs a <code>&amp;str</code> whose validity is your responsibility. Step 18 shows how to use it safely: validate <em>once</em> at the seam, then promise the rest of the program the bytes are valid.</p>
</div>

```rust,ignore
pub struct ValidUtf8<'a> {
    /// Invariant: `bytes` is valid UTF-8.
    bytes: &'a [u8],
}

impl<'a> ValidUtf8<'a> {
    /// Validate once at the seam. Constant-time after this; safe API.
    pub fn from_bytes(bytes: &'a [u8]) -> Result<Self, std::str::Utf8Error> {
        std::str::from_utf8(bytes)?;        // validates every byte
        Ok(ValidUtf8 { bytes })
    }

    /// Cheap: bytes have already been validated by `from_bytes`.
    pub fn as_str(&self) -> &'a str {
        // SAFETY: `from_bytes` is the only constructor and it called
        // `std::str::from_utf8`, which validates the entire slice. The
        // slice is borrowed and cannot be mutated while `self` holds it,
        // so the UTF-8 invariant cannot be broken behind our back.
        unsafe { std::str::from_utf8_unchecked(self.bytes) }
    }
}

// Usage in wordc.
fn run(session: &WordcSession, min_len: usize) -> Result<(), WordcError> {
    let valid = ValidUtf8::from_bytes(session.bytes())
        .map_err(|_| WordcError::NotUtf8 { path: session.path().to_owned() })?;
    let text: &str = valid.as_str();        // free, no re-validation

    for w in WordIter::new(text, min_len) {
        // ...
    }
    Ok(())
}
```

Two things that make this acceptable, not reckless:

**1. The unsafe block is one line, with a `// SAFETY:` justification.** Nothing else in `wordc` can construct a `ValidUtf8` without going through `from_bytes`. The invariant — "the wrapped `&[u8]` is valid UTF-8" — is established at exactly one spot and re-asserted nowhere else.

**2. The exposed API is safe.** `as_str()` is a *safe* function. Every caller of `as_str()` gets a `&str` and never sees the unsafe machinery. If a future contributor refactors `wordc`, they cannot accidentally violate the invariant — the type system has narrowed the path of possibility.

Compare with the lazy version of the same idea: scattering `unsafe { std::str::from_utf8_unchecked(...) }` calls all over the codebase, each one trusting that "obviously these bytes are UTF-8". That pattern works until the day someone changes `WordcSession::open` to read partial files, or until a future `WordcSession::write_back` writes invalid bytes. Concentrate the unsafe; expose a safe wrapper; document the invariant.

<div class="ferris-says">
<p>If you can't write the <code>// SAFETY:</code> comment in one or two sentences, the unsafe block is doing too much. Refactor until either the comment is concise <em>or</em> you find that the unsafe block isn't actually needed.</p>
</div>

## Quick check

<div class="quiz" data-answer="2">
  <div class="quiz__head"><span>Quick check</span><span>Unsafe contract</span></div>
  <p class="quiz__q">Inside an <code>unsafe { … }</code> block, what does the compiler stop checking, and what does <em>not</em> change?</p>
  <ul class="quiz__options">
    <li>It disables all type checking and the borrow checker — anything goes.</li>
    <li>It permits exactly four extra operations (deref raw pointer, call unsafe fn, access mutable static, implement unsafe trait). Type checking, borrow checking on safe code, and ownership <em>still</em> apply.</li>
    <li>It compiles to the same code as a C function.</li>
    <li>It silently bypasses the optimizer.</li>
  </ul>
  <div class="quiz__explain">Correct. <code>unsafe</code> is a tightly scoped permission: it unlocks four specific operations and shifts the responsibility for upholding their preconditions to <em>you</em>. Borrow checking, type checking, and lifetimes still run. The cliché "unsafe disables the safety" is wrong; it disables four checks and asks you to maintain the invariants those four checks usually maintain.</div>
  <div class="quiz__explain quiz__explain--wrong">Look at the four operations <code>unsafe</code> unlocks. Is the borrow checker on that list?</div>
  <button type="button" class="quiz__reset">Try again</button>
</div>

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
