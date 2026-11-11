---
name: dataset-generation
description: Thomas's conventions for dataset generators — programs that produce synthetic data for benchmarks, tests and demos. PLACEHOLDER: settled so far is that every generator takes a scale factor and supports a variety of them, from tiny test sizes to large benchmark sizes; the rest is TBD. Use whenever creating, changing or reviewing a dataset generator, synthetic or benchmark data, test data at several sizes, or anything that takes a scale factor.
---

# Dataset generation

A dataset generator is a program that produces synthetic data: for benchmarks, tests and demos.

> **⚠️ Placeholder.** Sections marked *TBD* are not decided yet.
> Where one applies, don't guess: ask Thomas, then send the answer to a skill agent (see `kejser-code:skill-updates`).

## Scale factors

- Every generator takes a scale factor, and supports a variety of them, not one fixed size.
- The range covers:
  - small scale factors that generate in seconds, for unit tests and CI;
  - medium ones for development and demos;
  - large ones for benchmarks.
- The scale factor is an input to the generator, never a constant in its code.
- A dataset's documentation states what the scale factor scales, and lists the sizes it produces at each supported scale factor.

## TBD — fill in before relying on this skill

- **Scale factor values**: which values are supported (e.g. `0.01`, `1`, `10`, `100`, `1000`), whether fractions are allowed, and what scale factor 1 means.
- **What scales**: which tables grow linearly with the scale factor and which stay fixed (lookup tables, dimensions).
- **Determinism**: whether the same scale factor and seed always produce the same data, and whether a smaller scale factor's data is a subset of a larger one's.
- **Language and engine**: a self-contained Rust binary, SQL run in DuckDB, or both (see `kejser-code:language-choice`).
- **Output**: file formats (Parquet, CSV), file layout, and loading into a database.
- **Command line**: how the scale factor, seed and output location are passed.
- **Parallelism**: splitting generation across threads or files at large scale factors.
- **Validation**: checking row counts and distributions per scale factor.

## Updating this skill

Changes go through a skill agent (see `kejser-code:skill-updates`).
It replaces the *TBD* bullet with the concrete rule and moves it into the settled sections.
