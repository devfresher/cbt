import _ from "lodash"
import * as assessmentModel from "../models/assessment.js"

import * as assessmentService from "../services/assessment.service.js"
import * as subjectService from "../services/subject.service.js"

export const createAssessment = async (req, res, next) => {
	let { error } = assessmentModel.validateCreateReq(req.body)
	if (error) throw { status: "error", code: 400, message: error.details[0].message }

	const newAssessment = await assessmentService.createAssessment(req)
	next({ status: "success", data: newAssessment })
}

export const updateAssessment = async (req, res, next) => {
	let { error } = assessmentModel.validateUpdateReq(req.body)
	if (error) throw { status: "error", code: 400, message: error.details[0].message }

	const assessment = await assessmentService.getOneAssessment({ _id: req.params.assessmentId })
	const updatedAssessment = await assessmentService.updateAssessment(assessment, req)

	next({ status: "success", data: updatedAssessment })
}

export const fetchAllAssessment = async (req, res, next) => {
	const assessment = await assessmentService.getMany({}, req.query)
	next({ status: "success", data: assessment })
}

export const fetchAllAssessmentTaken = async (req, res, next) => {
	const assessments = await assessmentService.getAllTaken()
	next({ status: "success", data: assessments })
}

export const fetchAllBySubject = async (req, res, next) => {
	const subject = await subjectService.getOneSubject({ _id: req.params.subjectId })

	const assessments = await assessmentService.getMany({ subject: subject._id }, req.query)
	next({ status: "success", data: assessments })
}

export const fetchById = async (req, res, next) => {
	const subject = await subjectService.getOneSubject({ _id: req.params.subjectId })
	const assessment = await assessmentService.getOneAssessment({
		_id: req.params.assessmentId,
		subject: subject._id,
	})

	next({ status: "success", data: assessment })
}

export const deleteAssessment = async (req, res, next) => {
	const deleted = await assessmentService.deleteAssessment({ _id: req.params.assessmentId })
	next({ status: "success", code: 204, data: deleted })
}

export const startAssessment = async (req, res, next) => {
	let { error } = assessmentModel.validateStartAssessment(req.body)
	if (error) throw { status: "error", code: 400, message: error.details[0].message }

	const assessment = await assessmentService.startAssessment(
		req.user._id,
		req.body.assessmentType
	)
	next({ status: "success", data: assessment })
}

export const completeAssessment = async (req, res, next) => {
	let { error } = assessmentModel.validateCompleteAssessment(req.body)
	if (error) throw { status: "error", code: 400, message: error.details[0].message }

	const assessmentTaken = await assessmentService.completeAssessment(req.user._id, req.body)
	next({ status: "success", data: assessmentTaken })
}
