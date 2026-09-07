import { Dialog, Tabs } from "radix-ui";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { z } from "zod";
import {
  type Action,
  availableActions,
  changeRole,
  createScenario,
  invalidateFileVerification,
  type Role,
  type Scenario,
  type SimState,
  transition,
} from "../../../packages/domain/src/prototype";
import { sampleFiles, verifySampleFiles } from "./assets";

const originalQuote = {
  name: "Still — a quieter kind of care",
  brief:
    "A considered three-image product pack for Still Studio. Warm natural tones, sculptural composition and a clear focus on the ceramic vessel. One hero, one detail and one collection image.",
  amount: 360,
};
const quoteSchema = z.object({
  name: z.string().trim().min(5).max(80),
  brief: z.string().trim().min(20).max(500),
  amount: z.coerce.number().int().min(1).max(5000),
});
const scenarios: { value: Scenario; label: string }[] = [
  { value: "review", label: "Delivery ready to review" },
  { value: "fresh", label: "Start with the quote" },
  { value: "dispute", label: "Dispute needs a decision" },
  { value: "expired", label: "Payment hold expired" },
  { value: "pending", label: "Outcome unknown" },
  { value: "lost-capability", label: "Capability unavailable" },
];
const phaseLabels: Record<SimState["phase"], string> = {
  DRAFT: "Ready when you are",
  DEPLOYED: "Reservation unfinished",
  RESERVED: "Waiting for the studio",
  ACCEPTED: "Good work is underway",
  SUBMITTED: "Your delivery is ready.",
  DISPUTED: "Let’s find a clear resolution.",
  APPROVED: "A deliberate yes.",
  CANCELLED: "This order is closed.",
};
const roleNames: Record<Role, string> = {
  buyer: "Alex · Still Studio",
  merchant: "North Studio",
  operator: "Resolution operator",
};
const actionLabels: Partial<Record<Action, string>> = {
  ready: "Simulate setup readiness",
  authorize: "Simulate payment hold",
  deploy: "Simulate bootstrap deployment",
  reserve: "Reserve sample terms",
  accept: "Accept the sample order",
  submit: "Submit the sample delivery",
  approve: "Approve the sample delivery",
  dispute: "Open a sample dispute",
  "resolve-approve": "Resolve: approve delivery",
  "resolve-cancel": "Resolve: cancel order",
  cancel: "Cancel reservation",
  capture: "Simulate payment capture",
  void: "Simulate releasing the hold",
  reconcile: "Recheck sample outcome",
  restore: "Simulate capability restore",
};
function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="icon" aria-hidden="true">
      {children}
    </span>
  );
}
function Badge({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`panel ${className}`}>{children}</section>;
}

function useModel() {
  const [state, setState] = useState(() => createScenario("review"));
  const stateRef = useRef(state);
  const [quote, setQuote] = useState(originalQuote);
  const [scenario, setScenario] = useState<Scenario>("review");
  const [notice, setNotice] = useState("");
  const [checking, setChecking] = useState(false);
  const [modal, updateModal] = useState<
    "approve" | "dispute" | "evidence" | "image" | null
  >(null);
  const [activeImage, setActiveImage] = useState(0);
  const [consent, setConsent] = useState(false);
  const [reason, setReason] = useState("");
  const [tab, setTab] = useState("delivery");
  const generation = useRef(0);
  const request = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const mainHeading = useRef<HTMLHeadingElement>(null);
  const modalOrigin = useRef<HTMLElement | null>(null);
  function setModal(value: typeof modal) {
    if (value && !modal && document.activeElement instanceof HTMLElement) {
      modalOrigin.current = document.activeElement;
    }
    updateModal(value);
  }
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(quote.amount);
  const actions = availableActions(state);
  const can = (action: Action) => actions.includes(action);

  function commit(next: SimState) {
    stateRef.current = next;
    setState(next);
  }
  function invalidate() {
    generation.current++;
    request.current?.abort();
    setChecking(false);
    setModal(null);
    setConsent(false);
    setNotice("");
  }
  function reset(value: Scenario) {
    invalidate();
    setScenario(value);
    setQuote(originalQuote);
    setTab("delivery");
    commit(createScenario(value));
  }
  function chooseRole(role: Role) {
    invalidate();
    commit(changeRole(stateRef.current, role));
  }
  function act(action: Action) {
    try {
      commit(transition(stateRef.current, action));
      setNotice(
        `${actionLabels[action] ?? "Sample updated"}. Simulation only; no external action occurred.`,
      );
      setModal(null);
      setConsent(false);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "That action is not available.",
      );
    }
  }
  async function checkFiles() {
    commit(invalidateFileVerification(stateRef.current));
    const current = ++generation.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setChecking(true);
    setNotice("Checking the three downloaded sample files…");
    try {
      const ids = await verifySampleFiles(controller.signal);
      if (generation.current !== current) return;
      commit(transition(stateRef.current, "verify", { verifiedFileIds: ids }));
      setNotice(
        "All three sample files match their pinned SHA-256 digests. This checks bytes, not quality or a blockchain commitment.",
      );
    } catch (error) {
      if (generation.current === current)
        setNotice(
          error instanceof Error
            ? error.message
            : "Could not check these files.",
        );
    } finally {
      if (generation.current === current) setChecking(false);
    }
  }
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    document.title = `Milo — ${location.pathname === "/demo" ? "sample workspace" : "prototype"}`;
    mainHeading.current?.focus();
  }, [location.pathname]);

  function exportReceipt() {
    const data = {
      environment: "synthetic-ui-prototype",
      notAChainReceipt: true,
      order: "sample-001",
      quote,
      phase: state.phase,
      payment: state.payment,
      sampleBytesChecked: state.filesVerified,
      revision: state.revision,
      files: sampleFiles.map(({ name, hash }) => ({ name, sha256: hash })),
      limitations: [
        "No real authentication, wallet, proof, chain transaction or payment.",
        "Sample file digests are pinned locally, not committed to Midnight.",
        "No customer data or private-state backup is included.",
      ],
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "milo-sample-receipt.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(
      "Sample receipt downloaded. This is not blockchain or payment evidence.",
    );
  }
  function evidence() {
    setModal("evidence");
  }

  return {
    state,
    quote,
    setQuote,
    scenario,
    setScenario,
    notice,
    checking,
    modal,
    setModal,
    activeImage,
    setActiveImage,
    consent,
    setConsent,
    reason,
    setReason,
    tab,
    setTab,
    navigate,
    mainHeading,
    modalOrigin,
    money,
    can,
    commit,
    invalidate,
    reset,
    chooseRole,
    act,
    checkFiles,
    exportReceipt,
    evidence,
  };
}

const WorkspaceContext = createContext<ReturnType<typeof useModel> | null>(
  null,
);
function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Missing prototype workspace context");
  return value;
}

function RoleRequired({
  requiredRole: role,
  children,
}: {
  requiredRole: Role;
  children: ReactNode;
}) {
  const { state, chooseRole } = useWorkspace();
  return state.role === role ? (
    children
  ) : (
    <Panel className="reading-panel">
      <span className="eyebrow">EXPLORE ANOTHER PERSPECTIVE</span>
      <h2>This is the {role} view.</h2>
      <p>
        The prototype lets you switch synthetic roles. In the real product,
        membership and independent capabilities must authorize access.
      </p>
      <button type="button" className="button" onClick={() => chooseRole(role)}>
        Explore the {role} perspective
      </button>
    </Panel>
  );
}
function Progress() {
  const { state } = useWorkspace();
  const index = [
    "DRAFT",
    "DEPLOYED",
    "RESERVED",
    "ACCEPTED",
    "SUBMITTED",
    "APPROVED",
  ].indexOf(state.phase);
  return (
    <ol className="progress-track" aria-label="Sample order progress">
      {["Agreement", "In the studio", "Your review", "Approval"].map(
        (label, i) => (
          <li
            key={label}
            className={
              state.phase === "CANCELLED" || state.phase === "DISPUTED"
                ? ""
                : index >= i + 2
                  ? "reached"
                  : ""
            }
          >
            <span>{i + 1}</span>
            {label}
          </li>
        ),
      )}
    </ol>
  );
}
function Scope() {
  const { quote, money } = useWorkspace();
  return (
    <div className="scope-content">
      <span className="eyebrow">THE AGREEMENT · SAMPLE 001</span>
      <h2>{quote.name}</h2>
      <p>{quote.brief}</p>
      <dl className="detail-grid">
        <div>
          <dt>Deliverables</dt>
          <dd>Three final PNG images</dd>
        </div>
        <div>
          <dt>Fixed price</dt>
          <dd>{money} USD · one pack</dd>
        </div>
        <div>
          <dt>Creative partner</dt>
          <dd>North Studio</dd>
        </div>
        <div>
          <dt>Commissioned by</dt>
          <dd>Still Studio · Alex</dd>
        </div>
        <div>
          <dt>Usage</dt>
          <dd>Website & organic social · sample terms</dd>
        </div>
        <div>
          <dt>Review deadline</dt>
          <dd>10 Sep 2026, 16:00 UTC · sample clock</dd>
        </div>
        <div>
          <dt>Resolution</dt>
          <dd>Pre-agreed operator · full approval or cancellation</dd>
        </div>
        <div>
          <dt>Delivery policy</dt>
          <dd>One fixed submission; no replacement or revision rounds</dd>
        </div>
      </dl>
      <div className="soft-note">
        In a real order, frozen terms and delivery commitments belong to the
        protocol. This prototype records neither on a blockchain.
      </div>
    </div>
  );
}
function Timeline() {
  const { state } = useWorkspace();
  return (
    <div className="timeline">
      <span className="eyebrow">
        SAMPLE ACTIVITY · NOT EXTERNAL OBSERVATIONS
      </span>
      {[...state.events].reverse().map((event) => (
        <div className="timeline-item" key={event.id}>
          <span className="timeline-dot" />
          <div>
            <strong>{event.label}</strong>
            <p>{event.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
function PaymentPanel() {
  const { state, money, can, act } = useWorkspace();
  return (
    <Panel className="payment-panel">
      <div className="panel-heading">
        <h3>Payment, separately</h3>
        <Icon>↗</Icon>
      </div>
      <div className="payment-total">
        {money}
        <span>USD</span>
      </div>
      <Badge
        tone={
          state.payment === "expired" || state.payment === "failed"
            ? "warning"
            : state.payment === "captured"
              ? "success"
              : ""
        }
      >
        {state.payment === "none"
          ? "No payment attempt"
          : `Sample ${state.payment}`}
      </Badge>
      <p>
        {state.payment === "authorized"
          ? "A simulated hold—not a charge. Approval and capture are separate steps."
          : state.payment === "captured"
            ? "Sample capture recorded separately. No real money moved."
            : state.payment === "expired"
              ? "The sample hold expired. This does not cancel or reopen the order."
              : "Payment status never determines the contract phase."}
      </p>
      {can("capture") && (
        <button
          className="button secondary full"
          type="button"
          onClick={() => act("capture")}
        >
          Simulate capture
        </button>
      )}
      {can("void") && (
        <button
          className="button secondary full"
          type="button"
          onClick={() => act("void")}
        >
          Simulate releasing hold
        </button>
      )}
      <span className="micro muted">Stripe is not connected.</span>
    </Panel>
  );
}
function ActionPanel() {
  const {
    state,
    can,
    act,
    checking,
    checkFiles,
    setConsent,
    setModal,
    setReason,
    chooseRole,
  } = useWorkspace();
  return (
    <Panel className="action-panel">
      <div className="panel-heading">
        <span className="eyebrow">YOUR NEXT STEP</span>
        <span className="little-star" aria-hidden="true">
          ✳
        </span>
      </div>
      {state.outcomeUnknown ? (
        <>
          <h2>Let’s check before retrying.</h2>
          <p>
            A submitted request may have succeeded. Keep its identity; don’t
            submit another.
          </p>
          <button
            type="button"
            className="button full"
            onClick={() => act("reconcile")}
          >
            Recheck sample outcome
          </button>
        </>
      ) : !state.capabilityAvailable ? (
        <>
          <h2>Your capability is unavailable.</h2>
          <p>
            Reading is still possible. Signing in again cannot restore an order
            capability.
          </p>
          <button
            type="button"
            className="button full"
            onClick={() => act("restore")}
          >
            Simulate a local restore
          </button>
          <p className="micro">
            No actual backup is created or recovered here.
          </p>
        </>
      ) : state.phase === "SUBMITTED" && state.role === "buyer" ? (
        <>
          <h2>Take a closer look.</h2>
          <p>
            Review all three images against the agreed scope. A good decision
            starts with the actual files.
          </p>
          <div className="check-list">
            <span>
              <Icon>✓</Icon>Three final images
            </span>
            <span>
              <Icon>✓</Icon>One fixed sample delivery
            </span>
            <span>
              <Icon>{state.filesVerified ? "✓" : "○"}</Icon>
              {state.filesVerified
                ? "Sample bytes match"
                : "Sample byte check required"}
            </span>
          </div>
          <button
            type="button"
            className={`button ${state.filesVerified ? "secondary" : ""} full`}
            disabled={checking}
            onClick={checkFiles}
          >
            {checking
              ? "Checking sample files…"
              : state.filesVerified
                ? "Check sample bytes again"
                : "Check the three sample files"}
          </button>
          <button
            type="button"
            className="button full"
            disabled={!can("approve") || checking}
            onClick={() => {
              setConsent(false);
              setModal("approve");
            }}
          >
            Approve delivery <span aria-hidden="true">↗</span>
          </button>
          <button
            type="button"
            className="quiet-button full"
            onClick={() => {
              setReason("");
              setModal("dispute");
            }}
          >
            Something isn’t right?
          </button>
        </>
      ) : state.phase === "APPROVED" ? (
        <>
          <h2>The sample delivery is approved.</h2>
          <p>
            That records an approval, not payment success. Check the separate
            payment result below.
          </p>
          <Link className="button full" to="/orders/sample-001/receipt">
            View sample receipt ↗
          </Link>
          {state.payment === "authorized" && state.role !== "operator" && (
            <button
              type="button"
              className="quiet-button full"
              onClick={() => chooseRole("operator")}
            >
              Explore payment reconciliation
            </button>
          )}
        </>
      ) : state.phase === "CANCELLED" ? (
        <>
          <h2>A clear end to this order.</h2>
          <p>
            Cancellation is terminal. Any payment hold or financial incident
            still needs its own reconciliation.
          </p>
          <Link
            className="button secondary full"
            to="/orders/sample-001/receipt"
          >
            View the sample record
          </Link>
        </>
      ) : state.phase === "DISPUTED" ? (
        <>
          <h2>A considered resolution.</h2>
          <p>
            The pre-agreed operator reviews the evidence. Only full approval or
            full cancellation is in scope.
          </p>
          {state.role === "operator" ? (
            <>
              <button
                type="button"
                className="button full"
                disabled={!can("resolve-approve")}
                onClick={() => act("resolve-approve")}
              >
                Resolve: approve delivery
              </button>
              <button
                type="button"
                className="button secondary full"
                disabled={!can("resolve-cancel")}
                onClick={() => act("resolve-cancel")}
              >
                Resolve: cancel order
              </button>
            </>
          ) : (
            <button
              type="button"
              className="button secondary full"
              onClick={() => chooseRole("operator")}
            >
              Explore operator perspective
            </button>
          )}
        </>
      ) : (
        <>
          <h2>
            {state.phase === "ACCEPTED"
              ? "In good hands."
              : state.phase === "RESERVED"
                ? "Over to the studio."
                : "A thoughtful beginning."}
          </h2>
          <p>
            {state.phase === "ACCEPTED"
              ? "North Studio is preparing the three-image pack. The sample files are original generated artwork."
              : state.phase === "RESERVED"
                ? "The merchant must accept the fixed scope before starting work."
                : "Review the quote and the separate setup, hold and reservation steps."}
          </p>
          {(["accept", "submit", "cancel"] as Action[])
            .filter(can)
            .map((action) => (
              <button
                type="button"
                key={action}
                className="button full"
                onClick={() => act(action)}
              >
                {actionLabels[action]}
              </button>
            ))}
          {(state.phase === "DRAFT" || state.phase === "DEPLOYED") && (
            <Link className="button full" to="/quotes/sample-001">
              Prepare this sample order ↗
            </Link>
          )}
          {state.phase === "RESERVED" && state.role === "buyer" && (
            <button
              type="button"
              className="quiet-button full"
              onClick={() => chooseRole("merchant")}
            >
              Explore merchant perspective
            </button>
          )}
          {state.phase === "ACCEPTED" && can("dispute") && (
            <button
              type="button"
              className="quiet-button full"
              onClick={() => {
                setReason("");
                setModal("dispute");
              }}
            >
              Open a sample dispute
            </button>
          )}
        </>
      )}
      <div className="action-footnote">
        <Icon>◇</Icon> Prototype actions only. No wallet prompts.
      </div>
    </Panel>
  );
}
function OrderView() {
  const {
    state,
    quote,
    mainHeading,
    evidence,
    tab,
    setTab,
    setActiveImage,
    setModal,
  } = useWorkspace();
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumbs">
            <Link to="/orders">Your orders</Link>
            <span>/</span>
            <span>Sample 001</span>
          </div>
          <h1 tabIndex={-1} ref={mainHeading}>
            {phaseLabels[state.phase]}
          </h1>
          <p>
            {quote.name} <span className="dot-divider">·</span> Made by North
            Studio
          </p>
        </div>
        <button
          type="button"
          className="button secondary small"
          onClick={evidence}
        >
          <Icon>◇</Icon>Sample evidence
        </button>
      </div>
      <Progress />
      <div className="workspace-grid order-layout">
        <aside className="primary-action" aria-label="Order actions">
          <ActionPanel />
        </aside>
        <div className="work-column">
          <Panel className="delivery-panel">
            <Tabs.Root value={tab} onValueChange={setTab}>
              <Tabs.List className="tabs" aria-label="Order information">
                <Tabs.Trigger value="delivery">
                  Delivery <span>03</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="scope">Agreed scope</Tabs.Trigger>
                <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="delivery">
                <div className="delivery-heading">
                  <div>
                    <span className="eyebrow">THE THREE-IMAGE PACK</span>
                    <h2>A little more stillness.</h2>
                  </div>
                  <Badge tone="neutral">Original sample artwork</Badge>
                </div>
                <div className="image-grid">
                  {sampleFiles.map((file, i) => (
                    <button
                      type="button"
                      className={`image-card image-${i}`}
                      key={file.id}
                      onClick={() => {
                        setActiveImage(i);
                        setModal("image");
                      }}
                      aria-label={`Inspect ${file.title}`}
                    >
                      <div className="image-wrap">
                        <img
                          src={file.src}
                          alt={`Synthetic Still vessel illustration — ${file.title.toLowerCase()}`}
                          width="600"
                          height="720"
                        />
                        <span className="image-expand" aria-hidden="true">
                          ↗
                        </span>
                        <span className="image-number">{file.id}</span>
                      </div>
                      <div className="image-description">
                        <strong>{file.title}</strong>
                        <span>{file.note}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="delivery-bottom">
                  <p>
                    <Icon>◇</Icon>{" "}
                    {state.filesVerified
                      ? "All three sample files match their pinned bytes."
                      : "Inspect every image, then check the sample bytes."}
                  </p>
                  <span>PNG · 3 files · synthetic</span>
                </div>
                {!["SUBMITTED", "DISPUTED", "APPROVED"].includes(
                  state.phase,
                ) && (
                  <div className="soft-note">
                    These are reference sample images, not a delivery submitted
                    at this phase.
                  </div>
                )}
              </Tabs.Content>
              <Tabs.Content value="scope">
                <Scope />
              </Tabs.Content>
              <Tabs.Content value="activity">
                <Timeline />
              </Tabs.Content>
            </Tabs.Root>
          </Panel>
          <div className="studio-note">
            <span className="studio-avatar">n.</span>
            <div>
              <strong>
                A note from North Studio{" "}
                <span className="micro muted">· fictional studio</span>
              </strong>
              <p>
                “Warm light, quiet shapes, room to breathe. Each composition is
                built around the same vessel, so the collection feels like one
                thoughtful story.”
              </p>
            </div>
          </div>
          <div className="privacy-inline">
            <Icon>◇</Icon>
            <p>
              <strong>Private is a boundary, not a blanket promise.</strong>{" "}
              Real files would be visible to authorized participants and Milo.
              This sample has no private customer data.{" "}
              <Link to="/privacy">Who sees what →</Link>
            </p>
          </div>
        </div>
        <aside
          className="payment-summary"
          aria-label="Independent payment status"
        >
          <PaymentPanel />
        </aside>
      </div>
    </>
  );
}
function QuoteView() {
  const { state, chooseRole, can, act, navigate } = useWorkspace();
  return (
    <>
      <PageTitle
        eyebrow="THE START OF SOMETHING GOOD"
        title="A clear scope, before you begin."
      />
      <div className="workspace-grid">
        <Panel>
          <Scope />
        </Panel>
        <aside
          className="action-column"
          aria-label="Order preparation and payment"
        >
          <Panel className="action-panel">
            <span className="eyebrow">PREPARE THE SAMPLE</span>
            <h2>One step at a time.</h2>
            <p>
              No account, wallet or card is connected. Each button demonstrates
              a separate prerequisite.
            </p>
            <ol className="setup-list">
              <li>Read and acknowledge the terms</li>
              <li>Wallet, proving and local recovery readiness</li>
              <li>Separate payment authorization</li>
              <li>Checked deployment, then reservation</li>
            </ol>
            {state.role !== "buyer" ? (
              <button
                className="button full"
                type="button"
                onClick={() => chooseRole("buyer")}
              >
                Explore buyer setup
              </button>
            ) : (
              (["ready", "authorize", "deploy", "reserve"] as Action[])
                .filter(can)
                .map((action) => (
                  <button
                    className="button full"
                    type="button"
                    key={action}
                    onClick={() => {
                      act(action);
                      if (action === "reserve") navigate("/orders/sample-001");
                    }}
                  >
                    {actionLabels[action]}
                  </button>
                ))
            )}
            {!["DRAFT", "DEPLOYED"].includes(state.phase) && (
              <Link to="/orders/sample-001" className="button full">
                Return to this sample order
              </Link>
            )}
            <div className="soft-note">
              No keys or backup files are created. A real hold must not precede
              safe wallet/recovery readiness.
            </div>
          </Panel>
          <PaymentPanel />
        </aside>
      </div>
    </>
  );
}
function Orders({ merchant = false }: { merchant?: boolean }) {
  const { state, quote, money } = useWorkspace();
  return (
    <>
      <PageTitle
        eyebrow={
          merchant ? "NORTH STUDIO · SAMPLE QUEUE" : "YOUR CREATIVE WORK"
        }
        title={
          merchant
            ? "Room for good work."
            : "A little clarity, all in one place."
        }
      />
      <div className="list-toolbar">
        <span className="muted">
          1 sample order · not live customer activity
        </span>
        {merchant && (
          <Link className="button small" to="/merchant/quotes/new">
            Prepare a sample quote ↗
          </Link>
        )}
      </div>
      <Link to="/orders/sample-001" className="order-list-card">
        <img
          src={sampleFiles[0].src}
          alt="Still sample product illustration"
          width="104"
          height="120"
        />
        <div>
          <span className="eyebrow">SAMPLE 001 · NORTH STUDIO</span>
          <h2>{quote.name}</h2>
          <p>Three-image pack · {money} USD</p>
        </div>
        <Badge>{state.phase.toLowerCase()}</Badge>
        <span className="list-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
      <p className="micro muted">
        Refresh resets the prototype. No order is saved to an account or
        service.
      </p>
    </>
  );
}
function Receipt() {
  const { state, quote, money, exportReceipt } = useWorkspace();
  return (
    <>
      <PageTitle
        eyebrow="A RECORD OF THE DECISION"
        title="Clear about what happened."
      />
      <Panel className="reading-panel receipt">
        <div className="receipt-mark" aria-hidden="true">
          m
        </div>
        <Badge>Sample receipt · not proof of payment</Badge>
        <h2>{quote.name}</h2>
        <dl className="detail-grid">
          <div>
            <dt>Order phase</dt>
            <dd>{state.phase}</dd>
          </div>
          <div>
            <dt>Payment observation</dt>
            <dd>Sample {state.payment}</dd>
          </div>
          <div>
            <dt>Agreed amount</dt>
            <dd>{money} USD</dd>
          </div>
          <div>
            <dt>Sample file bytes</dt>
            <dd>
              {state.filesVerified
                ? "Locally checked"
                : "Not checked in this actor context"}
            </dd>
          </div>
          <div>
            <dt>Network / transaction</dt>
            <dd>None · simulator only</dd>
          </div>
          <div>
            <dt>Sample revision</dt>
            <dd>{state.revision}</dd>
          </div>
        </dl>
        <p>
          There is no Midnight proof, Stripe confirmation or private-state
          backup in this export. It is a portable record of the prototype state
          only.
        </p>
        <button type="button" className="button" onClick={exportReceipt}>
          Download sample receipt ↓
        </button>
      </Panel>
    </>
  );
}
function NewQuote() {
  const { quote, invalidate, commit, setQuote, setScenario, navigate } =
    useWorkspace();
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(() => ({
    ...quote,
    amount: String(quote.amount),
  }));
  return (
    <RoleRequired requiredRole="merchant">
      <PageTitle
        eyebrow="A BOUNDED CREATIVE AGREEMENT"
        title="Make the scope unmistakable."
      />
      <Panel className="reading-panel">
        <form
          action={(data) => {
            const result = quoteSchema.safeParse(Object.fromEntries(data));
            if (!result.success) {
              setError(
                "Use a title of 5–80 characters, a brief of 20–500 characters, and a whole-dollar price from $1 to $5,000.",
              );
              return;
            }
            invalidate();
            commit(createScenario("fresh"));
            setQuote(result.data);
            setScenario("fresh");
            navigate("/quotes/sample-001");
          }}
        >
          <label className="field">
            Project title
            <input
              name="name"
              required
              minLength={5}
              maxLength={80}
              value={draft.name}
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
            />
          </label>
          <label className="field">
            The agreed creative brief
            <textarea
              name="brief"
              required
              minLength={20}
              maxLength={500}
              rows={5}
              value={draft.brief}
              onChange={(event) =>
                setDraft({ ...draft, brief: event.target.value })
              }
            />
          </label>
          <div className="form-pair">
            <label className="field">
              Fixed price (USD)
              <input
                name="amount"
                type="number"
                required
                min={1}
                max={5000}
                step={1}
                value={draft.amount}
                onChange={(event) =>
                  setDraft({ ...draft, amount: event.target.value })
                }
              />
            </label>
            <div className="field">
              Deliverables
              <strong className="fixed-field">
                Exactly three final PNG images
              </strong>
            </div>
          </div>
          <p className="soft-note">
            This creates a new in-memory sample draft and switches to the
            synthetic buyer view. No invitation is sent. Recipients, rights and
            sample deadlines remain fixed.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button">
            Review the sample quote ↗
          </button>
        </form>
      </Panel>
    </RoleRequired>
  );
}
function Account() {
  const { state, reset, navigate } = useWorkspace();
  return (
    <>
      <PageTitle
        eyebrow="ACCESS IS NOT AUTHORITY"
        title="Your place in the process."
      />
      <Panel className="reading-panel">
        <Badge>Sample identity only</Badge>
        <h2>{roleNames[state.role]}</h2>
        <p>
          No account is authenticated. The planned product uses one Privy
          sign-in; wallet permission is a separate contextual action, not
          another Milo login.
        </p>
        <div className="boundary-cards">
          <div>
            <h3>Wallet recovery</h3>
            <p>Restores what the supported wallet actually backs up.</p>
          </div>
          <div>
            <h3>Order capability</h3>
            <p>
              Requires the actor’s own encrypted, order-scoped private state.
              Email reset cannot recreate it.
            </p>
          </div>
          <div>
            <h3>Application records</h3>
            <p>
              Convex restore concerns authorized app records and files, not
              wallet seeds or role secrets.
            </p>
          </div>
        </div>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            reset("lost-capability");
            navigate("/orders/sample-001");
          }}
        >
          Explore lost-capability recovery
        </button>
      </Panel>
    </>
  );
}
function PageTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  const { mainHeading } = useWorkspace();
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 tabIndex={-1} ref={mainHeading}>
          {title}
        </h1>
      </div>
    </div>
  );
}
function InfoPage({
  kind,
}: {
  kind: "privacy" | "terms" | "pilot" | "how-it-works" | "sign-in";
}) {
  const content = {
    privacy: {
      title: "Private, with clear boundaries.",
      intro:
        "This UI prototype uses original synthetic files and in-memory sample state. No sign-in, payment, wallet or customer data is collected by application code.",
      items: [
        [
          "In the planned product",
          "Milo and authorized order participants can access protected records and files. A chosen remote prover receives private proof inputs. Public ledger fields can reveal timing and commitments.",
        ],
        [
          "In this prototype",
          "Sample images are public static assets. Interactions reset on refresh; nothing is written to local storage. The hosting environment may retain ordinary access logs under its own policy.",
        ],
        [
          "Not a production privacy policy",
          "Retention, deletion, support and real-user disclosures require review before any live pilot. This page explains current behavior, not legal readiness.",
        ],
      ],
    },
    terms: {
      title: "A prototype, not a live agreement.",
      intro:
        "You can explore the synthetic order flow. No purchase, commission, escrow, contract deployment or payment occurs.",
      items: [
        [
          "Fixed scope",
          "The proposed MVP is one bilateral fixed-price agreement and one delivery of three final images. No revisions, partial payouts or marketplace are included.",
        ],
        [
          "Two independent outcomes",
          "A valid approval would not guarantee successful payment, quality, ownership rights or lasting file availability.",
        ],
        [
          "Before real orders",
          "Reviewed terms, consent, merchant arrangements, safe recovery and operational readiness are required. This is not a substitute for those policies.",
        ],
      ],
    },
    pilot: {
      title: "A thoughtful start. Not an open launch.",
      intro:
        "The merchant pilot is not accepting enquiries or orders through this prototype. No contact form is connected and no email address is collected.",
      items: [
        [
          "The first service",
          "One invited studio, one buyer, one pre-agreed operator and a three-image product pack.",
        ],
        [
          "What comes first",
          "A compiling contract, safe wallet/recovery path, private-file access, payment reconciliation and independent usability evidence.",
        ],
        [
          "Explore without committing",
          "Use the sample to inspect the proposed experience. Nothing here guarantees future access or a delivery date.",
        ],
      ],
    },
    "how-it-works": {
      title: "Good work. A clear finish.",
      intro:
        "Agree a bounded scope, review the exact delivery and make a deliberate decision. The protocol and payment provider have different jobs.",
      items: [
        [
          "01 · Agree before committing",
          "Read the merchant, amount, scope, rights and deadlines. Real wallet/prover/recovery readiness must precede a payment hold, then checked deployment and reservation.",
        ],
        [
          "02 · Review the actual files",
          "The merchant accepts and submits one fixed delivery. The buyer verifies the downloaded bytes and reviews whether the work meets the agreement.",
        ],
        [
          "03 · Approve or raise a dispute",
          "Approval is a contract action, not immediate payment. Capture is reconciled separately; disputes use the pre-agreed operator. Timeouts require real actions, not UI timers.",
        ],
      ],
    },
    "sign-in": {
      title: "One account. A separate responsibility.",
      intro:
        "Privy sign-in is planned but not connected. This prototype deliberately does not ask for your email, OTP, wallet seed or card details.",
      items: [
        [
          "Explore with a sample identity",
          "Choose a synthetic buyer, merchant or operator using the prototype toolbar. This does not authenticate anyone.",
        ],
        [
          "In the planned application",
          "A verified session permits only authorized app access. Independent order capabilities still control protocol actions.",
        ],
        [
          "No secret collection",
          "Do not paste real credentials into prototypes or cloud agents. The sample needs none.",
        ],
      ],
    },
  }[kind];
  return (
    <>
      <PageTitle eyebrow="MILO · PRODUCT BOUNDARIES" title={content.title} />
      <Panel className="reading-panel">
        <p className="intro-copy">{content.intro}</p>
        {content.items.map(([heading, paragraph]) => (
          <section className="info-section" key={heading}>
            <h2>{heading}</h2>
            <p>{paragraph}</p>
          </section>
        ))}
        <Link className="button" to="/demo">
          Explore the sample ↗
        </Link>
      </Panel>
    </>
  );
}
function BoundOrder({ children }: { children: ReactNode }) {
  const params = useParams();
  return params.orderId === "sample-001" ||
    params.quoteId === "sample-001" ||
    params.caseId === "sample-001" ? (
    children
  ) : (
    <NotFound />
  );
}
function NotFound() {
  return (
    <>
      <PageTitle
        eyebrow="NOTHING TO OPEN HERE"
        title="Let’s get you back to the sample."
      />
      <Panel className="reading-panel">
        <p>
          This prototype only contains the synthetic sample order. A URL is not
          access permission.
        </p>
        <Link to="/demo" className="button">
          Open sample 001 ↗
        </Link>
      </Panel>
    </>
  );
}

export function App() {
  const model = useModel();
  return (
    <WorkspaceContext.Provider value={model}>
      <Shell />
    </WorkspaceContext.Provider>
  );
}

function Shell() {
  const {
    modalOrigin,
    mainHeading,
    state,
    scenario,
    reset,
    chooseRole,
    notice,
    modal,
    setModal,
    setConsent,
    activeImage,
    setActiveImage,
    consent,
    can,
    act,
    reason,
    setReason,
    exportReceipt,
    money,
    navigate,
  } = useWorkspace();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <aside className="sidebar" aria-label="Workspace navigation">
        <a className="wordmark" href="/">
          milo<span aria-hidden="true">✳</span>
        </a>
        <span className="sidebar-label">A CLEARER WAY TO WORK</span>
        <nav aria-label="Workspace">
          <NavLink to="/demo">
            <Icon>◈</Icon>Sample workspace
          </NavLink>
          <NavLink to="/orders">
            <Icon>▤</Icon>Your orders
          </NavLink>
          <NavLink to="/quotes/sample-001">
            <Icon>◇</Icon>The agreement
          </NavLink>
          <span className="nav-heading">OTHER PERSPECTIVES</span>
          <NavLink to="/merchant/orders">
            <Icon>▧</Icon>Studio queue
          </NavLink>
          <NavLink to="/operator/cases">
            <Icon>⚑</Icon>Resolution desk
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="sample-card">
            <span className="eyebrow">A SPACE TO EXPLORE</span>
            <p>
              All the clarity.
              <br />
              None of the commitment.
            </p>
            <a href="/how-it-works">How Milo is planned ↗</a>
          </div>
          <NavLink to="/account" className="account-link">
            <span className="avatar">
              {state.role === "buyer"
                ? "AS"
                : state.role === "merchant"
                  ? "NS"
                  : "OP"}
            </span>
            <span>
              <strong>{roleNames[state.role]}</strong>
              <small>Synthetic {state.role}</small>
            </span>
            <span aria-hidden="true">↗</span>
          </NavLink>
        </div>
      </aside>
      <div className="app-body">
        <header className="app-topbar">
          <span className="breadcrumb-brand">THE CREATIVE WORKSPACE</span>
          <div>
            <Badge tone="violet">
              <span className="tiny-dot" aria-hidden="true" /> UI prototype
            </Badge>
            <a href="/">Back to Milo ↗</a>
          </div>
        </header>
        <section className="prototype-toolbar" aria-label="Prototype controls">
          <p>
            <strong>Sample mode</strong>
            <span>No live account, chain or payment. Refresh resets.</span>
          </p>
          <div className="prototype-selects">
            <label>
              Scenario
              <select
                value={scenario}
                onChange={(event) => reset(event.target.value as Scenario)}
              >
                {scenarios.map((item) => (
                  <option value={item.value} key={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Perspective
              <select
                value={state.role}
                onChange={(event) => chooseRole(event.target.value as Role)}
              >
                <option value="buyer">Buyer</option>
                <option value="merchant">Merchant</option>
                <option value="operator">Operator</option>
              </select>
            </label>
            <button
              type="button"
              className="reset-button"
              onClick={() => reset(scenario)}
              aria-label="Reset this sample scenario"
            >
              ↺ <span>Reset</span>
            </button>
          </div>
        </section>
        <main id="workspace" className="workspace">
          <div
            className={`notice ${notice ? "visible" : ""}`}
            role="status"
            aria-live="polite"
          >
            {notice}
          </div>
          <Routes>
            <Route path="/demo" element={<OrderView />} />
            <Route path="/orders" element={<Orders />} />
            <Route
              path="/orders/:orderId"
              element={
                <BoundOrder>
                  <OrderView />
                </BoundOrder>
              }
            />
            <Route
              path="/orders/:orderId/receipt"
              element={
                <BoundOrder>
                  <Receipt />
                </BoundOrder>
              }
            />
            <Route
              path="/quotes/:quoteId"
              element={
                <BoundOrder>
                  <QuoteView />
                </BoundOrder>
              }
            />
            <Route
              path="/merchant/orders"
              element={
                <RoleRequired requiredRole="merchant">
                  <Orders merchant />
                </RoleRequired>
              }
            />
            <Route path="/merchant/quotes/new" element={<NewQuote />} />
            <Route
              path="/operator/cases"
              element={
                <RoleRequired requiredRole="operator">
                  <PageTitle
                    eyebrow="RESOLUTION DESK · SYNTHETIC"
                    title="An exception deserves attention."
                  />
                  <Panel className="reading-panel">
                    <h2>
                      {state.phase === "DISPUTED"
                        ? "One sample case needs a decision."
                        : "No disputed sample is selected."}
                    </h2>
                    <p>
                      The operator has only the pre-agreed resolution role, not
                      the buyer’s capability.
                    </p>
                    <button
                      type="button"
                      className="button"
                      onClick={() => {
                        reset("dispute");
                        navigate("/operator/cases/sample-001");
                      }}
                    >
                      Explore the sample dispute ↗
                    </button>
                  </Panel>
                </RoleRequired>
              }
            />
            <Route
              path="/operator/cases/:caseId"
              element={
                <BoundOrder>
                  <RoleRequired requiredRole="operator">
                    <OrderView />
                  </RoleRequired>
                </BoundOrder>
              }
            />
            <Route path="/account" element={<Account />} />
            {(
              ["privacy", "terms", "pilot", "how-it-works", "sign-in"] as const
            ).map((kind) => (
              <Route
                key={kind}
                path={`/${kind}`}
                element={<InfoPage kind={kind} />}
              />
            ))}
            <Route
              path="/m/north-studio"
              element={
                <>
                  <PageTitle
                    eyebrow="FICTIONAL CREATIVE PARTNER"
                    title="North Studio."
                  />
                  <Panel className="reading-panel">
                    <p>
                      A sample independent creative studio making considered
                      product imagery. This is not a real merchant listing or
                      marketplace.
                    </p>
                    <Link to="/quotes/sample-001" className="button">
                      View the sample agreement ↗
                    </Link>
                  </Panel>
                </>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <footer className="workspace-footer">
            <span>Private agreements. Clear approvals.</span>
            <span>
              R0 · synthetic UI only <span aria-hidden="true">◇</span>
            </span>
          </footer>
        </main>
      </div>
      <Dialog.Root
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
            setConsent(false);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (modalOrigin.current?.isConnected) modalOrigin.current.focus();
              else mainHeading.current?.focus();
            }}
            className={`dialog-content ${modal === "image" ? "image-dialog" : ""}`}
          >
            <Dialog.Close className="dialog-close" aria-label="Close dialog">
              ×
            </Dialog.Close>
            <span className="eyebrow">MILO · SAMPLE ONLY</span>
            <Dialog.Title>
              {modal === "approve"
                ? "A deliberate approval."
                : modal === "dispute"
                  ? "What needs a second look?"
                  : modal === "image"
                    ? sampleFiles[activeImage]?.title
                    : "Evidence, without overclaiming."}
            </Dialog.Title>
            <Dialog.Description>
              {modal === "approve"
                ? "Approve this exact sample delivery—not an immediate payment."
                : modal === "dispute"
                  ? "A sample dispute pauses the normal approval path for the pre-agreed operator."
                  : modal === "image"
                    ? "Original synthetic artwork. Inspect the sample at full size; a byte match does not judge creative quality."
                    : "These are prototype facts, not blockchain or payment-provider observations."}
            </Dialog.Description>
            {modal === "image" && (
              <>
                <img
                  className="lightbox-image"
                  src={sampleFiles[activeImage]?.src}
                  alt={`Synthetic product illustration — ${sampleFiles[activeImage]?.title}`}
                  width="600"
                  height="720"
                />
                <div className="lightbox-actions">
                  <button
                    type="button"
                    className="button secondary small"
                    disabled={activeImage === 0}
                    onClick={() => setActiveImage(activeImage - 1)}
                  >
                    ← Previous
                  </button>
                  <a
                    className="text-link"
                    href={sampleFiles[activeImage]?.src}
                    download={sampleFiles[activeImage]?.name}
                  >
                    Download sample PNG ↓
                  </a>
                  <button
                    type="button"
                    className="button secondary small"
                    disabled={activeImage === 2}
                    onClick={() => setActiveImage(activeImage + 1)}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
            {modal === "approve" && (
              <>
                <dl className="confirmation-summary">
                  <div>
                    <dt>Creative partner</dt>
                    <dd>North Studio</dd>
                  </div>
                  <div>
                    <dt>Delivery</dt>
                    <dd>Three final sample images · fixed version</dd>
                  </div>
                  <div>
                    <dt>Agreed amount</dt>
                    <dd>{money} USD</dd>
                  </div>
                  <div>
                    <dt>Byte check</dt>
                    <dd>
                      {state.filesVerified
                        ? "All sample files match"
                        : "Not checked"}
                    </dd>
                  </div>
                </dl>
                <div className="soft-note">
                  A real confirmed Midnight approval would allow a worker to
                  check the hold and request capture. Capture may still fail.
                  This prototype simulates only the approval now.
                </div>
                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                  />
                  I reviewed all three images and understand that approval and
                  payment are separate.
                </label>
                <button
                  type="button"
                  className="button full"
                  disabled={!consent || !can("approve")}
                  onClick={() => act("approve")}
                >
                  Approve this sample delivery ↗
                </button>
              </>
            )}
            {modal === "dispute" && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (reason.trim().length >= 10) act("dispute");
                }}
              >
                <label className="field">
                  Sample reason
                  <textarea
                    required
                    minLength={10}
                    maxLength={500}
                    value={reason}
                    rows={4}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Describe a fictional scope mismatch. Do not enter private information."
                  />
                </label>
                <p className="micro muted">
                  This text stays only in this dialog; it is not sent or saved.
                  Minimum 10 characters.
                </p>
                <button
                  type="submit"
                  className="button full"
                  disabled={reason.trim().length < 10 || !can("dispute")}
                >
                  Open the sample dispute
                </button>
              </form>
            )}
            {modal === "evidence" && (
              <>
                <dl className="detail-grid">
                  <div>
                    <dt>Source</dt>
                    <dd>In-memory simulator</dd>
                  </div>
                  <div>
                    <dt>Phase / revision</dt>
                    <dd>
                      {state.phase} / {state.revision}
                    </dd>
                  </div>
                  <div>
                    <dt>Independent payment</dt>
                    <dd>Sample {state.payment}</dd>
                  </div>
                  <div>
                    <dt>Byte check</dt>
                    <dd>
                      {state.filesVerified
                        ? "Pinned sample SHA-256 matched"
                        : "Not checked in this context"}
                    </dd>
                  </div>
                </dl>
                <p>
                  Real provider/operation evidence:{" "}
                  <strong>0/6 and 0/14.</strong> No compiling Compact contract,
                  real identity, proof, wallet, chain transaction or payment
                  exists in this prototype.
                </p>
                <div className="soft-note">
                  A matching file hash checks byte identity only—not ownership,
                  quality, review or a chain commitment. All images are original
                  synthetic fixtures.
                </div>
                <button
                  type="button"
                  className="button secondary"
                  onClick={exportReceipt}
                >
                  Export sample record ↓
                </button>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
