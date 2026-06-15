import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import ProductValidation from "../../validations/product.validation.js";
import ProductController from "../../controllers/product.controller.js";

const router = Router();

router
    .route('/')
    .post(auth(), validate(ProductValidation.createProduct), ProductController.createProduct)
    .get(auth(), ProductController.getProducts)

router
    .route('/:productId')
    .get(auth(), validate(ProductValidation.getProductByID), ProductController.getProductByID)
    .put(auth(), validate(ProductValidation.updateProduct), ProductController.updateProduct)
    .delete(auth(), validate(ProductValidation.hardDeleteProduct), ProductController.hardDeleteProduct)
    .patch(auth(), validate(ProductValidation.softDeleteProduct), ProductController.softDeleteProduct)
    
export default router