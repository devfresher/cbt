import _ from 'lodash'
import Subject from '../models/subject.js'
import Question, * as questionModel from '../models/question.js'
import * as subjectService from '../services/subject.service.js'

import * as questionService from '../services/question.service.js'

export const create = async (req, res, next) => {
    let { error } = questionModel.validateQuestion(req.body);
    if (error) throw{ status: "error", code: 400, message: error.details[0].message}

    const newQuestion = await questionService.createQuestion(req.body)
    next({status: "success", data: newQuestion})
}

export const updateQuestion = async (req, res, next) => {
    let { error } = questionModel.validateQuestion(req.body);
    if (error) throw{ status: "error", code: 400, message: error.details[0].message}

    const question = await questionService.getOneQuestion({_id: req.params.questionId})
    const updatedQuestion = await questionService.updateQuestion(question, req.body)

    next({status: "success", data: updatedQuestion})
}

export const fetchAllBySubject = async (req, res, next) => {
    const questions = await questionService.getAllBySubject(req.params.subjectId, req.query)
    next({status: "success", data: questions})
}

export const fetchById = async (req, res, next) => {
    const subject = await subjectService.getOneSubject({_id: req.params.subjectId})
    const question = await questionService.getOneQuestion({_id: req.params.questionId, subject: subject._id})

    next({status: "success", data: question})
}

export const deleteQuestion = async (req, res, next) => {
    const deleted = await questionService.deleteQuestion({_id: req.params.questionId})
    next({status: "success", code: 204, data: deleted})
}