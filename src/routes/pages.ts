import { Router } from "express";
import { body } from "express-validator";
import {
	getPages,
	getPageBySlug,
	createPage,
	updatePage,
	deletePage,
	getPageById,
} from "../controllers/pageController";
import { authenticate, authorize, optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";

const router = Router();

// Validation Rules
const pageValidation = [
	body("title").notEmpty().withMessage("Title is required").trim(),
	body("content").notEmpty().withMessage("Content is required"),
	body("slug").optional().isSlug().withMessage("Invalid slug format"),
	body("order").optional().isInt().withMessage("Order must be an integer"),
	body("isPublished").optional().isBoolean(),
];

/**
 * @route   GET /api/pages
 * @desc    Get all pages
 * @access  Public (Optional Auth for drafts)
 */
router.get("/", optionalAuth, getPages);

/**
 * @route   GET /api/pages/:slug
 * @desc    Get single page
 * @access  Public (Optional Auth for drafts)
 */
router.get("/:slug", optionalAuth, getPageBySlug);

/**
 * @route   GET /api/pages/id/:id
 * @desc    Get single page by ID
 * @access  Public
 */
router.get("/id/:id", optionalAuth, getPageById);

/**
 * @route   POST /api/pages
 * @desc    Create page
 * @access  Private (Admin, Content Manager)
 */
router.post(
	"/",
	authenticate,
	authorize([
		UserRole.SUPER_ADMIN,
		UserRole.ADMIN,
		UserRole.CONTENT_MANAGER,
		UserRole.EDITOR,
	]),
	validate(pageValidation),
	createPage
);

/**
 * @route   PUT /api/pages/:id
 * @desc    Update page
 * @access  Private (Admin, Content Manager)
 */
router.put(
	"/:id",
	authenticate,
	authorize([
		UserRole.SUPER_ADMIN,
		UserRole.ADMIN,
		UserRole.CONTENT_MANAGER,
		UserRole.EDITOR,
	]),
	validate([body("title").optional(), body("content").optional()]),
	updatePage
);

/**
 * @route   DELETE /api/pages/:id
 * @desc    Delete page
 * @access  Private (Admin, Super Admin)
 */
router.delete(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	deletePage
);

export default router;
