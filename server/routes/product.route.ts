import { Router } from "express";
import {
  getProducts,
  postProducts,
  deleteProduct,
  putProduct,
} from "../controllers/product.controller.js";
import { requireLogin } from "../middleware/auth.middleware.js";

const productRouter = Router();

productRouter.use(requireLogin);
productRouter.get("/", getProducts);
productRouter.post("/", postProducts);
productRouter.put("/:id", putProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
