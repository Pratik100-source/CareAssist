const jwt = require("jsonwebtoken");

// Generate access token (short-lived)
const generateAccessToken = (userData) => {
  return jwt.sign(
    userData,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Generate refresh token (long-lived)
const generateRefreshToken = (userData) => {
  return jwt.sign(
    userData,
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
};

// Middleware to verify access token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken, 
  verifyRefreshToken 
};
