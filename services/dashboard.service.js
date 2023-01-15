import { match } from "assert";
import _ from "lodash";
import Assessment from "../models/assessment.js";
import Class from "../models/class.js";
import Subject from "../models/subject.js";
import User from "../models/user.js";


export const adminDashboard = async () => {
    const studentCount = await User.countDocuments({role: "Student"})
    const subjectCount = await Subject.countDocuments()
    const classCount = await Class.countDocuments()

    let results
    // const classes = await Class.aggregate([
    //     // {$group : { _id : '$students.class._id', totalStudents : { $count : {} } }},
    //     {
    //         $lookup: {
    //             from: User.collection.name,
    //             localField: "_id",
    //             foreignField: "class._id",
    //             as: "students"
    //         }
            
    //     },
    //     // {$unwind: "$students"}
    //     // { $match: {"role": "Student"}}
    // ])
    const classes = await User.aggregate([
        { $match: {"role": "Student"}},
        {$group : { _id : '$class._id'}},
        {
            $lookup: {
                from: User.collection.name,
                localField: "_id",
                foreignField: "class._id",
                as: "students"
            }
            
        },
    ])
    const upcomingEvents = await Assessment.aggregate([
        {
            $match: {
                scheduledDate: { "$gte": new Date}
            }
        }
    ])

    return {studentCount, subjectCount, classCount, upcomingEvents, results, classes}
}

export const staffDashboard = async (staffId) => {
    const studentCount = await User.countDocuments({role: "Student"})
    const subjectCount = await Subject.countDocuments({teacher: staffId})
    const classCount = await Class.countDocuments()

    let results

    const classes = await User.aggregate([
        { $match: {"role": "Student"}},
        {$group : { _id : '$class._id'}},
        {
            $lookup: {
                from: User.collection.name,
                localField: "_id",
                foreignField: "class._id",
                as: "students"
            }
            
        },
    ])
    const upcomingEvents = await Assessment.aggregate([
        {
            $match: {
                scheduledDate: { "$gte": new Date}
            }
        }
    ])

    return {studentCount, subjectCount, classCount, upcomingEvents, results, classes}
}