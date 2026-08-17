const authServices = require("../services/auth.service")
const {UnauthorizedError} = require("../error/index");


const registerController = async (req, res, next) => {
    try {
        const user = await authServices.registerUser(req.body);

        return res.status(201).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);

    }
}


const verifyEmailController = async (req, res, next) => {
    try {
        //req.body must have id and otp
        const { user, token, refreshToken } = await authServices.verifyEmail(req.body);


        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            data: { user, token }
        });

    } catch (error) {
        next(error)
    }
}


const resendVerifyEmailController = async (req, res, next) => {
    try {
        //req.body must have id and otp
        const user = await authServices.resendEmailVerificationOtp(req.body);

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error)

    }
}

const loginController = async (req, res, next) => {
    try {

        const { user, accessToken = null, refreshToken = null } = await authServices.loginService(req.body);

        if (refreshToken) {
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
        }


        return accessToken ? res.status(200).json({
            success: true,
            data: { user, token: accessToken }
        }) :

            res.status(200).json({
                success: true,
                data: { user }
            })
            ;

    } catch (error) {
        next(error)

    }
}



const logoutController = async (req, res, next) => {
    try {
        //req.body must have id and otp
        const {user} = req;
        const refreshToken = req.cookies.refreshToken;

       if (!refreshToken) throw new UnauthorizedError('Session expired. Please login again.');


        await authServices.logoutService({user,refreshToken});

        res.clearCookie('refreshToken')

        return res.status(200).json({
            success: true,
            message :"Logout Scusssful"
        });

    } catch (error) {
        next(error)

    }
}


const refreshController = async (req, res, next) => {
    try {
        //req.body must have id and otp
        const {user} = req;
        const refreshToken = req.cookies.refreshToken;

       if (!refreshToken) throw new UnauthorizedError('Session expired. Please login again.');

       const {accessToken,newRefreshToken } =  await authServices.refreshService({user,refreshToken});

         if (newRefreshToken) {
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
        }


        return   res.status(200).json({
            success: true,
            data: {  token: accessToken }
        })

    } catch (error) {
        next(error)

    }
}








module.exports = {
    registerController,
    verifyEmailController,
    resendVerifyEmailController,
    loginController,
    logoutController,
    refreshController
}