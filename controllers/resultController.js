import _ from 'lodash'
import * as subjectService from '../services/subject.service.js'
import * as resultService from '../services/result.service.js'

export const fetchAllResults = async (req, res, next) => {
    const result = await resultService.fetchAllResults();

    next({ status: "success", data: result })
}   