import AssessmentTaken from "../models/assessmentTaken";

export const fetchResult = async (user) => {
    let result
    switch (user.role) {
        case 'admin':
            await AssessmentTaken.aggregate([
                {}
            ])
            result = await AssessmentTaken.find({student: user._id})
            break;

        case 'staff':
            await AssessmentTaken.aggregate([
                {$lookup: {
                    from: Subject.collection.name,
                    localField: "subject",
                    foreignField: "_id",
                    as: "subject"
                }},  { $unwind: "$subject" }, {
                    $match: {
                        "subject.class._id": student.class._id,
                        status: true,
                        type: assessmentType
                    }
                }
            ])
            result = await AssessmentTaken.find({student: user._id})
            break;

        case 'student':
            result = await AssessmentTaken.find({student: user._id})
            break;
    
        default:
            result = await AssessmentTaken.find({student: user._id})
            break;
    }

}