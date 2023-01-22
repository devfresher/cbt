import _ from 'lodash'
import * as subjectService from "../services/subject.service.js"

export const isSubjectTeacher = async (req, res, next) => {
    if (req.body.subjectId) {
        const subject = await subjectService.getOneSubject({_id: req.body.subjectId})
        if (_.toLower(req.user.role) === 'staff' && subject.teacher != req.user._id) 
            throw {status: "error", code: 403, message: "Unauthorized"}
    }
        
    next()
}