import express from "express"

const router = express.Router()

import { fetchByRole, updateUser } from '../controllers/userController.js'
import { requireRole } from "../middleware/auth.js"

router.get("/students", [requireRole('Admin')], fetchByRole('Student'))
router.get("/staffs", [requireRole('Admin')], fetchByRole('Staff'))
router.get("/admins", [requireRole('Admin')], fetchByRole('Admin'))
router.put("/:userId", [requireRole('Admin')], updateUser)

export default router