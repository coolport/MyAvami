import mongoose from "mongoose";
import Supplier from "../models/supplier.model.js";

export const isValidObjectId = (id: string): boolean =>
  mongoose.Types.ObjectId.isValid(id);

/**
 * Resolves which of the given supplier IDs exist in the database.
 * Returns a set of the existing IDs (as strings).
 */
export const getExistingSupplierIds = async (
  supplierIds: string[]
): Promise<Set<string>> => {
  const existing = await Supplier.find({ _id: { $in: supplierIds } }).select(
    "_id"
  );
  return new Set(existing.map((s) => s._id.toString()));
};
