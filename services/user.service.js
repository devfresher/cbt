import _ from "lodash"
import csv from "fast-csv"
import fs from "fs"

import User, * as userModel from "../models/user.js"

import * as classService from "../services/class.service.js"
import { deleteFromCloudinary, uploadToCloudinary } from "../startup/cloudinaryConfig.js"
import { isValidObjectId } from "mongoose"

const myCustomLabels = {
    totalDocs: 'totalItems',
    docs: 'items',
    limit: 'perPage',
    page: 'currentPage',
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: false,
    prevPage: false,
    totalPages: 'pageCount',
    pagingCounter: false,
    meta: 'paging',
}

export const getOneUser = async (filterQuery) => {
    return new Promise(async (resolve, reject) => {
        const user = await User.findOne(filterQuery)

        if (!user) reject({ status: "error", code: 404, message: `${_.capitalize(filterQuery.role) || 'User'} not found` })
        resolve(user)
    })
}

export const getAllStudentsByClass = async (classId, pageFilter) => {
    const theClass = await classService.getOneClass({ _id: classId })
    const findFilter = { "class._id": theClass._id, role: "Student" }

    pageFilter.customLabels = myCustomLabels

    return await User.find(findFilter)
    // return User.paginate(findFilter, pageFilter)
}

export const getMany = async (filterQuery, pageFilter) => {
    pageFilter.customLabels = myCustomLabels

    return await User.find(filterQuery)
    // return await User.paginate(filterQuery, pageFilter)
}

const checkIfUserExists = async (field, value) => {
    const userExists = await User.findOne({ [field]: value })

    if (userExists) return { status: "error", code: 400, message: `${field} already exists` }
    return null
}

export const createUser = (data, file) => {
    return new Promise(async (resolve, reject) => {

        const error = await checkIfUserExists('email', data.email)
        if (error) return reject(error)

        if (!data.password) return reject({ status: "error", code: "400", message: "Password field can not be empty" })

        let newUser = new User({
            fullName: data.fullName,
            email: data.email,
            password: await userModel.hashPassword(data.password),
            role: data.role,
        })

        if (data.role === 'Staff' || data.role === 'Admin') {
            const fields = ['phoneNumber', 'regNumber', 'oracleNumber']
            const errors = await Promise.all(fields.map(async (field) => {
                return await checkIfUserExists(field, data[field])
            }))

            if (errors.filter(error => error).length > 0) return reject(errors)
            
            newUser.phoneNumber = data.phoneNumber
            newUser.regNumber = data.regNumber
            newUser.oracleNumber = data.oracleNumber
            newUser.state = data.state
            newUser.lga = data.lga
            console.log(newUser);
        } else if (data.role === 'Student') {
            const error = await checkIfUserExists('admissionNo', data.admissionNo)
            if (error) return reject(error)

            let theClass
            try {
                if (!_.isUndefined(data.classId) && isValidObjectId(data.classId)) theClass = await classService.getOneClass({ _id: data.classId })
            } catch (error) {
                reject(error)
            }

            newUser.birthDate = data.birthDate
            newUser.admissionNo = data.admissionNo
            newUser.religion = data.religion
            newUser.homeAddress = data.homeAddress
            newUser.gender = data.gender
            newUser.class = theClass ? theClass : null
            newUser.classSection = theClass ? data.classSection : null
            // newUser.guardian = {
            //     name: data.guardianName,
            //     phoneNumber: data.guardianPhone,
            //     address: data.guardianAddress,
            //     relationship: data.guardianRelationship
            // }
        }
        let profileImage = (file ? await uploadToCloudinary(file) : data.profileImage )|| {}
        newUser.profileImage = { url: profileImage.secure_url, imageId: profileImage.public_id }
        
        try {
            await newUser.save()
            resolve(newUser)
        } catch (error) {
            reject({status: "error", code: 500, message: error})
        }

    })
}

export const batchCreateUsers = async (file) => {
    return new Promise(async (resolve, reject) => {

        const users = []
        const newUsers = []
        const errors =[]

        const readStream = fs.createReadStream(file.path)
        const csvStream = csv.parse({headers: true})

        csvStream.on("data", (data) => {
            data = _.mapKeys(data, (value, key) => _.camelCase(key.replace(/ /g,'')));
            data.guardian = {
                name: data.guardianName,
                phoneNumber: data.guardianPhone,
                address: data.guardianAddress,
                relationship: data.guardianRelationship
            }

            data.profileImage = data.profileImage ? { secure_url: data.profileImage } : undefined
            users.push(_.omit(data, ['guardianName', 'guardianPhone', 'guardianAddress', 'guardianRelationship']))
        })

        csvStream.on("end", async () => {
            let index = 0
            for (const user of users) {
                try {
                    const newUser = await createUser(user)
                    newUsers.push(newUser)
                } catch (error) {
                    error.message += ` for record ${index+1}`
                    errors.push(error.message)
                }

                index++
            }
            resolve({newUsers, errors})
            fs.unlinkSync(file.path)
        })

        readStream.pipe(csvStream)
    })
}

export const updateUser = async (user, data, file) => {
    let image
    if (file) image = user.profileImage ?
        await uploadToCloudinary(file, user.profileImage.imageId) : await uploadToCloudinary(file)

    user.fullName = data.fullName || user.fullName
    user.profileImage = image ? { url: image.secure_url, imageId: image.public_id } : (user.profileImage || undefined)
    user.resetPasswordToken = data.resetPasswordToken
    user.resetTokenExpiry = data.resetTokenExpiry

    if (user.role === 'Staff') {
        user.phoneNumber = data.phoneNumber || user.phoneNumber
    } else if (user.role === 'Student') {
        if (data.classId)
            user.class = await classService.getOneClass({ _id: data.classId })

        user.religion = data.religion || user.religion
        user.homeAddress = data.homeAddress || user.homeAddress
        user.classSection = data.classSection || user.classSection
        user.guardian = {
            _id: user.guardian._id,
            name: data.guardianName || user.guardian.name,
            phoneNumber: data.guardianPhone || user.guardian.phoneNumber,
            address: data.guardianAddress || user.guardian.address,
            relationship: data.guardianRelationship || user.guardian.relationship
        }
    }

    await user.save()
    return _.omit(user.toObject(), ['password'])
}

export const deleteUser = async (filterQuery) => {
    const user = await getOneUser(filterQuery)
    if (user.profileImage?.imageId) await deleteFromCloudinary(user.profileImage.imageId)

    await User.deleteOne(filterQuery)
    return user
}