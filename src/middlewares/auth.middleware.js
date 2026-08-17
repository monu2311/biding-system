const jwt = require('jsonwebtoken');
const {UnauthorizedError} = require("../error/index");


 const authenticate = (req, res, next) => {
    try {
        const token =
            req.headers.authorization?.split(" ")[1];


        if (!token) {
           return next(new UnauthorizedError('Token missing'));
        }


        const decode = jwt.verify(token,process.env.ACCESS_SECRET);

        req.user = decode;;

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Token expired'))
        }
       return next(new UnauthorizedError('Invalid token'));
        
    }
}


module.exports= {authenticate}