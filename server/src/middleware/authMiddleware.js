const { auth } = require('../config/firebaseAdminConfig');
/**
 * Middleware to verify Firebase ID tokens for protected routes.
 * If token is valid, `req.user` will contain the decoded token.
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided or malformed header.' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        let errorMessage = 'Unauthorized: Invalid token.';
        if (error.code === 'auth/id-token-expired') {
            errorMessage = 'Unauthorized: Token expired.';
        } else if (error.code === 'auth/argument-error') {
            errorMessage = 'Unauthorized: Malformed token.';
        }
        res.status(401).json({ message: errorMessage });
    }
};

module.exports = authenticateToken;