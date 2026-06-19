const authServices = require("../services/auth.service")


const registerController = async (req, res) => {
    try {
       const user = await authServices.registerUser(req.body);

        return res.status(201).json({
            success: true,
            data: user
        });

    } catch (error) {
        if (error.message === "User already exists") {
            return res.status(409).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });

    }
}


module.exports = {
    registerController
}