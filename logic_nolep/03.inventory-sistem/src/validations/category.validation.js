import Joi from 'joi';
import { objectId } from './custom.validation.js';

class CategoryValidation {
    static createCategory = {
        body: Joi.object().keys({
            name: Joi.string().required(),
        })
    }

    static getCategory = {
        params: Joi.object().keys({
            categoryId: Joi.string().custom(objectId),
        })
    }

    static updataCategory = {
        params: Joi.object().keys({
            categoryId: Joi.string().custom(objectId),
        }),
        body: Joi.object().keys({
            name: Joi.string()
        }).min(1)
    }

    static hardDeleteCategory = {
        params: Joi.object().keys({
            categoryId: Joi.string().custom(objectId),
        })
    }

    static softDeleteCategory = {
        params: Joi.object().keys({
            categoryId: Joi.string().custom(objectId),
        })
    }
}

export default CategoryValidation;