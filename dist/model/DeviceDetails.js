import { Document, model, Schema } from "mongoose";
const DeviceDetails = new Schema({
    hostname: {
        type: String,
        trim: true,
        unique: true,
    },
    ipAddress: {
        type: String,
        trim: true,
    },
    subnet: {
        type: String,
        trim: true,
    },
    username: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        select: false, // hides password in normal queries
    },
}, {
    timestamps: true,
});
export default model("System", DeviceDetails);
//# sourceMappingURL=deviceDetails.js.map