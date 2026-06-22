const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { serialize } = require('v8');

const generateSecureOTP = async () => {
  const value = (crypto.randomInt(1000, 10000)).toString();
  console.log("genrate OTP  ==>", value)
  return await bcrypt.hash(value, 10);
};

const generateOTP = async () => {
  const value = (crypto.randomInt(1000, 10000)).toString();
  const secureOtp = await bcrypt.hash(value, 10)
  return {
    value,
    secureOtp
  };
};


const getExpireTime = () => {

  console.log("currennt TIme = ", new Date());
  console.log("v TIme = ", new Date(new Date().getTime() + 3 * 60 * 1000));
   return  new Date(new Date().getTime() + 3 * 60 * 1000);
}


module.exports = {
  generateSecureOTP,
  getExpireTime,
  generateOTP
};