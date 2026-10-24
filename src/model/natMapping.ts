import { model, Schema } from "mongoose";

export interface INatMapping {
  sourceIp: string;
  natHost: string;
  natPort: number;
}

const NatMappingSchema = new Schema<INatMapping>(
  {
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
  },
  {
    timestamps: true,
  }
);

export default model<INatMapping>(
  "NatMapping",
  NatMappingSchema
);