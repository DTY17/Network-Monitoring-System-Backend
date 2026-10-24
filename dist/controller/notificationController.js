import { Client } from "ssh2";
import SyslogMessage from "../model/notification.js";
import System from "../model/deviceDetails.js";
import NatMapping from "../model/natMapping.js";
import User from "../model/user.js";
const isAdminRole = (role) => role?.toUpperCase() === "ADMIN";
// ============================================================
// PAGINATION HELPER
// ============================================================
function getPagination(req) {
    const pageValue = Number.parseInt(String(req.query.page ?? "1"), 10);
    const limitValue = Number.parseInt(String(req.query.limit ?? "10"), 10);
    const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
    // Prevent extremely large requests
    const limit = Number.isFinite(limitValue) && limitValue > 0
        ? Math.min(limitValue, 100)
        : 10;
    const skip = (page - 1) * limit;
    return {
        page,
        limit,
        skip,
    };
}
function createPagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}
// ============================================================
// GET ALL
// ============================================================
export async function get_all(req, res) {
    try {
        const { page, limit, skip } = getPagination(req);
        const incomplete = String(req.query.incomplete ?? "").toLowerCase() ===
            "true";
        const filterQuery = {};
        if (incomplete) {
            filterQuery.status = { $ne: "complete" };
        }
        const [syslogMessageList, total] = await Promise.all([
            SyslogMessage.find(filterQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            SyslogMessage.countDocuments(filterQuery),
        ]);
        return res.status(200).json({
            message: "Syslog Details",
            data: syslogMessageList,
            pagination: createPagination(page, limit, total),
        });
    }
    catch (err) {
        console.error("Error fetching syslog messages:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// SAVE
// ============================================================
export async function save(req, res) {
    try {
        const { priority, timestamp, facility, severity, msg_tag, msg_text, raw, status, ipAddress, } = req.body;
        console.log("Syslog save:", req.body);
        const newSyslogMessage = new SyslogMessage({
            priority,
            timestamp,
            facility,
            severity,
            msg_tag,
            msg_text,
            raw,
            // Device IP
            ipAddress,
            status: status || "pending",
        });
        await newSyslogMessage.save();
        return res.status(201).json({
            message: "Syslog saved successfully",
            data: newSyslogMessage,
        });
    }
    catch (err) {
        console.error("Error saving syslog message:", err);
        return res.status(500).json({
            message: "Syslog save failed",
        });
    }
}
// ============================================================
// GET BY ID
// ============================================================
export async function get_id(req, res) {
    try {
        const { id } = req.params;
        const syslogMsg = await SyslogMessage.findById(id);
        if (!syslogMsg) {
            return res.status(404).json({
                message: "Syslog message not found",
            });
        }
        return res.status(200).json({
            message: "Syslog Details",
            data: syslogMsg,
        });
    }
    catch (err) {
        console.error("Error fetching syslog message:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// DELETE
// ============================================================
export async function delete_id(req, res) {
    try {
        const { id } = req.params;
        const deleted = await SyslogMessage.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({
                message: "Syslog message not found",
            });
        }
        return res.status(200).json({
            message: "Syslog message deleted",
        });
    }
    catch (err) {
        console.error("Error deleting syslog message:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// UPDATE
// ============================================================
export async function update(req, res) {
    try {
        const { id } = req.params;
        const updated = await SyslogMessage.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return res.status(404).json({
                message: "Syslog message not found",
            });
        }
        return res.status(200).json({
            message: "Syslog message updated",
            data: updated,
        });
    }
    catch (err) {
        console.error("Error updating syslog message:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// UPDATE STATUS
//
// Workflow:
//   pending / assigned  → (assigned user) fixed
//   fixed               → (admin) complete  or  not_complete
//   not_complete        → (assigned user) fixed again
// ============================================================
export async function updateStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, statusUpdatedBy } = req.body;
        // ---------------- VALIDATION ----------------
        if (!status) {
            return res.status(400).json({
                message: "Status is required",
            });
        }
        if (!statusUpdatedBy) {
            return res.status(400).json({
                message: "User who updated the status is required",
            });
        }
        const allowedStatuses = [
            "pending",
            "assigned",
            "fixed",
            "complete",
            "not_complete",
        ];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }
        // ---------------- FIND EXISTING ----------------
        const existing = await SyslogMessage.findById(id);
        if (!existing) {
            return res.status(404).json({
                message: "Syslog message not found",
            });
        }
        // ---------------- PERMISSIONS ----------------
        const actor = await User.findById(statusUpdatedBy);
        if (!actor) {
            return res.status(401).json({
                message: "Unknown user",
            });
        }
        const actorIsAdmin = isAdminRole(actor.role);
        // Only the assigned user can mark an event as fixed
        if (status === "fixed" &&
            String(existing.assignedTo ?? "") !== String(statusUpdatedBy)) {
            return res.status(403).json({
                message: "Only the assigned user can mark this as fixed",
            });
        }
        // Only admins can approve or reject
        if ((status === "complete" || status === "not_complete") &&
            !actorIsAdmin) {
            return res.status(403).json({
                message: "Only admins can approve or reject",
            });
        }
        // "assigned" is set through the assign endpoint; "pending" is admin only
        if (status === "assigned") {
            return res.status(400).json({
                message: "Use the assign endpoint to assign a task",
            });
        }
        if (status === "pending" && !actorIsAdmin) {
            return res.status(403).json({
                message: "Only admins can reset an event to pending",
            });
        }
        // ---------------- UPDATE DATA ----------------
        const updateData = {
            status,
        };
        if (status === "fixed") {
            // Member who fixed the problem
            updateData.fixedBy = statusUpdatedBy;
            updateData.fixedAt = new Date();
            // General status history
            updateData.statusUpdatedBy = statusUpdatedBy;
            updateData.statusUpdatedAt = new Date();
        }
        else if (status === "complete") {
            // statusUpdatedBy / statusUpdatedAt stay as the MEMBER's information.
            updateData.approvedBy = statusUpdatedBy;
            updateData.approvedAt = new Date();
        }
        else {
            updateData.statusUpdatedBy = statusUpdatedBy;
            updateData.statusUpdatedAt = new Date();
        }
        // ---------------- SAVE ----------------
        const updated = await SyslogMessage.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            return res.status(404).json({
                message: "Syslog message not found",
            });
        }
        return res.status(200).json({
            message: "Syslog status updated successfully",
            data: updated,
        });
    }
    catch (err) {
        console.error("Error updating syslog status:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// FILTER
// ============================================================
export async function filter(req, res) {
    try {
        const { facility, msg_tag } = req.query;
        const filters = {};
        if (facility) {
            filters.facility = facility;
        }
        if (msg_tag) {
            filters.msg_tag = msg_tag;
        }
        const { page, limit, skip } = getPagination(req);
        const [results, total] = await Promise.all([
            SyslogMessage.find(filters)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            SyslogMessage.countDocuments(filters),
        ]);
        return res.status(200).json({
            message: "Filtered Syslog Details",
            data: results,
            pagination: createPagination(page, limit, total),
        });
    }
    catch (err) {
        console.error("Error filtering syslog messages:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// COUNT
// ============================================================
export async function getCount(req, res) {
    try {
        const count = await SyslogMessage.countDocuments();
        return res.status(200).json({
            message: "Total syslog messages",
            data: { count },
        });
    }
    catch (err) {
        console.error("Error counting syslog messages:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// GET USER STATUS HISTORY
// Returns only notifications updated by the specified user
// ============================================================
export async function getUserHistory(req, res) {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }
        const { page, limit, skip } = getPagination(req);
        const filterQuery = {
            statusUpdatedBy: userId,
        };
        const [history, total] = await Promise.all([
            SyslogMessage.find(filterQuery)
                .sort({ statusUpdatedAt: -1 })
                .skip(skip)
                .limit(limit),
            SyslogMessage.countDocuments(filterQuery),
        ]);
        return res.status(200).json({
            message: "User notification history",
            data: history,
            pagination: createPagination(page, limit, total),
        });
    }
    catch (err) {
        console.error("Error fetching user history:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// GET ALL HISTORY
//
// Returns only notifications that have a statusUpdatedBy value.
// ============================================================
export async function getAllHistory(req, res) {
    try {
        const { page, limit, skip } = getPagination(req);
        const filterQuery = {
            statusUpdatedBy: {
                $exists: true,
                $nin: [null, ""],
            },
        };
        const [history, total] = await Promise.all([
            SyslogMessage.find(filterQuery)
                .sort({ statusUpdatedAt: -1 })
                .skip(skip)
                .limit(limit),
            SyslogMessage.countDocuments(filterQuery),
        ]);
        return res.status(200).json({
            message: "All notification history",
            data: history,
            pagination: createPagination(page, limit, total),
        });
    }
    catch (err) {
        console.error("Error fetching all history:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// ASSIGN TASK (admin only)
// ============================================================
export async function assignTask(req, res) {
    try {
        const { id } = req.params;
        const { assignedTo, assignedBy } = req.body;
        if (!assignedTo || !assignedBy) {
            return res.status(400).json({
                message: "assignedTo and assignedBy are required",
            });
        }
        // Caller must be an admin
        const admin = await User.findById(assignedBy);
        if (!admin || !isAdminRole(admin.role)) {
            return res.status(403).json({
                message: "Only admins can assign tasks",
            });
        }
        // Assignee must exist
        const assignee = await User.findById(assignedTo);
        if (!assignee) {
            return res.status(404).json({
                message: "Assigned user not found",
            });
        }
        // Event must exist
        const existing = await SyslogMessage.findById(id);
        if (!existing) {
            return res.status(404).json({
                message: "Syslog message not found",
            });
        }
        if (existing.status === "complete") {
            return res.status(409).json({
                message: "Completed events cannot be reassigned",
            });
        }
        const updated = await SyslogMessage.findByIdAndUpdate(id, {
            assignedTo,
            assignedBy,
            assignedDate: new Date(),
            status: "assigned",
        }, {
            new: true,
            runValidators: true,
        });
        return res.status(200).json({
            message: "Task assigned successfully",
            data: updated,
        });
    }
    catch (err) {
        console.error("Error assigning task:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// GET ASSIGNED TASKS FOR USER
// ============================================================
export async function getAssignedTasks(req, res) {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }
        const { page, limit, skip } = getPagination(req);
        const filterQuery = {
            assignedTo: userId,
        };
        const [tasks, total] = await Promise.all([
            SyslogMessage.find(filterQuery)
                .sort({ assignedDate: -1 })
                .skip(skip)
                .limit(limit),
            SyslogMessage.countDocuments(filterQuery),
        ]);
        return res.status(200).json({
            message: "Assigned tasks",
            data: tasks,
            pagination: createPagination(page, limit, total),
        });
    }
    catch (err) {
        console.error("Error fetching assigned tasks:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// GET ALL ASSIGNED TASKS
// ============================================================
export async function getAllAssignedTasks(req, res) {
    try {
        const { page, limit, skip } = getPagination(req);
        const filterQuery = {
            assignedTo: {
                $exists: true,
                $nin: [null, ""],
            },
        };
        const [tasks, total] = await Promise.all([
            SyslogMessage.find(filterQuery)
                .sort({ assignedDate: -1 })
                .skip(skip)
                .limit(limit),
            SyslogMessage.countDocuments(filterQuery),
        ]);
        return res.status(200).json({
            message: "All assigned tasks",
            data: tasks,
            pagination: createPagination(page, limit, total),
        });
    }
    catch (err) {
        console.error("Error fetching assignments:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
// ============================================================
// SSH
// ============================================================
export async function connectSSH(req, res) {
    try {
        const { id } = req.params;
        // 1. Find syslog notification
        const notification = await SyslogMessage.findById(id);
        if (!notification) {
            return res.status(404).json({
                message: "Syslog notification not found",
            });
        }
        // 2. Original device IP from syslog
        //    used to find NAT mapping + credentials
        let deviceIp = notification.ipAddress;
        if (typeof deviceIp !== "string" || deviceIp.trim() === "") {
            return res.status(400).json({
                message: "IP address is not available for this syslog",
            });
        }
        deviceIp = deviceIp.trim();
        console.log("==========================================");
        console.log("SSH CONNECTION REQUEST");
        console.log("Original device IP:", deviceIp);
        // 3. Remove port if ipAddress accidentally contains one
        //    4.4.4.4:22 → 4.4.4.4
        const ipMatch = deviceIp.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/);
        if (ipMatch && ipMatch[1]) {
            deviceIp = ipMatch[1];
        }
        console.log("Normalized device IP:", deviceIp);
        // 4. Find NAT mapping
        const natMapping = await NatMapping.findOne({
            sourceIp: deviceIp,
        }).lean();
        if (!natMapping) {
            console.error(`No NAT mapping found for source IP ${deviceIp}`);
            return res.status(404).json({
                message: `No NAT mapping found for IP address ${deviceIp}`,
            });
        }
        // 5. Validate NAT mapping
        const natHostValue = natMapping.natHost;
        const natPortValue = natMapping.natPort;
        if (typeof natHostValue !== "string" ||
            natHostValue.trim() === "") {
            return res.status(500).json({
                message: `Invalid NAT host for IP address ${deviceIp}`,
            });
        }
        if (typeof natPortValue !== "number" ||
            !Number.isInteger(natPortValue) ||
            natPortValue <= 0) {
            return res.status(500).json({
                message: `Invalid NAT port for IP address ${deviceIp}`,
            });
        }
        const sshHost = natHostValue.trim();
        const sshPort = natPortValue;
        console.log("NAT mapped host:", sshHost);
        console.log("NAT mapped port:", sshPort);
        // 6. Find device credentials using ORIGINAL IP
        const device = await System.findOne({
            ipAddress: deviceIp,
        }).select("+password");
        if (!device) {
            console.error(`No device found for original IP ${deviceIp}`);
            return res.status(404).json({
                message: `No device found for IP address ${deviceIp}`,
            });
        }
        console.log("Device found:", device.hostname);
        // 7. Validate username
        const usernameValue = device.username;
        if (typeof usernameValue !== "string" ||
            usernameValue.trim() === "") {
            return res.status(400).json({
                message: `SSH username is missing for device ${deviceIp}`,
            });
        }
        const username = usernameValue.trim();
        // 8. Validate password
        const passwordValue = device.password;
        if (typeof passwordValue !== "string" ||
            passwordValue === "") {
            return res.status(400).json({
                message: `SSH password is missing for device ${deviceIp}`,
            });
        }
        const password = passwordValue;
        // 9. Hostname
        const hostname = typeof device.hostname === "string" &&
            device.hostname.trim() !== ""
            ? device.hostname.trim()
            : deviceIp;
        console.log("Hostname:", hostname);
        console.log("Username:", username);
        // 10. Create SSH client
        const connection = new Client();
        let responseSent = false;
        const sendResponse = (statusCode, data) => {
            if (responseSent) {
                return;
            }
            responseSent = true;
            return res.status(statusCode).json(data);
        };
        // 11. SSH READY
        connection.on("ready", () => {
            console.log(`SSH connection successful: ${sshHost}:${sshPort}`);
            // This endpoint only tests the SSH connection.
            connection.end();
            return sendResponse(200, {
                message: "SSH connection successful",
                data: {
                    hostname: hostname,
                    ipAddress: deviceIp,
                    sshHost: sshHost,
                    sshPort: sshPort,
                    username: username,
                    connected: true,
                },
            });
        });
        // 12. SSH ERROR
        connection.on("error", (error) => {
            console.error(`SSH connection error ${sshHost}:${sshPort}:`, error);
            return sendResponse(502, {
                message: "SSH connection failed",
                error: error.message,
                data: {
                    hostname: hostname,
                    ipAddress: deviceIp,
                    sshHost: sshHost,
                    sshPort: sshPort,
                    connected: false,
                },
            });
        });
        // 13. SSH CLOSE
        connection.on("close", () => {
            console.log(`SSH connection closed: ${sshHost}:${sshPort}`);
        });
        // 14. CONNECT USING NAT MAPPING
        console.log(`Connecting to SSH ${sshHost}:${sshPort}...`);
        connection.connect({
            host: sshHost,
            port: sshPort,
            username: username,
            password: password,
            readyTimeout: 10000,
            algorithms: {
                kex: [
                    "diffie-hellman-group1-sha1",
                    "diffie-hellman-group14-sha1",
                ],
                cipher: [
                    "aes128-cbc",
                    "3des-cbc",
                    "aes192-cbc",
                    "aes256-cbc",
                ],
            },
            keepaliveInterval: 5000,
            keepaliveCountMax: 2,
        });
    }
    catch (err) {
        console.error("SSH connection controller error:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
//# sourceMappingURL=notificationController.js.map