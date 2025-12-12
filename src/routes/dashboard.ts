import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../models/User";

const router = Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin, Super Admin, Editor, Content Manager)
 */
router.get(
	"/stats",
	authenticate,
	authorize([
		UserRole.SUPER_ADMIN,
		UserRole.ADMIN,
		UserRole.EDITOR,
		UserRole.CONTENT_MANAGER,
	]),
	getDashboardStats
);

export default router;
