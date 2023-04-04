import Joi from "joi"
import objectId from "joi-objectid"
import { mongoose, SchemaType, SchemaTypes } from "mongoose"
import paginate from "mongoose-paginate-v2"

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
		ref: "subject",
	},
	options: {
		type: {},
		required: true,
	},
	correctAns: {
		type: String,
		required: true,
	},
	image: {
		type: {
			url: String,
			imageId: String,
		},
	},
})

questionSchema.plugin(paginate)
const Question = mongoose.model("question", questionSchema)

export function validateCreateReq(req) {
	const schema = Joi.object({
		question: Joi.string().min(5).required(),
		optionA: Joi.string().required(),
		optionB: Joi.string().required(),
		optionC: Joi.string().required(),
		optionD: Joi.string().required(),
		answer: Joi.string().required(),
		subjectId: Joi.objectId().required(),
	})

	return schema.validate(req)
}

export function validateUpdateReq(req) {
	const schema = Joi.object({
		question: Joi.string().min(5),
		optionA: Joi.string(),
		optionB: Joi.string(),
		optionC: Joi.string(),
		optionD: Joi.string(),
		answer: Joi.string(),
		subjectId: Joi.objectId(),
	})

	return schema.validate(req)
}

export default Question
