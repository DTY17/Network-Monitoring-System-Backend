import { Document, model, Schema } from "mongoose";

export interface ISyslogMessage extends Document {
  priority?: number;
  timestamp?: string;
  facility?: string;
  severity?: number;
  msg_tag?: string;
  msg_text?: string;
  raw?: string;

  // Router/device IP
  ipAddress?: string;

  status?: string;

  // Status tracking
  statusUpdatedBy?: string;
  statusUpdatedAt?: Date;

  // Approval tracking
  approvedBy?: string;
  approvedAt?: Date;

  // Assignment tracking
  assignedTo?: string;
  assignedBy?: string;
  assignedDate?: Date;

  // Fixed tracking
  fixedBy?: string;
  fixedAt?: Date;
}

const SyslogMessageSchema = new Schema<ISyslogMessage>(
  {
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
  },
  {
    timestamps: true,
  },
);

export default model<ISyslogMessage>(
  "SyslogMessage",
  SyslogMessageSchema,
);