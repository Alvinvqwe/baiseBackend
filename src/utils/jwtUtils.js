const jwt = require("jsonwebtoken");
const SECRET_KEY = "wx5Uda1z-0CRDnziIL9UNRvU36rAlzslgvPXcP5o-Ns=";
const jwksClient = require("jwks-rsa");
const client = jwksClient({
  jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
});

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });
};

// Verify JWT token
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY);
}

module.exports = { generateToken, verifyToken };
