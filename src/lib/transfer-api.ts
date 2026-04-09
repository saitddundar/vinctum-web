import api from "./api";
import type {
  InitiateTransferRequest,
  InitiateTransferResponse,
  TransferStatusResponse,
  TransferInfo,
  CancelTransferResponse,
} from "../types/transfer";

export async function initiateTransfer(req: InitiateTransferRequest): Promise<InitiateTransferResponse> {
  const { data } = await api.post("/v1/transfers", req);
  return data;
}

export async function getTransferStatus(transferId: string): Promise<TransferStatusResponse> {
  const { data } = await api.get(`/v1/transfers/${transferId}`);
  return data;
}

export async function listTransfers(nodeId: string): Promise<{ transfers: TransferInfo[] }> {
  const { data } = await api.get(`/v1/transfers/node/${nodeId}`);
  return data;
}

export async function cancelTransfer(transferId: string, reason?: string): Promise<CancelTransferResponse> {
  const { data } = await api.post(`/v1/transfers/${transferId}/cancel`, { reason: reason || "" });
  return data;
}
