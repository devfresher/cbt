import express from "express"

const router = express.Router()

import * as questionController from '../controllers/questionController.js'
import { requireRole } from "../middleware/auth.js"
import { validateObjectIds } from "../middleware/validate.js"

// Questions Implementation
router.post("/", [requireRole (['Admin', 'Staff'])], questionController.create)
router.get("/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], questionController.fetchAllBySubject)
router.get("/:subjectId/:questionId", [requireRole (['Admin', 'Staff']), validateObjectIds(['subjectId', 'questionId'])], questionController.fetchById)
router.put("/:questionId", [requireRole (['Admin', 'Staff']), validateObjectIds('questionId')], questionController.updateQuestion)
router.delete("/:questionId", [requireRole (['Admin', 'Staff']), validateObjectIds('questionId')], questionController.deleteQuestion)

export default router