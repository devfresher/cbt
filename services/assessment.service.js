import _ from "lodash";
import Assessment from "../models/assessment.js"
import AssessmentTaken from "../models/assessmentTaken.js"

import Question from "../models/question.js"
import Subject from "../models/subject.js";
import * as userService from "./user.service.js";
import * as subjectService from "./subject.service.js";

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

const activeAssessment = async (classId, assessmentType) => {
    let assessment = await Assessment.aggregate([
        {$lookup: {
            from: Subject.collection.name,
            localField: "subject",
            foreignField: "_id",
            as: "subject"
        }},  { $unwind: "$subject" }, {
            $match: {
                "subject.class._id": classId,
                status: true,
                type: assessmentType
            }
        }
    ])
    assessment = assessment[0]
    if (!assessment) throw { status: "error", code: 400, message: `No active assessment (${assessmentType}) available` }

    return assessment
}

export const startAssessment = async (studentId, assessmentType) => {
    // get the Student
    const student = await userService.getOneUser({ _id: studentId })

    // Get active assessment for the class
    let assessment = await activeAssessment(student.class._id, assessmentType)

    // get the random Questions
    const questions = await Question.aggregate( [
        { $sample: {size: assessment.noOfQuestion || 50}},
        { $match: { subjectId: assessment.subject._id } }
    ])

    // get the question Ids
    const questionIds = !_.isEmpty(questions) ? [questions.forEach((q) => {
        return q._id
    })]:null

    // Check if assessment has been taken by student
    const assessmentTaken = await AssessmentTaken.findOne({ assessment: assessment._id, student: studentId})
    if(!assessmentTaken) {
        // new student, start fresh
        const newAssessmentTaken = new AssessmentTaken({
            assessment: assessment._id,
            student: student._id,
            questionsSupplied: questionIds,
            totalQuestionSupplied: questions.length
        })

        await newAssessmentTaken.save()
        return {assessment, questions, startedAt: Date.now()}

    }  else if (assessmentTaken.completedAt) {
        throw {status: "error", code: 400, message: "Assessment already completed"}
    } 

    return {assessment, questions, startedAt: assessmentTaken.startedAt}
}

export const completeAssessment = async (studentId, req) => {
    // get the Student
    const student = await userService.getOneUser({ _id: studentId })

    // Check if assessment has been taken by student
    const assessmentTaken = await AssessmentTaken.findOne({ assessment: req.assessmentId, student: student._id})

    if(!assessmentTaken) throw { status: "error", code: 400, message: "No assessment to complete" }
    else if (assessmentTaken.completedAt) throw { status: "error", code: 400,  message: "Assessment already completed"}

    // if started, update for completion
    assessmentTaken.totalAttemptedQuestion = req.totalAttempted
    assessmentTaken.totalCorrectAnswer = req.totalCorrectAnswer
    assessmentTaken.totalWrongAnswer = req.totalWrongAnswer
    assessmentTaken.completedAt = Date.now()
    await assessmentTaken.save()

    return assessmentTaken
}

export const getOneAssessment = async (filterQuery) => {
    const assessment = await Assessment.findOne(filterQuery)
    if (!assessment) throw { status: "error", code: 404, message: "Assessment not found" }

    return assessment
}

export const getMany = async (filterQuery, pageFilter) => {
    pageFilter.customLabels = myCustomLabels
    return await Assessment.paginate(filterQuery, pageFilter)
}

export const getAllBySubject = async (subjectId, pageFilter) => {
    const subject = await subjectService.getOneSubject({_id: subjectId})
    const findFilter = {"subject": subject._id}
    
    pageFilter.customLabels = myCustomLabels

    return Assessment.paginate(findFilter, pageFilter)
}

export const createAssessment = async (data) => {
    const subject = await subjectService.getOneSubject({_id: data.subjectId})

    const assessmentTitle = `${subject.title}-${subject.class.title}`
    const newAssessment = new Assessment ({
        title: assessmentTitle,
        type: data.type,
        status: data.status,
        scheduledDate: data.scheduledDate,
        duration: data.duration,
        instruction: data.instruction,
        subject: data.subjectId,
        noOfQuestion: data.noOfQuestion,
        passMark: data.passMark
    })
    await newAssessment.save()
    return newAssessment
}

export const updateAssessment = async (assessment, data) => {
    let assessmentTitle
    if (data.subjectId) {
        const subject = await subjectService.getOneSubject({_id: data.subjectId})
        assessmentTitle = `${subject.title}-${subject.class.title}`
    }

    assessment.title = assessmentTitle || assessment.title
    assessment.type = data.type || assessment.type
    assessment.status = data.status || assessment.status
    assessment.scheduledDate = data.scheduledDate || assessment.scheduledDate
    assessment.duration = data.duration || assessment.duration
    assessment.subject = data.subjectId || assessment.subject
    assessment.instruction = data.instruction || assessment.instruction
    assessment.noOfQuestion = data.noOfQuestion || assessment.noOfQuestion
    assessment.passMark = data.passMark || assessment.noOfQuestion*0.4
    await assessment.save()

    return assessment
}

export const deleteAssessment = async (filterQuery) => {
    const assessment = await getOneAssessment(filterQuery)

    await Assessment.deleteOne(filterQuery)
    return assessment
}