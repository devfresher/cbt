import express from "express"

const router = express.Router()

import * as subjectController from '../controllers/subjectController.js'
import { requireRole } from "../middleware/auth.js"
import { validateObjectId } from "../middleware/validate.js"

router.post("/:classId", [requireRole (['Admin']), validateObjectId('classId')], subjectController.createSubject)
router.get("/:classId", [requireRole (['Admin', 'Staff']), validateObjectId('classId')], subjectController.fetchAllByClass)
router.get("/:classId/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectId('classId'), validateObjectId('subjectId')], subjectController.fetchById)
router.put("/:classId/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectId('classId'), validateObjectId('subjectId')], subjectController.updateSubject)
router.delete("/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectId('subjectId')], subjectController.deleteSubject)

export default router