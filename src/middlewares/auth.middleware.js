const jwt = require('jsonwebtoken');


export const authenticate = (req, res, next) => {
    try {
        const token =
            req.headers.authorization?.split(" ")[1];


        if (!token) {
            return res.status(401).json({
                message: "Token missing"
            });
        }


        const decode = jwt.verify(token,process.env.ACCESS_SECRET);

        req.user = decode;;

        next();

    } catch (error) {
        console.log("Error in auth middleware ")
    }
}


// module.exports= authenticate