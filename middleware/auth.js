const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FIX: normalize user id
    req.user = {
      id: decoded.id || decoded._id,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;