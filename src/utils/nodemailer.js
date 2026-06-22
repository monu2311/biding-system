const nodemailer = require('nodemailer');



const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


const sendMail  = async(sentPayload)=>{
   try {
    
    const info = await transport.sendMail(sentPayload);

    return info
   } catch (error) {
    throw error;
   }
}


module.exports = {
    sendMail
}