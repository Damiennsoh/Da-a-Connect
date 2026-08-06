const jwt = require("jsonwebtoken");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    if (!process.env.SUPABASE_JWT_SECRET) {
      throw new Error("Missing SUPABASE_JWT_SECRET environment variable");
    }

    const decodedToken = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.authId = decodedToken.sub; // Supabase uses 'sub' for the user ID
    
    // In Supabase Auth, email might be in decodedToken.email
    req.body = req.body || {};
    if (!req.body.email && decodedToken.email) {
       req.body.email = decodedToken.email;
    }
    
    next();
  } catch (err) {
    console.error("[AUTH ERROR]", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authenticateToken };
