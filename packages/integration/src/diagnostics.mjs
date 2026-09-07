import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageDirectory = fileURLToPath(new URL("../", import.meta.url));
const names = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "ReferenceError",
  "AssertionError",
  "AggregateError",
  "AbortError",
  "TimeoutError",
  "AxiosError",
  "FiberFailure",
  "Wallet.Other",
  "Wallet.Sync",
  "Wallet.Transacting",
  "Wallet.InsufficientFunds",
  "Wallet.Address",
  "Wallet.Sign",
  "Wallet.ApplyTransaction",
  "Wallet.RollbackUtxo",
  "Wallet.SpendUtxo",
  "Wallet.TransactionHistory",
  "Wallet.SubmissionWalletError",
  "Wallet.InvalidCoinHashes",
  "UtxoNotFoundError",
  "DeployTxFailedError",
  "CallTxFailedError",
  "ContractTypeError",
  "IndexerError",
  "IndexerQueryError",
  "RpcError",
  "SubmissionError",
  "ConnectionError",
  "TransactionProgressError",
  "ParseError",
  "TransactionUsurpedError",
  "TransactionDroppedError",
  "TransactionInvalidError",
]);
// Exact Substrate validity strings at node-1.0.0's pinned SDK revision.
const validity = new Map([
  ["Transaction call is not expected", "Call"],
  ["Transaction will be valid in the future", "Future"],
  ["Transaction is outdated", "Stale"],
  ["Transaction has a bad signature", "BadProof"],
  ["Transaction has an ancient birth block", "AncientBirthBlock"],
  ["Transaction would exhaust the block limits", "ExhaustsResources"],
  ["Inability to pay some fees (e.g. account balance too low)", "Payment"],
  [
    "A call was labelled as mandatory, but resulted in an Error.",
    "BadMandatory",
  ],
  [
    "Transaction dispatch is mandatory; transactions must not be validated.",
    "MandatoryValidation",
  ],
  ["InvalidTransaction custom error", "Custom"],
  ["Invalid signing address", "BadSigner"],
  ["The implicit data was unable to be calculated", "IndeterminateImplicit"],
  ["The transaction extension did not authorize any origin", "UnknownOrigin"],
]);
const read = (value, key) => {
  try {
    return value?.[key];
  } catch {
    return undefined;
  }
};
const knownName = (value) => {
  if (typeof value !== "string" || value.length > 80) return undefined;
  const normalized = value.replace(/^\(FiberFailure\) /, "");
  return names.has(normalized) ? normalized : undefined;
};

export function errorDiagnostics(error) {
  const classifications = new Set();
  const locations = new Set();
  const rpcCodes = new Set();
  const transactionValidity = new Set();
  const seen = new Set();
  const queue = [error];
  for (let count = 0; queue.length && count < 16; count++) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    for (const key of ["name", "_tag"]) {
      const name = knownName(read(current, key));
      if (name) classifications.add(name);
    }
    const code = read(current, "code");
    if (
      Number.isInteger(code) &&
      code >= -2_147_483_648 &&
      code <= 2_147_483_647
    ) {
      rpcCodes.add(code);
      const data = read(current, "data");
      if (code === 1010 && typeof data === "string" && validity.has(data)) {
        transactionValidity.add(validity.get(data));
      }
    }
    const stack = read(current, "stack");
    if (typeof stack === "string") {
      for (const line of stack.slice(0, 16_384).split("\n").slice(1, 33)) {
        if (!/^\s+at /.test(line)) continue;
        const start = line.indexOf(packageDirectory);
        if (start === -1) continue;
        const match = line
          .slice(start + packageDirectory.length)
          .match(
            /^((?:src|node_modules)\/[A-Za-z0-9_@./-]{1,240}\.(?:mjs|cjs|js)):(\d{1,7}):(\d{1,5})(?:\)|$)/,
          );
        if (
          !match ||
          match[1].split("/").includes("..") ||
          !existsSync(`${packageDirectory}${match[1]}`)
        )
          continue;
        locations.add(
          `packages/integration/${match[1]}:${match[2]}:${match[3]}`,
        );
        if (locations.size >= 12) break;
      }
    }
    queue.push(read(current, "cause"));
    // Effect's FiberFailure stores the typed failure under this public symbol.
    queue.push(read(current, Symbol.for("effect/Runtime/FiberFailure/Cause")));
    const tag = read(current, "_tag");
    if (tag === "Fail") queue.push(read(current, "error"));
    if (tag === "Die") queue.push(read(current, "defect"));
    if (tag === "Sequential" || tag === "Parallel") {
      queue.push(read(current, "left"), read(current, "right"));
    }
  }
  return {
    errorNames: [...classifications],
    sourceLocations: [...locations].slice(0, 12),
    ...(rpcCodes.size ? { rpcCodes: [...rpcCodes] } : {}),
    ...(transactionValidity.size
      ? { transactionValidity: [...transactionValidity] }
      : {}),
  };
}
