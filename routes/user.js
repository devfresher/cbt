import express from "express"

const router = express.Router()

import * as userController from '../controllers/userController.js'
import { requireLoggedInUser, requireRole } from "../middleware/auth.js"
import { validateObjectId } from "../middleware/validate.js"

router.post("/student", requireRole(['Admin', 'Staff']), userController.createUser)
router.post("/staff", requireRole('Admin'), userController.createUser)

router.get("/students", requireRole('Admin'), userController.fetchAllByRole('Student'))
router.get("/staffs", requireRole('Admin'), userController.fetchAllByRole('Staff'))
router.get("/admins", requireRole('Admin'), userController.fetchAllByRole('Admin'))

router.get("/profile/me", requireLoggedInUser, userController.fetchProfile)
router.get("/:userId", [requireRole(['Admin', 'Staff']), validateObjectId('userId')], userController.fetchById)
router.put("/:userId", [requireRole('Admin'), validateObjectId('userId')], userController.updateUser)
router.delete("/:userId", [requireRole('Admin'), validateObjectId('userId')], userController.deleteUser)


export default router