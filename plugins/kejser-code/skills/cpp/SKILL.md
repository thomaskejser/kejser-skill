---
name: cpp
description: Thomas's modern C++ conventions — ownership with smart pointers, optional/expected instead of sentinels, RAII, const everywhere, free functions, no using namespace, braces always, CLI11, vcpkg manifest mode, Makefile over hand-run CMake. Use whenever writing, editing, or reviewing C++ code, CMake, or C++ build setup.
---

# C++ conventions

> **Ask first.** New C++ is written only after Thomas says yes (see `kejser-code:language-choice`); editing a repo that is already C++ needs no new OK.

Modern C++ in the Jason Turner style. Builds on `kejser-code:code-style`. A repo's formatter config (`.clang-format`, `make format`) decides layout — run it, don't hand-format.

## Language standard

Use the newest standard the repo's toolchain and dependencies allow, and no newer. Some dependencies cap it (e.g. DuckDB headers fail under C++23, so DuckDB extensions stay on C++20). Check before reaching for C++23 features.

## Ownership and resources

- `std::unique_ptr` by default; `std::shared_ptr` only when ownership is genuinely shared. Never hand-written `new`/`delete`.
- RAII wrappers around every C resource (handles, file descriptors, library objects).
- Where destructors are not guaranteed to run (e.g. engine-managed kernel objects), release resources in the explicit lifecycle hook the framework provides.

## Types and values

- `std::optional` instead of sentinel values.
- `std::expected` (C++23) or the repo's status type instead of error codes.
- `std::string_view` and `std::span` for non-owning views.
- `enum class`, never plain `enum`.
- `std::variant` + `std::visit` instead of type tags and casts.
- `const` and `constexpr` everywhere they fit. Prefer immutable value types: members `const`, set once by the constructor.
- Build containers in place: `reserve`, then `emplace_back`.
- `override`, `explicit`, and `final` wherever they apply. `auto` where the type is obvious or noise.
- Standard algorithms and ranges over hand-rolled loops.

## Structure

- **Free functions**, grouped by namespace — not structs of static methods.
- **Never `using namespace`**, in headers or source.
- File-local helpers are small `static` functions. Use an anonymous namespace only when a *type* needs internal linkage.
- **Always use braces** on `if`/`else`/`for`/`while`/`switch` bodies, even one-liners.
- Guard clauses and early returns; each `switch` case returns its complete result.

## Command line

Never hand-roll argv parsing. Use CLI11, with its validators for ranges, existing paths and enum choices.

## Build and dependencies

- Drive the build through the repo's `Makefile`, a thin task runner over CMake. Don't run hand-written CMake or compiler invocations.
- Dependencies come from **vcpkg in manifest mode**, one manifest per component. No Homebrew, system packages, or `pkg_check_modules` for libraries — build tools only.
- Don't disable the compiler cache.
