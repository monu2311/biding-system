const authRepositories = require('../repositories/auth.repositories');
const bcrypt = require('bcrypt');
const { generateSecureOTP, getExpireTime, generateOTP } = require('../utils/otp')
const { OTP_PURPOSE } = require("../constant/index")
const { getAccessToken, getRefreshToken } = require('../utils/jwt');
const { NotFoundError, ConflictError } = require("../error/index")
const { sendMail } = require("../utils/nodemailer");

//Register USER
const registerUser = async (userData) => {

    const checkUser = await authRepositories.findUserByEmail(userData.email);

    if (checkUser) throw new ConflictError('User already exists.');

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const otpCode = await generateOTP()
    const otpExpiresAt = getExpireTime();

    // const userPayload = [userData.name, userData.email, hashedPassword, false, "local"]
    const userPayload = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        is_verified: false,
        auth_provider: "local"
    };



    const otpPayload = {
        secureOtp: otpCode.secureOtp, 
        purpose: OTP_PURPOSE.EMAIL_VERIFICATION,
        expireAt: otpExpiresAt, 
        verified: false
    }



    const { createdUser, createdOtp } = await authRepositories.createUser(
        userPayload,
        otpPayload
    );

    await sendOtpToEmail({ email: userData.email, value: otpCode.value });


    return {
        id: createdUser.id,
        email: createdUser.email,
        message: "OTP SEND SUCCCESFUL"
    }


}


const verifyEmail = async (userData) => {

    const otpvalues = await authRepositories.findOTPbyUserId(userData.id, OTP_PURPOSE.EMAIL_VERIFICATION);
    console.log("otpvalues.expires_at", otpvalues.expires_at)
    console.log("otpvalues. new Date()", new Date())

    if (otpvalues.expires_at < new Date()) {
        throw new Error("OTP EXPIRE PLEASE RESENND OTP.")
    }


    //check the otp and save otp are same
    const verifyOtp = await bcrypt.compare(userData.otp, otpvalues.otp_code);

    //throw error if otp not match 
    if (!verifyOtp) {
        throw new Error("INCORRECT OTP.")
    }


    const userPayload = [true, userData.id]

    const otpPayload = [true, otpvalues.id, OTP_PURPOSE.EMAIL_VERIFICATION]

    //Verified user and otp both in Update User Verified 
    const res = await authRepositories.updateUserVerified(userPayload, otpPayload)


    //create the payload for token 
    const payload = {
        email: res.updatedUSERRes.email,
        id: res.updatedUSERRes.id,
        is_verified: res.updatedUSERRes.is_verified
    }

    const accessToken = await getAccessToken(payload);     //genrate the access Token against payload
    const refreshToken = await getRefreshToken(payload);   //genrate the refresh Token against payload

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);  // genrate the hash refresh Token to save into database
    const refreshTokenExpiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000.                       //get the next 30 day date for Expore
    );


    //genrate the Payload for save data into the refresh token table
    const createTokenPayload = [
        res.updatedUSERRes.id,
        hashedRefreshToken,
        refreshTokenExpiresAt,
        false
    ]


    //call the Respository function to save data
    await authRepositories.saveRefreshToken(createTokenPayload);


    return {
        user: {
            id: res.updatedUSERRes.id,
            name: res.updatedUSERRes.name,
            email: res.updatedUSERRes.email,
            isVerified: res.updatedUSERRes.is_verified
        },

        token: accessToken,
        refreshToken



    }

}


const resendEmailVerificationOtp = async ({ email, purpose }) => {
    const data = await authRepositories.findUserByEmail(email);
    const user = data;
    console.log("sdfadfdsf", user)
    if (!user) throw new NotFoundError('User');

    if (user.is_verified) {
        throw new ConflictError("Email already verified");
    }

    return resendOtp({
        userId: user.id,
        email: user.email,
        purpose: OTP_PURPOSE[purpose]
    });
};


const sendOtpToEmail = async (data) => {

    const sendMeg =
    {
        from: '"IVIK" <ibhux1125@gmail.com>', // sender address
        to: data.email, // list of recipients
        subject: "Resend Otp", // subject line
        text: "Hello world?", // plain text body
        html: `<b>OTP ${data.value}</b>`, // HTML body

    }


    await sendMail(sendMeg);

}

const resendOtp = async (userData) => {

    console.log(userData)
    const otpvalues = await authRepositories.findOTPbyUserId(userData.userId, OTP_PURPOSE[userData.purpose]);

    console.log("otpvaluesotpvaluesotpvalues", otpvalues)



    const optObject = await generateOTP()
    const expireTIme = getExpireTime();

    const otpPayload = [optObject.secureOtp, expireTIme, otpvalues.id, OTP_PURPOSE[userData.purpose]]



    const sendMeg =
    {
        from: '"IVIK" <ibhux1125@gmail.com>', // sender address
        to: userData.email, // list of recipients
        subject: "Resend Otp", // subject line
        text: "Hello world?", // plain text body
        html: `<b>OTP ${optObject.value}</b>`, // HTML body

    }


    await sendMail(sendMeg);


    //Verified user and otp both in Update User Verified 
    const res = await authRepositories.updateOTPbyUser(otpPayload)





}





module.exports = {
    registerUser,
    verifyEmail,
    resendEmailVerificationOtp
}