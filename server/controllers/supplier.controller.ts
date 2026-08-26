import type { RequestHandler } from "express";
import Supplier from "../models/supplier.model.js";
import { isValidObjectId } from "../utils/validation.js";

const REQUIRED_FIELDS = [
  "supplierName",
  "supplierEmail",
  "supplierAddress",
  "supplierNumber",
  "supplierContactPersonName",
  "supplierContactPersonNumber",
] as const;

const hasAllFields = (s: Record<string, unknown>): boolean =>
  REQUIRED_FIELDS.every((field) => Boolean(s[field]));

export const getSuppliers: RequestHandler = async (_req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.status(200).json({ success: true, data: suppliers });
  } catch (error) {
    console.error("Error fetching suppliers:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const postSupplier: RequestHandler = async (req, res) => {
  const body = req.body;

  if (Array.isArray(body)) {
    if (!body.every((s) => hasAllFields(s))) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields for every supplier",
      });
    }

    try {
      const newSuppliers = await Supplier.insertMany(body);
      res.status(201).json({ success: true, data: newSuppliers });
    } catch (error) {
      console.error("Error in Bulk Create Supplier:", (error as Error).message);
      res.status(500).json({ success: false, message: "Server error" });
    }
    return;
  }

  const supplier = body as Record<string, unknown>;

  if (!hasAllFields(supplier)) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  try {
    const newSupplier = new Supplier(supplier);
    await newSupplier.save();
    res.status(201).json({ success: true, data: newSupplier });
  } catch (error) {
    console.error("Error in Create Supplier:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const putSupplier: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };
  const supplier = req.body;

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Supplier Id" });
  }

  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(id, supplier, {
      new: true,
    });

    if (!updatedSupplier) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }

    res.status(200).json({ success: true, data: updatedSupplier });
  } catch (error) {
    console.error("Error in PUTTING Supplier:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteSupplier: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Supplier Id" });
  }

  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(id);

    if (!deletedSupplier) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }

    res.status(200).json({ success: true, message: "Supplier Deleted" });
  } catch (error) {
    console.error("Error deleting supplier:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
