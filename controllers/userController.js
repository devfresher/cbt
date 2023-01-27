import _ from 'lodash'
import * as userModel from '../models/user.js'
import * as userService from '../services/user.service.js'
import * as classService from '../services/class.service.js'
import * as subjectService from '../services/subject.service.js'


export const createUser = async (req, res, next) => {
    let { error } = userModel.validateUser(req.body);
    if (error) throw { status: "error", code: 400, message: error.details[0].message }

    const newUser = await userService.createUser(req.body, req.file)
    next({ status: "success", data: newUser })
}

export const batchCreateUser = async (req, res, next) => {
    if (!req.file) throw { status: "error", code: 400, message: "No csv file uploaded" }
    const result = await userService.batchCreateUsers(req.file)

    if (_.isEmpty(result.newUsers)) {
        throw { status: "error", code: 422, message: "No users record was created" }
    } else if (!_.isEmpty(result.errors) && !_.isEmpty(result.newUsers)) {
        next({ status: "success", data: { message: `${result.newUsers.length} new users created, and ${result.errors.length} users failed to create` } })
    } else {
        next({ status: "success", data: { message: `${result.newUsers.length} new users created` } })
    }
}

export const fetchAllByRole = async function (req, res, next) {
    const users = await userService.getMany({ role: _.capitalize(req.query.r) }, req.query)
    next({ status: "success", data: users })
}

export const fetchById = async function (req, res, next) {
    const user = await userService.getOneUser({ _id: req.params.userId })
    next({ status: "success", data: user })
}

export const fetchProfile = async function (req, res, next) {
    const user = await userService.getOneUser({ _id: req.user._id })
    next({ status: "success", data: user })
}

export const updateUser = async (req, res, next) => {
    const user = await userService.getOneUser({ _id: req.params.userId })

    req.body.role = user.role
    let { error } = userModel.validateUpdateReq(req.body);
    if (error) throw { status: "error", code: 400, message: error.details[0].message }

    const updatedUser = await userService.updateUser(user, req.body, req.file)
    next({ status: "success", data: _.omit(updatedUser, ['password']) })
}

export const assignClass = async (req, res, next) => {
    const theClass = await classService.getOneClass({ _id: req.params.classId })

    const data = { teacher: req.user._id }
    const updatedClass = await classService.updateClass(theClass, data)

    next({ status: "success", data: { message: `Successfully assigned to ${theClass.title}`, details: updatedClass } })
}

export const assignSubject = async (req, res, next) => {
    const subject = await subjectService.getOneSubject({ _id: req.params.subjectId })

    const data = { teacherId: req.user._id }
    const updatedSubject = await subjectService.updateSubject(subject, data)

    next({ status: "success", data: { message: `Successfully assigned to ${subject.title}`, details: updatedSubject } })
}

export const deleteUser = async (req, res, next) => {
    const deleted = await userService.deleteUser({ _id: req.params.userId })
    next({ status: "success", code: 204, data: deleted })
}