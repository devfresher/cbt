import express from "express"

const router = express.Router()

import * as questionController from '../controllers/questionController.js'
import { requireRole } from "../middleware/auth.js"
import { validateObjectIds } from "../middleware/validate.js"

// Questions Implementation
router.post("/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], questionController.createQuestion)
router.get("/:subjectId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], questionController.fetchAllBySubject)
router.get("/:subjectId/:questionId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], questionController.getQuestionById)
router.put("/:subjectId/:questionId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], questionController.updateQuestion)
router.delete("/:questionId", [requireRole (['Admin', 'Staff']), validateObjectIds('subjectId')], questionController.deleteQuestion)

export default router