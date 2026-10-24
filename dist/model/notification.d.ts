import { Document } from "mongoose";
export interface ISyslogMessage extends Document {
    priority?: number;
    timestamp?: string;
    facility?: string;
    severity?: number;
    msg_tag?: string;
    msg_text?: string;
    raw?: string;
    ipAddress?: string;
    status?: string;
    statusUpdatedBy?: string;
    statusUpdatedAt?: Date;
    approvedBy?: string;
    approvedAt?: Date;
    assignedTo?: string;
    assignedBy?: string;
    assignedDate?: Date;
    fixedBy?: string;
    fixedAt?: Date;
}
declare const _default: import("mongoose").Model<ISyslogMessage, {}, {}, {}, Document<unknown, {}, ISyslogMessage, {}, import("mongoose").DefaultSchemaOptions> & ISyslogMessage & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISyslogMessage>;
export default _default;
//# sourceMappingURL=notification.d.ts.map