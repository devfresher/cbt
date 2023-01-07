import Assessment, { assessmentSchema } from "../models/assessment.js"
import Question from "../models/question.js"
import Subject from "../models/subject.js";

export const getActiveAssessment = async (classId, assessmentType) => {
    let assessment = await Assessment.aggregate([
        {
            $lookup: {
                from: Subject.collection.name,
                localField: "subject",
                foreignField: "_id",
                as: "subject"
            }
        }, 
        { $unwind: "$subject" },
        {
            $match: {
                "subject.class._id": classId,
                status: true,
                assessmentType
            }
        }
    ])
    assessment = assessment[0]

    if (!assessment) throw {
        status: "error",
        error: {
            code: 400,
            message: "Assessment not available for you"
        }
    }

    const questions = await Question.aggregate( [
        { $sample: {size: 10}},
        { $match: { subjectId: assessment.subject._id } }
    ] )
    return {assessment, questions}
}