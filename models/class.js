import Joi from "joi"
import joiObjectid from "joi-objectid"
import { mongoose, SchemaTypes } from "mongoose"
import paginate from "mongoose-paginate-v2"

Joi.objectId = joiObjectid(Joi)
export const classSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		maxLength: 255,
	},
	teacher: {
		type: SchemaTypes.ObjectId,
	},
})

classSchema.plugin(paginate)
const Class = mongoose.model("class", classSchema)

export function validateClass(theClass) {
	const schema = Joi.object({
		title: Joi.string().min(3).max(50).required(),
		teacher: Joi.objectId(),
		description: Joi.string().max(255),
	})

	return schema.validate(theClass)
}

export function validateUpdate(req) {
	const schema = Joi.object({
		title: Joi.string().min(3).max(50),
		teacher: Joi.objectId(),
		description: Joi.string().max(255),
	})

	return schema.validate(req)
}

export default Class
