import _ from 'lodash'
import Class, * as classModel from '../models/class.js'
import { isValidObjectId } from 'mongoose'
import Subject from '../models/subject.js'

export const createSubject = async function (req, res) {
    let { error } = classModel.validateSubject(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    if (!isValidObjectId(req.params.classId)) return res.status(400).json("Invalid class ID")

    const theClass = await Class.findById(req.params.classId)
    if (!theClass) return res.status(404).json("Class not found")

    const subject = await Subject.find({title: req.body.title, "class._id": req.params.classId})
    if (subject) return res.status(400).json(`${req.body.title}-${theClass.title} already exists`)

    const newSubject = new Subject ({
        title: req.body.title,
        class: theClass
    })
    await newSubject.save()

    res.json(newSubject)
}

export const fetchAllByClass = async function (req, res) {
    if(!isValidObjectId(req.params.classId)) return res.status(400).json("Invalid class id")

    const theClass = await Class.findById(req.params.classId)
    if(!theClass) return res.status(404).json("Class not found")

    const subjects = await Subject.find({"class._id": req.params.classId})
    if (!subjects) return res.status(204).json()

    res.json(subjects)
}