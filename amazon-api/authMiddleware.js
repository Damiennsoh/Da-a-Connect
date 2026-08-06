const { createClient } = require("@supabase/supabase-js");

// Supabase admin client — uses service role key so it can call getUser()
// We only need URL + anon key for getUser() with a user JWT.
// (No service role key required for token verification via getUser.)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // ── Approach 1: Supabase SDK (preferred — avoids JWT secret encoding issues)
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        console.error("[AUTH ERROR - Supabase]", error?.message || "No user");
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      req.authId = data.user.id;
      req.authUser = data.user;
      req.authEmail = data.user.email || null;
      req.authName =
        data.user.user_metadata?.display_name ||
        data.user.user_metadata?.full_name ||
        null;

      return next();
    } catch (err) {
      console.error("[AUTH ERROR - Supabase exception]", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }

  // ── Approach 2: Fallback — manually verify JWT with raw secret
  // Supabase signs with the BASE64-DECODED secret bytes, not the raw string.
  try {
    const jwt = require("jsonwebtoken");
    const secret = process.env.SUPABASE_JWT_SECRET || "";
    // Decode from base64 if it looks like base64
    const secretBuffer = Buffer.from(secret, "base64");
    const decodedToken = jwt.verify(token, secretBuffer);
    req.authId = decodedToken.sub;
    req.body = req.body || {};
    if (!req.body.email && decodedToken.email) {
      req.body.email = decodedToken.email;
    }
    return next();
  } catch (err) {
    console.error("[AUTH ERROR - JWT fallback]", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authenticateToken };
