import _ from "lodash"
import Class from "../models/class.js"
import * as userService from "../services/user.service.js"
import { paginationLabel } from "../utils/pagination.js"

export const getOneClass = (filterQuery) => {
	return new Promise(async (resolve, reject) => {
		let theClass = await Class.findOne(filterQuery)
		if (!theClass) reject({ status: "error", code: 404, message: "Class not found" })

		resolve(theClass)
	})
}

export const getMany = async (filterQuery, pageFilter) => {
	if (!pageFilter || (!pageFilter.page && !pageFilter.limit)) return await Class.find(filterQuery)

	pageFilter.customLabels = paginationLabel
	return await Class.paginate(filterQuery, pageFilter)
}

const isClassTeacher = async (teacherId) => {
	const assignedClass = await Class.findOne({ teacher: teacherId })
	if (assignedClass)
		throw { status: "error", code: 400, message: "Teacher already assigned to a class" }

	return
}

export const createClass = async (data) => {
	let theClass = await Class.findOne({ title: data.title })
	if (theClass) throw { status: "error", code: 400, message: `${data.title} already exist` }

	let teacher
	if (data.teacher) {
		teacher = await userService.getOneUser({ _id: data.teacher, role: "Staff" })
		await isClassTeacher(data.teacher)
	}

	const newClass = new Class({
		title: data.title,
		description: data.description,
		teacher: teacher ? teacher._id : null,
	})

	await newClass.save()
	return newClass
}

export const updateClass = async (theClass, data) => {
	let teacher
	if (data.teacher) {
		teacher = await userService.getOneUser({ _id: data.teacher, role: "Staff" })
		await isClassTeacher(data.teacher)
	}

	theClass.title = data.title || theClass.title
	theClass.description = data.description || theClass.description
	theClass.teacher = teacher ? teacher._id : theClass.teacher

	await theClass.save()
	return theClass
}

export const deleteClass = async (filterQuery) => {
	const theClass = await getOneClass(filterQuery)

	await Class.deleteOne(filterQuery)
	await userService.deleteManyUsers({ "class._id": theClass._id })

	return theClass
}
