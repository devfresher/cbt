import _ from "lodash"
import mongoose from "mongoose"
import AssessmentTaken from "../models/assessmentTaken.js"

export const fetchResult = async (user, limit) => {
	let pipeline
	switch (_.toLower(user.role)) {
		case "admin":
			pipeline = [
				{ $match: { completedAt: { $ne: null } } },
				{
					$lookup: {
						from: "users",
						localField: "student",
						foreignField: "_id",
						as: "student",
					},
				},
				{
					$lookup: {
						from: "assessments",
						localField: "assessment",
						foreignField: "_id",
						as: "assessment",
					},
				},
				{ $match: { "assessment.resultReleased": true } },
				{
					$lookup: {
						from: "subjects",
						localField: "assessment.subject",
						foreignField: "_id",
						as: "subject",
					},
				},
				{
					$lookup: {
						from: "classes",
						localField: "subject.class._id",
						foreignField: "_id",
						as: "class",
					},
				},
				{ $unwind: "$student" },
				{
					$group: {
						_id: { assessment_id: "$assessment", class_id: "$class" },
						students: {
							$push: {
								info: "$student",
								score: "$totalCorrectAnswer",
								grade: "$grade",
							},
						},
					},
				},
				{
					$project: {
						_id: 0,
						assessment: "$_id.assessment_id",
						class: "$_id.class_id",
						students: 1,
					},
				},
				{ $unwind: "$assessment" },
				{ $unwind: "$class" },
			]
			break

		case "staff":
			pipeline = [
				{ $match: { completedAt: { $ne: null } } },
				{
					$lookup: {
						from: "users",
						localField: "student",
						foreignField: "_id",
						as: "student",
					},
				},
				{
					$lookup: {
						from: "assessments",
						localField: "assessment",
						foreignField: "_id",
						as: "assessment",
					},
				},
				{ $match: { "assessment.resultReleased": true } },
				{
					$lookup: {
						from: "subjects",
						localField: "assessment.subject",
						foreignField: "_id",
						as: "subject",
					},
				},
				{ $match: { "subject.teacher": mongoose.Types.ObjectId(user._id) } },
				{
					$lookup: {
						from: "classes",
						localField: "subject.class._id",
						foreignField: "_id",
						as: "class",
					},
				},
				{ $unwind: "$student" },
				{
					$group: {
						_id: { assessment_id: "$assessment", class_id: "$class" },
						students: {
							$push: {
								info: "$student",
								score: "$totalCorrectAnswer",
								grade: "$grade",
							},
						},
					},
				},
				{
					$project: {
						_id: 0,
						assessment: "$_id.assessment_id",
						class: "$_id.class_id",
						students: 1,
					},
				},
				{ $unwind: "$assessment" },
				{ $unwind: "$class" },
			]
			break

		case "student":
			pipeline = [
				{ $match: { completedAt: { $ne: null } } },
				{ $match: { student: mongoose.Types.ObjectId(user._id) } },
				{
					$lookup: {
						from: "assessments",
						localField: "assessment",
						foreignField: "_id",
						as: "assessment",
					},
				},
				{ $match: { "assessment.resultReleased": true } },
				{
					$lookup: {
						from: "subjects",
						localField: "assessment.subject",
						foreignField: "_id",
						as: "subject",
					},
				},
				{
					$lookup: {
						from: "classes",
						localField: "subject.class._id",
						foreignField: "_id",
						as: "class",
					},
				},
				{
					$project: {
						student: 0,
					},
				},
				{ $unwind: "$assessment" },
				{ $unwind: "$class" },
				{ $unwind: "$subject" },
			]
			break

		default:
			pipeline = []
			break
	}

	if (limit) pipeline.push({ $limit: limit })
	const result = await AssessmentTaken.aggregate(pipeline)
	return result
}
