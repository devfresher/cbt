import _ from "lodash"
import csv from "fast-csv"
import fs from "fs"

import Question from "../models/question.js"
import * as subjectService from "./subject.service.js"
import { deleteFromCloudinary, uploadToCloudinary } from "../startup/cloudinaryConfig.js"
import { isValidObjectId } from "mongoose";

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

export const createQuestion = (data, file) => {
    return new Promise(async (resolve, reject) => {
        let image, subject
        if (file) {
            image = await uploadToCloudinary(file)
        } else if (data.imageUrl) {
            image = {secure_url: data.imageUrl}
        }
        
        if (!isValidObjectId(data.subjectId)) return reject({status: "error", code: 400, message: "Invalid Subject Id"})
        try {
            subject = await subjectService.getOneSubject({_id: data.subjectId})
        } catch (error) {
            return reject(error)
        }

        const newQuestion = new Question ({
            question: data.question,
            subjectId: subject._id,
            options: {a: data.optionA, b: data.optionB, c: data.optionC, d: data.optionD},
            correctAns: data.answer,
            image: image ? {url: image.secure_url, imageId: image.public_id} : undefined,
        })

        await newQuestion.save()
        resolve(newQuestion)
    })
}

export const batchCreateQuestion = (file) => {
    return new Promise(async (resolve, reject) => {

        const questions = []
        const newQuestions = []
        const errors =[]

        
        const readStream = fs.createReadStream(file.path)
        const csvStream = csv.parse({headers: true})

        csvStream.on("data", (data) => {
            data = _.mapKeys(data, (value, key) => _.camelCase(key.replace(/ /g,'')))
            questions.push(data)
        })

        csvStream.on("end", async () => {
            let index = 0
            for (const question of questions) {
                try {
                    const newQuestion = await createQuestion(question)
                    newQuestions.push(newQuestion)
                } catch (error) {
                    error.message += ` for record ${index+1}`
                    errors.push(error.message)
                }

                index++
            }
            resolve({newQuestions, errors})
            fs.unlinkSync(file.path)
        })

        readStream.pipe(csvStream)
    })
}

export const updateQuestion = async (question, req) => {
    let subject
    if (req.body.subjectId) subject = await subjectService.getOneSubject({_id: req.body.subjectId})

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

export const getMany = async (filterQuery, pageFilter) => {
    if(_.isEmpty(pageFilter)) return await Question.find(filterQuery)

    pageFilter.customLabels = myCustomLabels
    return await Question.paginate(filterQuery, pageFilter)
}

export const deleteQuestion = async (filterQuery) => {
    const question = await getOneQuestion(filterQuery)
    if (question.image) await deleteFromCloudinary(question.image.imageId)

    await Question.deleteOne(filterQuery)
    return question
}