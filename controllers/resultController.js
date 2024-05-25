import _ from "lodash"
import * as resultService from "../services/result.service.js"
import * as assessmentService from "../services/assessment.service.js"
import * as userService from "../services/user.service.js"

export const fetchAllResults = async (req, res, next) => {
	const result = await resultService.fetchResult(req.user)

	next({ status: "success", data: result })
}

export const resetStudentAssessment = async (req, res, next) => {
	const { studentId, assessmentId } = req.query

	const assessment = await assessmentService.getOneAssessment({ _id: assessmentId })
	const student = await userService.getOneUser({ _id: studentId, role: "Student" })

	const result = await resultService.deleteAssessmentTaken({
		assessment: assessment._id,
		student: student._id,
	})
	next({ status: "success", code: 204, data: result })
}
