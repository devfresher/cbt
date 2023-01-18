import Question from "../models/question.js"
import * as subjectService from "./subject.service.js"
import { deleteFromCloudinary, uploadToCloudinary } from "../startup/cloudinaryConfig.js"

const myCustomLabels = {
    totalDocs: 'totalItems',
    docs: 'items',
    limit: 'perPage',
    page: 'currentPage',
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: false,
    prevPage: false,
    totalPages: 'pageCount',
    pagingCounter: false,
    meta: 'paging',
};

export const getOneQuestion = async (filterQuery) => {
    const question = await Question.findOne(filterQuery)
    if (!question) throw { status: "error", code: 404, message: "Question not found" }

    return question
}

export const createQuestion = async (req) => {
    let image
    if (req.file) image = await uploadToCloudinary(req.file)

    const subject = await subjectService.getOneSubject({_id: req.body.subjectId})
    if (req.user.role === 'staff' && subject.teacher !== req.user._id) throw {status: "error", code: 403, message: "Unauthorized"}

    const newQuestion = new Question ({
        question: req.body.question,
        subjectId: subject._id,
        options: {a: req.body.optionA, b: req.body.optionB, c: req.body.optionC, d: req.body.optionD},
        correctAns: req.body.answer,
        image: image ? {url: image.secure_url, imageId: image.public_id} : undefined,
    })
    await newQuestion.save()
    return newQuestion
}

export const updateQuestion = async (question, req) => {
    let subject
    if (req.body.subjectId) {
        subject = await subjectService.getOneSubject({_id: req.body.subjectId})
        if (req.user.role === 'staff' && subject.teacher !== req.user._id) throw {status: "error", code: 403, message: "Unauthorized"}
    }

    let image
    if (req.file) {
        if (question.image) image = await uploadToCloudinary(req.file, question.imageId)
    }

    question.question = req.body.question || question.question
    question.options = {a: req.body.optionA, b: req.body.optionB, c: req.body.optionC, d: req.body.optionD} || question.options,
    question.correctAns = req.body.answer || question.correctAns
    question.image = image ? {url: image.secure_url, imageId: image.public_id} : (question.image || undefined)
    question.subjectId = subject._id || question.subjectId 

    await question.save()
    return question
}

export const getAllBySubject = async (subjectId, pageFilter) => {
    const subject = await subjectService.getOneSubject({_id: subjectId})
    const findFilter = {"subject": subject._id}
    
    pageFilter.customLabels = myCustomLabels

    return Question.paginate(findFilter, pageFilter)
}

export const getMany = async (filterQuery, pageFilter) => {
    pageFilter.customLabels = myCustomLabels
    return await Question.paginate(filterQuery, pageFilter)
}

export const deleteQuestion = async (filterQuery) => {
    const question = await getOneQuestion(filterQuery)
    if (question.image) await deleteFromCloudinary(question.image.imageId)

    await Question.deleteOne(filterQuery)
    return question
}