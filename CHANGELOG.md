# Changelog

Changes are grouped by verified scope. “Added” does not mean a live service or a passed integration gate. Execution status lives in [PROGRESS_MANIFEST.md](PROGRESS_MANIFEST.md).

## Unreleased — synthetic UI prototype

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
