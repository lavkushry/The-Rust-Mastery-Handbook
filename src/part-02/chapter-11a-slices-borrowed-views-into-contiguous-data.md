# Chapter 11A: Slices, Borrowed Views into Contiguous Data
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href=\"../part-02/chapter-11-borrowing-and-references-first-contact.md\">Ch 11: Borrowing</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li>Slices as borrowed views: <code>&amp;[T]</code> and <code>&amp;str</code></li><li>Why slices carry both pointer and length</li><li>Relationship between owned data and slice views</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">25<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 15 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--borrow-shared);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Slice Window</div><h2 class="visual-figure__title">A Slice Borrows a Region, Not the Whole Collection API</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Slice window diagram showing a borrowed range into an array"><rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(69,123,157,0.16)"></rect><rect x="74" y="154" width="392" height="72" rx="18" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect><rect x="86" y="168" width="52" height="44" fill="#dbeafe"></rect><rect x="142" y="168" width="52" height="44" fill="#dbeafe"></rect><rect x="198" y="168" width="52" height="44" fill="#457b9d"></rect><rect x="254" y="168" width="52" height="44" fill="#457b9d"></rect><rect x="310" y="168" width="52" height="44" fill="#457b9d"></rect><rect x="366" y="168" width="52" height="44" fill="#dbeafe"></rect><path d="M226 122 V 154 M338 122 V 154" stroke="#457b9d" stroke-width="5"></path><path d="M226 122 H 338" stroke="#457b9d" stroke-width="5"></path><text x="242" y="110" class="svg-small" style="fill:#2d5870;">&amp;nums[2..5]</text><text x="120" y="274" class="svg-small" style="fill:#6b7280;">a slice is pointer plus length into existing contiguous storage</text></svg></div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--borrow-shared);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">String View</div><h2 class="visual-figure__title"><code>&amp;str</code> Is a UTF-8 Slice, Not a Random-Access Char Array</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="String slice diagram showing bytes and a borrowed substring window"><rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect><rect x="62" y="158" width="416" height="72" rx="18" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect><rect x="82" y="172" width="48" height="44" fill="#8ecae6"></rect><rect x="134" y="172" width="48" height="44" fill="#8ecae6"></rect><rect x="186" y="172" width="48" height="44" fill="#457b9d"></rect><rect x="238" y="172" width="48" height="44" fill="#457b9d"></rect><rect x="290" y="172" width="48" height="44" fill="#8ecae6"></rect><rect x="342" y="172" width="48" height="44" fill="#8ecae6"></rect><text x="196" y="136" class="svg-small" style="fill:#dbeafe;">borrowed UTF-8 window</text><text x="92" y="282" class="svg-small" style="fill:#fff3c4;">indexing by byte boundary matters because characters are not fixed-width</text></svg></div>
  </figure>
</div>

## Step 1 - The Problem

You often want part of a collection or part of a string without copying it. Raw pointer-plus-length pairs are famously bug-prone. Rust turns that pattern into safe borrowed slice types.

## Step 2 - Rust's Design Decision

Rust uses:

- `&[T]` for borrowed contiguous sequences
- `&str` for borrowed UTF-8 text slices

Rust accepted:

- explicit slice types
- no casual string indexing fiction

Rust refused:

- unsafe view arithmetic as the default programming model

## Step 3 - The Mental Model

Plain English rule: a slice is a borrowed window into contiguous data owned somewhere else.

## Step 4 - Minimal Code Example

```rust
fn first_two(nums: &[i32]) -> &[i32] {
    &nums[..2]
}
```

## Step 5 - Walkthrough

The function does not own any numbers. It borrows an existing slice and returns a narrower borrowed view into the same data.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Slices let you talk about part of an array, vector, or string without copying it.

</div>
<div class="level-panel" data-level="Engineer">

Slice-based APIs are powerful because they are:

- allocation-free
- flexible
- ownership-friendly

They are common in parsers, formatters, scanners, and text-processing code.

</div>
<div class="level-panel" data-level="Deep Dive">

Slices are fat pointers: pointer plus length. Their safety comes from tying that view to a valid owner region and preserving bounds. `&str` adds the UTF-8 invariant on top.

</div>
</div>


## `&str` and UTF-8 Boundaries

String slices use byte ranges, but those ranges must land on UTF-8 boundaries. This is why Rust does not pretend all string indexing is simple.

## Step 7 - Common Misconceptions

Wrong model 1: "Slices are tiny vectors."

Correction: they do not own storage; they are borrowed views.

Wrong model 2: "A string slice is just any byte range."

Correction: for `&str`, the range must still be valid UTF-8 boundaries.

Wrong model 3: "Slicing means copying."

Correction: slicing usually means reborrowing a portion, not allocating.

## Step 8 - Real-World Pattern

Slice-based APIs are one of the clearest signals of Rust maturity: they often mean the author wants flexibility and low allocation pressure.

## Step 9 - Practice Block

### Code Exercise

Write one function over `&[u8]` and one over `&str` that returns a borrowed sub-slice.

### Code Reading Drill

Explain the ownership of:

```rust
let data = vec![1, 2, 3, 4];
let middle = &data[1..3];
```

### Spot the Bug

Why is this suspect?

```rust
let s = String::from("éclair");
let first = &s[..1];
```

### Refactoring Drill

Change a function taking `&Vec<T>` into one taking `&[T]`.

### Compiler Error Interpretation

If the compiler rejects a string slice range, translate that as: "this byte boundary would violate UTF-8 string invariants."

## Step 10 - Contribution Connection

After this chapter, you can:

- improve APIs from container-specific to slice-based
- reason about borrowed text processing more safely
- spot needless allocation in view-oriented code

Good first PRs include:

- replacing `&Vec<T>` with `&[T]`
- tightening text APIs to borrowed slices
- clarifying UTF-8 boundary assumptions

## In Plain English

Slices are borrowed windows into bigger data. That matters because good systems code often wants to look at parts of data without copying the whole thing.

## What Invariant Is Rust Protecting Here?

A borrowed view must stay within valid bounds of contiguous owned data and, for `&str`, must preserve UTF-8 validity.

## If You Remember Only 3 Things

- Slices borrow; they do not own.
- `&[T]` and `&str` are flexible, allocation-friendly API boundaries.
- `&str` slicing must respect UTF-8 boundaries.

## Memory Hook

A slice is a transparent ruler laid over a larger strip of data. The ruler measures a region; it does not become the owner of the strip.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is `&[T]`? | A borrowed slice of contiguous `T` values. |
| What is `&str`? | A borrowed UTF-8 string slice. |
| Do slices own their data? | No. |
| Why are slices good API parameters? | They are flexible and avoid unnecessary allocation. |
| What must `&str` slicing preserve? | UTF-8 boundary validity. |
| What metadata does a slice carry? | Pointer plus length. |
| Why prefer `&[T]` over `&Vec<T>` in many APIs? | It accepts more callers and better expresses borrowed contiguous data. |
| Is slicing usually a copy? | No. It is usually a borrowed view. |

## Chapter Cheat Sheet

| Need | Type | Why |
|---|---|---|
| borrow any contiguous elements | `&[T]` | generic slice view |
| borrow text | `&str` | UTF-8 text view |
| API flexibility | slice parameter | less ownership coupling |
| partial view | slicing syntax | no new allocation by default |
| avoid container-specific API | prefer slice | broader compatibility |

---
