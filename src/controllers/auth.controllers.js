const authServices = require("../services/auth.service")


const registerController = async (req, res) => {
    try {
        const user = await authServices.registerUser(req.body);
        console.log("user",user)


        return res.status(201).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.log("Eoororo", error.message)
        if (error.message === "User already exists.") {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}


const verifyEmailController =async(req,res)=>{
     try {
        //req.body must have id and otp
        const user = await authServices.verifyEmail(req.body);  

        return res.status(201).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.log("Eoororo", error.message)
        if ( ["DID NOT FIND OTP PLESE RESEND OTP.","OTP EXPIRE PLEASE RESENND OTP.","INCORRECT OTP."].includes(error.message) ) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}


const resendVerifyEmailController =async(req,res)=>{
     try {
        //req.body must have id and otp
        const user = await authServices.resendEmailVerificationOtp(req.body);  

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.log("Eoororo", error.message)
        if ( ["DID NOT FIND OTP PLESE RESEND OTP.","OTP EXPIRE PLEASE RESENND OTP.","INCORRECT OTP."].includes(error.message) ) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}



module.exports = {
    registerController,
    verifyEmailController,
    resendVerifyEmailController
}