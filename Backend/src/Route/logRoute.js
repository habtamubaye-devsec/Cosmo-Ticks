import express from "express";
import AuditLog from "../models/auditLog.model.js";
import { validateAdmin } from "../Middleware/auth.middleware.js";

const router = express.Router();

// Admin-only: list audit logs with pagination.
router.get("/", validateAdmin, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(10, Number(req.query.limit) || 25));
  const skip = (page - 1) * limit;

  const [total, logs] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));

  res.json({
    data: logs,
    meta: { page, limit, total, pages },
  });
});

export default router;
