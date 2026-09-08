import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { validateArtifacts, validateCohort } from "./artifacts.mjs";
import { localConfig, publicReceipt } from "./config.mjs";
import { errorDiagnostics } from "./diagnostics.mjs";
import { balanceWithDustReadiness } from "./dust.mjs";
import { captureSubmissions } from "./submissions.mjs";

let stage = "configuration";
let boundary = "harness";
const emit = (event, fields = {}) =>
  process.stdout.write(`${JSON.stringify({ event, ...fields })}\n`);
const fail = (error) => {
  emit("failed", {
    stage,
    boundary,
    ...errorDiagnostics(error),
    immutableOrderAdmission: false,
    r1Complete: false,
  });
  process.exit(1);
};
process.on("uncaughtException", fail);
process.on("unhandledRejection", fail);

async function main() {
  const env = localConfig(process.env);
  const expiresAt = Date.now() + env.timeoutMs;
  const deadline = setTimeout(() => {
    emit("timeout", {
      stage,
      outcome: "unknown-if-submitted",
      immutableOrderAdmission: false,
      r1Complete: false,
    });
    process.exit(1);
  }, env.timeoutMs);
  const step = (name) => {
    stage = name;
    boundary = "harness";
    emit("stage", { stage });
  };
  const rpc = async (method, params) => {
    const response = await fetch(env.node, {
      method: "POST",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    assert(response.ok);
    const data = await response.json();
    assert(!data.error);
    return data.result;
  };
  step("verify-compiler-artifacts-and-cohort");
  const artifactReceipt = await validateArtifacts();
  const cohort = await validateCohort();
  const { artifacts: artifactHashes, ...artifactFingerprints } =
    artifactReceipt;
  emit("compiler-artifacts-validated", { ...artifactFingerprints, cohort });
  step("verify-owned-genesis");
  assert.equal(await rpc("chain_getBlockHash", [0]), env.genesisHash);

  const tk = await import("@midnight-ntwrk/testkit-js");
  // Testkit's wallet builders otherwise log seeds, including fresh random ones.
  tk.logger.level = "silent";
  const { setNetworkId } = await import(
    "@midnight-ntwrk/midnight-js-network-id"
  );
  setNetworkId(env.networkId);
  const L = await import("@midnight-ntwrk/midnight-js-protocol/ledger");
  const { CompiledContract } = await import(
    "@midnight-ntwrk/midnight-js-protocol/compact-js"
  );
  const { deployContract, submitTx, verifyContractState } = await import(
    "@midnight-ntwrk/midnight-js-contracts"
  );
  const { NodeZkConfigProvider } = await import(
    "@midnight-ntwrk/midnight-js-node-zk-config-provider"
  );
  const { httpClientProofProvider } = await import(
    "@midnight-ntwrk/midnight-js-http-client-proof-provider"
  );
  const { indexerPublicDataProvider } = await import(
    "@midnight-ntwrk/midnight-js-indexer-public-data-provider"
  );
  const { UnshieldedAddress } = await import("@midnight-ntwrk/wallet-sdk");
  const { firstValueFrom, filter, timeout } = await import("rxjs");
  const { artifacts, generated, witnesses, freshOrder } = await import(
    "./order.mjs"
  );
  const { createConstructorContext } = await import(
    "@midnight-ntwrk/compact-runtime"
  );
  const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
  const contract = new generated.Contract(witnesses);
  const circuits = Object.keys(contract.provableCircuits).sort();
  const zkConfigProvider = new NodeZkConfigProvider(artifacts);
  const verifierKeys = await zkConfigProvider.getVerifierKeys(circuits);
  assert.deepEqual(
    circuits,
    Object.keys(artifactHashes)
      .filter((path) => path.endsWith(".verifier"))
      .map((path) => path.slice(5, -9))
      .sort(),
  );
  for (const [name, key] of verifierKeys)
    assert.equal(sha256(key), artifactHashes[`keys/${name}.verifier`]);
  emit("artifacts", {
    generatedSha256: artifactHashes["contract/index.js"],
    verifierSha256: Object.fromEntries(
      verifierKeys.map(([name, key]) => [name, sha256(key)]),
    ),
  });
  const publicDataProvider = indexerPublicDataProvider(
    env.indexer,
    env.indexerWS,
  );
  const proof = httpClientProofProvider(env.proofServer, zkConfigProvider, {
    timeout: env.timeoutMs,
  });
  const privateStateProvider = tk.inMemoryPrivateStateProvider();
  const wallets = [];
  const restoreSubmissions = [];
  try {
    step("genesis-wallet-sync");
    // Constructor and this public seed property do not start a Docker environment.
    const genesis = new tk.LocalTestEnvironment(tk.logger);
    const funder = await tk.MidnightWalletProvider.build(
      tk.logger,
      env,
      genesis.genesisMintWalletSeed[0],
    );
    wallets.push(funder);
    restoreSubmissions.push(
      captureSubmissions(funder.wallet, emit, () => stage),
    );
    await funder.start(false);
    const night = L.unshieldedToken().raw;
    const waitState = (provider, predicate) =>
      firstValueFrom(
        provider.wallet.state().pipe(
          filter((state) => state.isSynced && predicate(state)),
          timeout({ first: env.timeoutMs }),
        ),
      );
    const genesisState = await tk.syncWallet(funder.wallet);
    const fundingAmount = 50_000n * 1_000_000n;
    assert((genesisState.unshielded.balances[night] ?? 0n) >= fundingAmount);
    await tk.waitForFunds(funder.wallet, env, false, funder.unshieldedKeystore);
    await waitState(funder, (state) => state.dust.balance(new Date()) > 0n);

    step("fresh-buyer-funding");
    const buyer = await tk.MidnightWalletProvider.build(
      tk.logger,
      env,
      randomBytes(32).toString("hex"),
    );
    wallets.push(buyer);
    restoreSubmissions.push(
      captureSubmissions(buyer.wallet, emit, () => stage),
    );
    await buyer.start(false);
    await tk.syncWallet(buyer.wallet);
    const recipe = await funder.wallet.transferTransaction(
      [
        {
          type: "unshielded",
          outputs: [
            {
              type: night,
              amount: fundingAmount,
              receiverAddress: buyer.unshieldedKeystore
                .getBech32Address()
                .decode(UnshieldedAddress, env.networkId),
            },
          ],
        },
      ],
      {
        shieldedSecretKeys: funder.zswapSecretKeys,
        dustSecretKey: funder.dustSecretKey,
      },
      {
        ttl: new Date(Date.now() + 600_000),
      },
    );
    const signed = await funder.wallet.signRecipe(recipe, (payload) =>
      funder.unshieldedKeystore.signData(payload),
    );
    const fundingId = await funder.submitTx(
      await funder.wallet.finalizeRecipe(signed),
    );
    emit("submitted", { stage, txId: fundingId });
    emit(
      "funding-finalized",
      publicReceipt(await publicDataProvider.watchForTxData(fundingId)),
    );
    await waitState(
      buyer,
      (state) => (state.unshielded.balances[night] ?? 0n) > 0n,
    );
    step("fresh-buyer-dust");
    await tk.waitForFunds(buyer.wallet, env, false, buyer.unshieldedKeystore);
    await waitState(buyer, (state) => state.dust.balance(new Date()) > 0n);
    emit("fresh-buyer-funded", { nightObserved: true, dustObserved: true });

    const providers = {
      privateStateProvider,
      publicDataProvider,
      zkConfigProvider,
      proofProvider: {
        async proveTx(...args) {
          boundary = "proofProvider.proveTx";
          const result = await proof.proveTx(...args);
          emit("proof-provider-completed", { stage });
          boundary = "contracts.continuation";
          return result;
        },
      },
      walletProvider: {
        getCoinPublicKey: () => buyer.getCoinPublicKey(),
        getEncryptionPublicKey: () => buyer.getEncryptionPublicKey(),
        async balanceTx(tx, ttl = new Date(Date.now() + 3_600_000)) {
          boundary = "walletProvider.balanceTx";
          emit("wallet-balancing-started", { stage });
          const recipe = await balanceWithDustReadiness(
            buyer.wallet,
            tx,
            {
              shieldedSecretKeys: buyer.zswapSecretKeys,
              dustSecretKey: buyer.dustSecretKey,
            },
            {
              ttl,
              deadline: expiresAt,
              emit: (event, fields) => emit(event, { stage, ...fields }),
            },
          );
          // Signing/finalization can reserve inputs; they must not be retried with balancing.
          boundary = "walletProvider.signRecipe";
          const signed = await buyer.wallet.signRecipe(recipe, (payload) =>
            buyer.unshieldedKeystore.signData(payload),
          );
          boundary = "walletProvider.finalizeRecipe";
          const result = await buyer.wallet.finalizeRecipe(signed);
          emit("wallet-balancing-completed", { stage });
          boundary = "contracts.continuation";
          return result;
        },
      },
      midnightProvider: {
        async submitTx(tx) {
          boundary = "midnightProvider.submitTx";
          const txId = await buyer.submitTx(tx);
          emit("submitted", { stage, txId });
          boundary = "contracts.continuation";
          return txId;
        },
      },
    };
    const compiledContract = CompiledContract.make(
      "milo-order",
      generated.Contract,
    ).pipe(
      CompiledContract.withWitnesses(witnesses),
      CompiledContract.withCompiledFileAssets(artifacts),
    );
    const order = freshOrder();
    step("MID-T01-deploy");
    const deployed = await deployContract(providers, {
      compiledContract,
      privateStateId: "buyer",
      initialPrivateState: order.privateState,
      args: [order.configuration],
    });
    const address = deployed.deployTxData.public.contractAddress;
    assert.equal(typeof address, "string");
    const deploymentReceipt = publicReceipt(deployed.deployTxData.public);
    emit("deployment-finalized", { address, ...deploymentReceipt });
    step("MID-T01-bootstrap-inspection");
    const initial = await publicDataProvider.queryContractState(address, {
      type: "blockHash",
      blockHash: deploymentReceipt.blockHash,
    });
    assert(initial);
    const expected = contract.initialState(
      createConstructorContext({}, buyer.getCoinPublicKey()),
      order.configuration,
    );
    assert.deepEqual(
      generated.ledger(initial.data),
      generated.ledger(expected.currentContractState.data),
    );
    verifyContractState(verifierKeys, initial);
    assert.deepEqual(
      initial
        .operations()
        .map((name) =>
          typeof name === "string" ? name : new TextDecoder().decode(name),
        )
        .sort(),
      circuits,
    );
    emit("bootstrap-inspected", {
      initialStateMatches: true,
      completeVerifierSetMatches: true,
      committeeSize: initial.maintenanceAuthority.committee.length,
      threshold: initial.maintenanceAuthority.threshold,
    });

    step("MID-T01-maintenance-lock");
    const signingKey = await privateStateProvider.getSigningKey(address);
    assert(signingKey);
    const oldAuthority = initial.maintenanceAuthority;
    assert.equal(oldAuthority.threshold, 1);
    assert.deepEqual(oldAuthority.committee, [
      L.signatureVerifyingKey(signingKey),
    ]);
    const lockedAuthority = new L.ContractMaintenanceAuthority(
      [],
      1,
      oldAuthority.counter + 1n,
    );
    let update = new L.MaintenanceUpdate(
      address,
      [new L.ReplaceAuthority(lockedAuthority)],
      oldAuthority.counter,
    );
    update = update.addSignature(0n, L.signData(signingKey, update.dataToSign));
    const unprovenTx = L.Transaction.fromParts(
      env.networkId,
      undefined,
      undefined,
      L.Intent.new(new Date(Date.now() + 600_000)).addMaintenanceUpdate(update),
    );
    const lockReceipt = publicReceipt(
      await submitTx(providers, { unprovenTx }),
    );
    const locked = await publicDataProvider.queryContractState(address, {
      type: "blockHash",
      blockHash: lockReceipt.blockHash,
    });
    assert(locked);
    assert.deepEqual(locked.maintenanceAuthority.committee, []);
    assert.equal(locked.maintenanceAuthority.threshold, 1);
    assert.equal(
      locked.maintenanceAuthority.counter,
      oldAuthority.counter + 1n,
    );
    verifyContractState(verifierKeys, locked);
    assert.deepEqual(
      generated.ledger(locked.data),
      generated.ledger(initial.data),
    );
    emit("maintenance-lock-observed", {
      ...lockReceipt,
      committeeSize: 0,
      threshold: 1,
      adversarialMaintenanceRejectionVerified: false,
    });

    step("MID-T02-reserve-diagnostic-nonadmitted");
    const reserved = await deployed.callTx.reserve(0n);
    const reserveReceipt = publicReceipt(reserved.public);
    const after = await publicDataProvider.queryContractState(address, {
      type: "blockHash",
      blockHash: reserveReceipt.blockHash,
    });
    assert(after);
    const state = generated.ledger(after.data);
    assert.equal(state.phase, generated.Phase.RESERVED);
    assert.equal(state.revision, 1n);
    assert.deepEqual(state.configuration, order.configuration);
    verifyContractState(verifierKeys, after);
    emit("reservation-finalized", {
      address,
      ...reserveReceipt,
      phase: "RESERVED",
      revision: "1",
      immutableOrderAdmission: false,
      r1Complete: false,
      remaining: [
        "adversarial-maintenance-rejection",
        "canonical-quote-binding",
        "remaining-MID-operation-evidence",
      ],
    });
  } finally {
    emit("stopping-owned-wallets");
    await Promise.allSettled(wallets.map((wallet) => wallet.stop()));
    for (const restore of restoreSubmissions) restore();
    clearTimeout(deadline);
  }
  process.exit(0);
}
main().catch(fail);
