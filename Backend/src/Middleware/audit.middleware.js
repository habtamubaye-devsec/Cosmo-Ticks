import AuditLog from "../models/auditLog.model.js";

const shouldLog = (req) => {
  // Only log API requests.
  if (!req?.originalUrl?.startsWith("/api/v1")) return false;

  // Avoid recursive logging when reading logs.
  if (req.originalUrl.startsWith("/api/v1/logs")) return false;

  // Keep minimal: only write operations.
  const method = String(req.method || "").toUpperCase();
  return method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
};

export const auditLogger = (req, res, next) => {
  res.on("finish", async () => {
    try {
      if (!shouldLog(req)) return;

      // Only log admin actions (req.user is set by validateToken/validateAdmin).
      const user = req.user;
      if (!user || user.role !== "admin") return;

      await AuditLog.create({
        actor: user._id,
        actorEmail: user.email || "",
        actorName: user.name || "",
        method: String(req.method || "").toUpperCase(),
        path: req.originalUrl || req.path || "",
        statusCode: res.statusCode,
        ip:
          req.headers?.["x-forwarded-for"]?.toString()?.split(",")[0]?.trim() ||
          req.ip ||
          "",
        userAgent: req.headers?.["user-agent"] || "",
      });
    } catch {
      // Best-effort logger; never break request pipeline.
    }
  });

  next();
};
