import _ from "lodash"
import * as dashboardService from "../services/dashboard.service.js"

export const getDashboard = async (req, res, next) => {
	const response = await dashboardService.getDashboard(req.user)
	next({ status: "success", data: response })
}
