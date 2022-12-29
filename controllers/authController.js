import _ from 'lodash'
import bcrypt from 'bcrypt'
import User, * as userModel from '../models/user.js'

export const login = async function (req, res) {
    let { error } = validateLogin(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    let user = await User.findOne({ email: req.body.email, role: ['Admin', 'Staff']})
    if (!user) return res.status(400).json("Invalid email or password")

    const isValidPassword = await bcrypt.compare(req.body.password, user.password)
    if (!isValidPassword) return res.status(400).json("Invalid email or password")

    const token = user.generateAuthToken()
    res.json(token)
}

export const studentLogin = async function (req, res) {
    let { error } = validateLogin(req.body, 'student');
    if (error) return res.status(400).json(error.details[0].message)

    let student = await User.findOne({ admissionNo: req.body.admissionNo, role: 'Student'})
    if (!student) return res.status(400).json("Invalid admission number or password")

    const isValidPassword = await bcrypt.compare(req.body.password, student.password)
    if (!isValidPassword) return res.status(400).json("Invalid admission number or password")

    const token = student.generateAuthToken()
    res.json(token)
}