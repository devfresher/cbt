import Subject from "../models/subject.js"

import * as classService from "../services/class.service.js"
import * as userService from "../services/user.service.js"

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
export const getOneSubject = async (filterQuery) => {
    const subject = await Subject.findOne(filterQuery)
    if (!subject) throw { status: "error", code: 404, message: "Subject not found" }

    return subject
}

export const createSubject = async (data) => {
    const theClass = await classService.getOneClass({_id: data.classId})

    const subject = await Subject.findOne({title: data.title, "class._id": theClass._id})
    if (subject) throw { status: "error", code: 400,  message: "Subject already exists" }

    let teacher
    if(data.teacherId) teacher = await userService.getOneUser({_id: data.teacherId, role: 'Staff'})

    const newSubject = new Subject ({
        title: data.title,
        class: {
            _id: theClass._id,
            title: theClass.title
        },
        teacher: teacher ? teacher._id : null
    })

    await newSubject.save()
    return newSubject
}

export const updateSubject = async (subjectId, updateData) => {
    const subject = await getOneSubject({_id: subjectId})

    if(updateData.classId) 
        subject.class = await classService.getOneClass({_id: updateData.classId})

    if(updateData.teacherId) {
        const teacher = await userService.getOneUser({_id: updateData.teacherId, role: 'Staff'})
        subject.teacher = teacher._id
    }

    subject.title = updateData.title || subject.title
    subject.save()

    return subject
}

export const getAllSubjectsByClass = async (classId, pageFilter) => {
    const theClass = await classService.getOneClass({_id: classId})
    const findFilter = {"class._id": theClass._id}
    
    pageFilter.customLabels = myCustomLabels

    return Subject.paginate(findFilter, pageFilter)
}

export const getMany = async (filterQuery, pageFilter) => {
    pageFilter.customLabels = myCustomLabels

    return await Subject.paginate(filterQuery, pageFilter)
}

export const deleteSubject = async (filterQuery) => {
    const subject = await getOneSubject(filterQuery)

    await Subject.deleteOne(filterQuery)
    return subject
}