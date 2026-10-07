import Joi from 'joi';
import { objectId } from './custom.validation.js';

class ProductValidation {
  static createProduct = {
    body: Joi.object().keys({
      name: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().required(),
      quantityInStock: Joi.number().required(),
      categoryId: Joi.string().custom(objectId),
      userId: Joi.string().custom(objectId),
    }),
  };

  static getProducts = {
    query: Joi.object().keys({
      category: Joi.string(),
    })
  }

  static getProductByID = {
    params: Joi.object().keys({
      productId: Joi.string().custom(objectId),
    }),
  };

  static getProductByUser = {
    params: Joi.object().keys({
      userId: Joi.string().custom(objectId),
    }),
  };

  static updateProduct = {
    params: Joi.object().keys({
      productId: Joi.string().custom(objectId),
    }),
    body: Joi.object().keys({
      name: Joi.string(),
      description: Joi.string(),
      price: Joi.number(),
      quantityInStock: Joi.number(),
      categoryId: Joi.string().custom(objectId),
      userId: Joi.string().custom(objectId),
    }).min(1),
  };

  static hardDeleteProduct = {
    params: Joi.object().keys({
      productId: Joi.string().custom(objectId),
    }),
  };

  static softDeleteProduct = {
    params: Joi.object().keys({
      productId: Joi.string().custom(objectId),
    }),
  };
}

export default ProductValidation;
