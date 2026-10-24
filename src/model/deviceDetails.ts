import { Document, model, Schema } from "mongoose";

export interface ISystem extends Document {
  hostname: string;
  ipAddress: string;
  subnet: string;
  username: string;
  password: string;
}

const DeviceDetails = new Schema<ISystem>(
  {
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
  },
  {
    timestamps: true,
  }
);

export default model<ISystem>(
  "System",
  DeviceDetails
);