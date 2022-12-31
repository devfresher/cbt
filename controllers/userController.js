import _ from 'lodash'
import User, * as userModel from '../models/user.js'
import Class from '../models/class.js';
import { isValidObjectId } from 'mongoose';

export const createUser = async (req, res) => {
    let { error } = userModel.validateUser(req.body);
    if (error) return res.status(400).json(error.details[0].message)

    let user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).json("Email already exit")

    let newUser = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: await userModel.hashPassword(req.body.password),
        role: req.body.role,
    })

    if(req.body.role === 'Staff' || req.body.role === 'Admin') {
        newUser.phoneNumber = req.body.phoneNumber
        newUser.regNumber = req.body.regNumber
        newUser.oracleNumber = req.body.oracleNumber
        newUser.state = req.body.state
        newUser.lga = req.body.lga
    } else if (req.body.role === 'Student') {
        let theClass
        if (!_.isUndefined(req.body.classId)) {
            if (!isValidObjectId(req.body.classId)) return res.status(400).json("Invalid class id")

            theClass = await Class.findById(req.body.classId)
            if (!theClass) return res.status(400).json("Class does not exist") 
        }

        newUser.birthDate = req.body.birthDate
        newUser.admissionNo = req.body.admissionNo
        newUser.religion = req.body.religion
        newUser.homeAddress = req.body.homeAddress
        newUser.class = (!_.isUndefined(theClass) ? theClass : null)
        newUser.classSection = (!_.isUndefined(theClass) ? req.body.classSection : null)
        newUser.parent = req.body.parentName
        newUser.guardian = {
            name: req.body.guardianName,
            phoneNumber: req.body.guardianPhone,
            address: req.body.guardianPhone,
            relationship: req.body.guardianRelationship
        }
    }
    await newUser.save()
    res.status(200).json(_.omit(newUser.toObject(), ['password']))
}

export const fetchAllByRole = (role) => {
    return async function (req, res) {
        const users = await User.find({role : role})
        if (!users) return res.status(204).json()

        res.json(users)
    }
}

export const fetchById = async function (req, res) {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json("User not found")

    res.json(user)
}

export const fetchProfile = async function (req, res) {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json("User not found")

    res.json(user)
}

export const updateUser = async (req, res) => {
    const user = await User.findById(req.params.userId)
    if(!user) return res.status(404).json("User not found")

    req.body.role = user.role
    let { error } = validateUpdateReq(req.body);
    if (error) return res.status(400).json(error.details[0].message)
    
    user.fullName = req.body.fullName

    if(user.role === 'Staff') {
        user.phoneNumber = req.body.phoneNumber
    } else if (user.role === 'Student') {
        if (!isValidObjectId(req.body.classId)) return res.status(400).json("Invalid class id")

        const theClass = await Class.getById(req.body.classId)
        if (!theClass) return res.status(400).json("Class does not exist") 

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
    res.json(_.omit(user.toObject(), ['password']))
}

export const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.userId)
    if(!user) return res.status(404).json("User not found")
    
    await User.deleteOne({_id: req.params.userId})
    res.status(204).json()
}