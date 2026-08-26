import type { RequestHandler } from "express";
import Transaction from "../models/transaction.model.js";
import { isValidObjectId } from "../utils/validation.js";

export const getTransactions: RequestHandler = async (_req, res) => {
  try {
    const transactions = await Transaction.find({});
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error fetching transactions:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const postTransactions: RequestHandler = async (req, res) => {
  const newTransaction = new Transaction(req.body);

  try {
    await newTransaction.save();
    res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    console.error("Error in Create Transaction:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteTransaction: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Transaction Id" });
  }

  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({ success: true, message: "Transaction Deleted" });
  } catch (error) {
    console.error("Error deleting transaction:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
