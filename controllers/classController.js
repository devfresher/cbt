import _ from 'lodash'
import { isValidObjectId } from 'mongoose'
import { Class, validateClass } from '../models/class.js'
import { User } from '../models/user.js'

export const fetchAll = async function (req, res) {
    const classes = await Class.find()
    if (!classes) return res.status(204).json()

    res.json(classes)
}

export const fetchStudentsByClass = async function (req, res) {
    if(!isValidObjectId(req.params.classId)) return res.status(400).send("Invalid class id")

    const theClass = await Class.findById(req.params.classId)
    if(!theClass) return res.status(404).send("Response not found")

    const students = await User.find({"class._id": req.params.classId})
    if (!students) return res.status(204).send()

    res.json(students)
}

export const createClass = async function (req, res) {
    let { error } = validateClass(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    let theClass = await Class.findOne({ title: req.body.title })
    if (theClass) return res.status(400).send(`${req.body.title} already exist`)

    const newClass = new Class ({
        title: req.body.title,
        description: req.body.description
    })
    await newClass.save()

    res.json(newClass)
}