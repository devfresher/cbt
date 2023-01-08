import Joi from "joi";
import objectId from 'joi-objectid'
import { mongoose, SchemaType, SchemaTypes } from 'mongoose';

Joi.objectId = objectId(Joi)

export const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        minLength: 3,
    },
    subjectId: {
        type: SchemaTypes.ObjectId,
        required: true,
        ref: "subject"
    },
    options: {
        type: {},
        required: true
    },
    correctAns: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
    }
})
const Question = mongoose.model('question', questionSchema)


export function validateQuestion(question) {
    const schema = Joi.object({
        question: Joi.string().min(5).required(),
        optionA: Joi.string().required(),
        optionB: Joi.string().required(),
        optionC: Joi.string().required(),
        optionD: Joi.string().required(),
        answer: Joi.string().required(),
        image: Joi.string(),
        subjectId: Joi.objectId().required(),
    })

    return schema.validate(question);
}

export default Question