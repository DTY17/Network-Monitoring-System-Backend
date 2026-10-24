export interface INatMapping {
    sourceIp: string;
    natHost: string;
    natPort: number;
}
declare const _default: import("mongoose").Model<INatMapping, {}, {}, {}, import("mongoose").Document<unknown, {}, INatMapping, {}, import("mongoose").DefaultSchemaOptions> & INatMapping & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, INatMapping>;
export default _default;
//# sourceMappingURL=natMapping.d.ts.map