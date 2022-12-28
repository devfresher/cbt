import _ from 'lodash'
import { User, validateUser, hashPassword } from '../models/user.js'
import { Class } from '../models/class.js';
import { isValidObjectId } from 'mongoose';

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
        if (!isValidObjectId(req.body.classId)) return res.status(400).send("Invalid class id")

        const theClass = await Class.getById(req.body.classId)
        if (!theClass) return res.status(400).send("Class does not exist") 

        newUser.birthDate = req.body.birthDate
        newUser.admissionNo = req.body.admissionNo
        newUser.religion = req.body.religion
        newUser.homeAddress = req.body.homeAddress
        newUser.class = theClass
        newUser.classSection = req.body.classSection
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

export const fetchByRole = (role) => {
    return async function (req, res) {
        const students = await User.find({role : role})
        if (!students) return res.status(204).json()

        res.json(students)
    }
}

export const updateUser = async (req, res) => {
    if(!isValidObjectId(req.params.userId)) return res.status(400).send("Invalid user id")

    const user = await User.findById(req.params.userId)
    if(!user) return res.status(404).send("User not found")

    let { error } = validateUser(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    
    user.fullName = req.body.fullName
    if(user.role === 'Staff') {
        user.phoneNumber = req.body.phoneNumber
    } else if (user.role === 'Student') {
        if (!isValidObjectId(req.body.classId)) return res.status(400).send("Invalid class id")

        const theClass = await Class.getById(req.body.classId)
        if (!theClass) return res.status(400).send("Class does not exist") 

        user.religion = req.body.religion
        user.homeAddress = req.body.homeAddress
        user.class = theClass
        user.classSection = req.body.classSection
        user.guardian = {
            name: req.body.guardianName,
            phoneNumber: req.body.guardianPhone,
            address: req.body.guardianPhone,
            relationship: req.body.guardianRelationship
        }
    }
    await user.save()
    res.send(_.omit(user.toObject(), ['password']))
}