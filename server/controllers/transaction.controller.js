import Transaction from "../models/transaction.model.js";
import mongoose from 'mongoose';

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    res.status(200).json({ success: true, data: transactions, string: "works" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "failedzz" });
  }
}

export const postTransactions = async (req, res) => {
  const transaction = req.body;
  const newTransaction = new Transaction(transaction);
  try {
    await newTransaction.save();
    console.log('REQPARAMS: ', transaction);
    res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "failed" });
  }
}

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  console.log("Deleting transaction ID:", id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Transaction Id" });
  }

  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(id);
    if (!deletedTransaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }
    console.log('Deleted transaction:', deletedTransaction);
    res.status(200).json({ success: true, message: "Transaction Deleted" });
  } catch (error) {
    console.error("Error deleting transaction:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
