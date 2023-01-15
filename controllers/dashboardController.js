import _ from 'lodash'
import * as dashboardService from '../services/dashboard.service.js'

export const getDashboard = async (req, res, next) => {
    let response
    switch (req.user.role) {
        case "Admin":
            response = await dashboardService.adminDashboard()
            break;

        case "Staff":
            response = await dashboardService.staffDashboard(req.user._id)
            break;
    
        default:
            throw {status: "error", code: 401, message: "Invalid user role"}
            break;
    }

    next({ status: "success", data: response })
}   