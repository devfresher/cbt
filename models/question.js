import Joi from "joi";
import { mongoose } from 'mongoose';

export const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        minLength: 3,
    },
    subjectId: {
        type: String,
        required: true
    },
    options: {
        type: {},
        required: true
    },
    correctAns:{
        type: String,
        required: true
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
    })

    return schema.validate(question);
}

export default Question