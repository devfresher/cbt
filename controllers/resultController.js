import _ from 'lodash'
import * as subjectService from '../services/subject.service.js'
import * as resultService from '../services/result.service.js'

export const fetchAllResults = async (req, res) => {
    
    try {
        const subject = await subjectService.getOneSubject({_id: req.params.subjectId})

        const result = await resultService.fetchResult(req.user);
        return res.json({
            status: "success",
            data: result
        })
    } catch (error) {
        return res.status(error.error.code).json(error)
    }

}