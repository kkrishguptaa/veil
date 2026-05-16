/**
 * Public-anchor-only receipt payload for demos (employee + auditor exports).
 * Same canonical JSON string always yields the same receipt hash.
 */
export type VeilLedgerApiOk = {
  ok: true;
  network: string;
  contractAddress: string;
  ledger: Record<string, unknown>;
};

export function buildVeilPublicReceiptPayload(result: VeilLedgerApiOk) {
  return {
    veil_receipt_version: 1 as const,
    veil_product: "Veil",
    network: result.network,
    contract_address: result.contractAddress,
    public_anchors: {
      organization_id: String(result.ledger.organization_id ?? ""),
      employee_registry_version: String(result.ledger.employee_registry_version ?? ""),
      batch_count: String(result.ledger.batch_count ?? ""),
      last_batch_hash: String(result.ledger.last_batch_hash ?? ""),
      status_message: String(result.ledger.status_message ?? ""),
    },
    scope_note:
      "This document summarizes public Veil ledger fields from the indexer. It does not include private payslip decryption, salary line items, or bank settlement data.",
  };
}

export function serializeVeilPublicReceipt(payload: ReturnType<typeof buildVeilPublicReceiptPayload>): string {
  return `${JSON.stringify(payload)}\n`;
}

export async function sha256HexUtf8(text: string): Promise<string> {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
