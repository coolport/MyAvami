import { BASE_URL } from "../services/api";

export interface StockStatus {
  label: string;
  color: string;
  colorScheme?: string;
}

const PHP = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export function formatPrice(price: number | undefined | null): string {
  return PHP.format(price ?? 0);
}

/** Short date used for expiration columns; empty input renders as N/A by default. */
export function formatDate(
  dateString: string | undefined | null,
  fallback = "N/A"
): string {
  if (!dateString) return fallback;
  return new Date(dateString).toLocaleDateString("en-PH");
}

/** Verbose date+time used for transaction timestamps. */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStockStatus(count: number): StockStatus & { colorScheme: string } {
  if (count === 0) return { label: "Out of Stock", color: "#e53e3e", colorScheme: "red" };
  if (count <= 10) return { label: "Low Stock", color: "#dd6b20", colorScheme: "orange" };
  return { label: "In Stock", color: "#38a169", colorScheme: "green" };
}

export function getExpirationStatus(dateString: string | undefined | null) {
  if (!dateString) return { color: "#718096", isExpired: false, isNearExpiry: false };

  const expirationDate = new Date(dateString);
  const today = new Date();
  const daysDiff = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) return { color: "#e53e3e", isExpired: true, isNearExpiry: false };
  if (daysDiff <= 7) return { color: "#dd6b20", isExpired: false, isNearExpiry: true };
  if (daysDiff <= 30) return { color: "#ecc94b", isExpired: false, isNearExpiry: true };
  return { color: "#38a169", isExpired: false, isNearExpiry: false };
}

const PLACEHOLDER_SMALL = "https://via.placeholder.com/60?text=No+Image";
const PLACEHOLDER_LARGE = "https://via.placeholder.com/200x150?text=No+Image";

/** Resolves product image paths against the API base URL. */
export function getImageUrl(imageUrl: string | undefined | null, size: "small" | "large" = "small"): string {
  if (!imageUrl) return size === "large" ? PLACEHOLDER_LARGE : PLACEHOLDER_SMALL;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  if (imageUrl.startsWith("/")) return `${BASE_URL}${imageUrl}`;
  return `${BASE_URL}/${imageUrl}`;
}

export const LOW_STOCK_THRESHOLD = 10;
