import _ from 'lodash'
import Class, * as classModel from '../models/class.js'
import User from '../models/user.js'

export const fetchAll = async (req, res) => {
    const classes = await Class.find()
    if (_.isEmpty(classes)) return res.status(204).json(classes)

    res.json(classes)
}

export const fetchStudentsByClass = async (req, res) => {
    const theClass = await Class.findById(req.params.classId)
    if(!theClass) return res.status(404).json("Response not found")

    const students = await User.find({"class._id": req.params.classId})
    if (!students) return res.status(204).json()

    res.json(students)
}

export const createClass = async (req, res) => {
    let { error } = classModel.validateClass(req.body);
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

export const updateClass = async (req, res) => {
    let { error } = classModel.validateUpdate(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    let theClass = await Class.findById(req.params.classId)
    if (!theClass) return res.status(404).json("Class not found")

    await Class.updateOne(
        {_id: req.params.classId},
        {$set: req.body}
    )

    theClass = await Class.findById(req.params.classId)
    res.json(theClass)
}

export const deleteClass = async (req, res) => {
    const theClass = await Class.findOneAndDelete(req.params.classId)
    if (!theClass) return res.status(404).json("Class not found")

    res.status(204).json(theClass)
}