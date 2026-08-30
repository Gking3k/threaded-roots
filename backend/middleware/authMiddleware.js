const jwt = require(
  "jsonwebtoken"
);

function requireAuth(
  req,
  res,
  next
) {
  try {
    const header =
      req.headers.authorization;

    if (
      !header ||
      !header.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        message:
          "Authentication required",
      });
    }

    const token =
      header.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user =
      decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message:
        "Invalid or expired token",
    });
  }
}


/*
 * Admin-only operations.
 */
function requireAdmin(
  req,
  res,
  next
) {
  if (
    !req.user ||
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      message:
        "Administrator access required",
    });
  }

  next();
}


/*
 * Staff or admin operations.
 */
function requireStaffOrAdmin(
  req,
  res,
  next
) {
  if (
    !req.user ||
    ![
      "admin",
      "staff",
    ].includes(
      req.user.role
    )
  ) {
    return res.status(403).json({
      message:
        "Administrative access required",
    });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireStaffOrAdmin,
};