import Joi from "joi";
import objectId from 'joi-objectid';

import { mongoose, SchemaTypes } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2'

Joi.objectId = objectId(Joi);

export const assessmentTakenSchema = new mongoose.Schema({
    assessment: {
        type: SchemaTypes.ObjectId,
        ref: 'assessment',
        required: true,
    },
    student: {
        type: SchemaTypes.ObjectId,
        ref: 'user',
        required: true,
    },
    questionsSupplied: [{
        type: SchemaTypes.ObjectId,
        ref: 'question',
    }],
    totalQuestionSupplied: {
        type: Number,
        required: true,
    },
    totalAttemptedQuestion: {
        type: Number,
    },
    totalCorrectAnswer: {
        type: Number,
    },
    totalWrongAnswer: {
        type: Number,
    },
    grade: {
        type: String
    },
    score: {
        type: Number
    },
    startedAt: {
        type: Date,
        required: true,
        default: Date.now()
    },
    completedAt: {
        type: Date,
    }
})

assessmentTakenSchema.plugin(aggregatePaginate)
const AssessmentTaken = mongoose.model('assessment_taken', assessmentTakenSchema)

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
export default AssessmentTaken