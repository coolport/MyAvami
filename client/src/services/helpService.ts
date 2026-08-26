import { api } from "./api";
import type { Faq, FaqPayload } from "../types";

export function getFaqs(): Promise<Faq[]> {
  return api<{ data: Faq[] }>("/help").then((res) => res.data);
}

export function createFaq(payload: FaqPayload): Promise<Faq> {
  return api<{ data: Faq }>("/help", { method: "POST", body: payload }).then(
    (res) => res.data
  );
}

export function updateFaq(id: string, payload: Partial<FaqPayload>): Promise<Faq> {
  return api<{ data: Faq }>(`/help/${id}`, {
    method: "PUT",
    body: payload,
  }).then((res) => res.data);
}

export function deleteFaq(id: string): Promise<void> {
  return api(`/help/${id}`, { method: "DELETE" }).then(() => undefined);
}
