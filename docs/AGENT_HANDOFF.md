# Milo agent handoff

Checkpoint: **7 September 2026**, implementation `041d853`, status reconciliation
`5b735da`. This document is a continuation guide, not a replacement specification
or permission to claim unfinished gates. Refresh GitHub and workspace state before
acting: branch, PR, CI and running processes can change after this snapshot.

## 1. Start here

1. Inspect the checkout, dirty files, current branch and linked PRs. Preserve work
   you did not author. At this checkpoint the branch is
   `hoplite/halikarnassos-f8ffcccc-local-compact-contract-local-network-execution`.
2. Read [the progress manifest](../PROGRESS_MANIFEST.md),
   [protocol verification](../PROTOCOL_VERIFICATION.md) and
   [the changelog](../CHANGELOG.md). They distinguish verified slices from gates.
3. Read the canonical documents below, especially blueprint §3.3, the admission
   sequence, the provider/operation tables, and the roadmap's M-01–M-03/R1 gates.
   Re-read the relevant sections **during** implementation, not just once.
4. Inspect current PR checks/review threads. PRs #1 and #2 were already merged
   when discovered by this work; this agent did not perform those merges.
   [PR #3](https://github.com/amolikpe-bit/milo/pull/3) holds the native execution
   checkpoint. Its publication snapshot is draft/open with auto-fix enabled;
   check live state rather than assuming that still holds.
5. Continue with the deployment resource-limit investigation in section 4.
   Do not start payment/cloud integration to avoid the blocked protocol gate.

### Authority and reading order

| Read | Owns |
| --- | --- |
| [01-blueprint.md](../01-blueprint.md) | Scope, privacy, protocol, admission, exact package decisions |
| [02-roadmap.md](../02-roadmap.md) | Work ordering, acceptance gates, R0–R5 and release boundaries |
| [03-building-guide.md](../03-building-guide.md) | Implementation and verification discipline |
| [04-ui-design.md](../04-ui-design.md), [05-ux-design.md](../05-ux-design.md) | UI, task flows, consent and presentation |
| [06-backend-design.md](../06-backend-design.md) | Auth, data/files, jobs and observation boundaries |
| [07-video-design.md](../07-video-design.md) | Truthful demo and publication requirements |
| [08-midnight-core-audit.md](../08-midnight-core-audit.md) | Source audit, unresolved evidence and Midnight priorities |

Historical audit statements describe their original evidence turn. Use the
manifest and execution receipts for subsequent implementation results. If prose
contradicts current evidence, correct it explicitly; do not silently change a gate.

## 2. What is done, partial, blocked and pending

**Highest completed release gate: R0.** No R1, controlled-pilot or live-pilot claim.
Completed provider/operation rows remain **0/6 and 0/14**. Actual partial provider
use exists, but that is not completion of each row's acceptance contract.

| Work | Current result | What must still happen |
| --- | --- | --- |
| Source-backed plan | Eight canonical documents; status/evidence ledgers | Resolve organizer date/rubric discrepancies before eligibility claims |
| UI foundation and prototype | Synthetic buyer/merchant/operator routes, sample files and browser-checked interactions | Real auth, files, wallet consent, recovery, accessibility/usability evidence; broader context inventory |
| Domain simulation | 14 tests / 79 assertions in the earlier UI/domain slice | Never use simulation as chain/payment evidence |
| Original Compact contract | Full compilation; 14 circuit artifact sets, 60 hashes; 19 contract tests / 302 assertions | Real deployment, admission, operation and adversarial network evidence |
| Native services | Node block production, matching indexed block, prover queue readiness and scoped shutdown | Not a persistent browser network or proof of an executed Milo circuit |
| Disposable wallet funding | Finalized synthetic NIGHT funding; buyer NIGHT/DUST observed | Does not establish browser-wallet onboarding, order recovery or commercial affordability |
| M-01–M-03 / R1 | **Blocked at full deployment resource limits** | Diagnose and fit the unchanged network limits, then prove/submit/observe and test forbidden behavior |
| M-04–M-06 / R2 | Pending | Isolated Convex/Privy, real browser wallet, membership/files, independent actors and recovery |
| M-07 payments | Simulation only | Stripe sandbox, signature verification, actual authorization windows, capture/void and reconciliation |
| R3 MVP candidate | Pending | Required predecessors, Preview execution, privacy/security/failure review, supported-wallet and task evidence, runbook |
| M-12 submission | Pending | Exact SHA/evidence, honest demo and organizer requirements; GitHub publication is not submission |
| R4/R5 | Pending | Explicit live approval, legal/merchant arrangements, consent/support capacity; later real customer/economic evidence |

Last verified local regression checkpoint: **37 Bun tests / 397 assertions plus
16 Node tests**, lint, strict typecheck, static build and bounded plan checks.
These are historical results until rerun against a new head. The latest RPC/byte
instrumentation has unit coverage but was not itself live-rerun. Remote CI must
be inspected separately; do not infer it from this count.

## 3. Non-negotiable patterns and invariants

- Preserve the tagline: **Private agreements. Clear approvals.**
- Seven service contexts share **one bilateral fixed-price protocol**, not seven
  contracts. Keep the `image-pack-v1` bounded three-image scope.
- Never rename/remove B-01–B-11, MID-P1–P6, MID-T01–T14, M-01–M-14 or R0–R5.
- Currency remains private agreed-terms data, not a public ledger field. The
  current artifact's fixed USD policy makes it inferable; that is not a public
  per-order currency field. Changing policy requires reviewed artifacts.
- Constructor execution is not proof of legitimate initialization. `reserve`
  independently checks bootstrap/public-configuration invariants; retain raw
  ledger-injection negative controls. Independent role witnesses, typed terms,
  revision checks and public block-time predicates must not be weakened.
- Admission requires the expected state and **complete** verifier/entrypoint set,
  observed irreversible maintenance policy, canonical address binding, then
  proved/observed reservation in the specified sequence.
- Empty maintenance committee with threshold **one** is the candidate impossible
  quorum. Threshold zero or deleting a local key is not a lock. Positive policy
  observation alone does not prove all maintenance attacks are rejected.
- Keep chain state, payment state and pending/unknown observations distinct.
  Persist identifiers before send. A timeout after submission is not rollback
  or rejection. Do not automatically resubmit an outcome-unknown transaction.
- The current integration driver is **diagnostic and non-admitted**. It retains
  only buyer openings for its bounded flow; merchant/operator openings are not
  retained. It is not an independent-actor lifecycle or recovery implementation.
- Never lift node limits, omit circuit keys, skip proof generation or weaken tests
  merely to produce a green result. Do not call ordinary funding B-10 sponsorship.

## 4. Immediate next work: deployment feasibility

### Established evidence — do not repeat the wrong diagnosis

| Attempt | Observation | Interpretation |
| --- | --- | --- |
| `run-OsIsLO` | Funding/DUST observed; failure after deployment proof-provider completion | Initial failure classification was discarded; no deployment success |
| `run-nacq7y` | `Wallet.InsufficientFunds` at wallet balancing on Node 24.20.0 | Positive DUST was insufficient; actual-fee/accrual fix followed |
| `run-KxqoEk` | Fee balancing passed; node returned RPC 1010, `Invalid Transaction: Transaction would exhaust the block limits` | **Newer, separate node resource rejection**, not the old funding failure |

The unchanged pinned node source specifies a 1 MiB block length, 75% normal
dispatch ratio and weighted execution limits. The exact attempt's limiting
dimension has **not** been established. Verifier file sizes alone do not prove
extrinsic size or dispatch weight. Source references and error semantics are in
[the integration README](../packages/integration/README.md).

### Next experiment, in order

1. Recheck blueprint §3.3 and the pinned node/SDK source. Identify the actual
   transaction-cost and runtime-limit APIs and their SCALE types before coding.
2. Extend the isolated diagnostic to collect public, bounded measurements of the
   actual finalized transaction bytes, encoded extrinsic length, dispatch/cost
   information, runtime identity and applicable limits at a specified block.
   Fingerprint the same artifacts used by the transaction. Do not emit bodies,
   witnesses, signing material or arbitrary error objects.
3. Prefer a read-only cost/admission probe before another submission. The pinned
   runtime exposes `get_transaction_cost(Vec<u8>)`; that does **not** establish a
   JSON-RPC method named `midnight_getTransactionCost`. Verify runtime-API/SCALE
   encoding rather than inventing an endpoint or cost conversion.
4. Determine whether a supported staged bootstrap can install bounded verifier
   batches **before admission**, retaining the same single contract and all 14
   operations, followed by complete inspection and irreversible locking. This is
   a **hypothesis**, not implemented or approved-as-correct protocol behavior.
   Check every step against the canonical admission sequence. If it requires a
   protocol change, record the conflict and obtain the needed decision first.
5. If viable, test partial/bootstrap interruption states as non-admissible,
   complete key equality, unchanged intended ledger state, final lock and rejected
   maintenance/circuit replacement. Measure total bootstrap cost/latency; multiple
   transactions may still fail the per-order feasibility gate.
6. Only then attempt and independently observe reservation. Continue through legal
   and forbidden operations, role/terms/delivery binding, replay, races, deadlines,
   malicious bootstrap and recovery. Advance individual MID rows only when their
   full required evidence exists; do not close R1 from one happy-path reservation.

Stop at the failing boundary, retain identifiers and classify the result. Do not
cycle through identical funded deployments without a new measurement or justified
change. Independent review is required before treating a fix as verified.

## 5. Reproduce the environment and checks

The verified native lane is Linux x86_64. The observed sandbox was gVisor with
no Docker/Podman/socket; inspect the actual current environment rather than assuming
that still holds. Native execution uses ordinary verified binaries, not a daemon
or a privileged container workaround.

| Component | Pin / boundary |
| --- | --- |
| Bun | 1.4.2, repository wrapper |
| Compact | Devtools 0.5.1; compiler 0.31.1; language 0.23.0 |
| Generated runtime | compact-runtime 0.16.0; onchain-runtime-v3 3.0.0 |
| Native candidate | Node service 1.0.0; indexer 4.3.3; prover 8.1.0 |
| Integration process | Node.js 24.20.0, not incidental host 24.19.0 |
| Isolated SDK graph | SDK/testkit 4.1.1; ledger-v8 8.1.0; wallet-sdk 1.1.0; frozen npm lockfile |

The native candidate is not proof of compatibility with every public network or
the separately planned browser-wallet cohort. Never adopt the newest release
merely because its number is higher. Retain exact archive/layer/member hashes.

Use the project's effective setup path. In Hoplite, inspect `project_settings_get`
and use `sandbox_setup`; project overrides win over repository settings. Outside
Hoplite the repository setup command is `npm run setup`. If setup fails, diagnose
and fix its durable path; do not silently report a one-off workaround as fresh
setup success. Once the pinned Bun is installed, from repository root:

```sh
npm run contract:cohort
npm run contract:compile
npm run setup:native-network
npm run setup:integration-runtime
export PATH="$PWD/.tools/node-runtime/node-v24.20.0-linux-x64/bin:$PATH"
node --version  # Must be v24.20.0 for the isolated integration package.
npm --prefix packages/integration ci --ignore-scripts --no-audit --no-fund
npm run lint
npm run typecheck
npm run check:plan
npm run test:unit
npm run test:integration
npm run build
npm run test:native-network
```

For an intentionally revised disposable transaction experiment, after reading
section 4 and [its environment contract](../packages/integration/README.md):

```sh
npm run test:native-node -- --with-services --transactions
```

The supervisor supplies owned loopback endpoints and an independently checked
genesis hash, uses the selected Node executable and stops its services. Do not
run `local.mjs` against guessed endpoints or public assets. The current full
deployment diagnostic is expected to encounter the recorded block-budget issue
until a verified change addresses it.

Generated keys/JS/ZKIR live under ignored `packages/contract/generated/`; rebuild
them, never hand-edit them. Node-only tests use module hooks and run separately
from Bun tests. The plan checker validates gate-ID presence, fences and relative
file targets, **not** all anchors, external pages or semantic plan compliance.

### Known environment limitations

- First-party reprovisioning/setup refused lifecycle claims even when native
  commands worked. The fault was reported, not repaired. Do not call it the active
  deployment blocker: native execution has already bypassed the Docker need.
- QA audit rejected the existing `.hoplite/settings.json` without useful schema
  diagnostics; settings inspection also reported it absent despite being tracked.
  This was reported. Do not invent configuration fields, remove checks or claim
  automatic browser QA readiness. Recheck authoritative schema/tool results.
- Prover binds **all sandbox interfaces**, unlike node/indexer loopback bindings.
  No Preview/tunnel may be published for it. Use synthetic, disposable inputs only;
  trusted proving/access controls remain a later integration requirement.
- Respect current resource metadata. Low Modal reservation is not its burst ceiling.
  Resize only for demonstrated resource failures, not this ledger admission error.
- Optional Docker instructions are in [local-network-candidate.md](local-network-candidate.md),
  using `infra/midnight/compose.yml`. This Compose route has not been executed here.

## 6. File map

| Path | Purpose |
| --- | --- |
| `packages/contract/src/order.compact` | Original protocol; change only against canonical invariants |
| `packages/contract/tests/` | Encoding, disclosure, generated-runtime and malicious-state tests |
| `scripts/compile-contract.ts`, `scripts/verify-compact-cohort.ts` | Complete artifacts, fingerprints and actual runtime identity |
| `scripts/setup-native-node.ts`, `scripts/setup-native-services.py` | Checksummed native artifacts/configuration |
| `scripts/setup-integration-runtime.ts` | Canonical isolated Node.js runtime |
| `scripts/native-node-smoke.ts`, `scripts/native-services-health.ts` | Ephemeral native network and diagnostic supervision |
| `scripts/native-processes.ts` and tests | Owned processes, signal handling and late-spawn cleanup |
| `packages/integration/src/local.mjs` | Diagnostic funding/deploy/lock/reserve orchestration; latter steps not proven live |
| `packages/integration/src/artifacts.mjs` | Source, 60 artifacts and cohort binding before funding |
| `packages/integration/src/dust.mjs` | Actual-fee readiness and bounded pre-submit retries |
| `packages/integration/src/submissions.mjs`, `diagnostics.mjs` | Pre-send IDs and allowlisted diagnostics |
| `packages/integration/src/order.mjs` | Isolated generated-runtime loader and bounded synthetic buyer fixture |
| `packages/integration/test/` | Node-only regressions; construction is not live proof |
| `packages/domain/`, `apps/web/` | Synthetic model and UI; not connected to real protocol state |
| `.github/workflows/check.yml` | Compile, static checks, separate suites and native health |

## 7. Evidence, privacy and research

Read [native-network.md](native-network.md),
[native-service-sources.md](native-service-sources.md),
[development-evidence.md](development-evidence.md),
[the sanitized native receipt](receipts/native-local-checkpoint.json) and
[the compiler receipt](receipts/compact-0.31.1.json).
The native receipt deliberately combines **separately labeled executions**;
do not turn those into a fabricated single end-to-end timeline.

Private diagnostics may survive in this workspace under
`.hoplite/artifacts/native-node/run-*`, including the attempts named above.
They are not guaranteed in a fresh clone. The chain is disposable; funding
identifiers do not imply a still-queryable network. Actor secrets are in memory,
not a tested backup/recovery mechanism. Do not restore one actor/database into
another run or describe this reset as user recovery.

Never commit/publish `.tools`, generated key output, raw logs, SDK transaction
bodies, seeds, witness data, environment secrets or private media. Testkit's default
wallet logging can print seeds: retain its disabled logger and the allowlisted
receipt/diagnostic projection. Cleanup must cover normal failure, SIGINT/SIGTERM
and children created during shutdown; SIGKILL cannot run application cleanup.

The user explicitly requested real Firecrawl CLI Developer Index use. The pinned
CLI 1.23.3 was actually attempted and denied keyless access from this IP:

```sh
npm run research:developer -- 'Midnight local development native node proof server run without Docker' --limit 3 --json
```

The separately authenticated Firecrawl MCP Developer Index/scrape integration
worked. Discover its available tools before calling them; do not assume credentials
or invent CLI success. Use official version-matched source/release metadata to
resolve technical choices, and record dates, revisions, exact failures and what
was actually executed. Search snippets are leads, not compatibility proof.

## 8. After the protocol gate: order and defer rules

Use roadmap dependency order, not calendar promises:

1. Resolve M-01–M-03/R1 with actual admitted protocol evidence.
2. Build R2 auth, membership/files, named browser wallet/prover profile and independent
   actor recovery using isolated real development environments. Do not substitute
   mocked provider results for integration evidence. Request missing account access
   or configuration only when it blocks that authorized stage.
3. Implement/test Stripe sandbox capture/void, signed webhooks, ordering/duplicates,
   expiry and timeout-after-effect reconciliation. No live keys or payments.
4. Complete R3 Preview, privacy/adversarial/operational and B-09/B-11 evidence,
   including actual supported-wallet/usability work and the runbook.
5. Package the exact reviewed SHA and honest demo for M-12; clarify organizer rules.
6. R4 requires explicit live authorization and operational/legal readiness. R5
   requires observed repeated customer value/economics, not more implementation.

| Deferred work | Re-entry trigger |
| --- | --- |
| B-10 DUST sponsorship | First optional phase only after funded baseline **and B-09**, plus cost/privacy/consent approval |
| B-08/M-13 public archive | Core evidence, concrete portability need, explicit synthetic publication/fee approval |
| EffectStream observer | Measured observation/history gap and a better verified operating-cost case |
| Mobile/Kuira and review inference | Actual customer need plus compatibility, safety and allowance evidence |
| Heavy 3D/M-14 launch film | R3 protocol/task clarity and a justified presentation need |

No optional item has been reactivated. Use `DEFERRED → REACTIVATED → ONGOING`
only after documenting the trigger, owner and admitted scope. Preserve older reasons.

## 9. Working and publication discipline

- Delegate bounded file ownership; parent integrates and owns final verification.
  Follow contract/integration changes with an independent review and rerun the
  relevant actual checks. Subagent claims alone are not final evidence.
- Before changing a phase, cross-check: canonical invariant → implementation path
  → positive test → negative test → real observation → honest gate/status update.
- For material UI work, use the managed Preview and actual browser assertions;
  do not reuse historical screenshots as current proof. For browser QA state,
  use declared isolated profiles/audits rather than production data or ad hoc edits.
- Review diffs for secrets, generated files, dependency drift, altered gate IDs,
  privacy disclosures and stale status prose. Check both top summaries and lower
  checkpoint paragraphs; one stale Docker sentence was already corrected in `5b735da`.
- Update the manifest, protocol/UI verification as applicable, changelog and this
  handoff when the next checkpoint changes its continuation instructions. Distinguish
  DONE slices, PARTIAL work, PENDING work and BLOCKED gates; never report a percentage
  or benchmark without evidence.
- Commit/push bounded, tested checkpoints through the authorized source-control
  tools. Inspect live PR state, keep its holistic description/current verification
  accurate, and retain auto-fix subscription. Do not sleep-poll CI after publication.
- Do not assume prior permission to merge PR #2 authorizes every future merge or
  any production launch. Obtain applicable authorization and inspect live reviews/
  checks before merging. If the current PR was merged, use the authorized branch
  rotation path; do not append independent work to a merged head.

### Next-agent completion checklist

- [ ] Live checkout/PR/CI reviewed; unrelated work preserved.
- [ ] Canonical admission and feasibility requirements reread.
- [ ] Actual limiting deployment resource measured without exposing private data.
- [ ] Proposed bootstrap change reviewed against the unchanged protocol/gates.
- [ ] Positive and negative evidence obtained on the exact candidate artifacts.
- [ ] Secrets/logs remain private; scoped processes/data handled correctly.
- [ ] Regression suites and relevant real execution rerun; limitations stated.
- [ ] Manifest/changelog/receipts/PR updated and checkpoint published.
- [ ] R1/R2/R3/live claims withheld until their full acceptance contracts pass.
