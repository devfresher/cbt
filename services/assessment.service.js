import _ from "lodash";
import winston from 'winston';
import Assessment, { assessmentSchema } from "../models/assessment.js"
import AssessmentTaken from "../models/assessmentTaken.js"

import Question from "../models/question.js"
import Subject from "../models/subject.js";
import * as userService from "./user.service.js";

export const startAssessment = async (studentId, assessmentType) => {
    // get the Student
    const student = await userService.getOneUser(studentId)
    if(!student.class) throw {
        status: "error",
        error: {
            code: 400,
            message: "Student does not have a class"
        }
    }

    // Get active assessment for the class
    let assessment = await Assessment.aggregate([
        {$lookup: {
            from: Subject.collection.name,
            localField: "subject",
            foreignField: "_id",
            as: "subject"
        }},  { $unwind: "$subject" }, {
            $match: {
                "subject.class._id": student.class._id,
                status: true,
                type: assessmentType
            }
        }
    ])
    assessment = assessment[0]
    if (!assessment) throw { status: "error", error: {
        code: 400,
        message: `No active assessment (${assessmentType}) available`
    }}

    // get the questions
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
    if(assessmentTaken.completedAt) {
        throw { status: "error", error: {
            code: 400,
            message: "Assessment already completed by student"
        }}
    } else if (assessmentTaken.startedAt) {
        // if started return assessment data
        return {assessment, questions, startedAt: assessmentTaken.startedAt}
    } else {
        // new student, start fresh
        const newAssessmentTaken = new AssessmentTaken({
            assessment: assessment._id,
            student: student._id,
            questionsSupplied: questionIds,
            totalQuestionSupplied: questions.length
        })
        
        try {
            await newAssessmentTaken.save()
            return {assessment, questions, startedAt: Date.now()}
        } catch (err) {
            winston.log('error', err)
            throw { status: "error", error: {
                    code: 500,
                    message: "Something unexpected went wrong"
                }
            }
        }
    } 
}

export const completeAssessment = async (studentId, req) => {
    // get the Student
    const student = await userService.getOneUser(studentId)
    if(!student.class) throw {
        status: "error",
        error: {
            code: 400,
            message: "Student does not have a class"
        }
    }

    // Check if assessment has been taken by student
    const assessmentTaken = await AssessmentTaken.findOne({ assessment: req.assessmentId, student: studentId})
    if(assessmentTaken.completedAt) {
        throw { status: "error", error: {
            code: 400,
            message: "Assessment already completed"
        }}
    } else if (assessmentTaken.startedAt) {

        // if started, update for completion
        assessmentTaken.totalAttemptedQuestion = req.totalAttempted
        assessmentTaken.totalCorrectAnswer = req.totalCorrectAnswer
        assessmentTaken.totalWrongAnswer = req.totalWrongAnswer
        assessmentTaken.completedAt = Date.now()
        await assessmentTaken.save()

        return assessmentTaken
    } else {
        // does not exist throw
        throw { status: "error", error: {
                code: 400,
                message: "N assessment to complete"
            }
        }
    } 
}