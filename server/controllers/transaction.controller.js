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
    console.error(console.error);
    res.status(200).json({ success: false, message: "failed" });
  }
}

