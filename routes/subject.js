import express from "express"

const router = express.Router()

import * as subjectController from '../controllers/subjectController.js'
import { requireRole } from "../middleware/auth.js"
import { validateObjectIds } from "../middleware/validate.js"

router.post("/:classId", [requireRole (['Admin']), validateObjectIds('classId')], subjectController.createSubject)
router.get("/:classId", [requireRole (['Admin', 'Staff']), validateObjectIds('classId')], subjectController.fetchAllByClass)
router.get("/:classId/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectIds(['classId', 'subjectId'])], subjectController.fetchById)
router.put("/:classId/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectIds(['classId', 'subjectId'])], subjectController.updateSubject)
router.delete("/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], subjectController.deleteSubject)

export default router