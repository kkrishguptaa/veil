/**
 * Server-only: submit Veil placeholder payroll circuits using the same genesis-seed
 * wallet flow as `scripts/deploy.ts` (local devnet bridge; see README).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { Buffer } from "node:buffer";
import { WebSocket } from "ws";

import { findDeployedContract } from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { setNetworkId, getNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import * as ledger from "@midnight-ntwrk/ledger-v8";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { WalletFacade } from "@midnight-ntwrk/wallet-sdk-facade";
import { DustWallet } from "@midnight-ntwrk/wallet-sdk-dust-wallet";
import { HDWallet, Roles } from "@midnight-ntwrk/wallet-sdk-hd";
import { ShieldedWallet } from "@midnight-ntwrk/wallet-sdk-shielded";
import {
  createKeystore,
  NoOpTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from "@midnight-ntwrk/wallet-sdk-unshielded-wallet";

import { getDeployment, getOrCreateSeed, resolveNetwork, type NetworkId } from "@/scripts/network";

// @ts-expect-error wallet sync requires WebSocket in Node
globalThis.WebSocket = WebSocket;

export type EmployerPlaceholderAction =
  | { kind: "registerEmployeePlaceholder" }
  | { kind: "runBatchPlaceholder"; batchHash: string };

function normalizeHexAddress(raw: string): string {
  const s = raw.trim().toLowerCase();
  return s.startsWith("0x") ? s.slice(2) : s;
}

function resolveContractAddress(network: NetworkId, cwd: string): string | null {
  const fromEnv = process.env.VEIL_CONTRACT_ADDRESS?.trim();
  if (fromEnv) return normalizeHexAddress(fromEnv);
  const dep = getDeployment(network, { cwd });
  return dep?.address ? normalizeHexAddress(dep.address) : null;
}

function deriveKeys(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, "hex"));
  if (hdWallet.type !== "seedOk") throw new Error("Invalid seed");
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (result.type !== "keysDerived") throw new Error("Key derivation failed");
  hdWallet.hdWallet.clear();
  return result.keys;
}

async function waitForProofServer(proofServerUrl: string, maxAttempts = 15, delayMs = 1000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetch(proofServerUrl, { method: "GET", signal: AbortSignal.timeout(3000) });
      return true;
    } catch {
      if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

async function loadCompiledVeil(cwd: string) {
  const zkConfigPath = path.resolve(cwd, "contracts", "managed", "veil");
  const contractPath = path.join(zkConfigPath, "contract", "index.js");
  if (!fs.existsSync(contractPath)) {
    throw new Error("Compiled contract missing — run `npm run compile`.");
  }
  const Veil = await import(pathToFileURL(contractPath).href);
  return {
    zkConfigPath,
    compiledContract: CompiledContract.make("veil", Veil.Contract).pipe(
      CompiledContract.withVacantWitnesses,
      CompiledContract.withCompiledFileAssets(zkConfigPath),
    ) as unknown as CompiledContract.CompiledContract<any, any>,
  };
}

/**
 * Runs one placeholder employer transaction and tears the wallet down.
 */
export async function runEmployerPlaceholderTx(
  action: EmployerPlaceholderAction,
  opts: { cwd?: string } = {},
): Promise<{ ok: true; circuit: string; network: NetworkId; contractAddress: string } | { ok: false; message: string }> {
  const cwd = opts.cwd ?? process.cwd();
  const { network, config: networkConfig } = resolveNetwork({ argv: ["node", "veil-web"], cwd });
  setNetworkId(networkConfig.networkId);

  const contractAddress = resolveContractAddress(network, cwd);
  if (!contractAddress) {
    return {
      ok: false,
      message:
        "No contract address on file. Run `npm run setup`, or set VEIL_CONTRACT_ADDRESS to the deployed hex address.",
    };
  }

  const proofOk = await waitForProofServer(networkConfig.proofServer);
  if (!proofOk) {
    return {
      ok: false,
      message:
        "Proof server is not responding. Start local services with `docker compose up -d` (or set MIDNIGHT_PROOF_SERVER_URL).",
    };
  }

  let compiledContract: CompiledContract.CompiledContract<any, any>;
  let zkConfigPath: string;
  try {
    const loaded = await loadCompiledVeil(cwd);
    compiledContract = loaded.compiledContract;
    zkConfigPath = loaded.zkConfigPath;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }

  const seed = getOrCreateSeed(network);
  const keys = deriveKeys(seed);
  const networkId = getNetworkId();
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

  const wallet = await WalletFacade.init({
    configuration: {
      networkId,
      indexerClientConnection: { indexerHttpUrl: networkConfig.indexer, indexerWsUrl: networkConfig.indexerWS },
      provingServerUrl: new URL(networkConfig.proofServer),
      relayURL: new URL(networkConfig.node.replace(/^http/, "ws")),
      txHistoryStorage: new NoOpTransactionHistoryStorage(),
      costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    },
    shielded: async (c) => ShieldedWallet(c).startWithSecretKeys(shieldedSecretKeys),
    unshielded: async (c) =>
      UnshieldedWallet(c).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: async (c) =>
      DustWallet(c).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });

  await wallet.start(shieldedSecretKeys, dustSecretKey);
  const state = await wallet.waitForSyncedState();

  const privateStatePassword =
    process.env.PRIVATE_STATE_PASSWORD?.trim() || "Local-Devnet-Development-Placeholder-1";

  const walletProvider = {
    getCoinPublicKey: () => state.shielded.coinPublicKey.toHexString(),
    getEncryptionPublicKey: () => state.shielded.encryptionPublicKey.toHexString(),
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys, dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      const signedRecipe = await wallet.signRecipe(recipe, (payload) => unshieldedKeystore.signData(payload));
      return wallet.finalizeRecipe(signedRecipe);
    },
    submitTx: (tx: any) => wallet.submitTransaction(tx),
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = unshieldedKeystore.getBech32Address().toString();

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: "veil-state",
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };

  const MAX_DUST_RETRIES = 12;
  const RETRY_MS = 4000;

  try {
    const found = await findDeployedContract(providers, {
      contractAddress,
      compiledContract,
    });

    const circuit =
      action.kind === "registerEmployeePlaceholder" ? "registerEmployeePlaceholder" : "runBatchPlaceholder";

    const callTx = found.callTx as {
      registerEmployeePlaceholder: () => Promise<unknown>;
      runBatchPlaceholder: (batchHash: string) => Promise<unknown>;
    };

    for (let attempt = 1; attempt <= MAX_DUST_RETRIES; attempt++) {
      try {
        if (action.kind === "registerEmployeePlaceholder") {
          await callTx.registerEmployeePlaceholder();
        } else {
          await callTx.runBatchPlaceholder(action.batchHash);
        }
        return { ok: true, circuit, network, contractAddress };
      } catch (err: unknown) {
        const full = `${err instanceof Error ? err.message : String(err)} ${
          err && typeof err === "object" && "cause" in err
            ? String((err as { cause?: unknown }).cause)
            : ""
        }`;
        const isDustShortage =
          full.includes("Not enough Dust") ||
          full.includes("Insufficient Funds") ||
          full.includes("could not balance dust");
        if (isDustShortage && attempt < MAX_DUST_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_MS));
          continue;
        }
        throw err;
      }
    }
    return { ok: false, message: "Transaction failed after retries (DUST balancing)." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const lower = msg.toLowerCase();
    if (lower.includes("econnrefused") || lower.includes("fetch failed")) {
      return {
        ok: false,
        message:
          "Could not reach the proof server or indexer. Confirm Docker devnet is up (`docker compose ps`) and URLs match `npm run network`.",
      };
    }
    return { ok: false, message: msg };
  } finally {
    await wallet.stop();
  }
}
