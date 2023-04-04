import _ from "lodash"
import { Types } from "mongoose"
import Assessment from "../models/assessment.js"
import Class from "../models/class.js"
import Subject from "../models/subject.js"
import User from "../models/user.js"

import * as resultService from "../services/result.service.js"

export const getDashboard = async (user) => {
	let studentCount, subjectCount, classCount, classes, upcomingEvents
	const results = await resultService.fetchResult(user, 5)

	switch (_.toLower(user.role)) {
		case "admin":
			studentCount = await User.countDocuments({ role: "Student" })
			subjectCount = await Subject.countDocuments()
			classCount = await Class.countDocuments()

			classes = await Subject.aggregate([
				{
					$lookup: {
						from: "users",
						localField: "class._id",
						foreignField: "class._id",
						as: "students",
					},
				},
				{ $unwind: "$students" },
				{ $group: { _id: "$class", totalStudent: { $count: {} } } },
				{
					$project: {
						_id: 0,
						classInfo: "$_id",
						totalStudent: 1,
					},
				},
			])

			upcomingEvents = await Assessment.aggregate([
				{ $match: { scheduledDate: { $gte: new Date() } } },
				{
					$lookup: {
						from: "subject",
						localField: "subject",
						foreignField: "_id",
						as: "subject",
					},
				},
				{ $unwind: "$subject" },
			])
			break

		case "staff":
			studentCount = await User.countDocuments({ role: "Student" })
			subjectCount = await Subject.countDocuments({ teacher: user._id })
			classCount = await Class.countDocuments({ teacher: user._id })

			classes = await Subject.aggregate([
				{ $match: { teacher: Types.ObjectId(user._id) } },
				{
					$lookup: {
						from: "users",
						localField: "class._id",
						foreignField: "class._id",
						as: "students",
					},
				},
				{ $unwind: "$students" },
				{ $group: { _id: "$class", totalStudent: { $count: {} } } },
				{
					$project: {
						_id: 0,
						classInfo: "$_id",
						totalStudent: 1,
					},
				},
			])

			upcomingEvents = await Assessment.aggregate([
				{ $match: { scheduledDate: { $gte: new Date() } } },
				{
					$lookup: {
						from: "subjects",
						localField: "subject",
						foreignField: "_id",
						as: "subject",
					},
				},
				{ $unwind: "$subject" },
				{ $match: { "subject.teacher": Types.ObjectId(user._id) } },
			])
			break

		default:
			studentCount = subjectCount = classCount = 0
			upcomingEvents = results = classes = []
			break
	}

	return { studentCount, subjectCount, classCount, upcomingEvents, results, classes }
}
