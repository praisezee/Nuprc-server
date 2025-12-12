import { Router } from "express";
import { body } from "express-validator";
import {
	getPublications,
	getPublication,
	createPublication,
	updatePublication,
	deletePublication,
	downloadPublication,
} from "../controllers/publicationController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";
import { PublicationCategory } from "../models/Publication";

const router = Router();

// Validation Rules
const publicationValidation = [
	body("title").notEmpty().withMessage("Title is required").trim(),
	body("description").notEmpty().withMessage("Description is required"),
	body("category")
		.notEmpty()
		.withMessage("Category is required")
		.isIn(Object.values(PublicationCategory))
		.withMessage("Invalid publication category"),
	body("fileUrl").notEmpty().withMessage("File URL is required").isURL(),
	body("fileSize").isNumeric().withMessage("File size must be a number"),
	body("publishYear")
		.isInt({ min: 1960, max: new Date().getFullYear() + 1 })
		.withMessage("Invalid publish year"),
];

/**
 * @route   GET /api/publications
 * @desc    Get all publications
 * @access  Public
 */
router.get("/", getPublications);

/**
 * @route   GET /api/publications/:id
 * @desc    Get single publication
 * @access  Public
 */
router.get("/:id", getPublication);

/**
 * @route   GET /api/publications/:id/download
 * @desc    Download publication (track count)
 * @access  Public
 */
router.get("/:id/download", downloadPublication);

/**
 * @route   POST /api/publications
 * @desc    Create publication
 * @access  Private (Admin, Editor)
 */
router.post(
	"/",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate(publicationValidation),
	createPublication
);

/**
 * @route   PUT /api/publications/:id
 * @desc    Update publication
 * @access  Private (Admin, Editor)
 */
router.put(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate([
		body("title").optional(),
		body("description").optional(),
		body("category").optional().isIn(Object.values(PublicationCategory)),
		body("fileUrl").optional().isURL(),
	]),
	updatePublication
);

/**
 * @route   DELETE /api/publications/:id
 * @desc    Delete publication
 * @access  Private (Admin, Super Admin)
 */
router.delete(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	deletePublication
);

export default router;
