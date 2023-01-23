import _ from "lodash";
import mongoose from "mongoose";
import AssessmentTaken from "../models/assessmentTaken.js";

export const fetchResult = async (user, query) => {
    let resultAggregate
    switch (_.toLower(user.role)) {
        
        case 'admin':
            resultAggregate = await AssessmentTaken.aggregate([
                { $match: { completedAt: { $ne: null } } },
                { $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'student'
                }},
                { $lookup: {
                    from: 'assessments',
                    localField: 'assessment',
                    foreignField: '_id',
                    as: 'assessment'
                }},
                { $lookup: {
                    from: 'subjects',
                    localField: 'assessment.subject',
                    foreignField: '_id',
                    as: 'subject'
                }},
                { $lookup: {
                    from: 'classes',
                    localField: 'subject.class._id',
                    foreignField: '_id',
                    as: 'class'
                }},
                { $unwind: "$student" },
                { $group: {
                    _id: { assessment_id: '$assessment', class_id: '$class' },
                    students: { $push: {info: '$student', score: "$score", grade: "$grade"} }
                }},
                { $project: {
                    _id: 0,
                    assessment: '$_id.assessment_id',
                    class: '$_id.class_id',
                    students: 1
                }},
                { $unwind: "$assessment"},
                { $unwind: "$class"},
            ])
                  
            break;

        case 'staff':
            resultAggregate = await AssessmentTaken.aggregate([
                { $match: { completedAt: { $ne: null } } },
                { $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'student'
                }},
                { $lookup: {
                    from: 'assessments',
                    localField: 'assessment',
                    foreignField: '_id',
                    as: 'assessment'
                }},
                { $lookup: {
                    from: 'subjects',
                    localField: 'assessment.subject',
                    foreignField: '_id',
                    as: 'subject'
                }},
                { $match: { 'subject.teacher': user._id} },
                { $lookup: {
                    from: 'classes',
                    localField: 'subject.class._id',
                    foreignField: '_id',
                    as: 'class'
                }},
                { $unwind: "$student" },
                { $group: {
                    _id: { assessment_id: '$assessment', class_id: '$class' },
                    students: { $push: {info: '$student', score: "$score", grade: "$grade"} }
                }},
                { $project: {
                    _id: 0,
                    assessment: '$_id.assessment_id',
                    class: '$_id.class_id',
                    students: 1
                }},
                { $unwind: "$assessment"},
                { $unwind: "$class"},
            ])
            break;

        case 'student':
            resultAggregate = await AssessmentTaken.aggregate([
                { $match: { completedAt: { $ne: null } } },
                { $match: { 'student': mongoose.Types.ObjectId(user._id)} },
                { $lookup: {
                    from: 'assessments',
                    localField: 'assessment',
                    foreignField: '_id',
                    as: 'assessment'
                }},
                { $lookup: {
                    from: 'subjects',
                    localField: 'assessment.subject',
                    foreignField: '_id',
                    as: 'subject'
                }},
                { $lookup: {
                    from: 'classes',
                    localField: 'subject.class._id',
                    foreignField: '_id',
                    as: 'class'
                }},
                { $project: {
                    student: 0
                }},
                { $unwind: "$assessment"},
                { $unwind: "$class"},
                { $unwind: "$subject"},
            ])
            break;
    
        default:
            resultAggregate = await AssessmentTaken.find({student: user._id})
            break;
    }

    const myCustomLabels = {
        totalDocs: 'totalItems',
        docs: 'items',
        limit: 'perPage',
        page: 'currentPage',
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: false,
        prevPage: false,
        totalPages: 'pageCount',
        pagingCounter: false,
        meta: 'paging',
    };
    query.customLabels = myCustomLabels
    const result = AssessmentTaken.aggregatePaginate(resultAggregate, query)
    return result 
}