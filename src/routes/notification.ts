import express from "express";

import {
  get_all,
  save,
  get_id,
  delete_id,
  update,
  updateStatus,
  filter,
  getCount,
  getUserHistory,
  getAllHistory,
  assignTask,
  getAssignedTasks,
  getAllAssignedTasks,
  connectSSH,
} from "../controller/notificationController.js";

const router = express.Router();

// =========================================================
// SYSLOG
// =========================================================

// GET all syslog messages
// Supports pagination:
// GET /api/v1/notification?page=1&limit=10
router.get("/", get_all);

// SAVE new syslog message
router.post("/", save);

// =========================================================
// COUNT
// =========================================================

// GET total syslog message count
router.get("/count", getCount);

// =========================================================
// HISTORY
// =========================================================

// GET all notification history
// Supports pagination if implemented in controller
router.get("/history/all", getAllHistory);

// GET notification history for a specific user
// Supports pagination if implemented in controller
router.get("/history/user/:userId", getUserHistory);

// =========================================================
// ASSIGNED TASKS
// =========================================================

// GET all assigned tasks
// Supports pagination if implemented in controller
router.get("/assigned", getAllAssignedTasks);

// GET assigned tasks for a specific user
// Supports pagination if implemented in controller
router.get("/assigned/:userId", getAssignedTasks);

// =========================================================
// FILTER
// =========================================================

// Example:
// GET /api/v1/notification/filter?facility=local7&msg_tag=LINK
router.get("/filter", filter);

// =========================================================
// STATUS
// =========================================================

// Update notification status
//
// Example:
// POST /api/v1/notification/status/64abc123
//
// Body:
// {
//   "status": "fixed",
//   "statusUpdatedBy": "64user123"
// }
router.post("/status/:id", updateStatus);

// =========================================================
// ASSIGN
// =========================================================

// Assign notification/task to a user
//
// Example:
// POST /api/v1/notification/assign/64abc123
//
// Body:
// {
//   "assignedTo": "64user123",
//   "assignedBy": "64admin123"
// }
router.post("/assign/:id", assignTask);

// =========================================================
// SSH CONNECTION TEST
// =========================================================

// Test SSH connection for a notification/device
//
// Example:
// POST /api/v1/notification/ssh/64abc123
router.post("/ssh/:id", connectSSH);

// =========================================================
// INDIVIDUAL SYSLOG
// =========================================================

// GET one syslog message by ID
router.get("/:id", get_id);

// UPDATE one syslog message
router.put("/:id", update);

// DELETE one syslog message
router.delete("/:id", delete_id);

// =========================================================

export default router;
