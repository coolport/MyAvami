//Presentational layer (routes in this case)
//this is where logic is passed from the controller
import express from 'express';
import { getProducts, postProducts, deleteProduct, putProduct } from '../controllers/product.controller.js';

const productRouter = express.Router();

//Create routes
productRouter.get("/", getProducts);
productRouter.post("/", postProducts);
productRouter.put("/:id", putProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
