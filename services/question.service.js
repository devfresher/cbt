import Question from "../models/question.js"
import * as subjectService from "./subject.service.js"

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

export const createQuestion = async (data) => {
    const subject = await subjectService.getOneSubject({_id: data.subjectId})

    const newQuestion = new Question ({
        question: data.question,
        subjectId: subject._id,
        options: {a: data.optionA, b: data.optionB, c: data.optionC, d: data.optionD},
        correctAns: data.answer,
        imageUrl: data.image
    })
    await newQuestion.save()
    return newQuestion
}

export const updateQuestion = async (question, data) => {
    let subject
    if (data.subjectId) subject = await subjectService.getOneSubject({_id: data.subjectId})

    question.question = data.question || question.question
    question.options = {a: data.optionA, b: data.optionB, c: data.optionC, d: data.optionD} || question.options,
    question.correctAns = data.answer || question.correctAns
    question.imageUrl = data.image || question.imageUrl
    question.subjectId = data.subjectId || question.subjectId

    await question.save()
    return question
}

export const getAllBySubject = async (subjectId, pageFilter) => {
    const subject = await subjectService.getOneSubject({_id: subjectId})
    const findFilter = {"subject": subject._id}
    
    pageFilter.customLabels = myCustomLabels

    return Question.paginate(findFilter, pageFilter)
}

export const deleteQuestion = async (filterQuery) => {
    const question = await getOneQuestion(filterQuery)

    await Question.deleteOne(filterQuery)
    return question
}