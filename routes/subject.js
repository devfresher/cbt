import express from "express"

const router = express.Router()

import * as subjectController from '../controllers/subjectController.js'
import { requireRole } from "../middleware/auth.js"

router.post("/:classId", requireRole (['Admin']), subjectController.createSubject)
router.get("/:classId", requireRole (['Admin', 'Staff']), subjectController.fetchAllByClass)
// router.get("/:classId/:subjectId", requireRole (['Admin', 'Staff']), subjectController.fetchAllByClass)
// router.put("/:subjectId", requireRole (['Admin', 'Staff']), subjectController.updateSubject)
// router.delete("/:subjectId", requireRole (['Admin', 'Staff']), subjectController.deleteSubject)

export default router