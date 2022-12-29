import express from "express"

const router = express.Router()

import { createUser, deleteUser, fetchAllByRole, fetchById, updateUser } from '../controllers/userController.js'
import { requireRole } from "../middleware/auth.js"

router.post("/", [requireRole('Admin')], createUser)
router.get("/students", [requireRole('Admin')], fetchAllByRole('Student'))
router.get("/staffs", [requireRole('Admin')], fetchAllByRole('Staff'))
router.get("/admins", [requireRole('Admin')], fetchAllByRole('Admin'))

router.get("/:userId", [requireRole('Admin', 'Staff')], fetchById)
router.put("/:userId", [requireRole('Admin')], updateUser)
router.delete("/:userId", [requireRole('Admin')], deleteUser)

export default router