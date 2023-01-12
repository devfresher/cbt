import Joi from "joi";
import objectId from 'joi-objectid';

import { mongoose, SchemaTypes } from 'mongoose';
import paginate from "mongoose-paginate-v2";

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
        type: SchemaTypes.ObjectId,
        ref: "subject"
    },
    noOfQuestion: {
        type: Number,
        required: true,
        default: 50
    },
    passMark: {
        type: Number,
        default: function () {
            return (this.noOfQuestion*0.4)
        }
    }
})

assessmentSchema.plugin(paginate)
const Assessment = mongoose.model('assessment', assessmentSchema)


export function validateCreateReq(req) {
    const schema = Joi.object({
        type: Joi.string().required().valid(...assessmentTypeList),
        status: Joi.boolean().default(false),
        duration: Joi.number().required(),
        scheduledDate: Joi.date().required(),
        instruction: Joi.string(),
        subjectId: Joi.objectId().required(),
        noOfQuestion: Joi.number(),
        passMark: Joi.number()
    })

    return schema.validate(req);
}
export function validateUpdateReq(req) {
    const schema = Joi.object({
        type: Joi.string().valid(...assessmentTypeList),
        status: Joi.boolean().default(false),
        duration: Joi.number(),
        scheduledDate: Joi.date(),
        instruction: Joi.string(),
        subjectId: Joi.objectId(),
        noOfQuestion: Joi.number(),
        passMark: Joi.number()
    })

    return schema.validate(req);
}

export function validateStartAssessment(req) {
    const schema = Joi.object({
        assessmentType: Joi.string().required().valid(...assessmentTypeList),
    })

    return schema.validate(req);
}

export function validateCompleteAssessment(req) {
    const schema = Joi.object({
        assessmentId: Joi.objectId().required(),
        totalQuestions: Joi.number().required(),
        totalAttempted: Joi.number().required(),
        totalCorrectAnswer: Joi.number().required(),
        totalWrongAnswer: Joi.number().required()
    })

    return schema.validate(req);
}
export default Assessment