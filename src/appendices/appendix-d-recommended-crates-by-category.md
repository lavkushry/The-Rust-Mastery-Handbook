# Appendix D — Recommended Crates by Category
<figure class="visual-figure" style="--chapter-accent: var(--valid);"><div class="visual-figure__header"><div><div class="visual-figure__eyebrow">Ecosystem Field Guide</div><h2 class="visual-figure__title">Choose the Standard Path First</h2></div></div><div class="visual-figure__body"><svg class="svg-frame" viewBox="0 0 980 360" role="img" aria-label="Crate category map with standard ecosystem crates for CLI, web, async, serialization, errors, testing, observability, databases, FFI, parsing, and crypto"><rect x="24" y="24" width="932" height="312" rx="28" fill="#fffdf8" stroke="rgba(82,183,136,0.14)"></rect><rect x="54" y="64" width="128" height="74" rx="18" fill="#eef6fb" stroke="#219ebc" stroke-width="3"></rect><text x="94" y="102" class="svg-small" style="fill:#0b5e73;">CLI</text><text x="76" y="126" class="svg-small" style="fill:#0b5e73;">clap indicatif</text><rect x="200" y="64" width="128" height="74" rx="18" fill="#eef2ff" stroke="#023e8a" stroke-width="3"></rect><text x="246" y="102" class="svg-small" style="fill:#023e8a;">Web</text><text x="222" y="126" class="svg-small" style="fill:#023e8a;">axum hyper tower</text><rect x="346" y="64" width="128" height="74" rx="18" fill="#edf8f1" stroke="#52b788" stroke-width="3"></rect><text x="390" y="102" class="svg-small" style="fill:#1f6f4d;">Async</text><text x="370" y="126" class="svg-small" style="fill:#1f6f4d;">tokio futures</text><rect x="492" y="64" width="128" height="74" rx="18" fill="#fff8df" stroke="#ffbe0b" stroke-width="3"></rect><text x="520" y="102" class="svg-small" style="fill:#8f5d00;">Serde</text><text x="510" y="126" class="svg-small" style="fill:#8f5d00;">serde json toml</text><rect x="638" y="64" width="128" height="74" rx="18" fill="#fff1eb" stroke="#e76f51" stroke-width="3"></rect><text x="670" y="102" class="svg-small" style="fill:#8f3d22;">Errors</text><text x="658" y="126" class="svg-small" style="fill:#8f3d22;">thiserror anyhow</text><rect x="784" y="64" width="128" height="74" rx="18" fill="#f3f0ff" stroke="#8338ec" stroke-width="3"></rect><text x="814" y="102" class="svg-small" style="fill:#5c2bb1;">Tests</text><text x="804" y="126" class="svg-small" style="fill:#5c2bb1;">proptest insta</text><text x="188" y="214" class="svg-small" style="fill:#6b7280;">prefer boring, maintained, ecosystem-standard crates unless your constraints clearly say otherwise</text></svg></div></figure>

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
