import _ from "lodash"
import Assessment from "../models/assessment.js"
import AssessmentTaken from "../models/assessmentTaken.js"

import * as userService from "./user.service.js"
import * as subjectService from "./subject.service.js"
import { paginationLabel } from "../utils/pagination.js"

const activeAssessment = async (classId, assessmentType) => {
	const assessments = await Assessment.aggregate([
		{
			$lookup: {
				from: "subjects",
				localField: "subject",
				foreignField: "_id",
				as: "subject",
			},
		},
		{ $unwind: "$subject" },
		{
			$match: {
				"subject.class._id": classId,
				status: true,
				type: assessmentType,
			},
		},
		{
			$lookup: {
				from: "questions",
				localField: "questions",
				foreignField: "_id",
				as: "questions",
			},
		},
	])
	const assessment = assessments[0]
	return assessment
}

const getGrade = (assessmentTaken) => {
	const { passMark } = assessmentTaken.assessment
	if (passMark === undefined) {
		return "Done"
	}

	return assessmentTaken.totalCorrectAnswer >= passMark ? "Pass" : "Fail"
}

export const startAssessment = async (studentId, assessmentType) => {
	const student = await userService.getOneUser({ _id: studentId })
	const classId = student.class._id

	const assessment = await activeAssessment(classId, assessmentType)
	if (!assessment) {
		throw {
			status: "error",
			code: 400,
			message: `No active assessment (${assessmentType}) available`,
		}
	}

	const shuffledQuestions = _.shuffle(assessment.questions)
	const questions = _.take(shuffledQuestions, assessment.noOfQuestion)

	const filteredAssessment = _.omit(assessment, "questions")

	const assessmentTaken = await AssessmentTaken.findOne({
		assessment: filteredAssessment._id,
		student: studentId,
	})

	if (!assessmentTaken) {
		const newAssessmentTaken = new AssessmentTaken({
			assessment: filteredAssessment._id,
			student: student._id,
			questionsSupplied: questions,
			totalQuestionSupplied: questions.length,
		})

		await newAssessmentTaken.save()
		return {
			assessment: filteredAssessment,
			questions,
			startedAt: Date.now(),
		}
	} else if (assessmentTaken.completedAt) {
		throw {
			status: "error",
			code: 400,
			message: "Assessment already completed",
		}
	}

	return {
		assessment: filteredAssessment,
		questions,
		startedAt: assessmentTaken.startedAt,
	}
}

export const completeAssessment = async (studentId, req) => {
	const student = await userService.getOneUser({ _id: studentId })

	const { assessmentId, totalAttempted, totalCorrectAnswer } = req
	const assessmentTaken = await AssessmentTaken.findOne({
		assessment: assessmentId,
		student: student._id,
	}).populate("assessment")

	if (!assessmentTaken) {
		throw {
			status: "error",
			code: 400,
			message: "No assessment to complete",
		}
	} else if (assessmentTaken.completedAt) {
		throw {
			status: "error",
			code: 400,
			message: "Assessment already completed",
		}
	}

	assessmentTaken.totalAttemptedQuestion = totalAttempted
	assessmentTaken.totalCorrectAnswer = totalCorrectAnswer
	assessmentTaken.percentageScore =
		(totalCorrectAnswer / assessmentTaken.totalQuestionSupplied) * 100
	assessmentTaken.grade = getGrade(assessmentTaken)
	assessmentTaken.totalWrongAnswer = assessmentTaken.totalQuestionSupplied - totalCorrectAnswer
	assessmentTaken.completedAt = Date.now()

	await assessmentTaken.save()
	return assessmentTaken
}

export const getOneAssessment = async (filterQuery) => {
	const assessment = await Assessment.findOne(filterQuery)
	if (!assessment) throw { status: "error", code: 404, message: "Assessment not found" }

	return assessment
}

export const getMany = async (filterQuery, pageFilter) => {
	if (!pageFilter || (!pageFilter.page && !pageFilter.limit))
		return await Assessment.find(filterQuery)

	pageFilter.customLabels = paginationLabel
	return await Assessment.paginate(filterQuery, pageFilter)
}

// Get all assessments that have been attempted by students
export const getAllTaken = async () => {
	const pipeline = [
		{ $group: { _id: "$assessment" } },
		{
			$lookup: {
				from: "assessments",
				localField: "_id",
				foreignField: "_id",
				as: "assessmentInfo",
			},
		},
		{ $unwind: "$assessmentInfo" },
		{ $replaceRoot: { newRoot: "$assessmentInfo" } },
	]
	const assessmentTaken = await AssessmentTaken.aggregate(pipeline)
	return assessmentTaken
}

export const createAssessment = async (req) => {
	const subject = await subjectService.getOneSubject({ _id: req.body.subjectId })

	const { noOfQuestion, questions, type, status, scheduledDate, duration, instruction } = req.body

	// Validate the number of questions in the assessment
	if (noOfQuestion > questions.length)
		throw {
			status: "error",
			code: 400,
			message: "Number of questions must be less or equal to the total questions supplied",
		}

	if (req.body.passMark && req.body.passMark > req.body.noOfQuestion)
		throw {
			status: "error",
			code: 400,
			message: "Pass mark must be less or equal to Number of questions",
		}

	const assessmentTitle = `${subject.title}-${subject.class.title}`
	const newAssessment = new Assessment({
		title: assessmentTitle,
		type,
		status,
		scheduledDate,
		duration,
		instruction,
		subject: subject._id,
		questions,
		noOfQuestion,
		passMark: req.body.passMark,
	})

	await newAssessment.save()
	return newAssessment
}

export const updateAssessment = async (assessment, req) => {
	let assessmentTitle, subject

	const error = {
		status: "error",
		code: 400,
		message: "Number of questions must be less or equal to the total questions supplied",
	}
	// Validate the number of questions in the assessment
	const { noOfQuestion, questions } = req.body
	if (noOfQuestion > (questions ? questions.length : assessment.questions.length)) {
		throw error
	}

	if (req.body.subjectId) {
		subject = await subjectService.getOneSubject({ _id: req.body.subjectId })
		assessmentTitle = `${subject.title}-${subject.class.title}`
	} else {
		subject = await subjectService.getOneSubject({ _id: assessment.subject })
	}

	if (req.body.status) {
		const active = await activeAssessment(subject.class._id, req.body.type || assessment.type)
		if (active)
			throw {
				status: "error",
				code: 400,
				message: `An assessment in ${subject.class.title} is currently active`,
			}
	}

	assessment.title = assessmentTitle || assessment.title
	assessment.type = req.body.type || assessment.type
	assessment.status = !_.isUndefined(req.body.status) ? req.body.status : assessment.status
	assessment.scheduledDate = req.body.scheduledDate || assessment.scheduledDate
	assessment.duration = req.body.duration || assessment.duration
	assessment.subject = req.body.subjectId || assessment.subject
	assessment.instruction = req.body.instruction || assessment.instruction
	assessment.noOfQuestion = req.body.noOfQuestion || assessment.noOfQuestion
	assessment.questions = req.body.questions || assessment.questions
	assessment.passMark = req.body.passMark || assessment.passMark
	assessment.resultReleased = req.body.releaseResult || assessment.resultReleased
	await assessment.save()

	return assessment
}

export const deleteAssessment = async (filterQuery) => {
	const assessment = await getOneAssessment(filterQuery)

	await Assessment.deleteOne(filterQuery)
	return assessment
}
