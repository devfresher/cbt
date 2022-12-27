import _ from 'lodash'
import { Class, validateClass } from '../models/class.js'

export const getAll = async function (req, res) {
    const classes = await Class.find()
    if (!classes) return res.status(204).json()

    res.json(classes)
}

export const createClass = async function (req, res) {
    let { error } = validateClass(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    let theClass = await Class.findOne({ title: req.body.title })
    if (theClass) return res.status(400).send(`${req.body.title} already exist`)

    const newClass = new Class ({
        title: req.body.title
    })
    await newClass.save()

    res.json(newClass)
}