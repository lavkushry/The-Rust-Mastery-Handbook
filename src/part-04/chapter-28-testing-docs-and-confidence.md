# Chapter 28: Testing, Docs, and Confidence

<div class="ferris-says" data-variant="insight">
<p>Tests, doc tests, integration tests, bench tests, property tests. Rust's testing story is best-in-class because the compiler has already caught most of the bugs other language's tests exist to catch. Here is how to cover the rest.</p>
</div>
<div class="chapter-snapshot">
  <div class="snapshot-cell"><h4>Prerequisites</h4><div class="snapshot-prereq"><a href="../part-02/chapter-05-cargo-and-project-structure.md">Ch 5: Cargo</a></div></div>
  <div class="snapshot-cell"><h4>You will understand</h4><ul><li><code>#[test]</code>, <code>#[should_panic]</code>, and integration tests</li><li>Doc tests as living documentation</li><li>Test organization: unit, integration, doc</li></ul></div>
  <div class="snapshot-cell"><h4>Reading time</h4><div class="snapshot-time">30<span class="snapshot-time-unit"> min</span></div><div style="font-size:0.72rem;opacity:0.45;margin-top:0.25rem">+ 20 min exercises</div></div>
</div>
<div class="diagram-grid diagram-grid--two">
  <figure class="visual-figure" style="--chapter-accent: var(--valid);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Confidence Layers</div><h2 class="visual-figure__title">Unit, Integration, and Doctest Cover Different Risks</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Testing layers diagram from unit tests to integration tests to doctests"><rect x="28" y="28" width="484" height="364" rx="24" fill="#fffdf8" stroke="rgba(82,183,136,0.16)"></rect><rect x="90" y="282" width="360" height="44" rx="14" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect><text x="232" y="309" class="svg-small" style="fill:#0b5e73;">unit tests</text><rect x="132" y="214" width="276" height="44" rx="14" fill="#edf8f1" stroke="#52b788" stroke-width="3"></rect><text x="230" y="241" class="svg-small" style="fill:#1f6f4d;">integration tests</text><rect x="172" y="146" width="196" height="44" rx="14" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect><text x="238" y="173" class="svg-small" style="fill:#8f5d00;">doctests</text><text x="104" y="98" class="svg-small" style="fill:#6b7280;">private logic confidence</text><text x="192" y="124" class="svg-small" style="fill:#6b7280;">public contract confidence</text><text x="206" y="350" class="svg-small" style="fill:#6b7280;">documentation truth confidence</text></svg></div>
  </figure>
  <figure class="visual-figure visual-figure--dark" style="--chapter-accent: var(--valid);">
    <div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Beyond Built-ins</div><h2 class="visual-figure__title">Property Tests, Snapshots, and Trait-Based Fakes</h2></div></div>
    <div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 540 420" role="img" aria-label="Supplementary testing methods diagram for proptest, insta snapshots, and fake trait implementations"><rect x="24" y="24" width="492" height="372" rx="24" fill="#101827" stroke="rgba(255,255,255,0.08)"></rect><rect x="54" y="118" width="132" height="176" rx="18" fill="#231942" stroke="#8338ec" stroke-width="3"></rect><text x="88" y="152" class="svg-small" style="fill:#efe8ff;">proptest</text><text x="72" y="186" class="svg-small" style="fill:#efe8ff;">generated inputs</text><text x="86" y="212" class="svg-small" style="fill:#efe8ff;">invariants</text><rect x="204" y="118" width="132" height="176" rx="18" fill="#172554" stroke="#3a86ff" stroke-width="3"></rect><text x="246" y="152" class="svg-small" style="fill:#dbeafe;">insta</text><text x="228" y="186" class="svg-small" style="fill:#dbeafe;">snapshot output</text><text x="226" y="212" class="svg-small" style="fill:#dbeafe;">review changes</text><rect x="354" y="118" width="132" height="176" rx="18" fill="#123e2e" stroke="#52b788" stroke-width="3"></rect><text x="388" y="152" class="svg-small" style="fill:#d9fbe9;">fake impl</text><text x="372" y="186" class="svg-small" style="fill:#d9fbe9;">small traits</text><text x="372" y="212" class="svg-small" style="fill:#d9fbe9;">cheap doubles</text></svg></div>
  </figure>
</div>

## Step 1 - The Problem

Rust's type system catches a lot, but it does not catch:

- wrong business logic
- incorrect boundary assumptions
- regressions in output shape
- integration mistakes across crates or modules

Strong Rust codebases treat tests and docs as part of API design, not as afterthoughts.

## Step 2 - Rust's Design Decision

Rust's built-in testing story spans:

- unit tests inside modules
- integration tests in `tests/`
- doctests in documentation

The ecosystem adds:

- `proptest` for property-based testing
- `insta` for snapshot testing

Rust accepted:

- multiple test layers
- some boilerplate around module organization

Rust refused:

- a single monolithic testing style pretending all confidence needs are identical

## Step 3 - The Mental Model

Plain English rule:

- unit tests validate small logic locally
- integration tests validate public behavior from outside the crate
- doctests validate examples and documentation truth

## Step 4 - Minimal Code Example

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_two_numbers() {
        assert_eq!(add(2, 3), 5);
    }
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `#[cfg(test)]` means the module exists only when compiling tests.
2. `use super::*;` imports the surrounding module's items.
3. `#[test]` marks a function for the test harness.
4. `cargo test` builds a test binary and runs all discovered tests.

This arrangement matters because unit tests inside the module can access private implementation details, while integration tests in `tests/` can only use the public API.

## Step 6 - Three-Level Explanation


<div class="level-tabs">
<div class="level-panel" data-level="Beginner">

Unit tests sit close to the code they check. Integration tests act more like real users of the crate.

</div>
<div class="level-panel" data-level="Engineer">

Strong test strategy often looks like:

- unit tests for pure logic and edge cases
- integration tests for public workflows
- doctests for usage examples
- snapshot tests for structured output
- property tests for invariants that should hold across many generated inputs

</div>
<div class="level-panel" data-level="Deep Dive">

Tests are how you preserve invariants the type system cannot encode. They are especially important around:

- parsing
- formatting
- protocol boundaries
- concurrency behavior
- error surface stability

The best Rust codebases often read tests first because tests reveal intended usage and failure boundaries more directly than implementation files.

</div>
</div>


## `cargo test`, `#[cfg(test)]`, and Organization

Useful commands:

```bash
cargo test
cargo test some_name
cargo test -- --nocapture
cargo test -- --test-threads=1
```

Keep pure helper functions small enough that they are easy to unit test. Use integration tests when you care about the public contract rather than private internals.

## `proptest`, `insta`, and Test Doubles

Property testing is valuable when invariants matter more than example cases:

- parser round trips
- serialization stability
- ordering guarantees

Snapshot testing is useful when output structure matters:

- CLI output
- generated config
- structured serialization

Test doubles in Rust often come from traits rather than mocking frameworks first. If behavior is abstracted behind a trait, fake implementations are often enough.

## Step 7 - Common Misconceptions

Wrong model 1: "The borrow checker means fewer tests are needed."

Correction: memory safety and behavioral correctness are different.

Wrong model 2: "Integration tests are just slower unit tests."

Correction: they validate a different contract: the public API as a consumer sees it.

Wrong model 3: "Doctests are cosmetic."

Correction: they are executable examples and one of the best ways to stop docs from rotting.

Wrong model 4: "Mocking is always the right way to test."

Correction: in Rust, small traits and real-value tests are often cleaner than heavy mocking.

## Step 8 - Real-World Pattern

Mature Rust repositories often rely heavily on:

- integration tests for CLI and HTTP behavior
- snapshot tests for user-visible output
- doctests for public libraries
- properties for parsers and serializers

Tests are often the fastest map into an unfamiliar codebase because they show intended usage instead of implementation detail first.

## Step 9 - Practice Block

### Code Exercise

Write:

- one unit test
- one integration-test idea
- one doctest example

for a small parser function.

### Code Reading Drill

Explain what this test can access and why:

```rust
#[cfg(test)]
mod tests {
    use super::*;
}
```

### Spot the Bug

Why is this test likely brittle?

```rust
assert_eq!(format!("{value:?}"), "State { x: 1, y: 2 }");
```

### Refactoring Drill

Take a long integration test that mixes setup, action, and assertions chaotically. Restructure it into a clearer scenario.

### Compiler Error Interpretation

If a doctest fails because an item is private, translate that as: "my documentation example is pretending to be a crate user, but I documented an internal-only path."

## Step 10 - Contribution Connection

After this chapter, you can read and add:

- unit and integration tests
- doctest examples
- property and snapshot coverage
- regression tests for reported bugs

Good first PRs include:

- turning a bug report into a failing test
- adding missing doctests to public APIs
- improving snapshot coverage for CLI output

## In Plain English

Rust catches many mistakes before the program runs, but it cannot tell whether your feature does the right thing. Tests and docs close that gap. That matters because good systems code is not just safe code; it is code whose behavior stays trustworthy over time.

## What Invariant Is Rust Protecting Here?

Behavioral contracts, public examples, and regression boundaries must stay true even when internal implementations change.

## If You Remember Only 3 Things

- Unit, integration, and doctests serve different purposes.
- Tests are often the best map into a codebase's intended behavior.
- The type system reduces a class of bugs; it does not remove the need for behavioral verification.

## Memory Hook

Types are the building frame. Tests are the load test. The frame can be perfect and still fail if the wrong bridge is attached to it.

## Flashcard Deck

| Question | Answer |
|---|---|
| What is `#[cfg(test)]` for? | Compiling test-only code when running the test harness. |
| What can unit tests access that integration tests usually cannot? | Private items in the same module tree. |
| What do integration tests validate? | The public API from an external consumer perspective. |
| Why are doctests valuable? | They keep examples executable and documentation honest. |
| When is `proptest` useful? | When invariants matter across many generated inputs. |
| When is `insta` useful? | When structured output should remain stable and reviewable. |
| Why are bug-regression tests valuable? | They prevent the same failure from quietly returning later. |
| Why can tests be a good onboarding tool? | They show intended usage and edge cases clearly. |

## Chapter Cheat Sheet

| Need | Test layer | Why |
|---|---|---|
| Pure local logic | unit test | fast and close to code |
| Public API workflow | integration test | consumer perspective |
| Executable docs | doctest | example correctness |
| Output stability | snapshot test | visible diff review |
| General invariant | property test | many generated cases |

---
