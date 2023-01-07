import Joi from "joi";
import objectId from 'joi-objectid';

import { mongoose, Schema } from 'mongoose';

Joi.objectId = objectId(Joi);

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
    instruction: {
        type: String,
        minLength: 5,
        maxLength: 255,
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: "subject"
    }
})

const Assessment = mongoose.model('assessment', assessmentSchema)


export function validateReq(req) {
    const schema = Joi.object({
        type: Joi.string().required().valid(...assessmentTypeList),
        status: Joi.boolean().default(false),
        duration: Joi.number().required(),
        scheduledDate: Joi.date().required(),
        instruction: Joi.string(),
        subjectId: Joi.objectId().required(),
    })

    return schema.validate(req);
}

export function validateStartAssessment(req) {
    const schema = Joi.object({
        assessmentType: Joi.string().required().valid(...assessmentTypeList),
    })

    return schema.validate(req);
}
export default Assessment