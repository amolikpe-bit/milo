# Synthetic prototype verification — 7 September 2026

**Scope: R0 UI prototype only.** This is not R1 contract evidence, a passed M-01–M-11 integration cohort, a security audit, or an MVP release. MID provider/operation counters remain **0/6 and 0/14**.

## Local checks

| Check | Observed result | Boundary |
| --- | --- | --- |
| `bun run setup` | Exact project-local Bun 1.4.2; frozen lockfile install succeeds | Frontend dependencies only; no Docker, Compact, provider credentials or real infrastructure provisioned |
| `bun run lint` | Biome formatting/lint passes without warnings or suppressions | Not a security review |
| `bun run typecheck` | Strict TypeScript passes | No generated contract/backend types exist yet |
| `bun run test:unit` | 14 tests, 79 assertions pass | Pure synthetic guards and pinned original PNG fixtures; not integration tests |
| `bun run build` | Static HTML/JS/CSS/assets generated; informational and sample-route entries configured | No Cloudflare deployment performed; output is not a second API service |
| Structural document check | Numbered-document links, references, fences and preserved baseline requirement IDs checked | Source/structural evidence, not runtime-gate closure |
| CI | Check workflow added for setup/lint/typecheck/unit/build | Remote CI result not assumed from local commands |

The public entry contains readable proposition/links/images in HTML and no React hydration requirement. Bun emits an empty public JavaScript entry; the interactive application has its own bundle. No Privy, Convex, Stripe, Midnight or Browser Use SDK is installed prematurely. `axe-core` is exposed only by the development server's `/__qa/axe.js` route; the static production build does not include that diagnostic endpoint or package.

## Browser assertions

Executed against the managed native Bun development server in the in-sandbox browser, using fictional participants and generated artwork:

| Flow / negative control | Result |
| --- | --- |
| New merchant quote | Edited title and $420 sample amount survive form-action submission into the buyer quote; no invitation or persistent order created |
| Fresh order | Explicit readiness → authorization → deployment → reservation; merchant accepts, then submits the sample pack |
| File identity | All three downloaded PNGs match their pinned SHA-256 digests; binary headers/dimensions also checked in unit tests |
| Failed recheck | Aborted one sample-file request after a prior successful check; old verification is revoked and approval stays disabled |
| Approval consent | Confirmation is disabled until acknowledgment; actual approval remains separate from the authorized sample hold |
| Receipt | Shows `APPROVED` alongside `Sample authorized`, not an invented payment success; export schema is synthetic-only |
| Payment | Operator simulation explicitly captures after approval; cancellation does not silently void the hold |
| Dispute | Buyer opens a sample dispute; pre-agreed operator can fully cancel; separate hold release remains explicit |
| Expired hold | Local bytes may match, but the Milo sample approval workflow stays blocked; expiry does not rewrite the protocol phase |
| Unknown outcome | Capture unavailable until explicit sample reconciliation; checking does not automatically repeat capture |
| Lost capability | Reading remains possible; labeled synthetic restore permits continuing the existing reservation, not a new wallet/account claim |
| Keyboard | Arrow-key tab navigation retains focus after rendering; Escape closes the image dialog and returns focus to its opener |
| Responsive | 320 CSS-pixel workspace has no horizontal overflow; current task precedes delivery in both DOM and mobile presentation |

The browser driver's immediate batch actions sometimes ran before a React/Radix update settled. Assertions were repeated after waiting for the actual rendered control; a tool saying “clicked” was not accepted as proof. The final normal-browser approval/receipt assertions passed. This is local browser evidence, **not** Browser Use Cloud/B-05, real-wallet acceptance or the B-11 human comprehension study.

## Accessibility and visual evidence

- Fresh desktop landing/workspace and 320px workspace screenshots were inspected. All displayed people, studios, orders, amounts and artwork are synthetic; no credentials or customer data appear.
- Axe 4.13.0 reported **zero automated violations** on the sampled landing, desktop workspace and 320px workspace after landmark fixes. `color-contrast` remains an **incomplete/manual-review** result. Do not present this as full WCAG conformance.
- Focus restoration and stable component identities were corrected after review. Full screen-reader, 200% zoom, all error states, real-wallet prompts and human usability tests remain pending.
- There is **no before-app screenshot**: base commit `45c000e14eba0a332ad28e99ec4ce7a8c974ee02` contains planning documents, not a runnable UI. Fabricating a baseline would be misleading.
- **Video blocker:** two recording attempts failed to reproduce the otherwise passing interaction reliably. Recorded clicks sometimes reported success while the expected state did not change; an enabled-control wait timed out. The same byte-check/approval flow worked outside capture. The cause remains unconfirmed and was reported to the platform. Both captures were stopped; neither is published as a successful flow recording.

## Remaining release blockers

Real Compact compilation and adversarial vectors; supported chain/compiler/provider cohort; independent actor wallets and encrypted order recovery; Privy/Convex membership and private-byte authorization; Stripe signed events, actual hold window and reconciliation; actual hosted deployment and cloud QA allowance; privacy canaries, operational recovery and user comprehension; organizer/merchant/legal/live-provider approvals. Optional sponsorship and other partner experiments remain deferred under the canonical gates.

See [PROGRESS_MANIFEST.md](PROGRESS_MANIFEST.md) for status transitions, remaining scope and deferral/reactivation rules. No simulated success closes a parent milestone.
