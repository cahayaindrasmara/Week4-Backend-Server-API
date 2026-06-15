import Joi from "joi";
import { objectId, password } from "./custom.validation.js";

class UserValidation {
    static createUser = {
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().custom(password).required(),
            role: Joi.string()
        })
    }

    static getUser = {
        params: Joi.object().keys({
            userId: Joi.string().custom(objectId),
        })
    }

    static updateUser = {
        params: Joi.object().keys({
            userId: Joi.string().custom(objectId),
        }),
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().custom(password).required(),
            role: Joi.string()
        })
    }

    static hardDeleteUser = {
        params: Joi.object().keys({
            userId: Joi.string().custom(objectId),
        })
    }

    static softDeleteUser = {
        params: Joi.object().keys({
            userId: Joi.string().custom(objectId),
        })
    }
}

export default UserValidation;