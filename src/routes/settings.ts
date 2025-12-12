import { Router } from "express";
import { body } from "express-validator";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";

const router = Router();

// Validation Rules
const settingsValidation = [
	body("siteName")
		.optional()
		.notEmpty()
		.withMessage("Site name cannot be empty"),
	body("contactEmail").optional().isEmail().withMessage("Invalid email"),
	body("siteDescription").optional().notEmpty(),
];

/**
 * @route   GET /api/settings
 * @desc    Get site settings
 * @access  Public
 */
router.get("/", getSettings);

/**
 * @route   PUT /api/settings
 * @desc    Update site settings
 * @access  Private (Admin only)
 */
router.put(
	"/",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	validate(settingsValidation),
	updateSettings
);

export default router;
