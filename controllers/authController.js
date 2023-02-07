import _ from 'lodash'
import * as userModel from '../models/user.js'
import * as authService from '../services/auth.service.js'
import * as userService from '../services/user.service.js'

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

export const sendOtp = async function (req, res, next) {
    let { error } = userModel.validateSendOtp(req.body)
    if (error) throw { status: "error", code: 400, message: error.details[0].message }

    await authService.sendOtp(req.body.email)
    next({ status: "success", message: `Reset password code sent to ${hideEmail(req.body.email)}` })
}

export const validateOtp = async function (req, res, next) {
    let { error } = userModel.validateValidateOtp(req.body)
    if (error) throw { status: "error", code: 400, message: error.details[0].message }

    const { email, authCode } = req.body
    const user = await userService.getOneUser({ email })

    await authService.validateOtp(user, authCode)
    next({ status: "success", message: `OTP validated successfully` })
}

export const newPassword = async function (req, res, next) {
    let { error } = userModel.validateNewPass(req.body)
    if (error) throw { status: "error", code: 400, message: error.details[0].message }

    const { email, password, authCode } = req.body
    const user = await userService.getOneUser({ email })
    await authService.validateOtp(user, authCode)

    await authService.handleResetPassword(user, password)
    next({ status: "success", message: `Password reset successful` })
}

const hideEmail = (email) => {
    const firstPart = email.substring(0, 3);
    const lastPart = email.substring(email.indexOf("@") - 3);
    const hiddenCharacters = "***";
    return `${firstPart}${hiddenCharacters}${lastPart}`;
};