import express from "express";
import { createNatMapping, getAllNatMappings, getNatMappingById, updateNatMapping, deleteNatMapping, } from "../controller/natMappingController.js";
const router = express.Router();
// CREATE
router.post("/", createNatMapping);
// GET ALL
router.get("/", getAllNatMappings);
// GET BY ID
router.get("/:id", getNatMappingById);
// UPDATE
router.put("/:id", updateNatMapping);
// DELETE
router.delete("/:id", deleteNatMapping);
export default router;
//# sourceMappingURL=natMapping.js.map