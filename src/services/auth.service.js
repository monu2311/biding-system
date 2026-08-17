const authRepositories = require('../repositories/auth.repositories');
const bcrypt = require('bcrypt');
const { generateSecureOTP, getExpireTime, generateOTP } = require('../utils/otp')
const { OTP_PURPOSE } = require("../constant/index")
const { getAccessToken, getRefreshToken } = require('../utils/jwt');
const { NotFoundError, ConflictError, UnprocessableError } = require("../error/index")
const { sendMail } = require("../utils/nodemailer");
const { v4: uuidv4 } = require('uuid');

//Register USER
const registerUser = async (userData) => {

    const checkUser = await authRepositories.findUserByEmail(userData.email);

    if (checkUser) {

        if (checkUser.is_verified) throw new ConflictError('User already exists.');

        if (!checkUser.is_verified) {
            const result = await _sendVerificationOtp(checkUser, OTP_PURPOSE.EMAIL_VERIFICATION)

            return result
        }
    }
    // if (checkUser) throw new ConflictError('User already exists.');

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

    if (!otpvalues) throw new NotFoundError("OTP")

    if (otpvalues.expires_at < new Date()) {
        throw new UnprocessableError("OTP EXPIRE PLEASE RESENND OTP.")
    }


    //check the otp and save otp are same
    const verifyOtp = await bcrypt.compare(userData.otp, otpvalues.otp_code);

    //throw error if otp not match 
    if (!verifyOtp) {
        throw new UnprocessableError("INCORRECT OTP.")
    }


    const userPayload = {
        is_verified: true, id: userData.id
    }

    const otpPayload = {
        verified: true,
        id: otpvalues.id,
        purpose: OTP_PURPOSE.EMAIL_VERIFICATION
    }

    //Verified user and otp both in Update User Verified 
    const res = await authRepositories.updateUserVerified(userPayload, otpPayload)


    //create the payload for token 
    const payload = {
        email: res.updatedUSERRes.email,
        id: res.updatedUSERRes.id,
        is_verified: res.updatedUSERRes.is_verified
    }

    
    const tokenId = uuidv4(); 

    const accessToken = await getAccessToken(payload);     //genrate the access Token against payload
    const refreshToken = await getRefreshToken({...payload,tokenId});   //genrate the refresh Token against payload

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);  // genrate the hash refresh Token to save into database
    const refreshTokenExpiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000                      //get the next 30 day date for Expore
    );


    //genrate the Payload for save data into the refresh token table
    const createTokenPayload = {
        id:tokenId,
        user_id: res.updatedUSERRes.id,
        token_hash: hashedRefreshToken,
        expires_at: refreshTokenExpiresAt,
        revoked: false
    }


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

    if (!data) throw new NotFoundError('User');

    if (data.is_verified) {
        throw new ConflictError("Email already verified");
    }

    const res = await _sendVerificationOtp(data, purpose);

    return res

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


const loginService = async(responseData)=>{
    const { email,password } = responseData;

    const user = await authRepositories.findUserWithPasswordByEmail(email);

    if(!user) throw new UnprocessableError("Invalid email or password");

    if(!user.is_verified){
        const otpResult = await _sendVerificationOtp(user, OTP_PURPOSE.EMAIL_VERIFICATION)

        return otpResult
    }

    if(user.auth_provider != 'local') throw new UnprocessableError("Invalid Login");

    const checkPass = await bcrypt.compare(password,user.password);

    if(!checkPass) throw new UnprocessableError("Wrong password");

    const tokenId = uuidv4();

     //create the payload for token 
    const payload = {
        email: user.email,
        id: user.id,
        is_verified: user.is_verified
    }


    const accessToken = await getAccessToken(payload);     //genrate the access Token against payload
    const refreshToken = await getRefreshToken({...payload,tokenId});   //genrate the refresh Token against payload

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);  // genrate the hash refresh Token to save into database
    const refreshTokenExpiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000                      //get the next 30 day date for Expore
    );


    //genrate the Payload for save data into the refresh token table
    const createTokenPayload = {
        id:tokenId,
        user_id: user.id,
        token_hash: hashedRefreshToken,
        expires_at: refreshTokenExpiresAt,
        revoked: false
    }


    //call the Respository function to save data
    await authRepositories.saveRefreshToken(createTokenPayload);


    return {
        user :{
            id: user.id,
            email: user.email,
            name : user.name,
            is_verified : user.is_verified
        
        },
        accessToken,
        refreshToken
    }
}

const logoutService = async(requestPayload)=>{
    const {refreshToken, user} = requestPayload;

    const decoded = jwt.decode(refreshToken); // not verify — just decode
    const { tokenId } = decoded;

    const result = await authRepositories.findRefreshTokenById(tokenId,user.id);

    if(!result) throw new NotFoundError("Refresh Token");

    const checkToken= await bcrypt.compare(refreshToken,result.token_hash);

    if(!checkToken) throw new UnprocessableError("Invalid Token");


    await authRepositories.DeleteRefreshTokenId(result.id);
}


const refreshService = async(requestPayload)=>{
    const {refreshToken, user} = requestPayload;
    const decoded = jwt.decode(refreshToken); // not verify — just decode
    const { tokenId } = decoded;

    const result =await authRepositories.findRefreshTokenById(tokenId,user.id);


    if(!result) throw new NotFoundError("Refresh Token");

    const checkToken=  await bcrypt.compare(refreshToken,result.token_hash);

    if(!checkToken) throw new UnprocessableError("Token revoked");

    if(result.expires_at < new Date()) throw new UnprocessableError("Unable to process");

      const newtokenId = uuidv4(); 

    const accessToken = await getAccessToken(user);     //genrate the access Token against payload
    const newRefreshToken = await getRefreshToken({...user,tokenId:newtokenId});   //genrate the refresh Token against payload

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);  // genrate the hash refresh Token to save into database
    const refreshTokenExpiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000                      //get the next 30 day date for Expore
    );

    
    
    const createTokenPayload = {
        id: newtokenId,
        user_id:user.id,
        token_hash: hashedRefreshToken,
        expires_at: refreshTokenExpiresAt,
        revoked: false
    }


    //call the Respository function to save data
    await authRepositories.saveRefreshToken(createTokenPayload);

    await authRepositories.DeleteRefreshTokenId(result.id);

    return {
        accessToken,newRefreshToken
    }
}





const _sendVerificationOtp = async (user, purpose) => {


    const otpvalues = await authRepositories.findOTPbyUserId(user.id, purpose);


    const optObject = await generateOTP()
    const expireTIme = getExpireTime();


    if (otpvalues) {
        const otpPayload = {
            otp_code: optObject.secureOtp,
            expires_at: expireTIme,
            id: otpvalues.id,
            purpose
        }
        await authRepositories.updateOTPbyUser(otpPayload);
    } else {
        const createOtpPayload = {
            user_id: user.id,
            otp_code: optObject.secureOtp,
            purpose,
            expires_at: expireTIme,
            verified: false
        }
        await authRepositories.createOtp(createOtpPayload);
    }

    const sendMeg =
    {
        from: '"IVIK" <ibhux1125@gmail.com>', // sender address
        to: user.email, // list of recipients
        subject: "Resend Otp", // subject line
        text: "Hello world?", // plain text body
        html: `<b>OTP ${optObject.value}</b>`, // HTML body

    }


    await sendMail(sendMeg);

    return {
        id: user.id,
        email: user.email,
        message: "OTP sent successfully"
    }

}





module.exports = {
    registerUser,
    verifyEmail,
    resendEmailVerificationOtp,
    loginService,
    logoutService,
    refreshService
}