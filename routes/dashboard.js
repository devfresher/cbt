import express from "express"

const router = express.Router()
import * as dashboardController from "../controllers/dashboardController.js"

import { requireRole } from "../middleware/auth.js"


router.get("/admin", [requireRole (['Admin'])], dashboardController.getDashboard)
router.get("/staff", [requireRole (['Staff'])], dashboardController.getDashboard)
router.get("/student", [requireRole (['Student'])], dashboardController.getDashboard)


export default router