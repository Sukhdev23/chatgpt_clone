const jwt = require("jsonwebtoken");

const AuthUser = (req, res, next) => {
  try {
    // agar token cookie ke andar hai (maan lo naam 'token' hai)
    const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1];
    console.log("Cookies received:", req.cookies);

    

    if (!token) {
      return res.status(401).json({ error: "Unauthorized, token missing" });
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // save user info to request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};




module.exports = AuthUser;
