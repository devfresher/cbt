import _ from 'lodash'
import Class, { validateClass } from '../models/class.js'
import User from '../models/user.js'
import { isValidObjectId } from 'mongoose'

export const fetchAll = async function (req, res) {
    const classes = await Class.find()
    if (!classes) return res.status(204).json()

    res.json(classes)
}

export const fetchStudentsByClass = async function (req, res) {
    if(!isValidObjectId(req.params.classId)) return res.status(400).json("Invalid class id")

    const theClass = await Class.findById(req.params.classId)
    if(!theClass) return res.status(404).json("Response not found")

    const students = await User.find({"class._id": req.params.classId})
    if (!students) return res.status(204).json()

    res.json(students)
}

export const createClass = async function (req, res) {
    let { error } = validateClass(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    let theClass = await Class.findOne({ title: req.body.title })
    if (theClass) return res.status(400).json(`${req.body.title} already exist`)

    const newClass = new Class ({
        title: req.body.title,
        description: req.body.description
    })
    await newClass.save()

    res.json(newClass)
}