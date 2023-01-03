import coreJoi from "joi";
import joiDate from "@joi/date";
import objectId from 'joi-objectid';
import config from 'config'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { mongoose } from 'mongoose';
import { classSchema } from "./class.js";

const Joi = coreJoi.extend(joiDate);
Joi.objectId = objectId(Joi);

export const roleList = ['Admin', 'Staff', 'Student']
export const genderList = ['Male', 'Female', 'Others']
export const religionList = ['Islam', 'Christianity', 'Others']

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        isUnique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: roleList,
        required: true
    },

    birthDate: Date,
    gender: {
        type: String,
        enum: genderList,
    },
    admissionNo: {
        type: String,
        isUnique: true
    },
    religion: {
        type: String,
        enum: religionList,
    },
    homeAddress: {
        type: String,
        maxLength: 255
    },
    class: {
        type: classSchema
    },
    classSection: {
        type: String
    },
    parent: String,
    guardian: {
        type: {
            name: String,
            phoneNumber: String,
            address: String,
            relationship: String
        }
    },

    phoneNumber: String,
    regNumber: {
        type: String,
        isUnique: true
    },
    oracleNumber: {
        type: String,
        isUnique: true
    },
    state: String,
    lga: String
})

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({
        _id: this._id,
        role: this.role
    }, config.get("jwtPrivateKey"), {expiresIn: '24h'})
}

const User = mongoose.model('user', userSchema)

export function validateUpdateReq(req) {
    let schema;
    if (req.role === 'Staff' || req.role === 'Admin') {
        schema = Joi.object({
            fullName: Joi.string().min(5).max(50).required(),
            phoneNumber: Joi.string().min(11).max(13).required(),
            role: Joi.string().required().valid(...roleList),
        })
    } else if(req.role === 'Student') {
        schema = Joi.object({
            fullName: Joi.string().min(5).max(50).required(),
            role: Joi.string().required().valid(...roleList),
            religion: Joi.string().required().valid(...religionList),
            homeAddress: Joi.string().required(),
            classId: Joi.objectId(),
            classSection: Joi.string(),
            guardianName: Joi.string().required(),
            guardianPhone: Joi.string().required(),
            guardianAddress: Joi.string().required(),
            guardianRelationship: Joi.string().required(),
        })
    } else {
        schema = Joi.object({
            fullName: Joi.string().min(5).max(50).required(),
            email: Joi.string().required().email().min(6).max(255),
            password: Joi.string().min(6).required(),
            role: Joi.string().required().valid(...roleList)
        })
    }

    return schema.validate(req);
}

export function validateUser(user) {
    let schema;
    if (user.role === 'Staff' || user.role === 'Admin') {
        schema = Joi.object({
            fullName: Joi.string().min(5).max(50).required(),
            email: Joi.string().required().email().min(6).max(255),
            password: Joi.string().min(6).required(),
            role: Joi.string().required().valid(...roleList),
            phoneNumber: Joi.string().min(11).max(13).required(),
            regNumber: Joi.string().required(),
            oracleNumber: Joi.string().required(),
            state: Joi.string().required(),
            lga: Joi.string().required(),
        })
    } else if(user.role === 'Student') {
        schema = Joi.object({
            fullName: Joi.string().min(5).max(50).required(),
            email: Joi.string().required().email().min(6).max(255),
            password: Joi.string().min(6).required(),
            role: Joi.string().required().valid(...roleList),
            birthDate: Joi.date().required(),
            gender: Joi.string().required().valid(...genderList),
            admissionNo: Joi.string().required(),
            religion: Joi.string().required().valid(...religionList),
            homeAddress: Joi.string().required(),
            parent: Joi.string().required(),
            classId: Joi.objectId(),
            classSection: Joi.string(),
            guardianName: Joi.string(),
            guardianAddress: Joi.string(),
            guardianRelationship: Joi.string(),    
        })
    } else {
        schema = Joi.object({
            fullName: Joi.string().min(5).max(50).required(),
            email: Joi.string().required().email().min(6).max(255),
            password: Joi.string().min(6).required(),
            role: Joi.string().required().valid(...roleList)
        })
    }

    return schema.validate(user);
}

export function validateLogin(req, type='others') {
    const loginData = (type === 'student') ? 
        { admissionNo: Joi.string().required() } : { email: Joi.string().required() }

    loginData.password = Joi.string().required()
    const schema = Joi.object(loginData)

    return schema.validate(req);
}

export async function hashPassword (password) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

export default User