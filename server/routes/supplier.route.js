import express from 'express';
import { getSuppliers, postSupplier, putSupplier, deleteSupplier } from '../controllers/supplier.controller.js';

const supplierRouter = express.Router();

//Create routes
//make sure to pass as reference. error msg for calling controllers is vague
supplierRouter.get("/", getSuppliers);
supplierRouter.post("/", postSupplier);
supplierRouter.put("/:id", putSupplier);
supplierRouter.delete("/:id", deleteSupplier);

// router.delete("/:id", deleteProduct);

export default supplierRouter;
