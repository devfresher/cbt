import express from "express"

import * as questionController from '../controllers/questionController.js'
import { requireRole } from "../middleware/auth.js"
import { isSubjectTeacher } from "../middleware/subject.js"
import { uploadSingle } from "../middleware/uploadFiles.js"
import { validateObjectIds } from "../middleware/validate.js"

const router = express.Router()

router.post("/", 
    [
        requireRole (['Admin', 'Staff']), 
        uploadSingle('image'),
        isSubjectTeacher, 
    ], 
    questionController.create
)

router.get("/", 
    [ requireRole (['Admin']) ], 
    questionController.fetchAll
)

router.get("/:subjectId", 
    [
        requireRole (['Admin', 'Staff']), 
        validateObjectIds('subjectId')
    ], 
    questionController.fetchAllBySubject
)
router.get("/:subjectId/:questionId", [requireRole (['Admin', 'Staff']), validateObjectIds(['subjectId', 'questionId'])], questionController.fetchById)
router.put("/:questionId", [requireRole (['Admin', 'Staff']), validateObjectIds('questionId'), isSubjectTeacher, uploadSingle('image')], questionController.updateQuestion)
router.delete("/:questionId", [requireRole (['Admin', 'Staff']), validateObjectIds('questionId')], questionController.deleteQuestion)

export default router