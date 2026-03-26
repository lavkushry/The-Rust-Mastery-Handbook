# PART 5 - Concurrency and Async

Rust's concurrency story is not "here are some APIs for threads." It is a language-level claim: if your program is safe Rust, it cannot contain a data race. That claim shapes everything in this part. `Send` and `Sync` are not trivia. `async fn` is not syntax sugar in the casual sense. `Pin` is not an arbitrary complication. They are all consequences of Rust refusing to separate safety from performance.

This part matters because serious Rust work quickly becomes concurrent Rust work. Servers handle many requests. CLIs spawn subprocesses and read streams. data pipelines coordinate producers and consumers. Libraries expose types that must behave correctly under shared use. If your mental model of concurrency is shallow, your Rust code will compile only after repeated fights with the type system. If your mental model is correct, the compiler becomes a design partner.

---

# Chapter 31: Threads and Message Passing

## Step 1 - The Problem

Concurrency begins with a basic tension: you want more than one unit of work to make progress, but the same memory cannot be used carelessly by all of them.

In C and C++, thread creation is easy and lifetime mistakes are easy too. A thread may outlive the stack frame it borrowed from. A pointer may still point somewhere that used to be valid. A shared queue may "work" in testing and then fail under scheduler timing you did not anticipate.

The failure mode is not abstract. This is what an unsafe shape looks like:

```c
void *worker(void *arg) {
    printf("%s\n", (char *)arg);
    return NULL;
}

int main(void) {
    pthread_t tid;
    char buf[32] = "hello";
    pthread_create(&tid, NULL, worker, buf);
    return 0; // buf's stack frame is gone, worker may still run
}
```

The bug is simple: the spawned thread was handed a pointer into a stack frame that can disappear before the thread reads it.

Message passing is a second version of the same problem. If two threads both believe they still own the same value after a send, you have either duplication of responsibility or unsynchronized sharing. Both lead to bugs.

## Step 2 - Rust's Design Decision

Rust makes two strong decisions here.

First, an unscoped thread must own what it uses. That is why `thread::spawn` requires a `'static` future or closure environment in practice: the new thread may outlive the current stack frame, so borrowed data from that frame is not acceptable.

Second, sending a value over a channel transfers ownership of that value. Rust refuses the design where a send is "just a copy of a reference unless you remember not to mutate it." That would reintroduce the same aliasing and lifetime problems under a more polite API.

Rust did accept some cost:

- You must think about `move`.
- You must understand why `'static` appears at thread boundaries.
- You often restructure code rather than keeping implicit borrowing.

Rust refused other costs:

- no tracing GC to keep borrowed values alive for threads
- no hidden runtime ownership scheme
- no "hope the race detector catches it later" model

## Step 3 - The Mental Model

Plain English rule: a spawned thread must either own the data it uses or borrow it from a scope that is guaranteed to outlive the thread.

For channels, the rule is just as simple: sending a value means handing off responsibility for that value.

If the compiler rejects your thread code, it is usually protecting one of two invariants:

- no thread may outlive the data it borrows
- no value may have ambiguous ownership after being handed across threads

## Step 4 - Minimal Code Example

```rust
use std::thread;

fn main() {
    let values = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("{values:?}");
    });

    handle.join().unwrap();
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

```rust
use std::thread;

fn main() {
    let values = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        println!("{values:?}");
    });

    handle.join().unwrap();
}
```

Line by line, the compiler sees this:

1. `values` is an owned `Vec<i32>` in `main`.
2. `move || { ... }` tells the compiler to capture `values` by value, not by reference.
3. Ownership of `values` moves into the closure environment.
4. `thread::spawn` takes ownership of that closure environment and may execute it after `main` continues.
5. Because the closure owns `values`, there is no dangling borrow risk.
6. `join()` waits for completion and returns a `Result`, because the thread may panic.

If you remove `move`, the closure tries to borrow `values` from `main`. Now the compiler must consider the possibility that the thread runs after `main` reaches the end of scope. That would mean a thread still holds a reference into dead stack data. Rust rejects that shape before the program exists.

You will typically see an error in the E0373 family for "closure may outlive the current function, but it borrows..." The exact wording varies slightly across compiler versions, but the design reason does not.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

`move` on a thread closure means "the new thread gets its own stuff." Without that, the new thread would be trying to borrow from the current function, which might finish too soon.

### Level 2 - Engineer

Use `thread::spawn` when the thread's lifetime is logically independent. Use `thread::scope` when the thread is just temporary parallel work inside a parent scope and should be allowed to borrow local data safely.

Channels are the idiomatic tool when ownership handoff is the design. Shared state behind locks is the tool when many threads must observe or update the same long-lived state.

### Level 3 - Systems

`thread::spawn` forces a strong boundary because the thread is scheduled independently by the OS. Rust cannot assume when it will run or when the parent stack frame will end. The `'static` requirement is not about "must live forever." It means "contains no borrow that could become invalid before the thread is done."

Message passing composes well with ownership because a send is a move. The type system can reason about exactly one owner before the send and exactly one owner after the send. That makes channel-based concurrency a natural extension of Rust's single-owner model.

## Scoped Threads

Sometimes a thread does not need to escape the current scope. In that case, requiring ownership of everything would be unnecessarily strict.

```rust
use std::thread;

fn main() {
    let mut values = vec![1, 2, 3, 4];

    thread::scope(|scope| {
        let (left, right) = values.split_at_mut(2);

        scope.spawn(move || left.iter_mut().for_each(|x| *x *= 2));
        scope.spawn(move || right.iter_mut().for_each(|x| *x *= 10));
    });

    assert_eq!(values, vec![2, 4, 30, 40]);
}
```

`thread::scope` changes the proof obligation. The compiler now knows every spawned thread must complete before the scope exits, so borrowing from local data is safe if the borrows are themselves non-overlapping and valid.

That is a very Rust design move: make the safe case explicit, then let the compiler exploit the stronger invariant.

## Channels and Backpressure

The standard library gives you `std::sync::mpsc`, which is adequate for many cases and great for understanding the model.

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        tx.send(String::from("ready")).unwrap();
    });

    let message = rx.recv().unwrap();
    assert_eq!(message, "ready");
}
```

The most important thing here is not the API. It is the ownership event:

- sender owns the `String`
- `send` moves the `String` into the channel
- receiver becomes the new owner when `recv` returns it

For high-throughput or more feature-rich cases, many production codebases use `crossbeam-channel` because it supports better performance characteristics and richer coordination patterns. The design lesson stays the same: moving messages is often cleaner than sharing data structures.

Bounded channels matter because they encode backpressure. If a producer can always enqueue without limit, memory becomes the pressure valve. That is usually the wrong valve.

## Step 7 - Common Misconceptions

> **Common Mistake**
> Thinking `move` "copies" captured values into a thread. It does not. It moves ownership unless the captured type is `Copy`.

Wrong model 1: "If I call `join()`, borrowing into `thread::spawn` should be fine."

Why it forms: humans read top to bottom and see the join immediately after spawn.

Why it is wrong: `thread::spawn` does not know, at the type level, that you will definitely join before the borrowed data dies. The API is intentionally conservative because the thread is fundamentally unscoped.

Correction: use `thread::scope` when borrowing is logically correct.

Wrong model 2: "`'static` means heap allocation."

Why it forms: many examples use `String`, `Arc`, or owned data.

Why it is wrong: `'static` is about the absence of non-static borrows, not where bytes live.

Correction: a moved `Vec<T>` satisfies a `thread::spawn` boundary without becoming immortal.

Wrong model 3: "Channels are for copying data around."

Why it forms: in other languages, channel sends often look like passing references around casually.

Why it is wrong: in Rust, the valuable property is ownership transfer.

Correction: think "handoff," not "shared mailbox with hidden aliases."

## Step 8 - Real-World Pattern

You will see two recurring shapes in real Rust repositories:

1. request or event ownership is moved into worker tasks or threads
2. bounded queues are used to express capacity limits, not just communication

Tokio-based servers, background workers, and data-pipeline code often use channels to decouple ingress from processing. The important design pattern is not the exact crate. It is that work units become owned values crossing concurrency boundaries.

CLI and search tools take the same approach. A parser thread may produce paths or work items, and worker threads consume them. That structure reduces lock contention and makes shutdown behavior easier to reason about.

## Step 9 - Practice Block

### Code Exercise

Write a program that:

- creates a bounded channel
- spawns two producers that each send five strings
- has one consumer print messages in receive order
- exits cleanly when both producers are done

### Code Reading Drill

Read this and explain who owns `job` at each step:

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel();
let tx2 = tx.clone();

thread::spawn(move || tx.send(String::from("a")).unwrap());
thread::spawn(move || tx2.send(String::from("b")).unwrap());

for job in rx {
    println!("{job}");
}
```

### Spot the Bug

What will the compiler object to here, and why?

```rust
use std::thread;

fn main() {
    let name = String::from("worker");
    let name_ref = &name;

    let handle = thread::spawn(|| {
        println!("{name_ref}");
    });

    handle.join().unwrap();
}
```

### Refactoring Drill

Take a design that shares `Arc<Mutex<Vec<Job>>>` across many worker threads and replace it with a channel-based design. Explain what got simpler and what got harder.

### Compiler Error Interpretation

If you see an error saying the closure may outlive the current function but borrows a local variable, translate it into plain English: "this thread boundary requires owned data, but I tried to smuggle a borrow through it."

## Step 10 - Contribution Connection

After this chapter, you can start reading:

- worker-pool code
- producer-consumer pipelines
- test helpers that use threads to simulate concurrent clients
- code that uses `thread::scope` for temporary parallelism

Approachable first PRs include:

- replace unbounded work queues with bounded ones where backpressure is needed
- convert awkward shared mutable state into message passing
- improve shutdown or join handling in threaded tests

## In Plain English

Threads are separate workers. Rust insists that each worker either owns its data or borrows it from a scope that is guaranteed to stay alive long enough. That matters to systems engineers because concurrency bugs are often timing bugs, and timing bugs are the most expensive class of bugs to debug after deployment.

## What Invariant Is Rust Protecting Here?

No thread may observe memory through a borrow that can become invalid before the thread finishes using it. For channels, ownership after a send must be unambiguous.

## If You Remember Only 3 Things

- `thread::spawn` is an ownership boundary, so `move` is usually the correct mental starting point.
- `thread::scope` exists because some threads are temporary parallel work, not detached lifetimes.
- Channels are most useful when you think of them as ownership handoff plus backpressure, not just communication syntax.

## Memory Hook

An unscoped thread is a courier leaving the building. If you hand it a borrowed office key instead of the actual package, you are assuming the office will still exist when the courier arrives.

## Flashcard Deck

| Question | Answer |
|---|---|
| Why does `thread::spawn` usually need `move`? | Because the spawned thread may outlive the current scope, so captured data must be owned rather than borrowed. |
| What does `'static` mean at a thread boundary? | The closure environment contains no borrow that could expire too early. |
| When should you prefer `thread::scope` over `thread::spawn`? | When child threads are temporary work that must finish before the current scope exits. |
| What happens to a value sent over a channel? | Ownership moves into the channel and then to the receiver. |
| Why are bounded channels important? | They encode backpressure and prevent the queue from turning memory into an unbounded shock absorber. |
| Why is a post-`spawn` `join()` not enough to justify borrowing into `thread::spawn`? | Because the API itself does not encode that promise; the compiler must type-check the thread boundary independently. |
| What kind of compiler error often appears when a thread closure borrows locals? | E0373-style "closure may outlive the current function" errors. |
| What is the design difference between message passing and shared mutable state? | Message passing transfers ownership of work units; shared mutable state requires synchronization around aliased data. |

## Chapter Cheat Sheet

| Need | Tool | Reason |
|---|---|---|
| Independent background thread | `thread::spawn(move || ...)` | Requires owned closure environment |
| Borrow local data in temporary parallel work | `thread::scope` | Scope proves child threads finish in time |
| Hand work items from producer to consumer | channel | Ownership transfer is explicit |
| Prevent unbounded producer growth | bounded channel | Backpressure is part of the design |
| Wait for a spawned thread | `JoinHandle::join()` | Surfaces panic as `Result` |

---

# Chapter 32: Shared State, Arc, Mutex, and Send/Sync

## Step 1 - The Problem

Message passing is not enough for every design. Sometimes many threads need access to the same state:

- a cache
- a metrics registry
- a connection pool
- shared configuration or shutdown state

The classic failure mode is shared mutable access without synchronization. In C or C++, two threads incrementing the same counter through plain pointers create a data race. That is undefined behavior, not merely "a wrong answer sometimes."

Even when you add locks manually, another problem remains: how do you encode, in types, which values are safe to move across threads and which are safe to share by reference across threads?

## Step 2 - Rust's Design Decision

Rust splits the problem in two.

1. Ownership and borrowing still determine who can access a value.
2. Auto traits determine whether a type may cross or be shared across thread boundaries.

Those auto traits are `Send` and `Sync`.

- `Send`: ownership of this type may move to another thread
- `Sync`: a shared reference to this type may be used from another thread

For shared mutable state, Rust does not permit "many aliases, everyone mutate if careful." It requires a synchronization primitive whose API itself enforces access discipline. That is why `Mutex<T>` gives you a guard, not a raw pointer.

## Step 3 - The Mental Model

Plain English rule: if multiple threads need the same data, separate the question of ownership from the question of access.

- `Arc<T>` answers ownership: many owners
- `Mutex<T>` answers access: one mutable accessor at a time
- `RwLock<T>` answers access differently: many readers or one writer

And underneath all of it:

- `Send` decides whether a value may move to another thread
- `Sync` decides whether `&T` may be shared across threads

## Step 4 - Minimal Code Example

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = Vec::new();

    for _ in 0..4 {
        let counter = Arc::clone(&counter);
        handles.push(thread::spawn(move || {
            let mut guard = counter.lock().unwrap();
            *guard += 1;
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }

    assert_eq!(*counter.lock().unwrap(), 4);
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `Arc::new(...)` creates shared ownership with atomic reference counting.
2. `Mutex::new(0)` wraps the integer in a synchronization primitive.
3. `Arc::clone(&counter)` increments the atomic refcount; it does not clone the protected `i32`.
4. `thread::spawn(move || { ... })` moves one `Arc<Mutex<i32>>` handle into each thread.
5. `counter.lock()` acquires the mutex and returns `MutexGuard<i32>`.
6. Dereferencing the guard gives mutable access to the inner `i32`.
7. When the guard goes out of scope, `Drop` unlocks the mutex automatically.

The invariant being checked is subtle but strong:

- many threads may own handles to the same shared object
- only the lock guard grants mutable access
- unlocking is tied to scope exit through RAII

If you tried the same shape with `Rc<RefCell<i32>>`, `thread::spawn` would reject it because `Rc<T>` is not `Send`, and `RefCell<T>` is not `Sync`. That is not a missing convenience. It is the type system telling you those primitives were built for single-threaded aliasing, not cross-thread sharing.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

`Arc` lets many threads own the same value. `Mutex` makes sure only one thread changes it at a time. The lock guard is like a temporary permission slip.

### Level 2 - Engineer

The common pattern is `Arc<Mutex<T>>` or `Arc<RwLock<T>>`, but mature Rust code treats that as a tool, not a default.

Use it when state is truly shared and long-lived. Do not use it as a reflex to silence the borrow checker. Many designs become simpler if you isolate ownership and send messages to a single state-owning task instead.

### Level 3 - Systems

`Send` and `Sync` are `unsafe` auto traits. The compiler derives them structurally for safe code, but incorrect manual implementations can create undefined behavior. `Rc<T>` is `!Send` because non-atomic refcount updates would race. `Cell<T>` and `RefCell<T>` are `!Sync` because shared references to them do not provide thread-safe mutation discipline.

`Arc<Mutex<T>>` works because the components line up:

- `Arc` provides thread-safe shared ownership
- `Mutex` provides exclusive interior access
- `T` is then accessed under a synchronization contract rather than raw aliasing

## `Send` and `Sync` Precisely

| Trait | Precise meaning | Typical implication |
|---|---|---|
| `Send` | A value of this type can be moved to another thread safely | `thread::spawn` and `tokio::spawn` often require it |
| `Sync` | `&T` can be shared between threads safely | Many shared references across threads require it |

A useful equivalence to remember:

`T` is `Sync` if and only if `&T` is `Send`.

That sentence is dense, but it reveals Rust's model: thread sharing is analyzed in terms of what references may do.

## `RwLock` and Atomics

`RwLock<T>` is a better fit when reads are common, writes are rare, and the read critical sections are meaningful.

```rust
use std::sync::{Arc, RwLock};

let state = Arc::new(RwLock::new(String::from("ready")));
let read_guard = state.read().unwrap();
assert_eq!(&*read_guard, "ready");
```

Atomics are a better fit when the shared state is a small primitive with simple lock-free updates and carefully chosen memory ordering.

```rust
use std::sync::atomic::{AtomicUsize, Ordering};

let counter = AtomicUsize::new(0);
counter.fetch_add(1, Ordering::Relaxed);
```

Do not read this as "atomics are faster, so prefer them." The right mental model is:

- `Mutex<T>` for compound state and easy invariants
- atomics for narrow state transitions you can reason about precisely

## Deadlock and Lock Design

Rust prevents data races. It does not prevent deadlocks.

That distinction matters. A program can be memory-safe and still stall forever because two threads wait on each other.

The practical rules are old but still essential:

- keep lock scopes short
- avoid holding one lock while acquiring another
- define a lock acquisition order if multiple locks are necessary
- prefer moving work outside the critical section

> **Design Insight**
> Rust eliminates unsynchronized mutation bugs, not bad concurrency architecture. You still need engineering judgment.

## Step 7 - Common Misconceptions

Wrong model 1: "`Arc` makes mutation thread-safe."

Why it forms: `Arc` is the cross-thread version of `Rc`, so people assume it solves all cross-thread problems.

Correction: `Arc` only solves shared ownership. It does nothing by itself about safe mutation.

Wrong model 2: "`Mutex` is a Rust replacement for borrowing."

Why it forms: beginners often add a mutex when the borrow checker blocks them.

Correction: a mutex is a synchronization design choice, not a borrow-checker escape hatch.

Wrong model 3: "If it compiles, deadlock cannot happen."

Why it forms: Rust's safety guarantees feel broad.

Correction: Rust prevents data races, not logical waiting cycles.

Wrong model 4: "`RwLock` is always better for read-heavy workloads."

Why it forms: more readers sounds automatically better.

Correction: `RwLock` has overhead, writer starvation tradeoffs, and can perform worse under real contention patterns.

## Step 8 - Real-World Pattern

You will see `Arc<AppState>` in web services, often with inner members like pools, caches, or configuration handles. The best versions of those designs avoid wrapping the entire application state in one giant `Mutex`. Instead, they use:

- immutable shared state where possible
- fine-grained synchronization where necessary
- owned messages to serialize stateful work

That pattern appears across async web services, observability pipelines, and long-running daemons. Mature code keeps the synchronized portion small and explicit.

## Step 9 - Practice Block

### Code Exercise

Build a small in-memory metrics registry with:

- `Arc<RwLock<HashMap<String, u64>>>`
- a writer thread that increments counters
- two reader threads that snapshot the map periodically

Then explain whether a channel-based design would be simpler.

### Code Reading Drill

What is being cloned here, and what is not?

```rust
use std::sync::{Arc, Mutex};

let state = Arc::new(Mutex::new(vec![1, 2, 3]));
let state2 = Arc::clone(&state);
```

### Spot the Bug

What would go wrong conceptually if this compiled?

```rust
use std::cell::RefCell;
use std::rc::Rc;
use std::thread;

let data = Rc::new(RefCell::new(0));
thread::spawn(move || {
    *data.borrow_mut() += 1;
});
```

### Refactoring Drill

Take a design that uses one `Arc<Mutex<AppState>>` containing twenty unrelated fields. Split it into a cleaner design and justify the new boundaries.

### Compiler Error Interpretation

If the compiler says `Rc<...>` cannot be sent between threads safely, translate that as: "this type's internal mutation discipline is not thread-safe, so the thread boundary is closed to it."

## Step 10 - Contribution Connection

After this chapter, you can read and modify:

- shared service state initialization
- lock-guarded caches
- metrics counters and registries
- thread-safe wrappers around non-thread-safe internals

Beginner-safe PRs include:

- shrinking oversized lock scopes
- replacing `Arc<Mutex<T>>` with immutable sharing where mutation is not needed
- documenting `Send` and `Sync` expectations on public types

## In Plain English

Sometimes many workers need access to the same thing. Rust separates "who owns it" from "who may touch it right now." That matters to systems engineers because shared state is where performance, correctness, and operational bugs collide.

## What Invariant Is Rust Protecting Here?

Shared access across threads must never create unsynchronized mutation or unsound aliasing. If a type crosses a thread boundary, its internal behavior must make that safe.

## If You Remember Only 3 Things

- `Arc` solves shared ownership, not shared mutation.
- `Send` and `Sync` are the thread-safety gates the compiler uses to police concurrency boundaries.
- `Arc<Mutex<T>>` is useful, but a design built entirely from it is often signaling missing ownership structure.

## Memory Hook

`Arc` is the shared building deed. `Mutex` is the single key to the control room. Owning the building does not mean everyone gets to turn knobs at once.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does `Send` mean? | A value of the type can be moved to another thread safely. |
| What does `Sync` mean? | A shared reference `&T` can be used from another thread safely. |
| Why is `Rc<T>` not `Send`? | Its reference count is updated non-atomically, so cross-thread cloning or dropping would race. |
| Why is `RefCell<T>` not `Sync`? | Its runtime borrow checks are not thread-safe synchronization. |
| What does `Arc::clone` clone? | The pointer and atomic refcount participation, not the underlying protected value. |
| What unlocks a `Mutex` in idiomatic Rust? | Dropping the `MutexGuard`, usually at scope end. |
| Does Rust prevent deadlock? | No. Rust prevents data races, not waiting cycles. |
| When should you consider atomics instead of a mutex? | When the shared state is a narrow primitive transition you can reason about with memory ordering semantics. |

## Chapter Cheat Sheet

| Situation | Preferred tool | Reason |
|---|---|---|
| Shared ownership, no mutation | `Arc<T>` | Cheap clone of ownership handle |
| Shared mutable compound state | `Arc<Mutex<T>>` | Exclusive access with simple invariants |
| Read-heavy shared state | `Arc<RwLock<T>>` | Many readers, one writer |
| Single integer or flag with simple updates | atomics | No lock, explicit memory ordering |
| Single-threaded shared ownership | `Rc<T>` | Cheaper than `Arc`, but not thread-safe |

---

# Chapter 33: Async/Await and Futures

## Step 1 - The Problem

Threads are powerful, but they are an expensive unit for waiting on I/O.

A web server that handles ten thousand mostly-idle connections does not want ten thousand blocked OS threads if it can avoid it. Each thread carries stack memory, scheduler cost, and coordination overhead. The problem is not that threads are bad. The problem is that "waiting" is too expensive when the unit of waiting is an OS thread.

Other ecosystems solve this by using:

- event loops and callbacks
- green threads managed by a runtime
- goroutines plus a scheduler

Those work, but they often hide memory, scheduling, or cancellation costs behind a runtime or garbage collector.

## Step 2 - Rust's Design Decision

Rust chose a different model:

- `async fn` compiles into a state machine
- that state machine implements `Future`
- an executor polls the future when it can make progress
- there is no built-in runtime in the language

This design keeps async as a library-level ecosystem choice rather than a hard-coded runtime commitment.

Rust accepted:

- steeper learning curve
- explicit runtime choice
- `Send` and pinning complexity at task boundaries

Rust refused:

- mandatory GC
- hidden heap traffic as the price of async
- a single scheduler model forced on CLI, server, embedded, and desktop code alike

## Step 3 - The Mental Model

Plain English rule: calling an `async fn` creates a future, but it does not run the body to completion right away.

A future is a paused computation that can be resumed later by polling.

The key reframe is this:

- threads are scheduled by the OS
- futures are scheduled cooperatively by an executor

## Step 4 - Minimal Code Example

```rust
async fn answer() -> u32 {
    42
}

fn main() {
    let future = answer();
    drop(future);
}
```

This program does not print anything and does not evaluate the `42` in a useful way. The point is structural: calling `answer()` builds a future value. Nothing drives it.

## Step 5 - Line-by-Line Compiler Walkthrough

Take this version:

```rust
async fn load() -> String {
    String::from("done")
}

#[tokio::main]
async fn main() {
    let result = load().await;
    println!("{result}");
}
```

What the compiler sees conceptually:

1. `load()` is transformed into a type that implements `Future<Output = String>`.
2. The body becomes states in that generated future.
3. `#[tokio::main]` creates a runtime and enters it.
4. `load().await` polls the future until it yields `Poll::Ready(String)`.
5. `println!` runs with the produced value.

What `.await` means is often misunderstood. It does not "spawn a thread and wait." It asks the current async task to suspend until the future is ready, allowing the executor to run something else in the meantime.

The central invariant is:

the executor may pause and resume the computation at each `.await`, but the future's internal state must remain valid across those pauses.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

An async function gives you a task-shaped value. `.await` is how you ask Rust to keep checking that task until it finishes.

### Level 2 - Engineer

Use async when the workload is dominated by waiting on I/O: sockets, files, timers, database round-trips, RPC calls. Do not use async because it feels modern. CPU-bound work inside async code still consumes executor time and may need `spawn_blocking` or dedicated threads.

Tokio dominates server-side Rust because it provides:

- runtime
- reactor for I/O readiness
- scheduler
- channels and synchronization primitives
- timers

### Level 3 - Systems

The `Future` trait is a polling interface:

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

trait DemoFuture {
    type Output;
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}
```

`Poll::Pending` means "not ready yet, but I have registered how to wake me." That wakeup path is how the runtime avoids busy-waiting.

Rust async is zero-cost in the sense that the state machine is concrete and optimizable. But that does not mean "free." Futures still have size, allocation strategies still matter, and scheduler behavior still matters. Zero-cost means the abstraction does not force extra indirection beyond what the semantics require.

## Executors, `tokio::spawn`, and `join!`

`tokio::spawn` schedules a future onto the runtime and returns a `JoinHandle`.

```rust
use tokio::task;

async fn work(id: u32) -> u32 {
    id * 2
}

#[tokio::main]
async fn main() {
    let a = task::spawn(work(10));
    let b = task::spawn(work(20));

    let result = a.await.unwrap() + b.await.unwrap();
    assert_eq!(result, 60);
}
```

Why the `Send + 'static` requirement often appears:

- the runtime may move tasks between worker threads
- the task may outlive the current stack frame

That is the same ownership story from threads, now expressed in async form.

`join!` is different:

```rust
let (a, b) = tokio::join!(work(10), work(20));
```

`join!` runs futures concurrently within the current task and waits for all of them. It does not create detached background tasks. This distinction matters in real code because it changes:

- cancellation behavior
- task ownership
- error handling shape
- `Send` requirements

## Step 7 - Common Misconceptions

Wrong model 1: "Calling an async function starts it immediately."

Correction: it constructs a future. Progress begins only when something polls it.

Wrong model 2: "Async makes code faster."

Correction: async makes waiting cheaper. CPU-heavy work is not magically accelerated.

Wrong model 3: "`.await` blocks like a thread join."

Correction: `.await` yields cooperatively so the executor can schedule other tasks.

Wrong model 4: "Tokio is Rust async."

Correction: Tokio is the dominant runtime, not the language feature itself.

## Step 8 - Real-World Pattern

Serious async Rust repositories usually separate:

- protocol parsing
- application logic
- background tasks
- shutdown and cancellation paths

In an `axum` or `hyper` service, request handlers are async because socket and database operations are mostly waiting. In `tokio`, spawned background tasks often own their state and communicate via channels. In observability stacks, async pipelines decouple ingestion from export with bounded buffers and backpressure.

That is the pattern to notice: async is most powerful when paired with explicit ownership boundaries and capacity boundaries.

## Step 9 - Practice Block

### Code Exercise

Write a Tokio program that:

- concurrently fetches two simulated values with `tokio::time::sleep`
- uses `join!` to wait for both
- logs total elapsed time

Then rewrite it with sequential `.await` and explain the difference.

### Code Reading Drill

What is concurrent here and what is not?

```rust
let a = fetch_user().await;
let b = fetch_orders().await;
```

What changes here?

```rust
let (a, b) = tokio::join!(fetch_user(), fetch_orders());
```

### Spot the Bug

Why is this likely a bad design in a server?

```rust
async fn handler() {
    let mut total = 0u64;
    for i in 0..50_000_000 {
        total += i;
    }
    println!("{total}");
}
```

### Refactoring Drill

Take a callback-style network flow from another language you know and redesign it as futures plus `join!` or spawned tasks. Explain where ownership lives.

### Compiler Error Interpretation

If `tokio::spawn` complains that a future is not `Send`, translate it as: "some state captured by this task cannot safely move between runtime worker threads."

## Step 10 - Contribution Connection

After this chapter, you can start reading:

- async handlers in web frameworks
- background worker loops
- retry or timeout wrappers around network calls
- task spawning and task coordination code

Approachable PRs include:

- replacing accidental sequential awaits with `join!`
- moving CPU-heavy work off the async executor
- clarifying task ownership and shutdown behavior in async tests

## In Plain English

Async is Rust's way of letting one thread juggle many waiting jobs without creating a new thread for each one. That matters to systems engineers because servers spend most of their time waiting on networks and disks, and waiting is exactly where wasted threads become wasted capacity.

## What Invariant Is Rust Protecting Here?

A future's state must remain valid across suspension points, and task boundaries must not capture data that can become invalid or unsafely shared.

## If You Remember Only 3 Things

- An `async fn` call returns a future; it does not run to completion by itself.
- `.await` is a cooperative suspension point, not an OS-thread block.
- `join!` means "run together and wait for all," while `tokio::spawn` means "hand this task to the runtime."

## Memory Hook

An async task is a folded travel itinerary in your pocket. It is the whole trip, but you only unfold the next section when the train arrives.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does calling an `async fn` produce? | A future value representing suspended work. |
| What does `.await` do conceptually? | Polls a future until ready, yielding control cooperatively when it is pending. |
| What problem does async primarily solve? | Making I/O waiting cheaper than dedicating one OS thread per waiting operation. |
| Why does Rust have external runtimes instead of one built-in runtime? | Different domains need different scheduling and runtime tradeoffs, and Rust avoids forcing one global model. |
| What does `tokio::spawn` usually require? | A future that is `Send + 'static`. |
| What is the difference between `join!` and `tokio::spawn`? | `join!` runs futures concurrently in the current task; `spawn` schedules a separate task on the runtime. |
| Does async help CPU-bound work by itself? | No. It helps waiting-heavy work, not raw computation. |
| What does `Poll::Pending` imply besides "not ready"? | The future has arranged to be woken when progress is possible. |

## Chapter Cheat Sheet

| Need | Tool | Why |
|---|---|---|
| Wait for one async operation | `.await` | Cooperative suspension |
| Run several futures and wait for all | `join!` | No detached background task needed |
| Start a background task | `tokio::spawn` | Runtime-managed task |
| Run blocking CPU or sync I/O | `spawn_blocking` or threads | Protect the executor from starvation |
| Add timers | `tokio::time` | Runtime-aware sleeping and intervals |

---

# Chapter 34: `select!`, Cancellation, and Timeouts

## Step 1 - The Problem

Real systems rarely wait on one thing at a time. They need to react to whichever event happens first:

- an inbound message
- a timeout
- a shutdown signal
- completion of one among several tasks

If you cannot race those events cleanly, you either block too long or build brittle coordination code. But racing futures introduces a new danger: what happens to the losers?

In callback-heavy environments, it is common to forget cleanup paths or to accidentally continue two branches of work after only one should win. In async Rust, the failure mode usually appears as cancellation bugs: partial work, lost buffered data, or dropped locks.

## Step 2 - Rust's Design Decision

Rust and Tokio make cancellation explicit through `Drop`.

When `select!` chooses one branch, the futures in the losing branches are dropped unless you structured the code to keep them around. This is a clean model because it reuses the existing resource cleanup story, but it means cancellation safety becomes a real design concern.

Rust accepted:

- you must understand dropping as cancellation
- you must reason about partial progress inside futures

Rust refused:

- hidden task abortion semantics
- implicit rollback magic for partially completed work

## Step 3 - The Mental Model

Plain English rule: `select!` waits on several futures and runs the branch for the one that becomes ready first. Every losing branch is cancelled by being dropped.

That means you must ask one question for every branch:

If this future is dropped right here, is the system still correct?

## Step 4 - Minimal Code Example

```rust
use tokio::sync::mpsc;
use tokio::time::{self, Duration};

async fn recv_or_timeout(mut rx: mpsc::Receiver<String>) {
    tokio::select! {
        Some(msg) = rx.recv() => println!("got {msg}"),
        _ = time::sleep(Duration::from_secs(5)) => println!("timed out"),
    }
}
```

## Step 5 - Line-by-Line Compiler Walkthrough

1. `rx.recv()` creates a future that will resolve when a message is available or the channel closes.
2. `time::sleep(...)` creates a timer future.
3. `tokio::select!` polls both futures.
4. When one becomes ready, the corresponding branch runs.
5. The other future is dropped.

Why this is safe in the example:

- `recv()` is cancellation-safe in the sense that dropping the receive future does not consume a message and lose it silently
- dropping `sleep` simply abandons the timer

Now imagine a future that incrementally fills an internal buffer before returning a complete frame. If it is dropped mid-way and the buffered bytes are not preserved elsewhere, cancellation may discard meaningful progress. That is a correctness problem, not a type error.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

`select!` is a race. The first ready thing wins. The others stop.

### Level 2 - Engineer

Use `select!` for event loops, shutdown handling, heartbeats, and timeouts. But audit each branch for cancellation safety.

Futures tied directly to queue receives, socket accepts, or timer ticks are often cancellation-safe. Futures doing multipart writes, custom buffering, or lock-heavy workflows often need more care.

### Level 3 - Systems

Cancellation in Rust async is not a separate runtime feature bolted on later. It is a consequence of ownership. A future owns its in-progress state. Dropping the future destroys that state. Therefore, cancellation safety is really a statement about whether destroying in-progress state at a suspension point preserves system invariants.

This is why careful async code often separates:

- state machine progress
- externally committed side effects
- retry boundaries

## Timeouts and Graceful Shutdown

Timeouts are just another race:

```rust
use tokio::time::{timeout, Duration};

async fn run_with_timeout() {
    match timeout(Duration::from_secs(2), slow_operation()).await {
        Ok(value) => println!("completed: {value:?}"),
        Err(_) => println!("timed out"),
    }
}

async fn slow_operation() -> &'static str {
    tokio::time::sleep(Duration::from_secs(10)).await;
    "done"
}
```

Graceful shutdown often looks like this:

```rust
use tokio::sync::watch;

async fn worker(mut shutdown: watch::Receiver<bool>) {
    loop {
        tokio::select! {
            _ = shutdown.changed() => {
                if *shutdown.borrow() {
                    break;
                }
            }
            _ = do_one_unit_of_work() => {}
        }
    }
}

async fn do_one_unit_of_work() {
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;
}
```

That pattern appears constantly in services: do work until a shutdown signal wins the race.

## Step 7 - Common Misconceptions

Wrong model 1: "`select!` is just like `match` for async."

Correction: `match` inspects a value you already have. `select!` coordinates live concurrent futures and drops losers.

Wrong model 2: "If a branch loses, it pauses and resumes later."

Correction: not unless you explicitly keep the future alive somewhere. Normally it is dropped.

Wrong model 3: "Timeouts are harmless wrappers."

Correction: a timeout is cancellation. If the wrapped future is not cancellation-safe, timing out may leave inconsistent in-progress state.

Wrong model 4: "Safe Rust means cancellation-safe code."

Correction: memory safety and logical protocol safety are different properties.

## Step 8 - Real-World Pattern

Production async services use `select!` for:

- request stream plus shutdown signal
- message receive plus periodic flush timer
- heartbeat plus inbound command
- completion of one task versus timeout of another

Tokio-based services also rely on bounded channels and `select!` together: queue receive is one branch, shutdown is another, and timer-driven maintenance is a third. Once you see that shape, large async codebases become far easier to navigate.

## Step 9 - Practice Block

### Code Exercise

Write an async worker that:

- receives jobs from a channel
- emits a heartbeat every second
- exits on shutdown

Use `tokio::select!` and explain what gets dropped on each branch win.

### Code Reading Drill

Explain the cancellation behavior here:

```rust
tokio::select! {
    value = fetch_config() => value,
    _ = tokio::time::sleep(Duration::from_secs(1)) => default_config(),
}
```

### Spot the Bug

Why can this be dangerous?

```rust
tokio::select! {
    _ = write_whole_response(&mut socket, &buffer) => {}
    _ = shutdown.changed() => {}
}
```

Hint: think about what happens if the write future is dropped halfway through.

### Refactoring Drill

Take a loop that does `recv().await`, then separately checks for shutdown, then separately sleeps. Refactor it into one `select!` loop and justify the behavioral change.

### Compiler Error Interpretation

If a `select!` branch complains about needing a pinned future, translate that as: "this future may be polled multiple times from the same storage location, so it cannot be moved casually between polls."

## Step 10 - Contribution Connection

After this chapter, you can read and improve:

- graceful shutdown loops
- retry plus timeout wrappers
- periodic maintenance tasks
- queue-processing loops with heartbeats or flush timers

Good first PRs include:

- documenting cancellation assumptions
- fixing timeout handling around non-cancellation-safe operations
- restructuring event loops to make shutdown behavior explicit

## In Plain English

Sometimes a program must react to whichever thing happens first. Rust lets you race those possibilities, but it makes you deal honestly with the loser paths. That matters to systems engineers because the hard bugs are often not "which path won" but "what state was left behind when the other path lost."

## What Invariant Is Rust Protecting Here?

Dropping a future must not violate protocol correctness or lose essential state silently. Cancellation must preserve the program's externally meaningful invariants.

## If You Remember Only 3 Things

- `select!` is a race, and losing branches are normally dropped.
- Cancellation safety is about whether dropping in-progress work preserves correctness.
- Timeouts are not neutral wrappers; they are cancellation boundaries.

## Memory Hook

`select!` is a race marshal firing the starter pistol. One runner breaks the tape. The others do not pause on the track. They leave the race.

## Flashcard Deck

| Question | Answer |
|---|---|
| What happens to losing futures in `tokio::select!`? | They are dropped unless explicitly preserved elsewhere. |
| Why is timeout behavior really cancellation behavior? | Because timing out works by dropping the in-progress future. |
| What does cancellation-safe mean? | Dropping the future at a suspension point does not violate correctness or silently lose essential state. |
| Why is `rx.recv()` commonly considered cancellation-safe? | Dropping the receive future does not consume and discard a message that was not returned. |
| Why can write operations be tricky under `select!`? | Partial progress may already have happened when the future is dropped. |
| What common service pattern uses `select!`? | Work loop plus shutdown signal plus timer tick. |
| Does Rust's memory safety guarantee imply cancellation safety? | No. They protect different invariants. |
| What question should you ask for every `select!` branch? | "If this future is dropped right here, is the system still correct?" |

## Chapter Cheat Sheet

| Need | Tool | Warning |
|---|---|---|
| Wait for whichever event happens first | `tokio::select!` | Losing futures are dropped |
| Add a hard time limit | `tokio::time::timeout` | Timeout implies cancellation |
| Graceful shutdown | shutdown channel plus `select!` | Make exit path explicit |
| Periodic maintenance | `interval.tick()` branch | Know whether missed ticks matter |
| Queue work plus heartbeat | `recv()` plus timer in `select!` | Audit both branches for cancellation safety |

---

# Chapter 35: Pin and Why Async Is Hard

## Step 1 - The Problem

Some values are fine to move around in memory. Others become invalid if moved after internal references have been created.

This is the self-referential problem. A simple version in many languages looks like "store a pointer to one of your own fields." If the struct later moves, that pointer becomes stale.

Async Rust encounters this problem because the compiler-generated future for an `async fn` may contain references into its own internal state across suspension points.

Without a rule here, polling a future, moving it, and polling again could produce a dangling reference inside safe code. That is unacceptable.

## Step 2 - Rust's Design Decision

Rust introduced `Pin<P>` and `Unpin`.

- `Pin<P>` says the pointee will not be moved through this pinned access path
- `Unpin` says moving the value even after pinning is still harmless for this type

Rust accepted:

- a harder mental model
- explicit pinning APIs
- more advanced error messages when custom futures or streams are involved

Rust refused:

- hidden runtime object relocation rules
- GC-based fixing of internal references
- making all async values heap-allocated by default just to avoid movement concerns

## Step 3 - The Mental Model

Plain English rule: pinning means "this value must stay at a stable memory location while code relies on that stability."

Important refinement: pinning is about the value, not about the pointer variable that refers to it.

If a type is `Unpin`, pinning is mostly a formality. If a type is `!Unpin`, moving it after pinning would break its invariants.

## Step 4 - Minimal Code Example

```rust
use std::future::Future;
use std::pin::Pin;

fn make_future() -> Pin<Box<dyn Future<Output = u32>>> {
    Box::pin(async { 42 })
}
```

This is not the whole theory of pinning, but it is the most common practical encounter: a future is heap-allocated and pinned so it can be polled safely from a stable location.

## Step 5 - Line-by-Line Compiler Walkthrough

1. `async { 42 }` creates an anonymous future type.
2. `Box::pin(...)` allocates that future and returns `Pin<Box<...>>`.
3. The heap allocation gives the future a stable storage location.
4. The `Pin` wrapper expresses that the pointee must not move out of that location through safe access.

Why this matters for async:

polling a future may cause it to store references between its internal states. The next poll assumes those references still point to the same memory. Pinning is the mechanism that makes that assumption legal.

## Step 6 - Three-Level Explanation

### Level 1 - Beginner

Some async values need to stay put in memory once execution has started. `Pin` is the type-system tool for saying "do not move this after this point."

### Level 2 - Engineer

In ordinary application code, you mostly see pinning through:

- `Box::pin`
- `tokio::pin!`
- APIs taking `Pin<&mut T>`
- crates like `pin-project` or `pin-project-lite` to safely project pinned fields

If a compiler error mentions pinning, it usually means a future or stream is being polled through an API that requires stable storage.

### Level 3 - Systems

Pinning is subtle because Rust normally allows moves freely. A move is usually just a bitwise relocation of a value to a new storage slot. For self-referential state, that is unsound.

`Pin<P>` does not make arbitrary unsafe code safe by magic. It participates in a larger contract:

- safe code must not move a pinned `!Unpin` value through the pinned handle
- unsafe code implementing projection or custom futures must preserve that guarantee

That is why libraries like Tokio use `pin-project-lite` internally. Field projection of pinned structs is delicate. You cannot just grab a `&mut` to a structurally pinned field and move on.

## Why Async Rust Feels Harder Than JavaScript or Go

This is not accidental. Rust exposes complexity that those languages hide behind different runtime tradeoffs.

JavaScript hides many lifetime and movement issues behind GC and a single-threaded event-loop model.

Go hides much of the scheduling and stack management behind goroutines and a runtime that can grow and move stacks.

Rust refuses both tradeoffs. So you must reason about:

- which tasks may move between threads
- which futures are `Send`
- when cancellation drops in-progress state
- when pinning is required
- when holding a lock across `.await` can stall other work

That is harder. It is also why well-written async Rust can be both predictable and efficient.

## `tokio::pin!` and `pin-project`

Pinned stack storage often looks like this:

```rust
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    let task = sleep(Duration::from_millis(10));
    tokio::pin!(task);

    (&mut task).await;
}
```

And pinned field projection in libraries often uses a helper macro crate:

- `pin-project`
- `pin-project-lite`

Those crates exist because manually projecting pinned fields is easy to get wrong in unsafe code.

## Step 7 - Common Misconceptions

Wrong model 1: "`Pin` means the pointer itself cannot move."

Correction: pinning is about the pointee's location and the promise not to move that value through the pinned access path.

Wrong model 2: "All futures are self-referential."

Correction: not all futures need pinning for the same reasons, and many are `Unpin`. The abstraction exists because some futures are not.

Wrong model 3: "`Pin` is only for heap allocation."

Correction: stack pinning exists too, for example with `tokio::pin!`.

Wrong model 4: "If I use `Box::pin`, I understand pinning."

Correction: you may understand the common application pattern without yet understanding the deeper contract. Those are different levels of mastery.

## Step 8 - Real-World Pattern

You will encounter pinning in:

- manual future combinators
- stream processing
- `select!` over reused futures
- library internals using projection macros
- executor and channel implementations

Tokio and related ecosystem crates use projection helpers specifically because `Pin` is not ornamental. It is part of the soundness boundary of async abstractions.

## Step 9 - Practice Block

### Code Exercise

Create a function that returns `Pin<Box<dyn Future<Output = String> + Send>>`, then use it inside a Tokio task and explain why pinning was convenient.

### Code Reading Drill

Explain what is pinned here and why:

```rust
let sleep = tokio::time::sleep(Duration::from_secs(1));
tokio::pin!(sleep);
```

### Spot the Bug

Why is a self-referential struct like this dangerous without special handling?

```rust
struct Bad<'a> {
    data: String,
    slice: &'a str,
}
```

### Refactoring Drill

Take code that recreates a timer future each loop iteration and redesign it so the same pinned future is reused where appropriate.

### Compiler Error Interpretation

If the compiler says a future cannot be unpinned or must be pinned before polling, translate that as: "this value's correctness depends on staying at a stable address while it is being driven."

## Step 10 - Contribution Connection

After this chapter, you can read:

- async combinator code
- custom stream and future implementations
- library code using `pin-project-lite`
- `select!` loops that pin a future once and poll it repeatedly

Approachable PRs include:

- replacing ad hoc pinning with clearer helper macros
- documenting why a type is `!Unpin`
- simplifying APIs that unnecessarily expose pinning to callers

## In Plain English

Some values can be moved around safely. Others break if they move after work has already started. `Pin` is Rust's way of saying "this must stay put now." That matters to systems engineers because async code is really a collection of paused state machines, and paused state machines still need their memory layout to make sense when resumed.

## What Invariant Is Rust Protecting Here?

A pinned `!Unpin` value must not be moved in a way that invalidates self-references or other address-sensitive internal state.

## If You Remember Only 3 Things

- `Pin` exists because some futures become address-sensitive across suspension points.
- `Box::pin` and `tokio::pin!` are the common practical tools; `pin-project` exists for safe field projection.
- Async Rust is harder partly because Rust refuses to hide movement, lifetime, and scheduling costs behind a GC or mandatory runtime.

## Memory Hook

Think of a future as wet concrete poured into a mold. Before it sets, you can move the mold. After internal supports are in place, moving it cracks the structure. Pinning says: leave it where it is.

## Flashcard Deck

| Question | Answer |
|---|---|
| What does `Pin` protect? | The stable location of a value whose correctness depends on not being moved. |
| What does `Unpin` mean? | The type can still be moved safely even when accessed through pinning APIs. |
| Why do some async futures need pinning? | Because compiler-generated state machines may contain address-sensitive state across `.await` points. |
| What is the common heap-based pinning tool? | `Box::pin`. |
| What is the common stack-based pinning tool in Tokio code? | `tokio::pin!`. |
| Why do crates use `pin-project` or `pin-project-lite`? | To safely project fields of pinned structs without violating pinning guarantees. |
| Does `Pin` itself allocate memory? | No. It expresses a movement guarantee; allocation is a separate concern. |
| Why is async Rust harder than JavaScript or Go? | Rust exposes task movement, pinning, ownership, and cancellation tradeoffs that those ecosystems hide behind stronger runtimes or GC. |

## Chapter Cheat Sheet

| Situation | Tool | Why |
|---|---|---|
| Return a heap-pinned future | `Pin<Box<dyn Future<...>>>` | Stable storage plus erased type |
| Reuse one future in `select!` | `tokio::pin!` | Keep it at a stable stack location |
| Implement pinned field access safely | `pin-project` or `pin-project-lite` | Avoid unsound manual projection |
| Future polling API takes `Pin<&mut T>` | honor the contract | The future may be address-sensitive |
| Debugging pin errors | ask "what value must stay put?" | Usually reveals the invariant quickly |

---

## Part 5 Summary

Rust concurrency is one coherent system:

- threads require ownership or proven scoped borrowing
- shared state requires explicit synchronization and thread-safety auto traits
- async uses futures and executors to make waiting cheap
- `select!` turns dropping into cancellation
- pinning protects address-sensitive state in async machinery

If you hold that model firmly, the APIs stop feeling like unrelated complexity and start looking like one design expressed at different concurrency boundaries.
