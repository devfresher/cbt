import AssessmentTaken from "../models/assessmentTaken";

export const fetchResult = async (user) => {
    switch (user.role) {
        case 'admin':
            let result = await AssessmentTaken.find({student: user._id})
            break;

        case 'staff':
            let result = await AssessmentTaken.find({student: user._id})
            break;

        case 'student':
            let result = await AssessmentTaken.find({student: user._id})
            break;
    
        default:
            let result = await AssessmentTaken.find({student: user._id})
            break;
    }

}