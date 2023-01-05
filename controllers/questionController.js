import _ from 'lodash'
import Subject from '../models/subject.js'
import Question, * as questionModel from '../models/question.js'

export const create = async (req, res) => {
    let { error } = questionModel.validateQuestion(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    const subject = await Subject.findById(req.params.subjectId)
    if (!subject) return res.status(404).json("Subject not found")

    const newQuestion = new Question ({
        question: req.body.question,
        subjectId: req.params.subjectId,
        options: {a: req.body.optionA, b: req.body.optionB, c: req.body.optionC, d: req.body.optionD},
        correctAns: req.body.answer
    })
    await newQuestion.save()

    res.json(newQuestion)
}

export const updateQuestion = async (req, res) => {
    let { error } = questionModel.validateQuestion(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    const subject = await Subject.findById(req.params.subjectId)
    if (!subject) return res.status(404).json("Subject not found")

    let question = await Question.findOne({_id: req.params.questionId, "subjectId": req.params.subjectId})
    if (!question) return res.status(400).json('Resource not found')

    question.question = req.body.question
    question.options = {a: req.body.optionA, b: req.body.optionB, c: req.body.optionC, d: req.body.optionD},
    question.correctAns = req.body.answer

    await question.save()

    res.json(question)
}

export const fetchAllBySubject = async (req, res) => {
    const subject = await Subject.findById(req.params.subjectId)
    if(!subject) return res.status(404).json("Subject not found")

    paginate(Question, req.query, {})
    const { page = 1, limit = 10 } = req.query
    const count = await Question.countDocuments()
    
    page = page > count ? count:page
    const questions = await Question.find({"subjectId": req.params.subjectId})
        .limit(limit * 1)
        .skip((page - 1) * limit)

    if (!questions) return res.status(204).json()
    res.json({questions, totalPages: Math.ceil(count/limit), currentPage: page})
}

export const fetchById = async (req, res) => {
    const question = await Question.findOne({"subjectId": req.params.subjectId, _id: req.params.questionId})
    if(!question) return res.status(404).json("Subject not found")

    res.json(question)
}

export const deleteQuestion = async (req, res) => {
    const question = await Question.findByIdAndDelete(req.params.questionId)
    if (!question) return res.status(404).json("Question not found")

    res.status(204).json(question)
}