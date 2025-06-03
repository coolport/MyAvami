// WIP - modeling documentation is in product model
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionEmployee: {
      type: String,
      required: true
      // setup global state so u can lookup current active employee for default value
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
          ref: 'Product'
        },
        transactionCartItemID: {
          type: String,
          required: true,
          ref: 'Product'
        },
        transactionCartItemCount: {
          type: Number,
          required: true,
        },
      }
    ],
    transactionTotal: {
      type: Number,
      required: true
    },
    transactionDiscount: {
      type: Boolean,
      required: true
    },
    transactionPaymentMethod: {
      type: String,
      required: true
    },
  }, {
  timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;

