const jwt = require('jsonwebtoken');


const getAccessToken =(payload)=> {
  return jwt.sign(payload,process.env.ACCESS_SECRET,{expiresIn:'24h'})
};

const getRefreshToken = (payload)=>{
    return jwt.sign(payload,process.env.REFRESH_SECRET,{expiresIn:'30d'})
};

const verifyToken = (token,type="access")=>{
    return jwt.verify(token,process.env[type === "access" ? ACCESS_SECRET : REFRESH_SECRET] )
}


module.exports ={
    getAccessToken,
    getRefreshToken,
    verifyToken
}