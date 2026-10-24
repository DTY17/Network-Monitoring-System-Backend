import { Document, model, Schema } from "mongoose";
const SyslogMessageSchema = new Schema({
    priority: {
        type: Number,
    },
    timestamp: {
        type: String,
    },
    facility: {
        type: String,
    },
    severity: {
        type: Number,
    },
    msg_tag: {
        type: String,
    },
    msg_text: {
        type: String,
    },
    raw: {
        type: String,
    },
    // ================================
    // DEVICE IP
    // ================================
    ipAddress: {
        type: String,
        default: null,
        trim: true,
    },
    // ================================
    // STATUS
    // ================================
    status: {
        type: String,
        default: "pending",
    },
    // ================================
    // STATUS TRACKING
    // ================================
    statusUpdatedBy: {
        type: String,
        default: null,
    },
    statusUpdatedAt: {
        type: Date,
        default: null,
    },
    // ================================
    // APPROVAL
    // ================================
    approvedBy: {
        type: String,
        default: null,
    },
    approvedAt: {
        type: Date,
        default: null,
    },
    // ================================
    // ASSIGNMENT
    // ================================
    assignedTo: {
        type: String,
        default: null,
    },
    assignedBy: {
        type: String,
        default: null,
    },
    assignedDate: {
        type: Date,
        default: null,
    },
    // ================================
    // FIXED
    // ================================
    fixedBy: {
        type: String,
        default: null,
    },
    fixedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});
export default model("SyslogMessage", SyslogMessageSchema);
//# sourceMappingURL=notification.js.map