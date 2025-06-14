import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionEmployee: {
      type: String,
      required: true
      // setup global state so u can lookup current active employee for default value
      // or idk
    },
    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    transactCart: [
      {
        // maybe just get id here as a ref or something? then fill the other values in the backend or api logic?
        // goal is to just display the relevant info for the item from the id alone (since the employee is just gonna be seelctingthe item the customer purhcased / involvoed in transaction)
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
    transactionAmountPaid: {
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

