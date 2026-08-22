const jwt = require('jsonwebtoken');
const {UnauthorizedError} = require("../error/index");
const authRepositories = require('../repositories/auth.repositories');


const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return next(new UnauthorizedError('Token missing'));

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return next(new UnauthorizedError('Token expired'));
            }
            return next(new UnauthorizedError('Invalid token'));
        }

        // DB errors now bubble up as real 500 errors
        const user = await authRepositories.findUserById(decoded.id);
        if (!user) return next(new UnauthorizedError('Account no longer exists'));

        req.user = user;
        next();

    } catch (error) {
        next(error);  // real errors — DB down, etc.
    }
};


module.exports= {authenticate}