# Local Compact verification — 7 September 2026

**Bounded execution checkpoints, not R1.** The original Milo contract compiles with full artifacts and its generated-runtime tests pass. The [native network lane](docs/native-network.md) verifies real node/indexer block identity, prover availability, finalized disposable funding and observed DUST without Docker. Full contract deployment was rejected by the node's block limits; reservation did not run. Completed MID provider/operation rows remain **0/6 and 0/14**. Fourteen compiled circuits are not fourteen completed MID operations.

## Native execution follow-up

- PR #2 was already merged when the user authorized merging it; its final checks passed. Follow-up work uses a new authorized branch, not the merged head.
- Direct sandbox inspection found Linux x86_64 gVisor, no Docker/Podman/socket. Another runtime-replacement request returned the same active-operation error. This platform fault is not claimed fixed.
- Pinned official native node 1.0.0 and exact OCI-derived indexer 4.3.3/prover 8.1.0 run unprivileged. The node archive, manifests/layers/executables and indexer configuration are checksum-verified. No global libraries, `/nix` tree or container runtime were installed.
- Fresh native runs observed block 1 and the identical hash via indexer GraphQL. Indexer readiness alone permits lag; the harness waits for the actual block. Prover `/ready` body `status: "ok"` means queue availability, not successful proving.
- Service cleanup runs on normal completion and SIGINT/SIGTERM; four real interruption regression tests pass, including late-spawn attempts during shutdown. Private logs and execution data remain ignored. The prover binds all sandbox interfaces, has no published Preview/tunnel, and is restricted here to disposable synthetic experiments.
- Source inspection corrected the earlier external database-password assumption: standalone uses SQLite and in-memory pub/sub. Docker is now an unexecuted optional fallback under `infra/midnight/compose.yml`.
- The isolated [transaction harness](packages/integration/README.md) is a separate Node process. Its diagnostic reservation explicitly does not admit an immutable commercial order or close R1.
- Actual execution caught insufficient DUST despite a positive balance. The fix uses real fee estimates and observed accrual, retrying only pre-submit insufficient-DUST failures; signing/submission are not retried. Artifact/source binding and pre-send identifiers (including internal registration calls) have regression coverage.
- With sufficient DUST, deployment reached node submission and received RPC **1010: Invalid Transaction: Transaction would exhaust the block limits**. This is a deployment feasibility blocker, not another Docker fault. No contract address, maintenance lock or reservation success is claimed. Preserve the single-contract/immutable-admission requirements while investigating a bounded bootstrap; do not raise node limits or remove MID operations.
- Current local checks pass: **37 Bun tests / 397 assertions**, **16 Node 24.20.0 tests**, lint, strict typecheck, static build and the bounded canonical-plan checker. The [sanitized execution receipt](docs/receipts/native-local-checkpoint.json) distinguishes separate health/funding runs and the deployment rejection. CI now runs native health and the separate Node suite; remote success must be read separately.
- Plan re-reading caught the incidental host Node 24.19.0 versus selected 24.20.0 difference. A publisher-checksummed, repository-local 24.20.0 runtime now drives the diagnostic; no global runtime upgrade or contract-cohort change was made.
- The platform's setup tool still refuses its lifecycle lease even after native execution succeeds. Its QA audit also rejects the existing settings file without exposing validation details; no schema, authentication, seed profile or automatic-QA policy was guessed. Both limitations were reported. Native commands work, but first-party fresh setup/automatic browser QA are not claimed verified.

## Earlier compiler/runtime checkpoint evidence

| Check | Observed result | Boundary |
| --- | --- | --- |
| Repository setup | Exact archive checksums and Compact devtools 0.5.1/compiler 0.31.1 installed on Linux x86_64 | Not a collectively tested SDK/network cohort |
| `bun run contract:cohort` | Runtime 0.16.0, on-chain runtime 3.0.0, one actual resolved WASM identity; compiler language/runtime/ledger-target checks pass | No provider instantiated |
| `bun run contract:compile` | Full compilation without skip flags; 14 state-changing circuits, 60 nonempty hashed artifacts, including every prover/verifier key and ZKIR | Compiling keys is not proving a transaction |
| `bun run lint` | 20 source/config files checked, no warnings or rule suppressions | Generated compiler output excluded, not edited |
| `bun run typecheck` | Strict TypeScript passes against actual generated declarations | Not browser-wallet or SDK integration |
| `bun run test:unit` | **33 tests, 381 assertions pass** across five files: 19 contract tests/302 assertions plus the existing 14 UI/domain tests/79 assertions | Generated runtime and synthetic fixtures only |
| `bun run build` | Native static web build passes | The web UI remains explicitly simulated and does not call the contract |
| Canonical document check | Eight documents, 280 local links, references, fences and baseline requirement IDs pass after status updates | Structural evidence, not an integration gate |

Source fingerprint: `8fe02a3949879a87cead236e92414449b2b4ece614d03783b6012cf4ca67bd96` (SHA-256 of `packages/contract/src/order.compact`). The checked [compiler receipt](docs/receipts/compact-0.31.1.json) records all final artifact fingerprints. Large generated artifacts stay ignored and are rebuilt, not manually edited or represented by fabricated chain receipts. CI now performs full compilation before typecheck/tests; remote CI is not assumed from local success.

The contract checkpoint was replayed as `25c67ac` onto current `main` after the existing PR was discovered already merged. Its tested source fingerprint is unchanged; this run did not merge any PR.

## What was exercised

- Typed TypeScript/Compact terms round trip and fixed commitment vectors; every terms field, salt, network, nonce and role changes its commitment.
- Independent actor-local witnesses; merchant actions cannot request the buyer's private limit, and public timeouts request no role secret or terms.
- Every canonical transition, malformed terms and bounds, wrong-role secrets, stale revisions, terminal states, immutable delivery, both dispute outcomes and one-second-before/at/after deadline boundaries.
- Raw-ledger bootstrap injection bypasses the constructor; proved reservation logic rejects malformed configuration, protocol version, revision and prefilled delivery/evidence.
- A temporary undisclosed role-secret write is rejected by the actual compiler's disclosure diagnostic. This is a negative compiler control, not a guarantee that all possible disclosures are safe.
- Independent review found and corrected constructor-only bootstrap validation and a public currency field. Currency remains in private terms and is checked against the artifact's fixed USD test policy; the deployment policy makes it inferable. Changing that policy requires reviewed new artifacts and admission, not an arbitrary client setting.

The [contract disclosure inventory](packages/contract/README.md) states all public arguments, witnesses, limitations and exact encodings. The contract is original source; public language references informed syntax rather than supplying a copied authorization model. The [development source receipt](docs/development-evidence.md) separates actual Firecrawl Developer Index evidence from the CLI request denied by the provider's keyless-IP policy.

## Remaining M-01–M-03 / R1 work

The [digest-pinned local-network candidate](docs/local-network-candidate.md) has not been executed. It has a distinct local node/indexer cohort, isolated configuration and a private backing-service configuration gate; metadata and health-check definitions do not establish compatibility.

**Observed platform blocker:** Docker runtime replacement was attempted twice and refused with “cannot be replaced while another operation is active.” Compiler/test sessions had exited successfully, all child agents were inactive and then closed, and process/health inspection showed no application/compiler job. Effective setup remains `sh scripts/setup.sh`. The issue was reported; no runtime controls were bypassed and no network was started. A successful compiler setup before the Compose candidate is not proof of fresh Docker-capable setup.

Still required: a supported Docker runtime and fresh network health; verified standalone configuration and actual image identities; isolated funded actors and reset; real prove → submit → finalized successful observation; malicious deployment/verifier substitution and non-upgradable maintenance/admission checks; transaction races and recovery at their real provider boundaries. M-01 remains open, so dependent M-02/M-03 and R1 are not closed by this bounded deliverable. Sponsorship and all optional work remain deferred.
