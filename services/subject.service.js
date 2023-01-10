import Subject from "../models/subject.js"


export const getOneSubject = async (subjectId) => {
    let subject = await Subject.findById(subjectId)
    if (!subject) throw {
        status: "error",
        error: {
            code: 404,
            message: "Subject not found"
        }
    }

    return subject
}