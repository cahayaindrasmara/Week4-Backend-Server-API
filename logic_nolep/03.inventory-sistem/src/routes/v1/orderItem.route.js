import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import OrderItemController from "../../controllers/orderItem.controller.js";
import OrderItemValidation from "../../validations/orderItem.validation.js";

const router = Router();

router
    .route('/')
    .post(auth(), validate(OrderItemValidation.createOrderItem), OrderItemController.createOrderItem)
    .get(auth(), OrderItemController.getOrderItems)

router
    .route('/:orderItemId')
    .get(auth(), validate(OrderItemValidation.getOrderItemByID), OrderItemController.getOrderItemByID)
    .put(auth(), validate(OrderItemValidation.updateOrderItem), OrderItemController.updateOrderItem)
    .delete(auth(), validate(OrderItemValidation.hardDeleteOrderItem), OrderItemController.hardDeleteOrderItem)
    
export default router