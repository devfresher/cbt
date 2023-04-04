import Subject from "../models/subject.js"

import * as classService from "../services/class.service.js"
import * as userService from "../services/user.service.js"
import { paginationLabel } from "../utils/pagination.js"

export const getOneSubject = async (filterQuery) => {
	return new Promise(async (resolve, reject) => {
		const subject = await Subject.findOne(filterQuery)
		if (!subject) reject({ status: "error", code: 404, message: "Subject not found" })

		resolve(subject)
	})
}

export const createSubject = async (data) => {
	const theClass = await classService.getOneClass({ _id: data.classId })

	const subject = await Subject.findOne({ title: data.title, "class._id": theClass._id })
	if (subject) throw { status: "error", code: 400, message: "Subject already exists" }

	let teacher
	if (data.teacherId)
		teacher = await userService.getOneUser({ _id: data.teacherId, role: "Staff" })

	const newSubject = new Subject({
		title: data.title,
		class: {
			_id: theClass._id,
			title: theClass.title,
		},
		teacher: teacher ? teacher._id : null,
	})

	await newSubject.save()
	return newSubject
}

export const updateSubject = async (subjectId, updateData) => {
	const subject = await getOneSubject({ _id: subjectId })

	let theClass
	if (updateData.classId) theClass = await classService.getOneClass({ _id: updateData.classId })

	let teacher
	if (updateData.teacherId)
		teacher = await userService.getOneUser({ _id: updateData.teacherId, role: "Staff" })

	subject.title = updateData.title || subject.title
	subject.teacher = teacher ? teacher._id : subject.teacher
	subject.class = theClass || subject.class

	subject.save()

	return subject
}

export const getMany = async (filterQuery, pageFilter) => {
	if (!pageFilter || (!pageFilter.page && !pageFilter.limit))
		return await Subject.find(filterQuery)

	pageFilter.customLabels = paginationLabel
	return await Subject.paginate(filterQuery, pageFilter)
}

export const deleteSubject = async (filterQuery) => {
	const subject = await getOneSubject(filterQuery)

	await Subject.deleteOne(filterQuery)
	return subject
}
