import { isValidObjectId } from "mongoose";

export const validateRequest =  (validator) => {
    return (req, res, next) => {
        const { error } = validator(req.body);
        const response = {
            status: 'fail',
            details: { error: { message: error.details[0].message } }
        }
        if (error) return res.status(400).json(response)

        next()
    }
}

export const validateObjectId = (idName) => {
    return (req, res, next) => {
        if(!isValidObjectId(req.params[idName])) return res.status(400).json(`Invalid ${idName} passed`)

        next()
    }
}