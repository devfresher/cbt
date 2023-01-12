import express from "express"

const router = express.Router()

import * as userController from '../controllers/userController.js'
import { requireLoggedInUser, requireRole } from "../middleware/auth.js"
import { validateObjectIds, validateRequest } from "../middleware/validate.js"

router.post("/student", requireRole(['Admin', 'Staff']), userController.createUser)
router.post("/staff", requireRole('Admin'), userController.createUser)
router.post("/admin", requireRole('Admin'), userController.createUser)

router.get("/", requireRole('Admin'), userController.fetchAllByRole)

router.get("/profile/me", requireLoggedInUser, userController.fetchProfile)
router.get("/:userId", [requireRole(['Admin', 'Staff']), validateObjectIds('userId')], userController.fetchById)
router.put("/:userId", [requireRole('Admin'), validateObjectIds('userId')], userController.updateUser)
router.delete("/:userId", [requireRole('Admin'), validateObjectIds('userId')], userController.deleteUser)


export default router