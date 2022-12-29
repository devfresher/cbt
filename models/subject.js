import Joi from "joi";
import { mongoose } from 'mongoose';
import { classSchema } from "./class.js";

export const subjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    class: {
        type: classSchema,
        required: true
    }
})
const Subject = mongoose.model('subject', subjectSchema)


export function validateSubject(subject) {
    const schema = Joi.object({
        title: Joi.string().min(5).max(50).required(),
    })

    return schema.validate(subject);
}

export default Subject