import { Document } from "mongoose";
export interface ISystem extends Document {
    hostname: string;
    ipAddress: string;
    subnet: string;
    username: string;
    password: string;
}
declare const _default: import("mongoose").Model<ISystem, {}, {}, {}, Document<unknown, {}, ISystem, {}, import("mongoose").DefaultSchemaOptions> & ISystem & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISystem>;
export default _default;
//# sourceMappingURL=deviceDetails.d.ts.map