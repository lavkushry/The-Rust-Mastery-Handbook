# Chapter 38: FFI, Talking to C Without Lying
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href=\"../part-06/chapter-37-unsafe-rust-power-and-responsibility.md\">Ch 37: Unsafe</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li><code>extern "C"</code> and calling conventions</li><li>Safe wrappers over C libraries</li><li>Ownership boundaries at FFI edges</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">40<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--unsafe);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Boundary Map</div><h2 class="visual-figure__title">The FFI Treaty Line</h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Treaty line diagram between Rust and C with ABI, layout, ownership, and string contracts crossing the boundary">
        <rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(255,0,110,0.18)"></rect>
        <rect x="56" y="78" width="176" height="264" rx="18" fill="#eefbf4" stroke="#52b788" stroke-width="3"></rect>
        <rect x="308" y="78" width="176" height="264" rx="18" fill="#fff5eb" stroke="#e76f51" stroke-width="3"></rect>
        <text x="114" y="114" class="svg-subtitle" style="fill:#2d6a4f;">Rust</text>
        <text x="382" y="114" class="svg-subtitle" style="fill:#8a4b08;">C</text>
        <line x1="270" y1="74" x2="270" y2="346" stroke="#ff006e" stroke-width="6" stroke-dasharray="10 8"></line>
        <text x="230" y="64" class="svg-small" style="fill:#ff006e;">FFI boundary</text>
        <text x="82" y="172" class="svg-small" style="fill:#4b5563;">references</text>
        <text x="82" y="194" class="svg-small" style="fill:#4b5563;">ownership types</text>
        <text x="82" y="216" class="svg-small" style="fill:#4b5563;">len-tracked strings</text>
        <text x="336" y="172" class="svg-small" style="fill:#4b5563;">raw pointers</text>
        <text x="336" y="194" class="svg-small" style="fill:#4b5563;">manual ownership</text>
        <text x="336" y="216" class="svg-small" style="fill:#4b5563;">null-terminated strings</text>
        <text x="120" y="304" class="svg-small" style="fill:#2d6a4f;">translate honestly</text>
        <text x="348" y="304" class="svg-small" style="fill:#8a4b08;">do not pretend contracts match automatically</text>
      </svg>
    </div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--heap);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">String Conversion</div><h2 class="visual-figure__title"><code>CString</code> vs <code>CStr</code></h2></div></div>
    <div class="visual-figure__body">
      <svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Owned CString with trailing null contrasted with borrowed CStr view from foreign pointer">
        <rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect>
        <rect x="56" y="84" width="174" height="244" rx="18" fill="#1f2937" stroke="#e76f51" stroke-width="3"></rect>
        <text x="94" y="118" class="svg-subtitle" style="fill:#ffd8cc;">CString</text>
        <rect x="88" y="162" width="24" height="34" rx="6" fill="#e76f51"></rect>
        <rect x="114" y="162" width="24" height="34" rx="6" fill="#e76f51"></rect>
        <rect x="140" y="162" width="24" height="34" rx="6" fill="#e76f51"></rect>
        <rect x="166" y="162" width="24" height="34" rx="6" fill="#ffbe0b"></rect>
        <text x="98" y="222" class="svg-small" style="fill:#ffd8cc;">owned buffer with trailing NUL</text>
        <rect x="310" y="84" width="174" height="244" rx="18" fill="#1f2937" stroke="#3a86ff" stroke-width="3"></rect>
        <text x="364" y="118" class="svg-subtitle" style="fill:#dbeafe;">CStr</text>
        <path d="M340 178 H 438" stroke="#3a86ff" stroke-width="6" marker-end="url(#cstrArrow)"></path>
        <text x="336" y="222" class="svg-small" style="fill:#dbeafe;">borrowed view from foreign ptr</text>
        <text x="322" y="246" class="svg-small" style="fill:#dbeafe;">Rust does not own the bytes</text>
        <defs><marker id="cstrArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#3a86ff"></path></marker></defs>
      </svg>
    </div>
  </figure>
</div>

## Step 1 - The Problem

Real systems rarely live in one language. You call C libraries, expose Rust to C, link with operating-system APIs, or incrementally migrate an older codebase.

The danger is not just syntax mismatch. It is contract mismatch:

- different calling conventions
- different layout expectations
- null-terminated versus length-tracked strings
- ownership rules the compiler cannot see

At an FFI boundary, Rust's type system stops at the edge of what it can express locally. If you lie there, the compiler cannot rescue you.

## Step 2 - Rust's Design Decision

Rust makes FFI explicit:

- `extern "C"` for ABI
- raw pointers for foreign memory
- `repr(C)` for layout-stable structs
- `CStr` and `CString` for C strings

Rust accepted:

- more manual boundary code
- explicit unsafe at the edge

Rust refused:

- pretending foreign memory obeys Rust reference rules automatically
- silently converting incompatible layout or ownership models

## Step 3 - The Mental Model

Plain English rule: an FFI boundary is a treaty line. On the Rust side, Rust's rules apply. On the C side, C's rules apply. Your job is to translate honestly between them.

## Step 4 - Minimal Code Example

```rust
unsafe extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    let value = unsafe { abs(-7) };
    assert_eq!(value, 7);
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `extern "C"` says "use the C calling convention for this symbol."
2. The function body is not present in Rust; it will be linked from elsewhere.
3. Calling it is unsafe because Rust cannot verify the foreign implementation's behavior.
4. The returned `i32` is trusted only because the ABI contract says this signature is correct.

This highlights the core invariant:

your Rust declaration must exactly match the foreign reality.

If it does not, the program may still compile and link while remaining unsound at runtime.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

FFI means Rust is talking to code written in another language. Rust needs explicit instructions about how that conversation works.

</div>
<div class="level-panel" data-level="Engineer">

At FFI boundaries:

- avoid Rust references in extern signatures unless you control both sides and the contract is airtight
- prefer raw pointers for foreign-owned data
- keep Rust-side wrappers small and explicit
- convert strings and ownership once at the edge

</div>
<div class="level-panel" data-level="Deep Dive">

An FFI boundary is a bundle of invariants:

- ABI must match
- layout must match
- ownership must match
- mutability and aliasing expectations must match
- lifetime expectations must match

`repr(C)` solves only layout. It does not solve ownership, initialization, or pointer validity.

</div>
</div>


## `CStr`, `CString`, `#[no_mangle]`, and `repr(C)`

```rust
use std::ffi::{CStr, CString};
use std::os::raw::c_char;

fn main() {
    let owned = CString::new("hello").unwrap();
    let ptr = owned.as_ptr();

    let borrowed = unsafe { CStr::from_ptr(ptr) };
    assert_eq!(borrowed.to_str().unwrap(), "hello");
}
```

Use:

- `CString` when Rust owns a null-terminated string to pass outward
- `CStr` when Rust borrows a null-terminated string from elsewhere

Exposing Rust to C commonly involves:

```rust
#[repr(C)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

#[no_mangle]
pub extern "C" fn point_sum(p: Point) -> i32 {
    p.x + p.y
}
```

`#[no_mangle]` preserves a stable symbol name for foreign linking.

## `bindgen` and Wrapper Strategy

Use `bindgen` when large C headers need Rust declarations generated automatically. Use `cbindgen` when exporting a Rust API to C consumers.

Even with generated bindings, do not dump raw FFI across your codebase. Wrap it:

- raw extern declarations in one module
- safe Rust types and errors on top
- conversion at the edge

## Step 7 - Common Misconceptions

Wrong model 1: "`repr(C)` makes FFI safe."

Correction: it makes layout compatible. Safety still depends on many other invariants.

Wrong model 2: "If it links, the signature must be correct."

Correction: ABI mismatches can compile and still be catastrophically wrong.

Wrong model 3: "Rust references are fine in extern APIs because they are pointers."

Correction: Rust references carry stronger aliasing and validity assumptions than raw C pointers.

Wrong model 4: "String conversion is a minor detail."

Correction: ownership and termination rules around strings are one of the most common FFI bug sources.

## Step 8 - Real-World Pattern

Mature Rust FFI layers usually have three strata:

1. raw bindings
2. safe wrapper types and conversions
3. application code that never touches raw pointers

That shape appears in database clients, graphics bindings, crypto integrations, and OS interfaces because it localizes unsafety and makes review tractable.

## Step 9 - Practice Block

### Code Exercise

Design a safe Rust wrapper around a hypothetical C function:

```c
int parse_config(const char* path, Config* out);
```

Explain:

- how you would represent the input path
- who owns `out`
- where unsafe belongs

### Code Reading Drill

What assumptions does this make?

```rust
unsafe {
    let name = CStr::from_ptr(ptr);
}
```

### Spot the Bug

Why is this unsound?

```rust
#[repr(C)]
struct Bad {
    ptr: &u8,
}
```

Assume C code is expected to construct and pass this struct.

### Refactoring Drill

Take a crate that exposes raw extern calls directly and redesign it so application code only sees safe Rust types.

### Compiler Error Interpretation

If the compiler rejects a direct cast or borrow at an FFI boundary, translate it as: "I am trying to pretend foreign memory already satisfies Rust's stronger guarantees."

## Step 10 - Contribution Connection

After this chapter, you can review:

- raw binding modules
- string and pointer conversion boundaries
- `repr(C)` structures
- exported C-facing functions

Good first PRs include:

- improving safety comments on FFI wrappers
- replacing Rust references in extern signatures with raw pointers
- isolating generated bindings from higher-level safe API code

## In Plain English

When Rust talks to C, neither side automatically understands the other's safety rules. You have to translate honestly between them. That matters because FFI bugs often look fine at compile time and fail only after they are deep in production.

## What Invariant Is Rust Protecting Here?

Foreign data must be translated into Rust only when ABI, layout, lifetime, validity, and ownership assumptions are all satisfied simultaneously.

## If You Remember Only 3 Things

- `repr(C)` is necessary for many FFI structs, but it is only one part of correctness.
- `CStr` and `CString` exist because C strings have different representation and ownership rules than Rust strings.
- Keep raw FFI declarations at the edge and expose safe wrappers inward.

## Memory Hook

An FFI boundary is a customs checkpoint. `repr(C)` is the passport photo. It is necessary, but it is not the whole border inspection.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does `extern "C"` specify? | The calling convention and ABI expected for the symbol. |
| Why are foreign function calls usually unsafe? | Rust cannot verify the foreign implementation obeys the declared contract. |
| What is `repr(C)` for? | Making Rust type layout compatible with C expectations. |
| When do you use `CString`? | When Rust owns a null-terminated string to pass to C. |
| When do you use `CStr`? | When Rust borrows a null-terminated string from C or another foreign source. |
| What does `#[no_mangle]` do? | Preserves a stable exported symbol name. |
| Why are Rust references risky in extern signatures? | They imply stronger validity and aliasing guarantees than raw foreign pointers usually can promise. |
| What is the preferred structure of an FFI crate? | Raw bindings at the edge, safe wrappers inward, application code isolated from raw pointers. |

## Chapter Cheat Sheet

| Need | Tool | Why |
|---|---|---|
| Call C function | `extern "C"` | ABI compatibility |
| Layout-stable shared struct | `repr(C)` | field layout contract |
| Borrow C string | `CStr` | null-terminated borrowed string |
| Own string for C | `CString` | null-terminated owned buffer |
| Export Rust symbol to C | `pub extern "C"` + `#[no_mangle]` | stable callable interface |

---
