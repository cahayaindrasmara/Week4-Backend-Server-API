import { Router } from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import OrderItemController from '../../controllers/orderItem.controller.js';
import OrderItemValidation from '../../validations/orderItem.validation.js';
import authorization from '../../middlewares/authorizarion.js';

const router = Router();

router
  .route('/')
  .post(auth(), authorization('admin'), validate(OrderItemValidation.createOrderItem), OrderItemController.createOrderItem)
  .get(auth(), authorization('admin'), OrderItemController.getOrderItems);

router
  .route('/:orderItemId')
  .get(auth(), authorization('admin'), validate(OrderItemValidation.getOrderItemByID), OrderItemController.getOrderItemByID)
  .put(auth(), authorization('admin'), validate(OrderItemValidation.updateOrderItem), OrderItemController.updateOrderItem)
  .delete(auth(), authorization('admin'), validate(OrderItemValidation.hardDeleteOrderItem), OrderItemController.hardDeleteOrderItem);

export default router;
