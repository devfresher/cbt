import _ from "lodash";
import Assessment from "../models/assessment.js";
import Class from "../models/class.js";
import Subject from "../models/subject.js";
import User from "../models/user.js";

import * as resultService from "../services/result.service.js"

export const getDashboard = async (user) => {
    let studentCount, subjectCount, classCount, classes, upcomingEvents
    const results = resultService.fetchResult(user, 5)

    switch (_.toLower(user.role)) {
        case "admin":
            studentCount = await User.countDocuments({role: "Student"})
            subjectCount = await Subject.countDocuments()
            classCount = await Class.countDocuments()
            
            classes = await User.aggregate([
                { $match: {"role": "Student"}},
                { $group : { _id : '$class._id', totalStudent: {$sum:1}} },
                { $lookup: {
                    from: "classes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "classInfo"
                }},
                { $unwind: "$classInfo" },
                { $project: {
                    _id: 0
                }}
            ])

            upcomingEvents = await Assessment.aggregate([
                { $match: { scheduledDate: { "$gte": new Date} } },
                {
                    $lookup: {
                        from: "subject",
                        localField: "subject",
                        foreignField: "_id",
                        as: "subject"
                    }
                },
                { $unwind: "$subject" },
            ])
            break;
            
        case "staff":
            studentCount = await User.countDocuments({role: "Student"})
            subjectCount = await Subject.countDocuments({teacher: user._id})
            classCount = await Class.countDocuments({teacher: user._id})

            classes = await User.aggregate([
                { $match: {"role": "Student"}},
                { $group : { _id : '$class._id', totalStudent: {$sum:1}} },
                { $lookup: {
                    from: "classes",
                    localField: "_id",
                    foreignField: "_id",
                    as: "classInfo"
                }},
                { $unwind: "$classInfo" },
                { $match: {"classInfo.teacher": user._id}},
                { $project: {
                    _id: 0
                }}
            ])
        
            upcomingEvents = await Assessment.aggregate([
                { $match: { scheduledDate: { "$gte": new Date} } },
                {
                    $lookup: {
                        from: Subject.collection.name,
                        localField: "subject",
                        foreignField: "_id",
                        as: "subject"
                    }
                },
                { $unwind: "$subject" },
                { $match: { "subject.teacher": user._id } }
            ])
            break;
        
        default: 
            studentCount = subjectCount = classCount = 0
            upcomingEvents = results = classes = []
            break
    }

    return {studentCount, subjectCount, classCount, upcomingEvents, results, classes}
}