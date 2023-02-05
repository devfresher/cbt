import express from "express"

const router = express.Router()

import * as classController from '../controllers/classController.js'
import { requireRole } from "../middleware/auth.js"
import { validateObjectIds } from "../middleware/validate.js"

router.post("/", requireRole (['Admin']), classController.createClass)

router.get("/", requireRole (['Admin', 'Staff']), classController.fetchAll)
router.get("/without-token", classController.fetchAll)
router.get("/:classId", [requireRole (['Admin', 'Staff']), validateObjectIds('classId')], classController.fetchById)
router.get("/:classId/students", [requireRole (['Admin', 'Staff']), validateObjectIds('classId')], classController.fetchStudentsByClass)

router.put("/:classId", [requireRole (['Admin']), validateObjectIds('classId')], classController.updateClass)

router.delete("/:classId", [requireRole (['Admin']), validateObjectIds('classId')], classController.deleteClass)


export default router