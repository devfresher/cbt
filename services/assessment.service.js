import _ from "lodash";
import Assessment from "../models/assessment.js"
import AssessmentTaken from "../models/assessmentTaken.js"

import Question from "../models/question.js"
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
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subject"
        }},  { $unwind: "$subject" }, 
        {
            $match: {
                "subject.class._id": classId,
                status: true,
                type: assessmentType
            }
        },
        {
            $lookup: {
                from: "questions",
                localField: "questions",
                foreignField: "_id",
                as: "questions"
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
    const questions = assessment.questions

    // Check if assessment has been taken by student
    const assessmentTaken = await AssessmentTaken.findOne({ assessment: assessment._id, student: studentId})
    if(!assessmentTaken) {
        // new student, start fresh
        const newAssessmentTaken = new AssessmentTaken({
            assessment: assessment._id,
            student: student._id,
            questionsSupplied: assessment.questions,
            totalQuestionSupplied: assessment.questions.length
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
    const assessmentTaken = await AssessmentTaken.findOne({ 
        assessment: req.assessmentId, 
        student: student._id
    }).populate('assessment')

    if(!assessmentTaken) throw { status: "error", code: 400, message: "No assessment to complete" }
    else if (assessmentTaken.completedAt) throw { status: "error", code: 400,  message: "Assessment already completed"}

    // if started, update for completion
    assessmentTaken.totalAttemptedQuestion = req.totalAttempted
    assessmentTaken.totalCorrectAnswer = req.totalCorrectAnswer
    assessmentTaken.score = (req.totalCorrectAnswer/assessmentTaken.totalQuestionSupplied)*100
    assessmentTaken.grade = assessmentTaken.score >= assessmentTaken.assessment.passMark ? "Pass":"Fail" 
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
    if(!pageFilter) return await Assessment.find(filterQuery)

    pageFilter.customLabels = myCustomLabels
    return await Assessment.paginate(filterQuery, pageFilter)
}

export const getAllTaken = async () => {
    const pipeline = [
        { $group: {_id: "$assessment"} },
        { $lookup: {
            from: "assessments",
            localField: "_id",
            foreignField: "_id",
            as: "assessmentInfo"
        } },
        { $unwind: "$assessmentInfo" },
        { "$replaceRoot": {"newRoot": "$assessmentInfo"} }
    ]
    const assessmentTaken = await AssessmentTaken.aggregate(pipeline)
    return assessmentTaken
}

export const createAssessment = async (req) => {
    const subject = await subjectService.getOneSubject({_id: req.body.subjectId})

    // if(req.body.noOfQuestion)
    const assessmentTitle = `${subject.title}-${subject.class.title}`
    const newAssessment = new Assessment ({
        title: assessmentTitle,
        type: req.body.type,
        status: req.body.status,
        scheduledDate: req.body.scheduledDate,
        duration: req.body.duration,
        instruction: req.body.instruction,
        subject: req.body.subjectId,
        questions: req.body.questions,
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
    assessment.questions = req.body.questions || assessment.questions
    assessment.passMark = req.body.passMark || assessment.questions.length * 0.4
    assessment.resultReleased = req.body.releaseResult || assessment.resultReleased
    await assessment.save()

    return assessment
}

export const deleteAssessment = async (filterQuery) => {
    const assessment = await getOneAssessment(filterQuery)

    await Assessment.deleteOne(filterQuery)
    return assessment
}