import _ from 'lodash'
import * as classModel from '../models/class.js'

import * as classService from '../services/class.service.js'
import * as userService from '../services/user.service.js'

export const fetchAll = async (req, res, next) => {
    const classes = await classService.getMany({}, req.query)
    next({status: "success", data: classes})
}

export const fetchStudentsByClass = async (req, res, next) => {
    const students = await userService.getAllStudentsByClass(req.params.classId, req.query)
    next({status: "success", data: students})
}

export const createClass = async (req, res, next) => {
    let { error } = classModel.validateClass(req.body);
    if (error) throw{ status: "error", code: 400, message: error.details[0].message}

    const newClass = await classService.createClass(req.body)
    next({status: "success", data: newClass})
}

export const updateClass = async (req, res, next) => {
    let { error } = classModel.validateUpdate(req.body);
    if (error) throw{ status: "error", code: 400, message: error.details[0].message}

    const theClass = await classService.getOneClass({_id: req.params.classId})

    const updatedData = await classService.updateClass(theClass, req.body)
    next({status: "success", data: updatedData})
}

export const deleteClass = async (req, res, next) => {
    const deleted = await classService.deleteClass({_id: req.params.classId})
    next({status: "success", code: 204, data: deleted})
}