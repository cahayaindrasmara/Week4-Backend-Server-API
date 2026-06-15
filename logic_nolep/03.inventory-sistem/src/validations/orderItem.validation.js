import Joi from "joi";
import { objectId } from "./custom.validation.js";

class OrderItemValidation {
    static createOrderItem = {
        body: Joi.object().keys({
            orderId: Joi.string().custom(objectId).required(),
            productId: Joi.string().custom(objectId).required(),
            quantity: Joi.number().required(),
            unitPrice: Joi.number().required()
        })
    }

    static getOrderItemByID = {
        params: Joi.object().keys({
            orderItemId: Joi.string().custom(objectId),
        })
    }

    static getOrderItemByOrder = {
        params: Joi.object().keys({
            orderId: Joi.string().custom(objectId),
        })
    }

    static updateOrderItem = {
        params: Joi.object().keys({
            orderItemId: Joi.string().custom(objectId),
        }),
        body: Joi.object().keys({
            orderId: Joi.string().custom(objectId).required(),
            productId: Joi.string().custom(objectId).required(),
            quantity: Joi.number().required(),
            unitPrice: Joi.number().required()
        })
    }

    static hardDeleteOrderItem = {
        params: Joi.object().keys({
            orderItemId: Joi.string().custom(objectId)
        })
    }
}

export default OrderItemValidation;