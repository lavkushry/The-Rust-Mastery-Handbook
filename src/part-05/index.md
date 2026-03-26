# PART 5 - Concurrency and Async

Rust's concurrency story is not "here are some APIs for threads." It is a language-level claim: if your program is safe Rust, it cannot contain a data race. That claim shapes everything in this part. `Send` and `Sync` are not trivia. `async fn` is not syntax sugar in the casual sense. `Pin` is not an arbitrary complication. They are all consequences of Rust refusing to separate safety from performance.

This part matters because serious Rust work quickly becomes concurrent Rust work. Servers handle many requests. CLIs spawn subprocesses and read streams. data pipelines coordinate producers and consumers. Libraries expose types that must behave correctly under shared use. If your mental model of concurrency is shallow, your Rust code will compile only after repeated fights with the type system. If your mental model is correct, the compiler becomes a design partner.

---

## Chapters in This Part

- [Chapter 31: Threads and Message Passing](chapter-31-threads-and-message-passing.md)
- [Chapter 32: Shared State, Arc, Mutex, and Send/Sync](chapter-32-shared-state-arc-mutex-and-send-sync.md)
- [Chapter 33: Async/Await and Futures](chapter-33-async-await-and-futures.md)
- [Chapter 34: `select!`, Cancellation, and Timeouts](chapter-34-select-cancellation-and-timeouts.md)
- [Chapter 35: Pin and Why Async Is Hard](chapter-35-pin-and-why-async-is-hard.md)

---

## Part 5 Summary

Rust concurrency is one coherent system:

- threads require ownership or proven scoped borrowing
- shared state requires explicit synchronization and thread-safety auto traits
- async uses futures and executors to make waiting cheap
- `select!` turns dropping into cancellation
- pinning protects address-sensitive state in async machinery

If you hold that model firmly, the APIs stop feeling like unrelated complexity and start looking like one design expressed at different concurrency boundaries.
