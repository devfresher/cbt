import { isValidObjectId } from "mongoose";

export default (validator) => {
    return (req, res, next) => {
        const { error } = validator(req.body);
        if (error) return res.status(400).json(error.details[0].message)

        next()
    }
}

export const validateObjectId = (idName) => {
    return (req, res, next) => {
        if(!isValidObjectId(req.params[idName])) return res.status(400).json(`Invalid ${idName} passed`)

        next()
    }
}