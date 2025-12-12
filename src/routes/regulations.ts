import { Router } from "express";
import { body } from "express-validator";
import {
	getRegulations,
	getRegulation,
	createRegulation,
	updateRegulation,
	deleteRegulation,
} from "../controllers/regulationController";
import { authenticate, authorize, optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";
import { RegulationCategory } from "../models/Regulation";
import { ContentStatus } from "../models/News";

const router = Router();

// Validation Rules
const regulationValidation = [
	body("title").notEmpty().withMessage("Title is required").trim(),
	body("description").notEmpty().withMessage("Description is required"),
	body("category")
		.notEmpty()
		.withMessage("Category is required")
		.isIn(Object.values(RegulationCategory))
		.withMessage("Invalid regulation category"),
	body("fileUrl").notEmpty().withMessage("File URL is required").isURL(),
	body("effectiveDate")
		.optional()
		.isISO8601()
		.withMessage("Invalid effective date format"),
	body("status").optional().isIn(Object.values(ContentStatus)),
];

/**
 * @route   GET /api/regulations
 * @desc    Get all regulations
 * @access  Public (Optional Auth for drafts)
 */
router.get("/", optionalAuth, getRegulations);

/**
 * @route   GET /api/regulations/:id
 * @desc    Get single regulation
 * @access  Public (Optional Auth for drafts)
 */
router.get("/:id", optionalAuth, getRegulation);

/**
 * @route   POST /api/regulations
 * @desc    Create regulation
 * @access  Private (Admin, Editor)
 */
router.post(
	"/",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate(regulationValidation),
	createRegulation
);

/**
 * @route   PUT /api/regulations/:id
 * @desc    Update regulation
 * @access  Private (Admin, Editor)
 */
router.put(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate([
		body("title").optional(),
		body("description").optional(),
		body("category").optional().isIn(Object.values(RegulationCategory)),
		body("fileUrl").optional().isURL(),
	]),
	updateRegulation
);

/**
 * @route   DELETE /api/regulations/:id
 * @desc    Delete regulation
 * @access  Private (Admin, Super Admin)
 */
router.delete(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	deleteRegulation
);

export default router;
