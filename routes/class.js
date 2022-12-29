import express from "express"

const router = express.Router()

import * as classController from '../controllers/classController.js'
import { requireRole } from "../middleware/auth.js"

router.get("/", requireRole (['Admin', 'Staff']), classController.fetchAll)
router.post("/", requireRole (['Admin']), classController.createClass)
router.get("/:classId/students", requireRole (['Admin', 'Staff']), classController.fetchStudentsByClass)


export default router