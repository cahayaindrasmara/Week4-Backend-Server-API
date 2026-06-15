import Joi from 'joi';
import { objectId } from './custom.validation.js';

class OrderValidation {
    static createOrder = {
        body: Joi.object().keys({
            totalPrice: Joi.number().required(),
            customerName: Joi.string().required(),
            customerEmail: Joi.string().required(),
            userId: Joi.string().custom(objectId)
        })
    }

    static getOrderByID = {
        params: Joi.object().keys({
            orderId: Joi.string().custom(objectId),
        })
    }

    static getOrderByUser = {
        params: Joi.object().keys({
            userId: Joi.string().custom(objectId)
        })
    }

    static updateOrder = {
        params: Joi.object().keys({
            orderId: Joi.string().custom(objectId)
        }),
        body: Joi.object().keys({
            totalPrice: Joi.number().required(),
            customerName: Joi.string().required(),
            customerEmail: Joi.string().required(),
            userId: Joi.string().custom(objectId)
        })
    }

    static hardDeleteOrder = {
        params: Joi.object().keys({
            orderId: Joi.string().custom(objectId),
        })
    }

    static softDeleteOrder = {
        params: Joi.object().keys({
            orderId: Joi.string().custom(objectId),
        })
    }
}

export default OrderValidation;