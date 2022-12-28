import express from "express"

const router = express.Router()

import { fetchAll, createClass, fetchStudentsByClass } from '../controllers/classController.js'
import { requireRole } from "../middleware/auth.js"

router.get("/", requireRole (['Admin', 'Staff']), fetchAll)
router.post("/", requireRole (['Admin']), createClass)
router.get("/:classId/students", requireRole (['Admin', 'Staff']), fetchStudentsByClass)


export default router