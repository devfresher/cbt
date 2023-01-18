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
    const assessments = await Assessment.aggregate([
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
    const assessment = assessments[0]
    return assessment
}

export const startAssessment = async (studentId, assessmentType) => {
    // get the Student
    const student = await userService.getOneUser({ _id: studentId })

    // Get active assessment for the class
    let assessment = await activeAssessment(student.class._id, assessmentType)
    if (!assessment) throw { status: "error", code: 400, message: `No active assessment (${assessmentType}) available` }


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

export const createAssessment = async (req) => {
    const subject = await subjectService.getOneSubject({_id: req.body.subjectId})
    if (req.user.role === 'staff' && subject.class.teacher !== req.user._id) throw {status: "error", code: 403, message: "Unauthorized"}

    const assessmentTitle = `${subject.title}-${subject.class.title}`
    const newAssessment = new Assessment ({
        title: assessmentTitle,
        type: req.body.type,
        status: req.body.status,
        scheduledDate: req.body.scheduledDate,
        duration: req.body.duration,
        instruction: req.body.instruction,
        subject: req.body.subjectId,
        noOfQuestion: req.body.noOfQuestion,
        passMark: req.body.passMark
    })
    await newAssessment.save()
    return newAssessment
}

export const updateAssessment = async (assessment, req) => {
    let assessmentTitle, subject
    if (req.body.subjectId) {
        subject = await subjectService.getOneSubject({_id: req.body.subjectId})
        assessmentTitle = `${subject.title}-${subject.class.title}`
        if (req.user.role === 'staff' && subject.class.teacher !== req.user._id) throw {status: "error", code: 403, message: "Unauthorized"}
    } else {
        subject = await subjectService.getOneSubject({_id: assessment.subject})
    }

    if (req.body.status) {
        const active = await activeAssessment(subject.class._id, (req.body.type || assessment.type))
        if (active) throw { status: "error", code: 400, message: `An assessment in ${subject.class.title} is currently active` }
    }

    assessment.title = assessmentTitle || assessment.title
    assessment.type = req.body.type || assessment.type
    assessment.status = !_.isUndefined(req.body.status) ? req.body.status : assessment.status
    assessment.scheduledDate = req.body.scheduledDate || assessment.scheduledDate
    assessment.duration = req.body.duration || assessment.duration
    assessment.subject = req.body.subjectId || assessment.subject
    assessment.instruction = req.body.instruction || assessment.instruction
    assessment.noOfQuestion = req.body.noOfQuestion || assessment.noOfQuestion
    assessment.passMark = req.body.passMark || assessment.noOfQuestion*0.4
    await assessment.save()

    return assessment
}

export const deleteAssessment = async (filterQuery) => {
    const assessment = await getOneAssessment(filterQuery)

    await Assessment.deleteOne(filterQuery)
    return assessment
}