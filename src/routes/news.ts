import { Router } from "express";
import { body } from "express-validator";
import {
	getNews,
	getNewsBySlug,
	createNews,
	updateNews,
	deleteNews,
	getNewsById,
} from "../controllers/newsController";
import { authenticate, authorize, optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";
import { ContentStatus } from "../models/News";

const router = Router();

// Validation Rules
const newsValidation = [
	body("title").notEmpty().withMessage("Title is required").trim(),
	body("content").notEmpty().withMessage("Content is required"),
	body("excerpt").notEmpty().withMessage("Excerpt is required"),
	body("category").notEmpty().withMessage("Category is required"),
	body("status").optional().isIn(Object.values(ContentStatus)),
];

/**
 * @route   GET /api/news
 * @desc    Get all news
 * @access  Public (Optional Auth for draft access)
 */
router.get("/", optionalAuth, getNews);

/**
 * @route   GET /api/news/:slug
 * @desc    Get single news article
 * @access  Public (Optional Auth for draft access)
 */
router.get("/:slug", optionalAuth, getNewsBySlug);

/**
 * @route   GET /api/news/id/:id
 * @desc    Get single news article by ID
 * @access  Public
 */
router.get("/id/:id", optionalAuth, getNewsById);

/**
 * @route   POST /api/news
 * @desc    Create news
 * @access  Private (Admin, Editor)
 */
router.post(
	"/",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate(newsValidation),
	createNews
);

/**
 * @route   PUT /api/news/:id
 * @desc    Update news
 * @access  Private (Admin, Editor)
 */
router.put(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate([
		...newsValidation,
		body("title").optional(), // Make fields optional for updates if needed, though usually PUT replaces
	]),
	updateNews
);

/**
 * @route   DELETE /api/news/:id
 * @desc    Delete news
 * @access  Private (Admin, Super Admin)
 */
router.delete(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	deleteNews
);

export default router;
