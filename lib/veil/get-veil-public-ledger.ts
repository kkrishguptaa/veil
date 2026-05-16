import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { WebSocket } from 'ws';

import { getDeployment, resolveNetwork, type NetworkId } from '@/scripts/network';
import { toJsonSafe } from '@/lib/veil/json-safe';
import { recoveryStepsForLedgerCode } from '@/lib/veil/veil-ledger-recovery';

export type VeilLedgerResult =
  | {
      ok: true;
      network: NetworkId;
      contractAddress: string;
      ledger: Record<string, unknown>;
      /** Always empty on success; present for a stable API envelope with error paths. */
      recoverySteps: [];
    }
  | {
      ok: false;
      network: NetworkId;
      code: 'no_deployment' | 'indexer_unreachable' | 'not_indexed';
      message: string;
      contractAddress?: string;
      recoverySteps: string[];
    };

function normalizeHexAddress(raw: string): string {
  const s = raw.trim().toLowerCase();
  return s.startsWith('0x') ? s.slice(2) : s;
}

function resolveContractAddress(network: NetworkId, cwd: string): string | null {
  const fromEnv = process.env.VEIL_CONTRACT_ADDRESS?.trim();
  if (fromEnv) return normalizeHexAddress(fromEnv);
  const dep = getDeployment(network, { cwd });
  return dep?.address ? normalizeHexAddress(dep.address) : null;
}

/**
 * Reads public Veil contract ledger fields via the Midnight indexer (no wallet secrets).
 * Intended for local devnet and demos where `.midnight-state.json` holds the deploy address.
 */
export async function getVeilPublicLedger(opts: { cwd?: string } = {}): Promise<VeilLedgerResult> {
  const cwd = opts.cwd ?? process.cwd();
  const { network, config } = resolveNetwork({ argv: ['node', 'veil-web'], cwd });
  setNetworkId(config.networkId);

  const contractAddress = resolveContractAddress(network, cwd);
  if (!contractAddress) {
    const code = 'no_deployment' as const;
    return {
      ok: false,
      network,
      code,
      message:
        'No contract address on file. Run `npm run setup` on this machine, or set VEIL_CONTRACT_ADDRESS to a hex deploy address.',
      recoverySteps: recoveryStepsForLedgerCode(code),
    };
  }

  const provider = indexerPublicDataProvider(config.indexer, config.indexerWS, WebSocket as never);

  try {
    const raw = await provider.queryContractState(contractAddress);
    if (!raw) {
      const code = 'not_indexed' as const;
      return {
        ok: false,
        network,
        code,
        contractAddress,
        message:
          'Indexer returned no contract state yet. If you just deployed, wait a block and refresh. Confirm Docker devnet is up.',
        recoverySteps: recoveryStepsForLedgerCode(code),
      };
    }
    const ledger = toJsonSafe(raw) as Record<string, unknown>;
    return { ok: true, network, contractAddress, ledger, recoverySteps: [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = 'indexer_unreachable' as const;
    return {
      ok: false,
      network,
      code,
      contractAddress,
      message: msg,
      recoverySteps: recoveryStepsForLedgerCode(code),
    };
  }
}
