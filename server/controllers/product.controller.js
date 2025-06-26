import Product from "../models/product.model.js";
import Supplier from "../models/supplier.model.js";
import mongoose from 'mongoose';

export const getProducts = async (req, res) => {
  try {
    // Populate supplier data when fetching products
    const products = await Product.find({}).populate('supplierId', 'supplierName supplierEmail supplierAddress supplierNumber');
    res.status(200).json({ success: true, data: products, string: "hi" });
  } catch (error) {
    console.error("Error fetching products: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const postProducts = async (req, res) => {
  const body = req.body;

  if (Array.isArray(body)) {
    // Bulk product creation
    const isValid = body.every(p =>
      p.itemName &&
      p.itemBrandName &&
      p.itemDescription &&
      p.itemPrice &&
      p.itemCount &&
      p.itemImage &&
      p.itemCategory &&
      p.supplierId
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields for every product including supplierId"
      });
    }

    // Validate all supplier IDs exist
    const supplierIds = body.map(p => p.supplierId);
    const uniqueSupplierIds = [...new Set(supplierIds)];

    try {
      const existingSuppliers = await Supplier.find({ _id: { $in: uniqueSupplierIds } });
      const existingSupplierIds = existingSuppliers.map(s => s._id.toString());

      const invalidSupplierIds = uniqueSupplierIds.filter(id => !existingSupplierIds.includes(id));

      if (invalidSupplierIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid supplier IDs: ${invalidSupplierIds.join(', ')}`
        });
      }

      const newProducts = await Product.insertMany(body);
      // Populate supplier data in response
      const populatedProducts = await Product.find({ _id: { $in: newProducts.map(p => p._id) } })
        .populate('supplierId', 'supplierName supplierEmail');

      res.status(201).json({ success: true, data: populatedProducts });
    } catch (error) {
      console.error("Error in Bulk Create Product: ", error.message);
      res.status(500).json({ success: false, message: "Server Error (Bulk)" });
    }
  } else {
    // Single product creation
    const product = req.body;

    // Updated validation to include all required fields
    if (!product.itemName ||
      !product.itemBrandName ||
      !product.itemDescription ||
      !product.itemPrice ||
      !product.itemCount ||
      !product.itemImage ||
      !product.itemCategory ||
      !product.supplierId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields including supplierId"
      });
    }

    // Validate supplier exists
    if (!mongoose.Types.ObjectId.isValid(product.supplierId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID format"
      });
    }

    try {
      const supplierExists = await Supplier.findById(product.supplierId);
      if (!supplierExists) {
        return res.status(400).json({
          success: false,
          message: "Supplier not found"
        });
      }

      const newProduct = new Product(product);
      await newProduct.save();

      // Populate supplier data in response
      const populatedProduct = await Product.findById(newProduct._id)
        .populate('supplierId', 'supplierName supplierEmail');

      console.log('REQPARAMS: ', req.body);
      res.status(201).json({ success: true, data: populatedProduct });
    } catch (error) {
      console.error("Error in Create Product: ", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
}

export const putProduct = async (req, res) => {
  const { id } = req.params;
  const product = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Product Id" });
  }

  // If supplierId is being updated, validate it exists
  if (product.supplierId) {
    if (!mongoose.Types.ObjectId.isValid(product.supplierId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID format"
      });
    }

    try {
      const supplierExists = await Supplier.findById(product.supplierId);
      if (!supplierExists) {
        return res.status(400).json({
          success: false,
          message: "Supplier not found"
        });
      }
    } catch (error) {
      console.error("Error validating supplier: ", error.message);
      return res.status(500).json({ success: false, message: "Server Error" });
    }
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true })
      .populate('supplierId', 'supplierName supplierEmail');

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error in PUTTING Product: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  console.log(req.params);
  console.log("id:", id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Product Id" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    console.log('REQPARAMS: ', req.params);
    res.status(200).json({ success: true, message: "Product Deleted" });
  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Optional: Add utility function to get products by supplier
export const getProductsBySupplier = async (req, res) => {
  const { supplierId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    return res.status(404).json({ success: false, message: "Invalid Supplier Id" });
  }

  try {
    const products = await Product.find({ supplierId })
      .populate('supplierId', 'supplierName supplierEmail');
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products by supplier: ", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
