import express from "express"

const router = express.Router()

import * as userController from '../controllers/userController.js'
import { requireLoggedInUser, requireRole } from "../middleware/auth.js"
import { validateObjectIds } from "../middleware/validate.js"
import { uploadSingleImage, uploadBatchCsv } from "../middleware/uploadFiles.js"


router.post("/student", [requireRole(['Admin', 'Staff']), uploadSingleImage('profileImage')], userController.createUser)
router.post("/batch-upload", [requireRole(['Admin']), uploadBatchCsv('csvFile')], userController.batchCreateUser)
router.post("/staff", [requireRole('Admin'), uploadSingleImage('profileImage')], userController.createUser)
router.post("/admin", requireRole('Admin'), userController.createUser)

router.get("/", requireRole('Admin'), userController.fetchAllByRole)

router.get("/profile/me", requireLoggedInUser, userController.fetchProfile)
router.get("/:userId", [requireRole(['Admin', 'Staff']), validateObjectIds('userId')], userController.fetchById)
router.put("/:userId", [requireRole('Admin'), validateObjectIds('userId'), uploadSingleImage('profileImage')], userController.updateUser)

router.patch("/assign/subject/:subjectId", [requireRole('Staff'), validateObjectIds('subjectId')], userController.assignSubject)
router.patch("/assign/class/:classId", [requireRole('Staff'), validateObjectIds('classId')], userController.assignClass)

router.delete("/:userId", [requireRole('Admin'), validateObjectIds('userId')], userController.deleteUser)


export default router