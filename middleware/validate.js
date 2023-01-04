import _ from 'lodash'
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

export const validateObjectIds = (idNames) => {
    return (req, res, next) => {
        idNames = Array.isArray(idNames) ? idNames:[idNames]
        _.find(idNames, 
            (idName) => {
                if(!isValidObjectId(req.params[idName])) return res.status(400).json(`Invalid ${idName} passed`)
            }
        )

        next()
    }
}