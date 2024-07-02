const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret"; // Make sure to set your JWT secret key in environment

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

module.exports = { generateToken, verifyToken };
