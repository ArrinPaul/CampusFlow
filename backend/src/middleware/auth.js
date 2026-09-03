const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // Developer mode bypass
  if (process.env.DEV_MODE === "true" && token === "dev-token") {
    req.student = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Developer",
      email: "dev@example.com",
      branch: "Computer Science",
      year: 4,
      telegram_username: "dev_user",
      subjects: ["CS101", "CS102"],
      created_at: new Date().toISOString()
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.student = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;
