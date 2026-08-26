import type { RequestHandler } from "express";
import Product from "../models/product.model.js";
import {
  isValidObjectId,
  getExistingSupplierIds,
} from "../utils/validation.js";

const SUPPLIER_POPULATE_SINGLE = "supplierName supplierEmail";
const SUPPLIER_POPULATE_FULL =
  "supplierName supplierEmail supplierAddress supplierNumber";

const hasRequiredFields = (p: Record<string, unknown>): boolean =>
  Boolean(
    p.itemName &&
      p.itemBrandName &&
      p.itemDescription &&
      p.itemPrice &&
      p.itemCount &&
      p.itemImage &&
      p.itemCategory &&
      Array.isArray(p.supplierIds) &&
      p.supplierIds.length > 0
  );

export const getProducts: RequestHandler = async (_req, res) => {
  try {
    const products = await Product.find({}).populate(
      "supplierIds",
      SUPPLIER_POPULATE_FULL
    );
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

type ProductBody = Record<string, unknown> & { supplierIds?: string[] };

export const postProducts: RequestHandler = async (req, res) => {
  const body = req.body;

  if (Array.isArray(body)) {
    if (!body.every((p) => hasRequiredFields(p))) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all fields for every product including at least one supplier ID",
      });
    }

    const uniqueSupplierIds = [
      ...new Set(body.flatMap((p) => p.supplierIds as string[])),
    ];

    try {
      const existingIds = await getExistingSupplierIds(uniqueSupplierIds);
      const invalidIds = uniqueSupplierIds.filter((id) => !existingIds.has(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid supplier IDs: ${invalidIds.join(", ")}`,
        });
      }

      const newProducts = await Product.insertMany(body);
      const populatedProducts = await Product.find({
        _id: { $in: newProducts.map((p) => p._id) },
      }).populate("supplierIds", SUPPLIER_POPULATE_SINGLE);

      res.status(201).json({ success: true, data: populatedProducts });
    } catch (error) {
      console.error("Error in Bulk Create Product:", (error as Error).message);
      res.status(500).json({ success: false, message: "Server error" });
    }
    return;
  }

  const product = body as ProductBody;

  if (!hasRequiredFields(product)) {
    return res.status(400).json({
      success: false,
      message:
        "Please provide all required fields including at least one supplier ID",
    });
  }

  try {
    const supplierIds = product.supplierIds as string[];
    const invalidFormatIds = supplierIds.filter((id) => !isValidObjectId(id));
    if (invalidFormatIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID format",
      });
    }

    const existingIds = await getExistingSupplierIds(supplierIds);
    if (existingIds.size !== supplierIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more suppliers not found",
      });
    }

    const newProduct = new Product(product);
    await newProduct.save();

    const populatedProduct = await Product.findById(newProduct._id).populate(
      "supplierIds",
      SUPPLIER_POPULATE_SINGLE
    );

    res.status(201).json({ success: true, data: populatedProduct });
  } catch (error) {
    console.error("Error in Create Product:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const putProduct: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };
  const product = req.body as ProductBody;

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Product Id" });
  }

  if (product.supplierIds !== undefined) {
    if (!Array.isArray(product.supplierIds) || product.supplierIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "supplierIds must be a non-empty array",
      });
    }

    const invalidFormatIds = product.supplierIds.filter(
      (sid) => !isValidObjectId(sid)
    );
    if (invalidFormatIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID format",
      });
    }

    try {
      const existingIds = await getExistingSupplierIds(product.supplierIds);
      if (existingIds.size !== product.supplierIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more suppliers not found",
        });
      }
    } catch (error) {
      console.error("Error validating suppliers:", (error as Error).message);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, product, {
      new: true,
    }).populate("supplierIds", SUPPLIER_POPULATE_SINGLE);

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error in PUTTING Product:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProduct: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };

  if (!isValidObjectId(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Product Id" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product Deleted" });
  } catch (error) {
    console.error("Error deleting product:", (error as Error).message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
