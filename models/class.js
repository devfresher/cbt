import Joi from "joi";
import { mongoose } from 'mongoose';

export const classSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        maxLength: 255
    }
})

const Class = mongoose.model('class', classSchema)


export function validateClass(theClass) {
    const schema = Joi.object({
        title: Joi.string().min(5).max(50).required(),
        description: Joi.string().max(255)
    })

    return schema.validate(theClass);
}

export function validateUpdate(req) {
    const schema = Joi.object({
        title: Joi.string().min(5).max(50),
        description: Joi.string().max(255)
    })

    return schema.validate(req);
}

export default Class