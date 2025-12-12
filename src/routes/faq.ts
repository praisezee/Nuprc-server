import { Router } from "express";
import { body } from "express-validator";
import {
	getFAQs,
	createFAQ,
	updateFAQ,
	deleteFAQ,
} from "../controllers/faqController";
import { authenticate, authorize, optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { UserRole } from "../models/User";

const router = Router();

// Validation Rules
const faqValidation = [
	body("question").notEmpty().withMessage("Question is required").trim(),
	body("answer").notEmpty().withMessage("Answer is required"),
	body("category").notEmpty().withMessage("Category is required"),
	body("order").optional().isInt(),
];

/**
 * @route   GET /api/faq
 * @desc    Get all FAQs
 * @access  Public (Optional Auth)
 */
router.get("/", optionalAuth, getFAQs);

/**
 * @route   POST /api/faq
 * @desc    Create FAQ
 * @access  Private (Admin, Editor)
 */
router.post(
	"/",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate(faqValidation),
	createFAQ
);

/**
 * @route   PUT /api/faq/:id
 * @desc    Update FAQ
 * @access  Private (Admin, Editor)
 */
router.put(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]),
	validate([body("question").optional(), body("answer").optional()]),
	updateFAQ
);

/**
 * @route   DELETE /api/faq/:id
 * @desc    Delete FAQ
 * @access  Private (Admin, Super Admin)
 */
router.delete(
	"/:id",
	authenticate,
	authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
	deleteFAQ
);

export default router;
