import { Router } from "express";
import { saveSystem, getAllSystems, getSystemById, updateSystem, deleteSystem, getSystemCount, } from "../controller/deviceDetailsController.js";
const router = Router();
// COUNT
router.get("/count", getSystemCount);
// GET ALL SYSTEMS
router.get("/", getAllSystems);
// GET SYSTEM BY ID
router.get("/:id", getSystemById);
// CREATE SYSTEM
router.post("/", saveSystem);
// UPDATE SYSTEM
router.put("/:id", updateSystem);
// DELETE SYSTEM
router.delete("/:id", deleteSystem);
export default router;
//# sourceMappingURL=deviceDetails.js.map