import _ from 'lodash'
import bcrypt from 'bcrypt'
import { User, validateLogin, validateUser, hashPassword } from '../models/user.js'

export const login = async function (req, res) {
    let { error } = validateLogin(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send("Invalid email or password")

    const isValidPassword = await bcrypt.compare(req.body.password, user.password)
    if (!isValidPassword) return res.status(400).send("Invalid email or password")

    const token = user.generateAuthToken()
    res.json(token)
}

export const createUser = async (req, res) => {
    let { error } = validateUser(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send("Email already exit")

    let newUser = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: await hashPassword(req.body.password),
        role: req.body.role,
    })

    if(req.body.role === 'Staff') {
        newUser.phoneNumber = req.body.phoneNumber
        newUser.regNumber = req.body.regNumber
        newUser.oracleNumber = req.body.oracleNumber
        newUser.state = req.body.state
        newUser.lga = req.body.lga
    } else if (req.body.role === 'Student') {
        newUser.birthDate = req.body.birthDate
        newUser.admissionNo = req.body.admissionNo
        newUser.religion = req.body.religion
        newUser.homeAddress = req.body.homeAddress
        newUser.parent = req.body.parentName
        newUser.guardian = {
            name: req.body.guardianName,
            phoneNumber: req.body.guardianPhone,
            address: req.body.guardianPhone,
            relationship: req.body.guardianRelationship
        }
    }
    await newUser.save()
    res.send(_.omit(newUser.toObject(), ['password']))
}