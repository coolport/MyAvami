import express from 'express';
// import { postUser, putUser, getUser } from '../controllers/user.controller.js';

const supplierRouter = express.Router();

//Create routes
//make sure to pass as reference. error msg for calling controllers is vague
supplierRouter.get("/", getSupplier);
supplierRouter.post("/", postSupplier);
supplierRouter.put("/:id", putSupplier);

// router.delete("/:id", deleteProduct);

export default supplierRouter;
