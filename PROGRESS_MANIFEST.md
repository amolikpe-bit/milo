# Milo — execution progress manifest

**Current release level: R0 — specification plus a verified local synthetic UI prototype.** No real Compact, wallet, Convex, Privy or Stripe integration has been verified. Midnight provider/operation evidence remains **0/6 and 0/14**. A working UI is not R1, R3 or a live service.

The [roadmap](02-roadmap.md) owns readiness definitions, dependency ordering and acceptance contracts. This manifest owns implementation status and evidence links; it does not redefine those gates. The [changelog](CHANGELOG.md) records meaningful changes, not estimated completion percentages.

## Status rules

| Status | Meaning / transition requirement |
| --- | --- |
| PENDING | Scoped and ordered; no execution evidence yet |
| ONGOING | Work has started; list unfinished checks and stop conditions |
| DONE | The named, bounded deliverable passed its listed checks; never implies its parent integration gate passed |
| BLOCKED | Exact missing capability, decision or failed requirement; retain the responsible role and safe fallback |
| DEFERRED | Explicitly outside the active slice, with a reason and evidence trigger |
| REACTIVATED | Previously deferred work explicitly admitted after its trigger passes; record old reason, new evidence, owner and scope before moving to ONGOING |

Never erase a deferral, replace an unknown result with success, or close a gate from a mock. A regression reopens the affected work and invalidates dependent readiness claims. Owners below are engineering responsibilities, not invented team members.

## Active stages

| Stage / existing work | Status | Owner | Evidence / artifact | Remaining work and stop condition |
| --- | --- | --- | --- | --- |
| 0 — source-backed plan | DONE, documentation only | Product/architecture | Eight reference documents; [planning commit](https://github.com/amolikpe-bit/milo/commit/45c000e14eba0a332ad28e99ec4ce7a8c974ee02); [PR #1](https://github.com/amolikpe-bit/milo/pull/1); prior 271-link structural check | Organizer dates/rubric and live network cohort remain unresolved |
| 1A — native frontend foundation; partial M-01/B-01 | DONE for the isolated UI slice | Platform | Exact Bun 1.4.2 lockfile, successful `bun run setup`, typecheck/lint/tests/static build; managed native dev Preview rendered | Full M-01/B-01 remain open: protocol infrastructure, real SDK canary and actual deployment are unverified |
| 1B — core clickable UI; partial M-08/M-10 | DONE for the listed synthetic routes | UI/UX | Static public landing; buyer/merchant/operator views; browser-tested quote, review, consent, dispute, receipt and recovery; [verification](VERIFICATION.md) | Broader target inventory, seven-context chooser, real OTP/upload, 200% zoom, screen-reader/user research and B-11 remain pending; no real auth claim |
| 1C — simulator safety and sample files | DONE for the synthetic model | Domain/QA | 14 tests, 79 assertions; role/phase and payment guards; three pinned PNGs; browser success plus failed-recheck negative control | None counts as Compact/circuit/provider evidence. Real replay, chain races, expiry and recovery remain open |
| 2 — real local protocol; M-01–M-03, R1 | ONGOING | Contract/platform | PENDING → ONGOING: canonical schema and current official cohort rechecked; checksum-pinned compiler bootstrap being installed | Full compilation, typed commitment vectors, adversarial circuit tests, compatible Docker/network cohort and real prove/submit/observe remain unverified |
| 3 — connected developer preview; M-04–M-06/B-03/B-04/B-07/B-09, R2 | PENDING | Backend/integration | No real account, file policy, wallet or private-state evidence | Named wallet/prover profile, isolated Convex/Privy configuration, independent actor recovery and authenticated files |
| 4 — payment adapter; M-07/B-06 | PENDING | Payment/backend | Simulation only; no credentials or payment requests | Stripe sandbox, signed webhooks, actual capture window and retry/reconciliation evidence |
| 5 — verified MVP candidate; M-09/M-11/B-05/B-09/B-11, R3 | PENDING | QA/operator | No real Preview-chain/cloud-QA/customer evidence | All required predecessors, privacy/adverse cases, actual Browser Use entitlement, supported-wallet/usability evidence and runbook |
| 6 — wave submission; M-12 | PENDING | Product/QA | Source publication is not a hackathon submission | Exact submitted SHA, compiler evidence, safe demo, requirements and organizer eligibility clarification |
| 7 — limited pilot / repeatable product; R4/R5 | PENDING | Product/business/operator | No live users, payments, retention or business results claimed | Explicit live authorization, approved policies, operating capacity and observed customer economics |

## Deferred and reactivated work

| Work | Status / reason | Reclaim trigger | Owner / permitted scope |
| --- | --- | --- | --- |
| B-10 DUST sponsorship | DEFERRED; funded baseline and B-09 have not passed | First optional next-phase candidate after those pass and cost/privacy/consent are approved | Integration; one exact adapter/profile, depletion/tamper/expiry/replay tests; no silent user-paid fallback |
| B-08/M-13 public archive | DEFERRED; no core evidence bundle or publication approval | Core verification, concrete portability need and explicit synthetic publication/fee approval | Integration/operator; no private files or Convex replacement |
| EffectStream observer | DEFERRED; no measured observation/history gap | Demonstrated gap and a better tested total operating cost | Integration; isolated derived observer, not consensus authority |
| Mobile/Kuira, review inference | DEFERRED; unnecessary for the first web slice, unverified budgets/safety | Actual customer need and exact compatibility/privacy/allowance evidence | Product/integration; separate bounded experiments |
| Heavy 3D/M-14 launch film | DEFERRED; protocol and task clarity first | R3 plus measured UX benefit or approved media/rights packet | UI/media; static/reduced-motion fallback |

**Reactivation history:** none. Starting the already-planned UI prototype is not a reclaimed deferral. No optional integration is silently enabled by adding a dependency or an upstream announcement.

## Evidence ledger

| Date / artifact | Kind | Result and limitation |
| --- | --- | --- |
| 2026-09-07 planning changes | Source/documentation | Public documentation and package-source checks, not SDK execution; independent review addressed |
| 2026-09-07 UI implementation | Local implementation | [Implementation checkpoint `6acd3a4`](https://github.com/amolikpe-bit/milo/commit/6acd3a4531a851f8fea836f31149de6621a4425e): local checks and asserted browser flows passed; details, artifact limits and remaining tests in [VERIFICATION.md](VERIFICATION.md) |

**Ongoing work:** the real local contract/environment milestone has started; it is not complete. **Blocked readiness:** R1 requires real local network execution in addition to compilation; R3 also requires configured isolated provider environments, a supported wallet/prover/cohort decision, real protocol/payment/recovery evidence and the external approvals in stages 2–7. The existing organizer/network discrepancies are not resolved by implementation work.

**Capture limitation:** screenshots were inspected and contain synthetic data only. Live DOM assertions passed; recording attempts did not reliably register the same interactions and were stopped/reported to the platform. Failed clips are not published as end-to-end proof.

## Publication discipline

Commit bounded checkpoints with a matching changelog and evidence entry. Do not merge or release automatically. The current platform's prescribed stacked branch name conflicts with Git's parent ref; this was reported to the platform. Until a valid stack namespace is available, keep independently reviewable commits on the authorized thread branch in PR #1 rather than inventing a branch or claiming a stack exists.

Use `PENDING → ONGOING → DONE`, `ONGOING → BLOCKED`, or `DEFERRED → REACTIVATED → ONGOING` explicitly. Each status change names its test/evidence, remaining limitations and dependent stages. Never rename B-01–B-11, MID-P1–P6 or MID-T01–T14.
