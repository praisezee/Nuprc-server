import { Router } from "express";
import { body } from "express-validator";
import {
	getPortals,
	createPortal,
	updatePortal,
	deletePortal,
} from "../controllers/portalController";
import { authenticate, authorize, optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";

const router = Router();

// Validation Rules
const portalValidation = [
	body("name").notEmpty().withMessage("Name is required").trim(),
	body("url").notEmpty().withMessage("URL is required").isURL(),
	body("category").notEmpty().withMessage("Category is required"),
	body("description").notEmpty().withMessage("Description is required"),
	body("order").optional().isInt(),
];

/**
 * @route   GET /api/portals
 * @desc    Get all portals
 * @access  Public (Optional Auth for inactive ones)
 */
router.get("/", optionalAuth, getPortals);

/**
 * @route   POST /api/portals
 * @desc    Create portal
 * @access  Private (Admin, Editor)
 */
router.post(
	"/",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate(portalValidation),
	createPortal
);

/**
 * @route   PUT /api/portals/:id
 * @desc    Update portal
 * @access  Private (Admin, Editor)
 */
router.put(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate([body("name").optional(), body("url").optional().isURL()]),
	updatePortal
);

/**
 * @route   DELETE /api/portals/:id
 * @desc    Delete portal
 * @access  Private (Admin, Super Admin)
 */
router.delete(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	deletePortal
);

export default router;
