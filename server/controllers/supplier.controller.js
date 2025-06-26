import Supplier from "../models/supplier.model.js";
import mongoose from "mongoose";

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.status(200).json({ success: true, data: suppliers });
  } catch (error) {
    console.error("Error fetching suppliers: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const postSupplier = async (req, res) => {
  const body = req.body;
  if (Array.isArray(body)) {
    const isValid = body.every(
      (s) =>
        s.supplierName &&
        s.supplierEmail &&
        s.supplierAddress &&
        s.supplierNumber
    );
    if (!isValid) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all fields for every supplier",
        });
    }

    try {
      const newSuppliers = await Supplier.insertMany(body);
      res.status(201).json({ success: true, data: newSuppliers });
    } catch (error) {
      console.error("Error in Bulk Create Supplier: ", error.message);
      res.status(500).json({ success: false, message: "Server Error (Bulk)" });
    }
  } else {
    const supplier = req.body;
    if (
      !supplier.supplierName ||
      !supplier.supplierEmail ||
      !supplier.supplierAddress ||
      !supplier.supplierNumber
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all fields" });
    }

    const newSupplier = new Supplier(supplier);

    try {
      await newSupplier.save();
      res.status(201).json({ success: true, data: newSupplier });
    } catch (error) {
      console.error("Error in Create Supplier: ", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
};

export const putSupplier = async (req, res) => {
  const { id } = req.params;
  const supplier = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Supplier Id" });
  }

  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(id, supplier, {
      new: true,
    });
    res.status(200).json({ success: true, data: updatedSupplier });
  } catch (error) {
    console.error("Error in PUTTING Supplier: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    await Supplier.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Supplier Deleted" });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
