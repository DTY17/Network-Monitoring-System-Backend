import mongoose, { Schema, Document } from "mongoose";
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["USER"] = "USER";
    UserRole["MANAGER"] = "MANAGER";
})(UserRole || (UserRole = {}));
export var UserState;
(function (UserState) {
    UserState["ACTIVE"] = "ACTIVE";
    UserState["INACTIVE"] = "INACTIVE";
})(UserState || (UserState = {}));
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: UserRole.USER },
    state: { type: String, default: UserState.ACTIVE },
}, { timestamps: true });
export default mongoose.model("User", UserSchema);
//# sourceMappingURL=user.js.map