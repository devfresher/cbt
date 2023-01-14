import _ from "lodash";
import Class from "../models/class.js";
import Subject from "../models/subject.js";
import User from "../models/user.js";


export const adminDashboard = async () => {
    const studentCount = await User.countDocuments({role: "Student"})
    const subjectCount = await Subject.countDocuments()
    const classCount = await Class.countDocuments()

    const allClass = await Class.aggregate([
        {
            $lookup: {
                from: User.collection.name,
                localField: "_id",
                foreignField: "class._id",
                as: "students"
            }
        },
        // { $unwind: "$students" },
        { 
            $match: { "students.role": "Student" }
        },
        { 
            $group: { "_id": "$class._id", studentCount: {$sum:1} }
        }
    ])
    // let newClass = []

    // newClass = _.map(allClass, (theClass) => {
    //     theClass.studentCount = await User.countDocuments({role: "Student", "class_id": theClass._id})
    //     theClass.subjectCount = await Subject.countDocuments({"class_id": theClass._id})
    //     return theClass
    // })

    // allClass.forEach((theClass, index) => {
    //     let studentCount = User.countDocuments({role: "Student", "class_id": theClass._id})
    //     let subjectCount = Subject.countDocuments({"class_id": theClass._id})
    //     newClass[index].studentCount = studentCount
    //     newClass[index].subjectCount = subjectCount
    // });

    console.log(allClass);
}