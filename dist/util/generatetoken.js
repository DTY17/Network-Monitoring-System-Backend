import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const signAccessToken = (user) => {
    return jwt.sign({
        sub: user._id.toString(),
        roles: user.role,
        email: user.email
    }, JWT_SECRET, {
        expiresIn: "30m"
    });
};
export const signRefreshToken = (user) => {
    return jwt.sign({
        sub: user._id.toString(),
        roles: user.role,
        email: user.email
    }, JWT_REFRESH_SECRET, {
        expiresIn: "7d"
    });
};
//# sourceMappingURL=generatetoken.js.map