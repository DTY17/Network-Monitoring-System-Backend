import { model, Schema } from "mongoose";
const NatMappingSchema = new Schema({
    sourceIp: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    natHost: {
        type: String,
        required: true,
        trim: true,
    },
    natPort: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});
export default model("NatMapping", NatMappingSchema);
//# sourceMappingURL=natMapping.js.map