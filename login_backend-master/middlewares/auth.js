const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your-fallback-secret-key'; // TODO: Remove fallback in production

const authenticateToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Verify token
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        success: false,
                        message: 'Token has expired'
                    });
                }
                return res.status(403).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            // Add user info to request
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = authenticateToken;