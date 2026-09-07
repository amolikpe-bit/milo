# Changelog

Changes are grouped by verified scope. “Added” does not mean a live service or a passed integration gate. Execution status lives in [PROGRESS_MANIFEST.md](PROGRESS_MANIFEST.md).

## Unreleased — native local execution, protocol work ongoing

- Reconciled stale manifest text with the published native/funding checkpoint: deployment block limits are the active protocol blocker; browser-wallet integration remains distinct from successful CLI funding.

- Verified the existing PR #2 was already merged with passing checks; continued on a fresh authorized branch.
- Unblocked local execution without Docker: pinned native node produced a block, exact native indexer observed the same block hash, and the pinned prover reported queue availability.
- Added opt-in, checksum-verified setup, isolated lifecycle controls, interruption regressions and scoped private diagnostics. The remaining Docker provisioning fault is not claimed fixed.
- Corrected standalone indexer configuration from exact source: SQLite/in-memory services do not require the three previously imposed backing-service passwords. Moved Docker Compose to an explicitly optional fallback.
- Added an isolated Node 24.20.0 transaction diagnostic with artifact/source validation, private-safe errors, pre-send identifiers and actual-fee DUST readiness. Finalized disposable funding and observed DUST pass; full deployment reaches submission but is rejected by the node's unchanged block limits. Reservation remains unexecuted.
- Verification: 37 Bun tests/397 assertions and 16 separate Node tests pass, along with lint, typecheck, build and bounded canonical-plan checks. R1, pilot and completed MID-row claims remain withheld.

## Earlier — verified local compiler/runtime slice

- M-01–M-03 moved from PENDING to ONGOING without claiming R1.
- Installed Compact devtools 0.5.1 and compiler 0.31.1 from exact official release archives with checked publisher SHA-256 digests; setup is repository-owned and Linux x86_64 scoped.
- Selected Compact runtime 0.16.0 and on-chain runtime 3.0.0 together, avoiding a silently newer duplicate transitive runtime. Added a real WASM identity/version canary; no blanket overrides.
- Rechecked current official support matrix through Firecrawl. Newer compiler releases are not adopted merely because they exist. The authenticated Firecrawl integration is available; sandbox CLI credentials are not.
- Original Compact order contract now compiles without skip flags: all 14 circuit artifact sets and 60 artifact hashes verified. Terms/capabilities, public timeouts and independent role actions use actual generated code, not the UI simulator.
- Corrected constructor-only bootstrap checks and an unintended public currency field after independent review. Raw-ledger injection and private fixed-currency policy regressions pass.
- Full verification passes: 33 tests/381 assertions, lint, typecheck, static build and canonical document checks. Added the negative disclosure compiler control and complete hashed artifact receipt.
- Added pinned Firecrawl CLI 1.23.3 as a development tool. Its real keyless Developer Index request was denied for this IP; the authenticated Developer Index integration succeeded. No CLI success or credentials are invented.
- Added an isolated digest-pinned Compose candidate, not an executed network. M-01–M-03 and R1 remain open: real prove/submit/observe and admission/maintenance checks are unfinished. Provider/operation evidence remains **0/6 and 0/14**.
- Docker runtime replacement was refused twice by the platform's active-operation guard after local jobs completed; reported and recorded as BLOCKED, not a successful network setup.
- PR #1 was discovered already merged outside this run. The authorized branch-rotation tool replayed the preserved toolchain/contract checkpoints onto current `main` for an independent follow-up PR; this run did not merge or close it.

## Earlier checkpoint — synthetic UI prototype

Implementation checkpoint: `6acd3a4531a851f8fea836f31149de6621a4425e`. This is a reviewable source commit, not a deployed or MVP release.

### Added and locally verified

- Native Bun/React prototype with separate public and interactive entries; no second API service or frontend bundler.
- Original synthetic three-image artwork, sample-byte verification, explicit approval/dispute confirmation and independent simulated payment state.
- Buyer, merchant and operator perspectives, bounded quote preparation, sample receipts and recovery/uncertain-outcome scenarios.
- Exact dependency setup, static build, typechecking and lint; 14 tests / 79 assertions pass.
- Actual browser checks for quote data, SHA-256 byte equality, approval consent, separate capture/void, disputes, unknown outcomes, synthetic recovery and failed rechecks.
- Stable component identities and explicit dialog focus return; named landmarks and task-first 320px layout. Axe reports zero automatic violations on sampled views, with incomplete contrast results—not an accessibility certification.
- Source-controlled progress/deferred/reactivated-state rules and [verification limitations](VERIFICATION.md). Live flow recording failed to reproduce the otherwise passing interaction reliably; failed captures are not presented as successful evidence.

### Not included

- Real authentication, Compact contracts, proving, chain observations, private-state backup, protected backend files or Stripe requests.
- Sponsorship, archive, inference, mobile SDKs and launch-film production.
- Real customer, performance, security-audit, accessibility-certification or MVP-readiness claims.

## 2026-09-07 — evidence and execution planning

- Corrected the unsupported Midnight.js umbrella `/protocol` import using exact published exports.
- Added source-backed dependency and environment decisions, experimental-version acceptance rules, and cross-wave UI/protocol sequencing.
- Preserved independent chain/payment authority, recovery distinctions, unresolved organizer/network conflicts and the **0/6, 0/14** evidence baseline.
- Published planning checkpoint `45c000e14eba0a332ad28e99ec4ce7a8c974ee02` in PR #1.
