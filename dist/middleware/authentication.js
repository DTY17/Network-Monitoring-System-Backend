import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const Authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (err) {
        console.error(err);
        res.status(401).json({
            message: "Invalid or expire token"
        });
    }
};
//# sourceMappingURL=authentication.js.map