import _ from 'lodash'
import Subject, * as subjectModel from '../models/subject.js'
import Assessment, * as assessmentModel from '../models/assessment.js'
import * as assessmentService from '../services/assessment.service.js'
import * as userService from '../services/user.service.js'

export const createAssessment = async (req, res) => {
    let { error } = assessmentModel.validateReq(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    const subject = await Subject.findById(req.body.subjectId)
    if (!subject) return res.status(404).json("Subject not found")

    const assessmentTitle = `${subject.title}-${subject.class.title}`
    // const assessment = await Assessment.findOne({title: assessmentTitle, "subject._id": req.params.subjectId})
    // if (assessment) return res.status(400).json(`${assessmentTitle} already exists`)

    const newAssessment = new Assessment ({
        title: assessmentTitle,
        type: req.body.type,
        status: req.body.status,
        scheduledDate: req.body.scheduledDate,
        duration: req.body.duration,
        instruction: req.body.instruction,
        subject: req.body.subjectId,
        noOfQuestion: req.body.noOfQuestion
    })
    await newAssessment.save()

    res.json(newAssessment)
}

export const updateAssessment = async (req, res) => {
    let { error } = assessmentModel.validateReq(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    const subject = await Subject.findById(req.body.subjectId)
    if (!subject) return res.status(404).json("Subject not found")

    const assessmentTitle = `${subject.title}-${subject.class.title}`
    let assessment = await Assessment.findOne({_id: req.params.assessmentId})
    if (!assessment) return res.status(404).json(`Assessment does not exists`)

    assessment.title = assessmentTitle
    assessment.type = req.body.type
    assessment.status = req.body.status
    assessment.scheduledDate = req.body.scheduledDate
    assessment.duration = req.body.duration
    assessment.subject = req.params.subjectId
    assessment.instruction = req.body.instruction
    assessment.noOfQuestion = req.body.noOfQuestion
    await assessment.save()
    
    res.json(assessment)
}

export const fetchAllBySubject = async (req, res) => {
    const subject = await Subject.findById(req.params.subjectId)
    if(!subject) return res.status(404).json("Subject not found")

    const assessment = await Assessment.find({"subject": req.params.subjectId})
    if (!assessment) return res.status(204).json()

    res.json(assessment)
}

export const fetchById = async (req, res) => {
    const assessment = await Assessment.findOne({"subject._id": req.params.subjectId, _id: req.params.assessmentId})
    if(!assessment) return res.status(404).json("Assessment not found")

    res.json(assessment)
}

export const deleteAssessment = async (req, res) => {
    const assessment = await Assessment.findByIdAndDelete(req.params.assessmentId)
    if (!assessment) return res.status(404).json("Assessment not found")

    res.status(204).json(assessment)
}

export const startAssessment = async (req, res) => {
    
    try {
        let { error } = assessmentModel.validateStartAssessment(req.body);
        if (error) throw {
            status: "error",
            error: {
                code: 400,
                message: error.details[0].message
            }
        }

        const assessment = await assessmentService.startAssessment(req.user._id, req.body.assessmentType);
        return res.json({
            status: "success",
            data: assessment
        })
    } catch (error) {
        console.log(error);
        return res.status(error.error.code).json(error)
    }

}

export const completeAssessment = async (req, res) => {
    
    try {
        let { error } = assessmentModel.validateCompleteAssessment(req.body);
        if (error) throw {
            status: "error",
            error: {
                code: 400,
                message: error.details[0].message
            }
        }

        const assessmentTaken = await assessmentService.completeAssessment(req.user._id, req.body);
        return res.json({
            status: "success",
            data: assessmentTaken
        })
    } catch (error) {
        console.log(error);
        return res.status(error.error.code).json(error)
    }

}