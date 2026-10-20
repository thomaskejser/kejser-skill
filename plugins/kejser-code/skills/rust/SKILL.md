---
name: rust
description: Thomas's Rust conventions. PLACEHOLDER: settled so far are fully self-contained binaries (static linking, musl on Linux, static CRT on Windows, bundled C libraries, rustls, assets compiled in) and the windows crate for every Windows API call; the rest is TBD. Use whenever writing, editing, reviewing or building Rust code, Cargo.toml or .cargo/config.toml, or calling Windows APIs from Rust.
---

# Rust conventions

Builds on `kejser-code:code-style`.

> **⚠️ Placeholder.** Sections marked *TBD* are not decided yet.
> Where one applies, do not guess: ask Thomas, then send the answer to the `Skills` agent (see `kejser-code:skill-updates`).

## Self-contained binaries

Every binary is fully self-contained: one executable file that runs on a clean machine of its target OS.
No installer, no runtime to install first, no `.dll`, `.so` or `.dylib` shipped next to it, and no files it must find at runtime.

### Per platform

| Platform | Build | May link dynamically | Check with |
|---|---|---|---|
| Linux | `--target x86_64-unknown-linux-musl` (or `aarch64-…`) | Nothing | `ldd <binary>` says it is static |
| Windows | MSVC target with the static CRT (below) | System DLLs only (`kernel32.dll`, `user32.dll`, …) | `dumpbin /dependents <binary>`: no `vcruntime140.dll`, no `msvcp140.dll` |
| macOS | Default target | `libSystem` and Apple system frameworks | `otool -L <binary>`: nothing from Homebrew or `/usr/local` |

- Linux builds use musl, never glibc: a glibc binary depends on the glibc version of the machine it was built on.
- Windows links the C runtime statically, set once in `.cargo/config.toml`:

  ```toml
  [target.'cfg(all(windows, target_env = "msvc"))']
  rustflags = ["-C", "target-feature=+crt-static"]
  ```

- macOS can't link `libSystem` statically; that and Apple's frameworks are part of the OS, so they are allowed.

### Dependencies

- A crate that wraps a C library is built with that library compiled in, using its `bundled` or `vendored` feature: `rusqlite` and `duckdb` with `bundled`.
- TLS uses `rustls`, never OpenSSL or the platform's native TLS.
  Turn off a crate's default TLS backend when it isn't rustls.
- A dependency that can only link a system library needs Thomas's OK before it is added.

### Assets and configuration

- Files the program needs (SQL, templates, schemas, default config) are compiled in with `include_str!` or `include_bytes!`.
- The program runs with no config file; any config file it reads only overrides built-in defaults.

## Windows

- Every Windows API call goes through Microsoft's [`windows`](https://crates.io/crates/windows) crate.
  Never `winapi` (unmaintained), `windows-sys`, or hand-written `extern "system"` blocks.
- Enable only the API namespaces the code uses:

  ```toml
  [target.'cfg(windows)'.dependencies]
  windows = { version = "…", features = ["Win32_Foundation", "Win32_System_Threading"] }
  ```

- Windows-only code lives in its own module behind `#[cfg(windows)]`, so the crate still builds on every other platform.
- Keep `unsafe` blocks to the API call itself, and wrap each call in a safe function that returns `Result`.

## TBD — fill in before relying on this skill

- **Toolchain**: edition, minimum Rust version, `rust-toolchain.toml`.
- **Formatting and lints**: `rustfmt` settings, Clippy level, warnings as errors.
- **Errors**: `thiserror`, `anyhow`, or plain enums; where each applies.
- **Command line**: argument parsing crate and conventions.
- **Async**: whether to use an async runtime, and which.
- **Release profile**: LTO, `codegen-units`, `strip`, `panic`.
- **Cross-compiling and CI**: how the per-platform binaries are built and published.
- **Testing**: unit, integration and snapshot test conventions.

## Updating this skill

When a convention is decided, send it to the `Skills` agent.
It replaces the *TBD* bullet with the concrete rule and moves it into the settled sections.
