---
name: dataset-generation
description: Thomas's default design for dataset generators — programs that produce synthetic data for benchmarks, tests and demos. Every generator takes a variety of scale factors (SF1 as the base, linear growth, a larger SF only adds rows, users growing with the square root of SF), is SQL run in DuckDB from thin Python, draws every random value from a hash of a key so any slice generates alone and identically, plants needles that hold at every SF, writes JSON as VARIANT, splits work into small memory-bounded chunks, and scales out with a coordinator container that hands chunks to pull-based worker containers and does every commit. Use whenever creating, changing or reviewing a dataset generator, synthetic or benchmark data, test data at several sizes, anything that takes a scale factor, or distributed generation with workers.
---

# Dataset generation

A dataset generator is a program that produces synthetic data: for benchmarks, tests and demos.
The reference implementation is `agenttelemetry` in the `sql-arena-data` repo; read it before building a new generator.

- **Thomas's rules** below are settled.
- **Default design** is how the reference generator does it.
  Follow it unless the dataset needs something else, and say so when you deviate.

## Thomas's rules

### Scale factors

- Every generator takes a scale factor and supports a variety of them, not one fixed size: small ones for tests and CI, medium ones for development and demos, large ones for benchmarks.
- The scale factor is an input to the generator, never a constant in its code.
- Users grow with the square root of the scale factor (`user_id` scales with √SF), so a larger scale factor has more activity per user.

### Data types

- JSON is generated as `VARIANT`, never as JSON text, in every copy of the data, Parquet included.

### Chunks

- Work is split into chunks small enough to bound the memory each one needs.
  Prefer more, smaller chunks: the compactor cleans up the small files.
- Generation is restartable from the last completed chunk.

### Distributed generation

- Two containers:
  - a **coordinator**, which holds the list of every chunk to generate and serves the web interface;
  - a **worker**, which asks the coordinator for work.
- Work is never divided up front.
  The coordinator hands out chunks as workers ask, so workers can join or leave while generation runs.
- A worker uses every CPU, by running several processes that each ask the coordinator for work.
- The coordinator does every commit: a worker tells the coordinator its chunk is ready, and the coordinator commits it.
  That way the coordinator also tracks progress.

### Where it runs

- Ask Thomas before starting a heavy job on a local machine.
- Large scale factors are generated on EC2.

## Default design

### Scale factors

- SF1 is the base size, defined in the dataset's README by its main unit (e.g. about 100,000 agent runs a year).
- Supported so far: SF1, SF10 and SF1000; larger ones are sized before they are added.
- Fact rows grow linearly with SF.
  Dimensions (tenants, products, prices) and the calendar stay fixed; users grow with √SF.
- A larger scale factor only adds rows: row n of a partition (e.g. session n of a day) has the same attributes at every SF.
- Data covers a fixed period (e.g. one year), so time filters select real fractions of it.

### Engine

- The generator is SQL in `<dataset>/sql/*.sql`, run by DuckDB from thin Python (see `kejser-code:etl` and `kejser-code:language-choice`).
- One entry point: `uv run generate.py <dataset> --sf N`.
- A web app, such as the coordinator's, is SvelteKit on Node.js with DuckDB through `duckdb-access`.

### Determinism

- No random-number state.
  Every random value is a hash of a salt and the row's key, e.g. `md5('tenant|s|<day>|<n>')`.
- Any slice can then be generated alone, in any order, on any machine, and comes out identical.
  Sharded, chunked and whole runs give the same data.

### Needles

- Needles are planted values that pick out a few rows, for lookups and text search.
- They sit in the first rows of a partition (e.g. sessions 0–39 of a day), so they are the same rows at every SF.
- Computed needles come from SQL macros of a partition and a slot, so a query can use a different needle each run.
- The chunk starting at row 0 of a partition holds its needles, so it must hold at least that partition's SF1 rows.

### Output

- Parquet, one folder per table: `<dataset>/sf<N>/<table>/<table>_NNNN.parquet`, files of about 500 MB.
- Tables are stored sorted by their time column.
- Queries are checked in once as templates in `<dataset>/queries/qNN.sql`, rendered per scale factor into `<dataset>/sf<N>/queries/`, never generated.
- Optionally an Iceberg v3 copy, partitioned by day and compacted to 512 MB files.

### Chunks and resuming

- A chunk is a slice of one partition, e.g. up to 5,000 sessions of one day: about 90,000 rows and 2.2 GB of memory.
- A plan step fixes the list of chunks, so a restart resumes against the same list.
- Progress is recorded in a manifest or ledger, so a restart skips completed chunks.
- Without containers, `--shard K/N` generates every N-th chunk from chunk K, and `--merge-shards N` combines the manifests.

### Coordinator and workers

- The coordinator hands out one chunk per request, with a 30-minute lease; an expired lease puts the chunk back.
- A failed chunk is retried up to 3 times.
- A worker runs one process per CPU, each with one DuckDB thread, and stages its output files.
- The coordinator commits staged files per table, in batches of up to 2 million rows, one commit at a time per table, and keeps a JSONL ledger so a restart resumes.
- The coordinator has no authentication, so workers reach it over a private network only.

### Command line

| Command                                                  | Does                               |
| -------------------------------------------------------- | ---------------------------------- |
| `generate.py <dataset> --sf N [--shard K/N]`             | Generates Parquet                  |
| `generate.py <dataset> --sf 1 --days 14 --no-upload`     | A quick test, written to `temp/`   |
| `<plan> --sf N --out plan.json`                          | Plans the chunks of a scale factor |
| `<work> --coordinator URL [--processes N --memory-gb G]` | Runs a worker                      |
| `<validate> --sf N`                                      | Checks the generated data          |

### Validation

- `sql/validate.sql` measures row counts, distributions and every needle, and compares them with the README's claims within tolerances.
- The step fails if any check is outside its tolerance.

### Documentation

- The dataset's `README.md` states what SF1 is, what scales and what stays fixed, and the rows, size and generation time at each supported SF.
- It lists the needles and the events on known dates that queries depend on.

## Updating this skill

Changes go through a skill agent (see `kejser-code:skill-updates`).
