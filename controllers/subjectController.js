import _ from 'lodash'
import * as subjectModel from '../models/subject.js'

import * as subjectService from '../services/subject.service.js'
import * as classService from '../services/class.service.js'

export const createSubject = async (req, res, next) => {
    let { error } = subjectModel.validateCreateReq(req.body);
    if (error) throw { status: "error", code: 400, message: error.details[0].message }

    const newSubject = await subjectService.createSubject(req.body)
    next({ status: "success", data: newSubject })
}

export const updateSubject = async (req, res, next) => {
    let { error } = subjectModel.validateUpdateReq(req.body);
    if (error) throw { status: "error", code: 400, message: error.details[0].message }

    const updatedSubject = await subjectService.updateSubject(req.params.subjectId, req.body)
    next({ status: "success", data: updatedSubject })
}

export const fetchAllByClass = async (req, res, next) => {
    const subjects = await subjectService.getAllSubjectsByClass(req.params.classId, req.query)
    next({status: "success", data: subjects})
}

export const fetchAll = async (req, res, next) => {
    const subjects = await subjectService.getMany({}, req.query)
    next({status: "success", data: subjects})
}

export const fetchById = async (req, res, next) => {
    const theClass = await classService.getOneClass({_id: req.params.classId})
    const subject = await subjectService.getOneSubject({_id: req.params.subjectId, "class_id": theClass._id})

    next({status: "success", data: subject})
}

export const deleteSubject = async (req, re, next) => {
    const deleted = await subjectService.deleteSubject({_id: req.params.subjectId})
    next({status: "success", code: 204, data: deleted})
}