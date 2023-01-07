import _ from 'lodash'
import Subject from '../models/subject.js'
import Question, * as questionModel from '../models/question.js'

export const create = async (req, res) => {
    let { error } = questionModel.validateQuestion(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    const subject = await Subject.findById(req.body.subjectId)
    if (!subject) return res.status(404).json("Subject not found")

    const newQuestion = new Question ({
        question: req.body.question,
        subjectId: req.body.subjectId,
        options: {a: req.body.optionA, b: req.body.optionB, c: req.body.optionC, d: req.body.optionD},
        correctAns: req.body.answer,
        imageUrl: req.body.image
    })
    await newQuestion.save()

    res.json(newQuestion)
}

export const updateQuestion = async (req, res) => {
    let { error } = questionModel.validateQuestion(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    const subject = await Subject.findById(req.body.subjectId)
    if (!subject) return res.status(404).json("Subject not found")

    let question = await Question.findOne({_id: req.params.questionId})
    if (!question) return res.status(400).json('Resource not found')

    question.question = req.body.question
    question.options = {a: req.body.optionA, b: req.body.optionB, c: req.body.optionC, d: req.body.optionD},
    question.correctAns = req.body.answer
    question.imageUrl = req.body.image
    question.subjectId = req.body.subjectId

    await question.save()

    res.json(question)
}

export const fetchAllBySubject = async (req, res) => {
    const subject = await Subject.findById(req.params.subjectId)
    if(!subject) return res.status(404).json("Subject not found")

    // let { page = 1, limit = 10 } = req.query
    // const count = await Question.countDocuments()
    // const totalPages = Math.ceil(count/limit)
    // page = page > totalPages ? totalPages:page

    const questions = await Question.find({"subjectId": req.params.subjectId})
        // .limit(limit * 1)
        // .skip((page - 1) * limit)

    if (!questions) return res.status(204).json()
    res.json({
        status: "success",
        data: questions, 
        // paging: {
        //     totalPages, 
        //     currentPage: page
        // }
    })
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