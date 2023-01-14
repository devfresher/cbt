import _ from "lodash";
import Assessment from "../models/assessment.js";
import AssessmentTaken from "../models/assessmentTaken.js";
import Subject from "../models/subject.js";

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

export const fetchAllResults = async () => {

    const subjects = Subject.find()
    _.each(subjects, (subject) => {
        subject.results = getResultsBySubject(subject._id) || null
    })
    // const result = await AssessmentTaken.aggregate([
    //     {
    //         $lookup: {
    //             from: Assessment.collection.name,
    //             localField: "assessment",
    //             foreignField: "_id",
    //             as: "assessment"
    //         }
    //     },  
    //     {
    //         $lookup: {
    //             from: Subject.collection.name,
    //             localField: "assessment.subject",
    //             foreignField: "_id",
    //             as: "subject"
    //         }
    //     },  
         
    //     { $unwind: "$assessment" }, 
    //     { $unwind: "$subject" }, 
    //     // { $unwind: "$subject.class" }, 
        
    //     {
    //         $match: {
    //             // completedAt: {$gte: Date.now()},
    //         }
    //     }
    // ])
    // console.log(result);

    return result
}