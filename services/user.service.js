import _ from "lodash"
import User, * as userModel from "../models/user.js"

import * as classService from "../services/class.service.js"
import { deleteFromCloudinary, uploadToCloudinary } from "../startup/cloudinaryConfig.js";

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
};

export const getOneUser = async (filterQuery) => {
    filterQuery.select = '-password'
    const user = await User.findOne(filterQuery)    

    if (!user) throw {status: "error", code: 404, message: `${_.capitalize(filterQuery.role) || 'User'} not found`}
    return user
}

export const getAllStudentsByClass = async (classId, pageFilter) => {
    const theClass = await classService.getOneClass({_id: classId})
    const findFilter = {"class._id": theClass._id, role: "Student"}
    
    pageFilter.customLabels = myCustomLabels

    return User.paginate(findFilter, pageFilter)
}

export const getMany = async (filterQuery, pageFilter) => {
    pageFilter.customLabels = myCustomLabels

    return await User.paginate(filterQuery, pageFilter)
}

export const createUser = async (data, file) => {
    const user = await User.findOne({ email: data.email })
    if (user) throw {status: "error", code: 400, message: "Email already exit"}

    let newUser = new User({
        fullName: data.fullName,
        email: data.email,
        password: await userModel.hashPassword(data.password),
        role: data.role,
    })

    if(data.role === 'Staff' || data.role === 'Admin') {
        const phoneExists = await User.countDocuments({ phoneNumber: data.phoneNumber })
        if (phoneExists > 0) throw {status: "error", code: 400, message: "Phone number already exit"}
    
        const regNumberExists = await User.countDocuments({ regNumber: data.regNumber })
        if (regNumberExists > 0) throw {status: "error", code: 400, message: "Registration number already exit"}
    
        const oracleNumberExists = await User.countDocuments({ oracleNumber: data.oracleNumber })
        if (oracleNumberExists > 0) throw {status: "error", code: 400, message: "Oracle number already exit"}

        newUser.phoneNumber = data.phoneNumber
        newUser.regNumber = data.regNumber
        newUser.oracleNumber = data.oracleNumber
        newUser.state = data.state
        newUser.lga = data.lga
    } else if (data.role === 'Student') {
        const admissionNoExists = await User.countDocuments({ admissionNo: data.admissionNo })
        if (admissionNoExists > 0) throw {status: "error", code: 400, message: "Admission number already exit"}

        let theClass
        if (!_.isUndefined(data.classId)) theClass = await classService.getOneClass({_id: data.classId})

        newUser.birthDate = data.birthDate
        newUser.admissionNo = data.admissionNo
        newUser.religion = data.religion
        newUser.homeAddress = data.homeAddress
        newUser.gender = data.gender
        newUser.class = theClass ? theClass : null
        newUser.classSection = theClass ? data.classSection : null
        newUser.guardian = {
            name: data.guardianName,
            phoneNumber: data.guardianPhone,
            address: data.guardianAddress,
            relationship: data.guardianRelationship
        }
    }

    let profileImage
    if (file) profileImage = await uploadToCloudinary(file)
    newUser.profileImage = profileImage ? { url: profileImage.secure_url, imageId: profileImage.public_id } : undefined

    await newUser.save()
    return newUser
}

export const updateUser = async (user, data, file) => {
    let image
    if (file) image = user.profileImage ? 
        await uploadToCloudinary(file, user.profileImage.imageId) : await uploadToCloudinary(file)

    user.fullName = data.fullName || user.fullName
    user.profileImage = image ? {url: image.secure_url, imageId: image.public_id} : (user.profileImage || undefined)

    if(user.role === 'Staff') {
        user.phoneNumber = data.phoneNumber || user.phoneNumber
    } else if (user.role === 'Student') {
        if (data.classId) 
            user.class = await classService.getOneClass({_id: data.classId})

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
    if (user.profileImage) await deleteFromCloudinary(user.profileImage.imageId)

    await User.deleteOne(filterQuery)
    return user
}