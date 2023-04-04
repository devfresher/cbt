import _ from "lodash"
import { getOneSubject } from "../services/subject.service.js"

export const isSubjectTeacher = async (req, res, next) => {
	const { subjectId } = req.body
	const { role } = req.user

	if (subjectId) {
		const subject = await getOneSubject({ _id: subjectId })
		if (_.toLower(role) === "staff" && subject.teacher !== req.user._id) {
			const error = {
				status: "error",
				code: 401,
				message: `You're not authorized to do that, because you're not the teacher of ${subject.title} ${subject.class.title}`,
			}
			return next(error)
		}
	}
	next()
}
