import Joi from "joi";
import { mongoose } from 'mongoose';

const classSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    }
})

export const Class = mongoose.model('class', classSchema)

export function validateClass(theClass) {
    const schema = Joi.object({
        title: Joi.string().min(5).max(50).required()
    })

    return schema.validate(theClass);
}