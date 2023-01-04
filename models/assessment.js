import Joi from "joi";
import { mongoose } from 'mongoose';

const assessmentTypeList = ['Exam', 'Test']
export const assessmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: assessmentTypeList,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    duration: {
        type: Number,
        required: true,
    },
    scheduledDate: {
        type: Date
    },
    subjectId: {
        type: String
    }
})

const Assessment = mongoose.model('assessment', assessmentSchema)


export function validateCreateReq(req) {
    const schema = Joi.object({
        type: Joi.string().required().valid(...assessmentTypeList),
        status: Joi.boolean().default(false),
        duration: Joi.number().required(),
        scheduledDate: Joi.date().required()
    })

    return schema.validate(req);
}

export default Assessment