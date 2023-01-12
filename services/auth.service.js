import bcrypt from 'bcrypt'
import _ from 'lodash'
import User from "../models/user.js"

export const otherLogin = async (email, password) => {
    const user = await User.findOne({ email, role: ['Admin', 'Staff']})
    if (!user) throw { status: "error", code: 400, message: "Invalid email or password"}

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) throw { status: "error", code: 400, message: "Invalid email or password"}


    const token = user.generateAuthToken()
    return { user: _.omit(user.toObject(), ['password']), accessToken: token}
}

export const studentLogin = async (admissionNo, password) => {
    const student = await User.findOne({ admissionNo, role: 'Student'})
    if (!student) throw { status: "error", code: 400, message: "Invalid admission number or password"}

    const isValidPassword = await bcrypt.compare(password, student.password)
    if (!isValidPassword) throw { status: "error", code: 400, message: "Invalid admission number or password"}
    _.unset(student, 'password')

    const token = student.generateAuthToken()
    return {student: _.omit(student.toObject(), ['password']), accessToken: token}
}