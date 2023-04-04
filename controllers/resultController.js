import _ from "lodash"
import * as resultService from "../services/result.service.js"

export const fetchAllResults = async (req, res, next) => {
	const result = await resultService.fetchResult(req.user)

    next({ status: "success", data: result })
}

export const resetStudentAssessment = async (req, res, next) => {
    const {studentId, assessmentId} = req.query

    const assessment = await assessmentService.getOneAssessment({_id: assessmentId})
    const student = await userService.getOneUser({_id: studentId, role: 'Student'})
    

    const result = await resultService.deleteAssessmentTaken({
        assessment: assessmentId, 
        student: studentId
    });
    next({ status: "success", code: 204, data: result })
}
