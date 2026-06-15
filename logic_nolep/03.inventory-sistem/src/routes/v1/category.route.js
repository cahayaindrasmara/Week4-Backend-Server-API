import { Router } from 'express';
import auth from '../../middlewares/auth.js'
import validate from '../../middlewares/validate.js';
import CategoryValidation from '../../validations/category.validation.js';
import CategoryController from '../../controllers/category.controller.js';

const router = Router();

router
    .route('/')
    .post(auth(), validate(CategoryValidation.createCategory), CategoryController.createCategory)
    .get(auth(), CategoryController.getCategorys);

router
    .route('/:categoryId')
    .get(auth(), validate(CategoryValidation.getCategory),CategoryController.getCategory)
    .put(auth(), validate(CategoryValidation.updataCategory), CategoryController.updateCategory)
    .delete(auth(), validate(CategoryValidation.hardDeleteCategory), CategoryController.hardDeleteCategory)
    .patch(auth(), validate(CategoryValidation.softDeleteCategory), CategoryController.softDeleteCategory)

export default router;