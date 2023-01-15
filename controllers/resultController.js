import _ from 'lodash'
import * as resultService from '../services/result.service.js'

export const fetchAllResults = async (req, res, next) => {
    const result = await resultService.fetchResult(req.user);

    next({ status: "success", data: result })
}   