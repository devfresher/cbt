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
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "question"
        }
    ],
    passMark: {
        type: Number,
        default: function () {
            return (this.questions.length*0.4)
        }
    },
    resultReleased: {
        type: Boolean,
        default: false
    }
})

// assessmentSchema.path('questions').validate(async function(value) {
//     if (!value) return true;
//     const ids = value.map(id => mongoose.Types.ObjectId(id));
//     console.log(ids);
//     const count = await mongoose.model('question').countDocuments({ _id: { $in: ids } });
//     return count === ids.length;
// }, 'Invalid questions. Some question ids does not exist');

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
        // noOfQuestion: Joi.number(),
        questions: Joi.array(),
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
        // noOfQuestion: Joi.number(),
        questions: Joi.array(),
        passMark: Joi.number(),
        releaseResult: Joi.boolean(),
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
        totalAttempted: Joi.number().required(),
        totalCorrectAnswer: Joi.number().required(),
        totalWrongAnswer: Joi.number().required()
    })

    return schema.validate(req);
}
export default Assessment