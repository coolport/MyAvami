import { api } from "./api";
import type { Product, ProductPayload, Supplier } from "../types";

export function getProducts(): Promise<Product[]> {
  return api<{ data: Product[] }>(`/products`).then((res) => res.data);
}

export function createProduct(payload: ProductPayload): Promise<Product> {
  return api<{ data: Product }>("/products", {
    method: "POST",
    body: payload,
  }).then((res) => res.data);
}

export function updateProduct(
  id: string,
  payload: Partial<ProductPayload>
): Promise<Product> {
  return api<{ data: Product }>(`/products/${id}`, {
    method: "PUT",
    body: payload,
  }).then((res) => res.data);
}

export function deleteProduct(id: string): Promise<void> {
  return api(`/products/${id}`, { method: "DELETE" }).then(() => undefined);
}

export function getSuppliers(): Promise<Supplier[]> {
  return api<{ data: Supplier[] }>("/supplier").then((res) => res.data);
}

export function createSupplier(
  payload: Omit<Supplier, "_id" | "createdAt" | "updatedAt">
): Promise<Supplier> {
  return api<{ data: Supplier }>("/supplier", {
    method: "POST",
    body: payload,
  }).then((res) => res.data);
}

export function updateSupplier(
  id: string,
  payload: Partial<Omit<Supplier, "_id" | "createdAt" | "updatedAt">>
): Promise<Supplier> {
  return api<{ data: Supplier }>(`/supplier/${id}`, {
    method: "PUT",
    body: payload,
  }).then((res) => res.data);
}

export function deleteSupplier(id: string): Promise<void> {
  return api(`/supplier/${id}`, { method: "DELETE" }).then(() => undefined);
}
