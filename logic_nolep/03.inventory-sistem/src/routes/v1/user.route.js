import { Router } from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import UserValidation from '../../validations/userValidation.js';
import UserController from '../../controllers/user.controller.js';
import ProductValidation from '../../validations/product.validation.js';
import ProductController from '../../controllers/product.controller.js';
import OrderValidation from '../../validations/order.validation.js';
import OrderController from '../../controllers/order.controller.js';
import authorization from '../../middlewares/authorizarion.js';

const router = Router();

router
  .route('/')
  .post(auth(), authorization('admin'), validate(UserValidation.createUser), UserController.createUser)
  .get(auth(), authorization('admin'), UserController.getUsers);

router
  .route('/:userId')
  .get(auth(), authorization('admin'), validate(UserValidation.getUser), UserController.getUserById)
  .put(auth(), authorization('admin'), validate(UserValidation.updateUser), UserController.updateUser)
  .delete(auth(), authorization('admin'), validate(UserValidation.hardDeleteUser), UserController.hardDeleteUser)
  .patch(auth(), authorization('admin'), validate(UserValidation.softDeleteUser), UserController.softDeleteUser);

router.get('/:userId/products', authorization('admin'), validate(ProductValidation.getProductByUser), ProductController.getProductByUser);
router.get('/:userId/orders', authorization('admin'), validate(OrderValidation.getOrderByUser), OrderController.getOrderByUser);

export default router;
