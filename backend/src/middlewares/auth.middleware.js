const jwt = require("jsonwebtoken");

const AuthUser = (req, res, next) => {
  try {
    let token = null;

    // 1. Token from cookies
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // 2. Token from Authorization header (Bearer <token>)
    else if (
      req.headers["authorization"] &&
      req.headers["authorization"].startsWith("Bearer ")
    ) {
      token = req.headers["authorization"].split(" ")[1];
    }

    console.log("🔑 Token received:", token ? "Yes" : "No");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized, token missing" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Attach user to request
    req.user = decoded;

    next();
  } catch (err) {
    console.error("❌ Token verify error:", err.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = AuthUser;
