export type UserRole = "admin" | "employee";

export interface Supplier {
  _id: string;
  supplierName: string;
  supplierEmail: string;
  supplierAddress: string;
  supplierNumber: string;
  supplierContactPersonName: string;
  supplierContactPersonNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSupplierRef {
  _id: string;
  supplierName?: string;
  supplierEmail?: string;
  supplierAddress?: string;
  supplierNumber?: string;
}

export interface Product {
  _id: string;
  itemName: string;
  itemBrandName: string;
  itemDescription: string;
  itemPrice: number;
  itemExpiration?: string;
  itemCount: number;
  itemImage: string;
  itemCategory: string;
  /** Populated objects on read; raw id strings when sent to the API. */
  supplierIds: ProductSupplierRef[] | string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductPayload {
  itemName: string;
  itemBrandName: string;
  itemDescription: string;
  itemPrice: number;
  itemCount: number;
  itemImage: string;
  itemCategory: string;
  itemExpiration?: string;
  supplierIds: string[];
}

export interface TransactionCartItem {
  transactionCartItemName: string;
  transactionCartItemID: string;
  transactionCartItemCount: number;
}

export interface Transaction {
  _id: string;
  transactionEmployee: string;
  transactionDate: string;
  transactCart: TransactionCartItem[];
  transactionTotal: number;
  transactionAmountPaid: number;
  transactionDiscount: boolean;
  transactionPaymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionPayload {
  transactionEmployee: string;
  transactCart: TransactionCartItem[];
  transactionTotal: number;
  transactionAmountPaid: number;
  transactionDiscount: boolean;
  transactionPaymentMethod: string;
}

export interface User {
  _id: string;
  userUsername: string;
  userFullName: string;
  userRole: UserRole;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  notificationType: string;
  notificationTitle: string;
  notificationMessage: string;
  notificationUserInvolved?: string;
  notificationItemInvolved?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPayload {
  notificationType: string;
  notificationTitle: string;
  notificationMessage: string;
  notificationUserInvolved?: string;
  notificationItemInvolved?: string;
}

export interface Faq {
  _id: string;
  helpQuestion: string;
  helpAnswer: string;
  createdAt: string;
  updatedAt: string;
}

export interface FaqPayload {
  helpQuestion: string;
  helpAnswer: string;
}

export interface SessionUser {
  id: string;
  username: string;
  role: UserRole;
}
