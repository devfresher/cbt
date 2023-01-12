import _ from 'lodash'
import { isValidObjectId } from "mongoose";

export const validateRequest =  (validator) => {
    return (req, res, next) => {
        const { error } = validator(req.body);
        if(error) throw { status: 'error', code: 400, message: error.details[0].message }

        next()
    }
}

export const validateObjectIds = (idNames) => {
    return (req, res, next) => {
        idNames = Array.isArray(idNames) ? idNames:[idNames]
        _.find(idNames, 
            (idName) => {
                if(!isValidObjectId(req.params[idName])) throw {status: "error", code: 400, message: `Invalid ${idName} passed`}
            }
        )

        next()
    }
}