import _ from 'lodash'
import * as userModel from '../models/user.js'
import * as userService from '../services/user.service.js'

export const createUser = async (req, res, next) => {
    let { error } = userModel.validateUser(req.body);
    if (error) throw{ status: "error", code: 400, message: error.details[0].message }

    const newUser = await userService.createUser(req.body)
    next({status: "success", data: newUser})
}

export const fetchAllByRole = async function (req, res, next) {
    const users = await userService.getMany({role: _.capitalize(req.query.r)}, req.query)
    next({status: "success", data: users})
}

export const fetchById = async function (req, res, next) {
    const user = await userService.getOneUser({_id: req.params.userId})
    next({status: "success", data: user})
}

export const fetchProfile = async function (req, res, next) {
    const user = await userService.getOneUser({_id: req.user._id})
    next({status: "success", data: user})
}

export const updateUser = async (req, res, next) => {
    const user = await userService.getOneUser({_id: req.params.userId})

    req.body.role = user.role
    let { error } = userModel.validateUpdateReq(req.body);
    if (error) throw {status: "error", code: 400, message: error.details[0].message}

    const updatedUser = await userService.updateUser(user, req.body)
    next({status: "success", data: _.omit(updatedUser, ['password'])})
}

export const deleteUser = async (req, res, next) => {
    const deleted = await userService.deleteUser({_id: req.params.userId})
    next({status: "success", code: 204, data: deleted})
}