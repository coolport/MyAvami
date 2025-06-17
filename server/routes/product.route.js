//Presentational layer (routes in this case)
//this is where logic is passed from the controller
import express from 'express';
import { getProducts, postProducts, deleteProduct, putProduct } from '../controllers/product.controller.js';
import { requireLogin, requireRole } from '../middleware/auth.middleware.js';

const productRouter = express.Router();

//Create routes



// apply auth middleware
// not working rn, wag muna galaawin
// productRouter.get("/", requireLogin, requireRole("admin"), getProducts);
productRouter.get("/", requireLogin, getProducts);

// productRouter.get("/", getProducts);

productRouter.post("/", postProducts);
productRouter.put("/:id", putProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
