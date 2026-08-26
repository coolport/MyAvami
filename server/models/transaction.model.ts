import mongoose from "mongoose";

export interface ITransactionCartItem {
  transactionCartItemName: string;
  transactionCartItemID: string;
  transactionCartItemCount: number;
}

export interface ITransaction {
  transactionEmployee: string;
  transactionDate: Date;
  transactCart: ITransactionCartItem[];
  transactionTotal: number;
  transactionAmountPaid: number;
  transactionDiscount: boolean;
  transactionPaymentMethod: string;
}

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    transactionEmployee: {
      type: String,
      required: true,
    },
    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    transactCart: [
      {
        transactionCartItemName: {
          type: String,
          required: true,
          ref: "Product",
        },
        transactionCartItemID: {
          type: String,
          required: true,
          ref: "Product",
        },
        transactionCartItemCount: {
          type: Number,
          required: true,
        },
      },
    ],
    transactionTotal: {
      type: Number,
      required: true,
    },
    transactionAmountPaid: {
      type: Number,
      required: true,
    },
    transactionDiscount: {
      type: Boolean,
      required: true,
    },
    transactionPaymentMethod: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;
