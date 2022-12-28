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
        enum: ['Staff', 'Student'],
        default: 'Staff',
        required: true
    },

    birthDate: Date,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Others'],
    },
    admissionNo: {
        type: String,
        isUnique: true
    },
    religion: {
        type: String,
        enum: ['Islam', 'Christianity', 'Others'],
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

    phoneNUmber: String,
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
    }, config.get("jwtPrivateKey"))
}

export const User = mongoose.model('user', userSchema)

export function validateUser(user) {
    let schema;
    if (user.role === 'Staff') {
        schema = Joi.object({
            fullName: Joi.string().min(5).max(50).required(),
            email: Joi.string().required().email().min(6).max(255),
            password: Joi.string().min(6).required(),
            role: Joi.string().required().valid('Student', 'Staff'),
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
            role: Joi.string().required().valid('Student', 'Staff'),
            birthDate: Joi.date().required(),
            gender: Joi.string().required().valid('Male', 'Female', 'Others'),
            admissionNo: Joi.string().required(),
            religion: Joi.string().required().valid('Islam', 'Christianity', 'Others'),
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
            role: Joi.string().required().valid('Student', 'Staff')
        })
    }

    return schema.validate(user);
}

export function validateLogin(req) {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    })

    return schema.validate(req);
}

export async function hashPassword (password) {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}