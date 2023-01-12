import _ from 'lodash'
import * as userModel from '../models/user.js'
import * as authService from '../services/auth.service.js'

export const login = async function (req, res, next) {
    let { error } = userModel.validateLogin(req.body);
    if (error) throw { status: "error", code: 400, message: error.details[0].message }

    const login = await authService.otherLogin(req.body.email, req.body.password)
    next({ status: "success", data: login })
}

export const studentLogin = async function (req, res, next) {
    let { error } = userModel.validateLogin(req.body, 'student');
    if (error) throw { status: "error", code: 400, message: error.details[0].message }

    const login = await authService.studentLogin(req.body.admissionNo, req.body.password)
    next({ status: "success", data: login })
}