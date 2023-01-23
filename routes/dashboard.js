import express from "express"

const router = express.Router()
import * as dashboardController from "../controllers/dashboardController.js"

import { requireRole } from "../middleware/auth.js"


router.get("/", [requireRole (['Admin', 'Staff'])], dashboardController.getDashboard)


export default router