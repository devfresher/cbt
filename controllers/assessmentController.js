import _ from 'lodash'
import Class from '../models/class.js'
import Subject, * as subjectModel from '../models/subject.js'
import Assessment, * as assessmentModel from '../models/assessment.js'

export const createAssessment = async (req, res) => {
    let { error } = assessmentModel.validateCreateReq(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    const subject = await Subject.findById(req.params.subjectId)
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
        subjectId: req.params.subjectId
    })
    await newAssessment.save()

    res.json(newAssessment)
}

export const updateAssessment = async (req, res) => {
    let { error } = assessmentModel.validateCreateReq(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    const subject = await Subject.findById(req.params.subjectId)
    if (!subject) return res.status(404).json("Subject not found")

    let assessment = await Assessment.findOne({_id: req.params.assessmentId, "subjectId": req.params.subjectId})
    if (!assessment) return res.status(404).json(`Assessment does not exists`)

    assessment.type = req.body.type
    assessment.status = req.body.status,
    assessment.scheduledDate = req.body.scheduledDate,
    assessment.duration = req.body.duration,
    assessment.subjectId = req.params.subjectId

    await assessment.save()
    res.json(assessment)
}

export const fetchAllBySubject = async (req, res) => {
    const subject = await Subject.findById(req.params.subjectId)
    if(!subject) return res.status(404).json("Subject not found")

    const assessment = await Assessment.find({"subjectId": req.params.subjectId})
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