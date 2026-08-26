import { api } from "./api";
import type { Transaction, TransactionPayload, User } from "../types";

export function getTransactions(): Promise<Transaction[]> {
  return api<{ data: Transaction[] }>("/transactions").then(
    (res) => res.data
  );
}

export function createTransaction(
  payload: TransactionPayload
): Promise<Transaction> {
  return api<{ data: Transaction }>("/transactions", {
    method: "POST",
    body: payload,
  }).then((res) => res.data);
}

export function deleteTransaction(id: string): Promise<void> {
  return api(`/transactions/${id}`, { method: "DELETE" }).then(
    () => undefined
  );
}

export function getUsers(): Promise<User[]> {
  return api<{ data: User[] }>("/users").then((res) => res.data);
}

export interface CreateUserPayload {
  userUsername: string;
  userPassword: string;
  userFullName: string;
  userRole: User["userRole"];
}

export function createUser(payload: CreateUserPayload): Promise<User> {
  return api<{ data: User }>("/users", { method: "POST", body: payload }).then(
    (res) => res.data
  );
}

export interface UpdateUserPayload {
  userUsername?: string;
  userFullName?: string;
  userPassword?: string;
  userRole?: User["userRole"];
}

export function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<User> {
  return api<{ data: User }>(`/users/${id}`, {
    method: "PUT",
    body: payload,
  }).then((res) => res.data);
}

export function deleteUser(id: string): Promise<User> {
  return api<{ data: User }>(`/users/${id}`, { method: "DELETE" }).then(
    (res) => res.data
  );
}
