const jwt = require('jsonwebtoken');

/**
 * Auth middleware - extract and verify JWT token
 */
const authMiddleware = (req, res, next) => {
  try {
    console.log('[Auth] Headers:', Object.keys(req.headers));
    const authHeader = req.headers.authorization;
    console.log('[Auth] Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Auth] Invalid auth header format');
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    console.log('[Auth] Token:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

    console.log('[Auth] ✅ Token verified:', decoded);

    // Attach user info to request (support both userId and user_id)
    req.user = {
      id: decoded.user_id || decoded.userId,
      email: decoded.email
    };

    console.log('[Auth] User attached to request:', req.user);
    next();
  } catch (error) {
    console.error('[Auth] ❌ Middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = authMiddleware;
