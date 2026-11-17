---
name: docker
description: How Thomas's projects organise Docker images — one image per project, named after it, that does every job (generating data, querying, measuring, showing results) with the role chosen at run time by an environment variable; a docker/ folder holding only what building and running the container needs (Dockerfile, its .dockerignore, files the image installs, deploy and run scripts, a README), while the application the image runs lives outside it in its own top-level folders; builds run from the project root. Use whenever creating, changing or reviewing a Dockerfile, a docker/ folder, container images, deploy scripts for containers, or deciding how many images a project needs.
---

# Docker

How a project's container images are organised.
The reference is the `demo` project in `~/source/core/demo`.

## One image per project

- A project has one image that does everything: generating data, querying, measuring, showing results.
  Never one image per job.
- The image is named after the project (e.g. `demo`).
- The image's behaviour is chosen at run time by an environment variable, `<PREFIX>_ROLE` (e.g. `DEMO_ROLE=worker|viewer`; see `kejser-code:environment-variables`).

## `docker/` holds only the container

- Thomas's rule: "the docker/ folder contains only stuff needed for the container and the application it runs is stored outside".
- `docker/` holds:
  - the `Dockerfile` and its `Dockerfile.dockerignore`;
  - files the image installs (e.g. `install-extensions.sql`);
  - the deploy scripts, in `docker/deploy/`;
  - a run script (e.g. `view.sh`);
  - a `README.md` on building, running and deploying the image.
- The application the image runs lives outside `docker/`, in its own top-level folders, each with its own README.
  In `demo`, the SvelteKit app is `web/` (its README covers pages, roles and environment), and the Python framework (`common/`, the workloads) and the Rust runner (`runner/`) are siblings of it.

## Building

- Build from the project root, so the Dockerfile can `COPY` the application folders:

  ```sh
  docker build -f docker/Dockerfile -t <project> .
  ```

- `docker/Dockerfile.dockerignore` keeps the root build context small; Docker reads it because it sits next to the Dockerfile with that name.

## Updating this skill

Changes go through a skill agent (see `kejser-code:skill-updates`).
