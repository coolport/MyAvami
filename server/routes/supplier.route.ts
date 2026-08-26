import { Router } from "express";
import {
  getSuppliers,
  postSupplier,
  putSupplier,
  deleteSupplier,
} from "../controllers/supplier.controller.js";
import { requireLogin } from "../middleware/auth.middleware.js";

const supplierRouter = Router();

supplierRouter.use(requireLogin);
supplierRouter.get("/", getSuppliers);
supplierRouter.post("/", postSupplier);
supplierRouter.put("/:id", putSupplier);
supplierRouter.delete("/:id", deleteSupplier);

export default supplierRouter;
