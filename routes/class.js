import express from "express"

const router = express.Router()

import * as classController from '../controllers/classController.js'
import { requireRole } from "../middleware/auth.js"
import { validateObjectId } from "../middleware/validate.js"

router.get("/", requireRole (['Admin', 'Staff']), classController.fetchAll)
router.post("/", requireRole (['Admin']), classController.createClass)
router.get("/:classId/students", [requireRole (['Admin', 'Staff']), validateObjectId('classId')], classController.fetchStudentsByClass)
router.put("/:classId", [requireRole (['Admin']), validateObjectId('classId')], classController.updateClass)
router.delete("/:classId", [requireRole (['Admin']), validateObjectId('classId')], classController.deleteClass)


export default router