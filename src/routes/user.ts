import { Router } from "express"
import { getCount, getUser, login, signup } from "../controller/userController.js"
// import { Authenticate } from "../middleware/authentication.js"
// import { requireRole } from "../middleware/rolecheck.js"
// import { Role } from "../util/Role.js"

const router = Router()

router.get("/get", getUser)     // Authenticate , requireRole([Role.Admin])
router.get("/count", getCount)  // Authenticate , requireRole([Role.Admin])
router.post("/login", login)
router.post("/signup", signup)

export default router