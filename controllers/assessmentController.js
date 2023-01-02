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
    const assessment = await Ass.findOne({title: assessmentTitle, "subject._id": req.params.subjectId})
    if (assessment) return res.status(400).json(`${assessmentTitle} already exists`)

    const newAssessment = new Assessment ({
        title: assessmentTitle,
        type: req.body.type,
        status: req.body.status,
        scheduledDate: req.body.startDate,
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

    let assessment = await Assessment.findOne({_id: req.params.assessmentId, "subject._id": req.params.subjectId})
    if (!assessment) return res.status(404).json(`Assessment does not exists`)

    await Assessment.updateOne(
        {
            _id: req.params.assessmentId, 
            "subject._id": req.params.subjectId
        },  {$set: req.body}
    )
    assessment = await Assessment.findById(req.params.assessmentId)

    res.json(assessment)
}

export const fetchAllByClass = async (req, res) => {
    const theClass = await Class.findById(req.params.classId)
    if(!theClass) return res.status(404).json("Class not found")

    const subjects = await Subject.find({"class._id": req.params.classId})
    if (!subjects) return res.status(204).json()

    res.json(subjects)
}

export const fetchById = async (req, res) => {
    const assessment = await Assessment.findOne({"subject._id": req.params.subject, _id: req.params.assessmentId})
    if(!assessment) return res.status(404).json("Assessment not found")

    res.json(assessment)
}

export const deleteSubject = async (req, res) => {
    const subject = await Class.findOneAndDelete(req.params.subjectId)
    if (!subject) return res.status(404).json("Subject not found")

    res.status(204).json(subject)
}