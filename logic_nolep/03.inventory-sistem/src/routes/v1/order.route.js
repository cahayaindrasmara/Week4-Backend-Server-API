import { Router } from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import OrderValidation from '../../validations/order.validation.js';
import OrderController from '../../controllers/order.controller.js';
import OrderItemValidation from '../../validations/orderItem.validation.js';
import OrderItemController from '../../controllers/orderItem.controller.js';
import authorization from '../../middlewares/authorizarion.js';

const router = Router();

router
  .route('/')
  .post(auth(), authorization('admin'), validate(OrderValidation.createOrder), OrderController.createOrder)
  .get(auth(), authorization('admin'), OrderController.getOrders);

router
  .route('/:orderId')
  .get(auth(), authorization('admin'), validate(OrderValidation.getOrderByID), OrderController.getOrderByID)
  .put(auth(), authorization('admin'), validate(OrderValidation.updateOrder), OrderController.updateOrder)
  .delete(auth(), authorization('admin'), validate(OrderValidation.hardDeleteOrder), OrderController.hardDeleteOrder)
  .patch(auth(), authorization('admin'), validate(OrderValidation.softDeleteOrder), OrderController.softDeleteOrder);

router.get(
  '/:orderId/order-items', auth(), authorization('admin'),
  validate(OrderItemValidation.getOrderItemByOrder),
  OrderItemController.getOrderItemByOrder,
);

export default router;
