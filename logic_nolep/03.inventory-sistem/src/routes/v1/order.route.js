import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import OrderValidation from "../../validations/order.validation.js";
import OrderController from "../../controllers/order.controller.js";
import OrderItemValidation from "../../validations/orderItem.validation.js";
import OrderItemController from "../../controllers/orderItem.controller.js";

const router = Router();

router
    .route('/')
    .post(auth(), validate(OrderValidation.createOrder), OrderController.createOrder)
    .get(auth(), OrderController.getOrders)

router
    .route('/:orderId')
    .get(auth(), validate(OrderValidation.getOrderByID), OrderController.getOrderByID)
    .put(auth(), validate(OrderValidation.updateOrder), OrderController.updateOrder)
    .delete(auth(), validate(OrderValidation.hardDeleteOrder), OrderController.hardDeleteOrder)
    .patch(auth(), validate(OrderValidation.softDeleteOrder), OrderController.softDeleteOrder)

router.get('/:orderId/order-items', validate(OrderItemValidation.getOrderItemByOrder), OrderItemController.getOrderItemByOrder)

export default router;