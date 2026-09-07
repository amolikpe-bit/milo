import assert from "node:assert/strict";
import test from "node:test";
import { localConfig, publicReceipt } from "../src/config.mjs";

const config = () => ({
  MILO_LOCAL_ALLOW_TRANSACTIONS: "disposable-owned-local",
  MILO_LOCAL_NETWORK_ID: "undeployed",
  MILO_LOCAL_GENESIS_HASH: `0x${"a".repeat(64)}`,
  MILO_LOCAL_NODE_HTTP: "http://127.0.0.1:9944/",
  MILO_LOCAL_NODE_WS: "ws://127.0.0.1:9944/",
  MILO_LOCAL_INDEXER_HTTP: "http://127.0.0.1:8088/api/v3/graphql",
  MILO_LOCAL_INDEXER_WS: "ws://127.0.0.1:8088/api/v3/graphql/ws",
  MILO_LOCAL_PROOF_HTTP: "http://127.0.0.1:6300/",
});
test("MID-T01 harness configuration requires explicit owned loopback endpoints", () => {
  assert.equal(localConfig(config()).networkId, "undeployed");
  for (const key of Object.keys(config())) {
    const env = config();
    delete env[key];
    assert.throws(() => localConfig(env), key);
  }
  for (const value of [
    "http://preview.example/",
    "http://localhost/",
    "http://user:secret@127.0.0.1/",
    "http://127.0.0.1/?token=x",
    "https://127.0.0.1/",
  ]) {
    assert.throws(() =>
      localConfig({ ...config(), MILO_LOCAL_PROOF_HTTP: value }),
    );
  }
  assert.throws(() =>
    localConfig({ ...config(), MILO_LOCAL_NETWORK_ID: "preview" }),
  );
  for (const value of ["0", "Infinity", "1800001", "NaN"]) {
    assert.throws(() =>
      localConfig({ ...config(), MILO_LOCAL_TIMEOUT_MS: value }),
    );
  }
});
test("MID-T02 receipt projection excludes transaction/private fields and rejects partial success", () => {
  const receipt = publicReceipt({
    status: "SucceedEntirely",
    txId: "tx",
    txHash: "hash",
    blockHash: "block",
    blockHeight: 1,
    private: { secret: "must-not-escape" },
    tx: { witness: "must-not-escape" },
  });
  assert.deepEqual(Object.keys(receipt).sort(), [
    "blockHash",
    "blockHeight",
    "status",
    "txHash",
    "txId",
  ]);
  assert(!JSON.stringify(receipt).includes("must-not-escape"));
  for (const status of ["FailEntirely", "FailFallible", undefined])
    assert.throws(() => publicReceipt({ status }));
});
