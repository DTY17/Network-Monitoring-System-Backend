import User from "../model/user.js";
export async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email",
            });
        }
        // NOTE: passwords are still compared as plain text.
        // Switch to bcrypt.compare(password, user.password) once signup hashes them.
        if (password === user.password) {
            return res.status(200).json({
                message: "Login Successfully",
                data: {
                    _id: user._id,
                    name: user.name,
                    role: user.role,
                },
            });
        }
        return res.status(400).json({
            message: "Invalid password",
        });
    }
    catch (e) {
        console.error("Login error:", e);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
export async function signup(req, res) {
    const { name, email, password, role, state } = req.body;
    try {
        const newUser = new User({
            name,
            email,
            password,
            role,
            state,
        });
        await newUser.save();
        return res.status(200).json({
            message: "Sign up Successfully",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Sign up Failed",
        });
    }
}
export async function getUser(req, res) {
    try {
        // Never send passwords to the browser
        const usersList = await User.find().select("-password");
        return res.status(200).json({
            message: "User Details",
            data: usersList,
        });
    }
    catch (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
export async function getCount(req, res) {
    try {
        const count = await User.countDocuments();
        return res.status(200).json({
            message: "Total users",
            data: { count },
        });
    }
    catch (err) {
        console.error("Error counting users:", err);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
//# sourceMappingURL=userController.js.map