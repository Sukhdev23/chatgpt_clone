const jwt = require("jsonwebtoken");

const AuthUser = (req, res, next) => {
  try {
    console.log("👉 Auth middleware triggered");
    console.log("Cookies:", req.cookies);
    console.log("Authorization Header:", req.headers["authorization"]);

    const token =
      req.cookies?.token ||
      req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ error: "Unauthorized, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ AuthUser Error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = AuthUser;
