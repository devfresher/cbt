import _ from "lodash"
import * as questionModel from "../models/question.js"
import * as subjectService from "../services/subject.service.js"

import * as questionService from "../services/question.service.js"

export const create = async (req, res, next) => {
	let { error } = questionModel.validateCreateReq(req.body)
	if (error) throw { status: "error", code: 400, message: error.details[0].message }

	const newQuestion = await questionService.createQuestion(req.body, req.file)
	next({ status: "success", data: newQuestion })
}

export const batchCreate = async (req, res, next) => {
	if (!req.file) throw { status: "error", code: 400, message: "No csv file uploaded" }
	const result = await questionService.batchCreateQuestion(req.file)

	if (_.isEmpty(result.newQuestions)) {
		throw {
			status: "error",
			code: 422,
			message: { content: "No question record was created", errors: result.errors },
		}
	} else if (!_.isEmpty(result.errors) && !_.isEmpty(result.newQuestions)) {
		next({
			status: "success",
			data: {
				errors: result.errors,
				message: `${result.newQuestions.length} new questions created, and ${result.errors.length} questions failed to create`,
			},
		})
	} else {
		next({
			status: "success",
			data: { message: `${result.newQuestions.length} new questions created` },
		})
	}
}

export const updateQuestion = async (req, res, next) => {
	let { error } = questionModel.validateUpdateReq(req.body)
	if (error) throw { status: "error", code: 400, message: error.details[0].message }

	const question = await questionService.getOneQuestion({ _id: req.params.questionId })
	const updatedQuestion = await questionService.updateQuestion(question, req)

	next({ status: "success", data: updatedQuestion })
}

export const fetchAllBySubject = async (req, res, next) => {
	const subject = await subjectService.getOneSubject({ _id: req.params.subjectId })

	const questions = await questionService.getMany({ subjectId: subject._id }, req.query)
	next({ status: "success", data: questions })
}

export const fetchAll = async (req, res, next) => {
	const questions = await questionService.getMany({}, req.query)
	next({ status: "success", data: questions })
}

export const fetchById = async (req, res, next) => {
	const subject = await subjectService.getOneSubject({ _id: req.params.subjectId })
	const question = await questionService.getOneQuestion({
		_id: req.params.questionId,
		subject: subject._id,
	})

	next({ status: "success", data: question })
}

export const deleteQuestion = async (req, res, next) => {
	const deleted = await questionService.deleteQuestion({ _id: req.params.questionId })
	next({ status: "success", code: 204, data: deleted })
}
