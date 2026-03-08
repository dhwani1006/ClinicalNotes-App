import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization;

  // Expect: "Authorization: Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id, name, email, iat, exp }
    req.user = decoded; // 👈 attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}



// import jwt from "jsonwebtoken";

// export default function auth(req, res, next) {
//   const header = req.headers.authorization;

//   // Expect: "Authorization: Bearer <token>"
//   if (!header || !header.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = header.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     // decoded = { id, name, email, iat, exp }
//     req.user = decoded; // 👈 attach user info to request
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// }