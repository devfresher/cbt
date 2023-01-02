import Joi from "joi";
import { mongoose } from 'mongoose';

const assessmentTypeList = ['exam', 'test']
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
        scheduledDate: Joi.date().format('YYYY-mm-dd H:i:s')
    })

    return schema.validate(req);
}

export default Assessment