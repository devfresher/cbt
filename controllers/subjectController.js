import _ from 'lodash'
import Class from '../models/class.js'
import Subject, * as subjectModel from '../models/subject.js'

export const createSubject = async (req, res) => {
    let { error } = subjectModel.validateCreateReq(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    const theClass = await Class.findById(req.body.classId)
    if (!theClass) return res.status(404).json("Class not found")

    const subject = await Subject.findOne({title: req.body.title, "class._id": req.body.classId})
    if (subject) return res.status(400).json(`Subject already exists`)

    const newSubject = new Subject ({
        title: req.body.title,
        "class._id": theClass._id,
        "class.title": theClass.title
    })
    await newSubject.save()

    res.json(newSubject)
}

export const updateSubject = async (req, res) => {
    let { error } = subjectModel.validateUpdateReq(req.body);
    if (error) return res.status(400).json(error.details[0].message)


    let subject = await Subject.findById(req.params.subjectId)
    if (!subject) return res.status(404).json("Subject not found")

    if(req.body.classId){
        const theClass = await Class.findById(req.body.classId)
        if (!theClass) return res.status(404).json("Class not found")    
        
        subject.class._id = req.body.classId
    }
    
    subject.title = req.body.title
    subject.save()

    res.json(subject)
}

export const fetchAllByClass = async (req, res) => {
    const theClass = await Class.findById(req.params.classId)
    if(!theClass) return res.status(404).json("Class not found")

    const subjects = await Subject.find({"class._id": req.params.classId})
    if (!subjects) return res.status(204).json()

    res.json(subjects)
}

export const fetchById = async (req, res) => {
    const subject = await Subject.findOne({"class._id": req.params.classId, _id: req.params.subjectId})
    if(!subject) return res.status(404).json("Subject not found")

    res.json(subject)
}

export const deleteSubject = async (req, res) => {
    const subject = await Class.findByIdAndDelete(req.params.subjectId)
    if (!subject) return res.status(404).json("Subject not found")

    res.status(204).json(subject)
}