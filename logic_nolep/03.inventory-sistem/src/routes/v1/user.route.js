import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import UserValidation from "../../validations/userValidation.js";
import UserController from "../../controllers/user.controller.js";
import ProductValidation from "../../validations/product.validation.js";
import ProductController from "../../controllers/product.controller.js";
import OrderValidation from "../../validations/order.validation.js";
import OrderController from "../../controllers/order.controller.js";

const router = Router();

router
    .route('/')
    .post(auth(), validate(UserValidation.createUser), UserController.createUser)
    .get(auth(), UserController.getUsers)

router
    .route('/:userId')
    .get(auth(), validate(UserValidation.getUser), UserController.getUserById)
    .put(auth(), validate(UserValidation.updateUser), UserController.updateUser)
    .delete(auth(), validate(UserValidation.hardDeleteUser), UserController.hardDeleteUser)
    .patch(auth(), validate(UserValidation.softDeleteUser), UserController.softDeleteUser)

router.get('/:userId/products', validate(ProductValidation.getProductByUser), ProductController.getProductByUser)
router.get('/:userId/orders', validate(OrderValidation.getOrderByUser), OrderController.getOrderByUser);

export default router
