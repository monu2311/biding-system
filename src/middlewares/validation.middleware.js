
const validationMiddleware = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false
        });

        if (error) {
            // Map the errors into a readable array format
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({ errors: errorMessages });
        }

        // Replace req.body with clean, casted data values
        req.body = value;
        next();
    }
}


module.exports =
    validationMiddleware
