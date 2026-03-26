# Appendix A — Cargo Command Cheat Sheet
<figure class="visual-figure" style="--chapter-accent: var(--perf);"><div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Command Board</div><h2 class="visual-figure__title">Cargo Surfaces by Workflow Phase</h2></div></div><div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 980 360" role="img" aria-label="Cargo command board grouping commands by development, testing, publishing, debugging, and workspace tasks"><rect x="24" y="24" width="932" height="312" rx="28" fill="#fffdf8" stroke="rgba(255,190,11,0.14)"></rect><rect x="54" y="86" width="156" height="184" rx="22" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect><text x="90" y="120" class="svg-small" style="fill:#0b5e73;">develop</text><text x="72" y="154" class="svg-small" style="fill:#0b5e73;">check, build, run, fmt</text><rect x="228" y="86" width="156" height="184" rx="22" fill="#edf8f1" stroke="#52b788" stroke-width="3"></rect><text x="270" y="120" class="svg-small" style="fill:#1f6f4d;">test</text><text x="246" y="154" class="svg-small" style="fill:#1f6f4d;">test, bench, doc</text><rect x="402" y="86" width="156" height="184" rx="22" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect><text x="428" y="120" class="svg-small" style="fill:#8f5d00;">publish</text><text x="420" y="154" class="svg-small" style="fill:#8f5d00;">package, publish, yank</text><rect x="576" y="86" width="156" height="184" rx="22" fill="#f3f0ff" stroke="#8338ec" stroke-width="3"></rect><text x="608" y="120" class="svg-small" style="fill:#5c2bb1;">inspect</text><text x="594" y="154" class="svg-small" style="fill:#5c2bb1;">tree, expand, miri</text><rect x="750" y="86" width="156" height="184" rx="22" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect><text x="774" y="120" class="svg-small" style="fill:#023e8a;">workspace</text><text x="764" y="154" class="svg-small" style="fill:#023e8a;">-p, --workspace, audit</text></svg></div></figure>

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
