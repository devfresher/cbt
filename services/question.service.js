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

export const createQuestion = async (data, file) => {
    let image
    if (file) image = await uploadToCloudinary(file)

    const subject = await subjectService.getOneSubject({_id: data.subjectId})

    const newQuestion = new Question ({
        question: data.question,
        subjectId: subject._id,
        options: {a: data.optionA, b: data.optionB, c: data.optionC, d: data.optionD},
        correctAns: data.answer,
        image: image ? {url: image.secure_url, imageId: image.public_id} : undefined,
    })
    await newQuestion.save()
    return newQuestion
}

export const updateQuestion = async (question, data, file) => {
    let subject
    if (data.subjectId) subject = await subjectService.getOneSubject({_id: data.subjectId})

    let image
    if (file) {
        if (question.image) image = await uploadToCloudinary(file, question.imageId)
    }

    question.question = data.question || question.question
    question.options = {a: data.optionA, b: data.optionB, c: data.optionC, d: data.optionD} || question.options,
    question.correctAns = data.answer || question.correctAns
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