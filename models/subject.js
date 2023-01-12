import Joi from "joi";
import objectid from "joi-objectid";
import { mongoose, SchemaTypes } from 'mongoose';
import paginate from "mongoose-paginate-v2";
import { classSchema } from "./class.js";

Joi.objectId = objectid(Joi)

export const subjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    class: {
        type: classSchema,
        required: true
    },
    teacher: {
        type: SchemaTypes.ObjectId
    }
})
subjectSchema.plugin(paginate)
const Subject = mongoose.model('subject', subjectSchema)


export function validateCreateReq(req) {
    const schema = Joi.object({
        title: Joi.string().min(5).max(50).required(),
        classId: Joi.objectId().required(),
        teacherId: Joi.objectId()
    })

    return schema.validate(req);
}

export function validateUpdateReq(req) {
    const schema = Joi.object({
        title: Joi.string().min(5).max(50),
        classId: Joi.objectId(),
        teacherId: Joi.objectId()
    })

    return schema.validate(req);
}
export default Subject