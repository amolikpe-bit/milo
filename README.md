# Milo

**Private agreements. Clear approvals.**

A privacy-first creative commissioning workspace, currently being built as a **synthetic UI prototype**. The first service is one fixed-price agreement and one delivery of three images. This is not a live marketplace, escrow service or verified Midnight application.

## What works and what does not

Implementation and verification status is tracked in [PROGRESS_MANIFEST.md](PROGRESS_MANIFEST.md), with changes in [CHANGELOG.md](CHANGELOG.md). Do not infer completion from a screenshot or package installation. Provider/operation evidence remains **0/6 and 0/14**; R1–R5 are not achieved.

The prototype uses fictional participants, generated original PNG artwork and an in-memory state machine. Role switching, wallet setup, payment authorization/capture, protocol transitions and recovery are **simulated**, not authenticated or externally observed. Refresh resets the scenario. Never enter real credentials, wallet material, customer data or payment details.

Sample images are public static assets. Checking their pinned SHA-256 hashes demonstrates local byte equality, not blockchain commitments, creative quality or ownership. Exported sample receipts contain no real proof or payment confirmation.

## Local development

The selected Bun version is pinned by the project setup; use the scripts rather than upgrading the global runtime. No provider credentials are needed for the UI prototype.

```sh
sh scripts/setup.sh
bun run dev
```

Open `http://localhost:3000` for the public landing or `/demo` for the sample workspace. In Hoplite use the managed Preview; its run command is versioned in `.hoplite/settings.json`.

```sh
bun run typecheck
bun run lint
bun run test:unit
bun run build
```

The build is static output, not a Convex deployment or a production Bun server. Real provider integration and local Docker/Compact infrastructure belong to later gates. Do not point this prototype at production credentials.

## Explore the prototype

- `/demo`: review the three original images, check sample bytes, confirm approval, then separately simulate capture as the operator.
- Choose **Start with the quote** to explore readiness → hold → deployment → reservation → merchant acceptance → delivery.
- Switch scenarios to inspect disputes, expired holds, unknown outcomes and unavailable capabilities. Switching a role is a prototype control, never actual access authorization.
- `/merchant/quotes/new`, `/operator/cases`, `/account` and `/orders/sample-001/receipt` expose the other bounded tasks.
- `/privacy`, `/terms` and `/pilot` describe current limitations; no live policy approval, enquiries or invitations are claimed.

## Canonical specifications

| Document | Responsibility |
| --- | --- |
| [Blueprint](01-blueprint.md) | Product, protocol, authority and package decisions |
| [Roadmap](02-roadmap.md) | Readiness, order of execution, environment and acceptance gates |
| [Building guide](03-building-guide.md) | Engineering, evidence, experiments and change control |
| [UI design](04-ui-design.md) / [UX design](05-ux-design.md) | Presentation and task/consent requirements |
| [Backend design](06-backend-design.md) | Protected files, external observations and reconciliation |
| [Video specification](07-video-design.md) | Optional post-MVP media, not technical demo evidence |
| [Midnight audit](08-midnight-core-audit.md) | Dated source evidence and add/reuse/defer decisions |

The progress manifest tracks work without changing those contracts. No implementation milestone closes until its own real evidence exists.
